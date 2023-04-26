import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { serialize } from "cookie";
import {
  updateProfileWebSchema,
  updateProfileWebSchemaDatabase,
} from "src/utils/validation/auth";
import { TRPCError } from "@trpc/server";
import { signJwt } from "src/utils/jwt";

export const authedUsersRouter = createTRPCRouter({
  dashboardInfo: protectedProcedure.query(async (req) => {
    const { ctx } = req;
    const { user } = ctx;

    const nowuser = await ctx.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!nowuser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // count all connected apps
    const connectedApps = await ctx.prisma.connectedApps.count({
      where: {
        userId: user.id,
      },
    });

    // get all scopes from connected apps
    const allScopesArr = await ctx.prisma.connectedApps.findMany({
      where: {
        userId: user.id,
      },
      include: {
        app: true,
      },
    });

    let totalScopes = 0;

    // go through the allScopesArr and split scope with " " and count them.
    allScopesArr.forEach((conApp) => {
      let scArr = conApp.scope.split(" ");
      totalScopes += scArr.length;
    });

    // count all login Requests
    const loginRequests = await ctx.prisma.loginRequest.count({
      where: {
        userId: user.id,
      },
    });

    // count all login Requests with consent false
    const loginRequestsConsentFalse = await ctx.prisma.loginRequest.count({
      where: {
        userId: user.id,
        consent: false,
      },
    });

    let totalminutes =
      loginRequests * 1.05 + totalScopes * 0.8 + connectedApps * 1;

    // floor to nearest 2 digits totalminutes
    totalminutes = Math.floor(totalminutes * 100) / 100;

    return {
      loginAttempts: loginRequests,
      services: connectedApps,
      min: totalminutes,
      permissions: totalScopes,
      connectedApps: allScopesArr,
      loginRequestsConsentFalse,
    };
  }),

  essentialInfo: protectedProcedure.query(async (req) => {
    const { ctx } = req;
    const { user } = ctx;
    const nowuser = await ctx.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!nowuser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (!nowuser.completedProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (
      nowuser.gender === null ||
      nowuser.address === null ||
      nowuser.pincode === null ||
      nowuser.country === null
    ) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      image: nowuser.image,
      gender: nowuser.gender,
      address: nowuser.address,
      pincode: nowuser.pincode,
      country: nowuser.country,
    };
  }),

  isCompletedProfile: protectedProcedure.query(async (req) => {
    const { ctx } = req;
    const { user } = ctx;
    const nowuser = await ctx.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!nowuser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      completedProfile: nowuser.completedProfile,
    };
  }),
  updateProfile: protectedProcedure
    .input(updateProfileWebSchemaDatabase)
    .mutation(async (req) => {
      const { ctx, input } = req;
      const { user } = ctx;
      const { image, gender, address, pincode, country } =
        updateProfileWebSchemaDatabase.parse(input);

      const updatedUser = await ctx.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          image,
          gender,
          address,
          pincode,
          country,
          completedProfile: true,
        },
      });

      if (!updatedUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const jwt = signJwt({
        email: updatedUser.email,
        id: updatedUser.id,
        name: updatedUser.name,
        emailVerified: updatedUser.emailVerified,
        image: updatedUser.image,
        phone: updatedUser.phone,
        phoneVerified: updatedUser.phoneVerified,
        dob: updatedUser.dateOfBirth,
      });

      ctx.res.setHeader("Set-Cookie", serialize("token", jwt, { path: "/" }));

      return {
        status: "ok",
        message: "Profile updated successfully",
      };
    }),
  logout: protectedProcedure.mutation(async (req) => {
    const { ctx } = req;
    ctx.res.setHeader(
      "Set-Cookie",
      serialize("token", "", { maxAge: -1, path: "/" })
    );
    return {
      redirect: "/",
    };
  }),
});
