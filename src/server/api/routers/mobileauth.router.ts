import * as trpc from "@trpc/server";
import { serialize } from "cookie";
import { env } from "src/env.mjs";

import { createTRPCRouter, publicProcedure } from "src/server/api/trpc";
import { decodeJwt, signJwt, verifyJwt } from "src/utils/jwt";

import {
  generateMobileOTPSchema,
  generateOTPSchema,
  loginMobileSchema,
  loginOTPSchema,
  mobileAuthSchema,
  registerMobileSchema,
  registerOTPSchema,
  updateProfileSchema,
  verifyEmailSchema,
} from "src/utils/validation/auth";
import { z } from "zod";

interface jwtSchema {
  email: string;
  phone: string;
  id: string;
  name: string;
  phoneVerified: Date;
  emailVerified: Date;
  image: string;
}

const accountSid = env.TWILIO_ACCOUNT_SID;
const authToken = env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

export const mobileAuthRouter = createTRPCRouter({
  regUserWithPhone: publicProcedure
    .input(registerMobileSchema)
    .mutation(async (req) => {
      const { input, ctx } = req;
      const { email, name, phone, otp } = await registerMobileSchema.parseAsync(
        input
      );

      const exists = await ctx.prisma.oneTimeToken.findFirst({
        where: {
          otp,
          phone,
        },
        include: {
          user: true,
        },
      });

      if (!exists) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Invalid OTP",
        });
      }

      if (exists.expiresAt < new Date()) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "OTP expired. Try again.",
        });
      }

      // delete otp from db
      await ctx.prisma.oneTimeToken.delete({
        where: { id: exists.id },
      });

      // email or phone number already exists
      const userexists = await ctx.prisma.user.findFirst({
        where: {
          OR: [
            {
              email,
            },
            {
              phone,
            },
          ],
        },
      });

      if (userexists) {
        throw new trpc.TRPCError({
          code: "CONFLICT",
          message: "User already exists.",
        });
      }

      try {
        const user = await ctx.prisma.user.create({
          data: {
            email,
            name,
            phone,
            phoneVerified: new Date(),
          },
        });

        const jwt = signJwt({
          email: user.email,
          phone: user.phone,
          id: user.id,
          name: user.name,
          phoneVerified: user.phoneVerified,
          emailVerified: user.emailVerified,
          image: user.image,
          iat: Math.floor(Date.now() / 1000), // Issued at time
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 1, // Expire time
        });

        return {
          status: 200,
          jwt,
          user,
        };
      } catch (error) {
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating user.",
        });
      }
    }),

  generateOTPWithPhone: publicProcedure
    .input(generateMobileOTPSchema)
    .mutation(async (req) => {
      const { input, ctx } = req;
      const { phone } = await generateMobileOTPSchema.parseAsync(input);

      // Check if user has otp already
      const exists = await ctx.prisma.oneTimeToken.findFirst({
        where: {
          OR: [
            {
              user: { phone: phone },
            },
            {
              phone,
            },
          ],
        },
      });
      if (!exists) {
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Get user
        const user = await ctx.prisma.user.findFirst({
          where: { phone },
        });

        if (!user) {
          await ctx.prisma.oneTimeToken.create({
            data: { otp, phone, expiresAt: new Date(Date.now() + 2 * 60000) },
          });

          // Send OTP to phone
          await client.messages.create({
            body: "Your OTP for Holocron: " + otp,
            from: "+17604562349",
            to: "+91" + phone,
          });
        } else {
          // Save OTP
          await ctx.prisma.oneTimeToken.create({
            data: {
              userId: user.id,
              otp,
              phone,
              expiresAt: new Date(Date.now() + 2 * 60000),
            },
          });

          // Send OTP to phone
          await client.messages.create({
            body: "Your OTP for Holocron: " + otp,
            from: "+17604562349",
            to: "+91" + phone,
          });
        }

        return {
          status: 200,
          message: "OTP sent successfully",
          result: otp,
        };
      }

      // if (exists.expiresAt > new Date()) {
      //   throw new trpc.TRPCError({
      //     code: "CONFLICT",
      //     message: "OTP already sent to this phone. Try again after some time.",
      //   });
      // }

      if (exists.expiresAt <= new Date()) {
        //delete prev OTP
        await ctx.prisma.oneTimeToken.delete({
          where: { id: exists.id },
        });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Get user
        const user = await ctx.prisma.user.findFirst({
          where: { phone },
        });

        // Save OTP
        if (!user) {
          await ctx.prisma.oneTimeToken.create({
            data: { otp, phone, expiresAt: new Date(Date.now() + 2 * 60000) },
          });

          // Send OTP to phone
          await client.messages.create({
            body: "Your OTP for Holocron: " + otp,
            from: "+17604562349",
            to: "+91" + phone,
          });
        } else {
          // Save OTP
          await ctx.prisma.oneTimeToken.create({
            data: {
              userId: user.id,
              otp,
              phone,
              expiresAt: new Date(Date.now() + 2 * 60000),
            },
          });

          // Send OTP to phone
          await client.messages.create({
            body: "Your OTP for Holocron: " + otp,
            from: "+17604562349",
            to: "+91" + phone,
          });
        }

        return {
          status: 200,
          message: "OTP sent successfully",
        };
      }
    }),

  loginWithPhone: publicProcedure
    .input(loginMobileSchema)
    .mutation(async (req) => {
      const { input, ctx } = req;
      const { phone, otp } = await loginMobileSchema.parseAsync(input);

      const exists = await ctx.prisma.oneTimeToken.findFirst({
        where: {
          otp,
          user: {
            phone,
          },
        },
        include: {
          user: true,
        },
      });

      if (!exists) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Invalid OTP/User not Found",
        });
      }

      if (exists.expiresAt < new Date()) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "OTP expired. Try again.",
        });
      }

      // delete otp from db
      await ctx.prisma.oneTimeToken.delete({
        where: { id: exists.id },
      });

      if (!exists.user) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      const user = await ctx.prisma.user.findFirst({
        where: {
          phone,
        },
      });

      if (!user) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not Found",
        });
      }

      const jwt = signJwt({
        email: exists.user.email,
        phone: exists.user.phone,
        id: exists.user.id,
        name: exists.user.name,
        phoneVerified: exists.user.phoneVerified,
        emailVerified: exists.user.emailVerified,
        image: user.image,
        iat: Math.floor(Date.now() / 1000), // Issued at time
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 1, // Expire time
      });

      return {
        status: 200,
        jwt,
        user,
      };
    }),

  verifyEmail: publicProcedure
    .input(verifyEmailSchema)
    .mutation(async (req) => {
      const { input, ctx } = req;

      const { jwt, otp } = await verifyEmailSchema.parseAsync(input);

      // jwt decode
      const decoded: jwtSchema = decodeJwt(jwt);

      const nowuser = await ctx.prisma.user.findFirst({
        where: {
          id: decoded.id,
        },
      });

      if (!nowuser) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not Found",
        });
      }

      const exists = await ctx.prisma.oneTimeToken.findFirst({
        where: {
          otp,
          user: {
            email: nowuser.email,
          },
        },
        include: {
          user: true,
        },
      });

      if (!exists) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Invalid OTP/User not Found",
        });
      }

      if (exists.expiresAt < new Date()) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "OTP expired. Try again.",
        });
      }

      // delete otp from db
      await ctx.prisma.oneTimeToken.delete({
        where: { id: exists.id },
      });

      if (!exists.user) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      // update user
      const update = await ctx.prisma.user.update({
        where: {
          id: exists.user.id,
        },
        data: {
          emailVerified: new Date(),
        },
      });

      if (!update) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      return {
        success: true,
      };
    }),

  updateProfile: publicProcedure
    .input(updateProfileSchema)
    .mutation(async (req) => {
      const { ctx, input } = req;

      const { jwt, image, dateofbirth, gender, address, pincode, country } =
        await updateProfileSchema.parseAsync(input);

      // jwt decode
      const decoded: jwtSchema = decodeJwt(jwt);

      const user = await ctx.prisma.user.findFirst({
        where: {
          id: decoded.id,
        },
      });

      if (!user) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not Found",
        });
      }

      const dob = new Date(dateofbirth);

      const updatedUser = await ctx.prisma.user.update({
        where: {
          id: decoded.id,
        },
        data: {
          image,
          dateOfBirth: dob,
          gender,
          address,
          pincode,
          country,
        },
      });

      if (!updatedUser) {
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not update profile",
        });
      }

      return {
        status: 200,
        message: "Profile updated successfully",
      };
    }),
  getAllUserDetails: publicProcedure
    .input(mobileAuthSchema)
    .mutation(async (req) => {
      const { ctx, input } = req;

      const { jwt } = await mobileAuthSchema.parseAsync(input);

      // jwt decode
      const decoded: jwtSchema = decodeJwt(jwt);

      const user = await ctx.prisma.user.findFirst({
        where: {
          id: decoded.id,
        },
      });

      if (!user) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not Found",
        });
      }

      return {
        status: 200,
        user,
      };
    }),
  dashboardInfo: publicProcedure
    .input(mobileAuthSchema)
    .mutation(async (req) => {
      const { ctx, input } = req;

      const { jwt } = await mobileAuthSchema.parseAsync(input);

      // jwt decode
      const decoded: jwtSchema = decodeJwt(jwt);

      const user = await ctx.prisma.user.findFirst({
        where: {
          id: decoded.id,
        },
      });

      if (!user) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not Found",
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
  thirdParty: publicProcedure
    .input(
      z.object({
        phone: z.string(),
        clientID: z.string(),
        scope: z.string(),
      })
    )
    .mutation(async (req) => {
      const { ctx, input } = req;

      const { phone, clientID, scope } = input;

      const nowuser = await ctx.prisma.user.findUnique({
        where: {
          phone,
        },
      });

      if (!nowuser) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not Found",
        });
      }

      // check if clientID exists
      const clientExists = await ctx.prisma.registeredApps.findUnique({
        where: {
          clientId: clientID,
        },
      });

      if (!clientExists) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Client not Found",
        });
      }

      // make login request
      const loginRequest = await ctx.prisma.loginRequest.create({
        data: {
          user: {
            connect: {
              id: nowuser.id,
            },
          },
          RegisteredApps: {
            connect: {
              clientId: clientID,
            },
          },
          scope,
          state: "app",
          redirectUri: "app",
          responseType: "app",
        },
      });

      if (!loginRequest) {
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create login request",
        });
      }

      return {
        user: nowuser,
      };
    }),

  thirdPartyConsent: publicProcedure
    .input(
      z.object({
        phone: z.string(),
        clientID: z.string(),
      })
    )
    .mutation(async (req) => {
      const { ctx, input } = req;

      const { phone, clientID } = input;

      const nowuser = await ctx.prisma.user.findUnique({
        where: {
          phone,
        },
      });

      if (!nowuser) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not Found",
        });
      }

      // check if clientID exists
      const clientExists = await ctx.prisma.registeredApps.findUnique({
        where: {
          clientId: clientID,
        },
      });

      if (!clientExists) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Client not Found",
        });
      }

      // edit login request
      const loginRequest = await ctx.prisma.loginRequest.findFirst({
        where: {
          regAppsId: clientExists.id,
          userId: nowuser.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!loginRequest) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Login Request not Found",
        });
      }

      const editloginRequest = await ctx.prisma.loginRequest.update({
        where: {
          id: loginRequest.id,
        },
        data: {
          consent: true,
        },
      });

      if (!editloginRequest) {
        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create login request",
        });
      }

      // check if connected app exists
      const connectedAppExists = await ctx.prisma.connectedApps.findFirst({
        where: {
          userId: nowuser.id,
          appId: clientExists.id,
        },
      });

      if (!connectedAppExists) {
        // connect apps
        const connectApp = await ctx.prisma.connectedApps.create({
          data: {
            user: {
              connect: {
                id: nowuser.id,
              },
            },
            app: {
              connect: {
                id: clientExists.id,
              },
            },
            scope: loginRequest.scope,
          },
        });

        if (!connectApp) {
          throw new trpc.TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not create login request",
          });
        }

        return {
          success: true,
        };
      }

      return {
        success: true,
      };
    }),
});
