import { createTRPCRouter } from "src/server/api/trpc";
import { authRouter } from "./routers/auth.router";
import { authedUsersRouter } from "./routers/authedUsers.router";
import { devRouter } from "./routers/dev.router";
import { oauthRouter } from "./routers/oauth.router";
import { mobileAuthRouter } from "./routers/mobileauth.router";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  authedUsers: authedUsersRouter,
  dev: devRouter,
  oauth: oauthRouter,
  mobile: mobileAuthRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
