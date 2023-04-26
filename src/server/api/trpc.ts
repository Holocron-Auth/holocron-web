/**
 * 1. CONTEXT
 */
import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";

import { getUserFromCookie } from "../user";

import { s3 } from "../aws";

export async function createContext(ctx: trpcNext.CreateNextContextOptions) {
  const { req, res } = ctx;

  const user = await getUserFromCookie(req);

  return {
    req,
    res,
    prisma,
    user,
    s3,
  };
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

/**
 * 2. INITIALIZATION
 */
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { prisma } from "../db";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  const user = await ctx.prisma.user.findUnique({
    where: {
      id: ctx.user.id,
    },
  });

  if (!user) {
    throw new trpc.TRPCError({
      code: "NOT_FOUND",
      message: "User not found/not approved",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

const enforceUserIsProfileDone = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  const user = await ctx.prisma.user.findUnique({
    where: {
      id: ctx.user.id,
    },
  });

  if (!user) {
    throw new trpc.TRPCError({
      code: "NOT_FOUND",
      message: "User not found/not approved",
    });
  }

  if (!user.completedProfile) {
    throw new trpc.TRPCError({
      code: "NOT_FOUND",
      message: "Complete your profile first, to unlock all features.",
    });
  }

  if (!(user.emailVerified !== null || user.phoneVerified !== null)) {
    throw new trpc.TRPCError({
      code: "NOT_FOUND",
      message: "Verify your email or phone to unlock all features.",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

/**
 * Protected (authenticated) procedure
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
export const highFeatureProcedure = t.procedure.use(enforceUserIsAuthed);
