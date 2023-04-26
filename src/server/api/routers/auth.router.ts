import * as trpc from "@trpc/server";
import { serialize } from "cookie";

import { createTRPCRouter, publicProcedure } from "src/server/api/trpc";
import { signJwt } from "src/utils/jwt";
import { sendCreatingAccountMail, sendLoginMail } from "src/utils/mail";
import {
  generateOTPSchema,
  loginOTPSchema,
  registerOTPSchema,
} from "src/utils/validation/auth";

export const authRouter = createTRPCRouter({
  regUserWithEmail: publicProcedure
    .input(registerOTPSchema)
    .mutation(async (req) => {
      const { input, ctx } = req;
      const { email, name, dateOfBirth, phone, otp } =
        await registerOTPSchema.parseAsync(input);

      const exists = await ctx.prisma.oneTimeToken.findFirst({
        where: {
          otp,
          email,
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

      const userexists = await ctx.prisma.user.findFirst({
        where: { email },
      });

      if (userexists) {
        throw new trpc.TRPCError({
          code: "CONFLICT",
          message: "User already exists.",
        });
      }

      const uexists = await ctx.prisma.user.findFirst({
        where: { email },
      });

      if (uexists) {
        throw new trpc.TRPCError({
          code: "CONFLICT",
          message: "User already exists.",
        });
      }

      try {
        // convert date from string to date
        const dob = new Date(dateOfBirth);
        const user = await ctx.prisma.user.create({
          data: {
            email,
            name,
            dateOfBirth: dob,
            phone,
            emailVerified: new Date(),
          },
        });

        const jwt = signJwt({
          email: user.email,
          id: user.id,
          name: user.name,
          emailVerified: user.emailVerified,
          image: user.image,
          phone: user.phone,
          phoneVerified: user.phoneVerified,
          dob: user.dateOfBirth,
        });

        ctx.res.setHeader("Set-Cookie", serialize("token", jwt, { path: "/" }));

        return {
          redirect: "/dashboard",
        };
      } catch (err) {
        throw new trpc.TRPCError({
          code: "CONFLICT",
          message: "Error creating user.",
        });
      }
    }),
  loginUserWithEmail: publicProcedure
    .input(loginOTPSchema)
    .mutation(async (req) => {
      const { input, ctx } = req;
      const { email, otp } = await loginOTPSchema.parseAsync(input);

      const exists = await ctx.prisma.oneTimeToken.findFirst({
        where: {
          otp,
          user: {
            email,
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
          email,
        },
      });

      if (!user) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not Found",
        });
      }

      if (!user.emailVerified) {
        const update = await ctx.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            emailVerified: new Date(),
          },
        });
      }

      const jwt = signJwt({
        email: exists.user.email,
        id: exists.user.id,
        name: exists.user.name,
        emailVerified: exists.user.emailVerified,
        image: user.image,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        dob: user.dateOfBirth,
      });

      ctx.res.setHeader("Set-Cookie", serialize("token", jwt, { path: "/" }));

      return {
        redirect: "/dashboard",
      };
    }),

  // todo schedule cron job to delete otp after 5 minutes
  generateOTPWithEmail: publicProcedure
    .input(generateOTPSchema)
    .mutation(async (req) => {
      const { input, ctx } = req;
      const { email } = await generateOTPSchema.parseAsync(input);

      // Check if user has otp already
      const exists = await ctx.prisma.oneTimeToken.findFirst({
        where: {
          OR: [
            {
              user: { email: email },
            },
            {
              email,
            },
          ],
        },
      });

      if (!exists) {
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Get user
        const user = await ctx.prisma.user.findFirst({
          where: { email },
        });

        if (!user) {
          await ctx.prisma.oneTimeToken.create({
            data: { otp, email, expiresAt: new Date(Date.now() + 2 * 60000) },
          });

          // Send OTP to email
          await sendCreatingAccountMail(email, otp);
        } else {
          // Save OTP
          await ctx.prisma.oneTimeToken.create({
            data: {
              userId: user.id,
              otp,
              email,
              expiresAt: new Date(Date.now() + 2 * 60000),
            },
          });

          // Send OTP to email
          await sendLoginMail(email, otp);
        }

        return {
          status: 200,
          message: "OTP sent successfully",
          result: email,
        };
      }

      if (exists.expiresAt > new Date()) {
        throw new trpc.TRPCError({
          code: "CONFLICT",
          message: "OTP already sent to this email. Try again after some time.",
        });
      }

      if (exists.expiresAt <= new Date()) {
        //delete prev OTP
        await ctx.prisma.oneTimeToken.delete({
          where: { id: exists.id },
        });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Get user
        const user = await ctx.prisma.user.findFirst({
          where: { email },
        });

        // Save OTP
        if (!user) {
          await ctx.prisma.oneTimeToken.create({
            data: { otp, email, expiresAt: new Date(Date.now() + 2 * 60000) },
          });

          // Send OTP to email
          await sendCreatingAccountMail(email, otp);
        } else {
          // Save OTP
          await ctx.prisma.oneTimeToken.create({
            data: {
              userId: user.id,
              otp,
              email,
              expiresAt: new Date(Date.now() + 2 * 60000),
            },
          });

          // Send OTP to email
          await sendLoginMail(email, otp);
        }

        return {
          status: 200,
          message: "OTP sent successfully",
          result: email,
        };
      }
    }),

  me: publicProcedure.query(async (req) => {
    const { ctx } = req;

    if (!ctx.user) {
      return null;
    }

    return ctx.user;
  }),
});
