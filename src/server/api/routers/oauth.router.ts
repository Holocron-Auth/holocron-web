import {
  getAccessTokenSchema,
  getClientDetailsSchema,
  getLoginRequestSchema,
  getUserInfoSchema,
  saveLoginRequestSchema,
} from "src/utils/validation/oauth";
import {
  createTRPCRouter,
  highFeatureProcedure,
  protectedProcedure,
  publicProcedure,
} from "src/server/api/trpc";
import { serialize } from "cookie";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import path from "path";
import { env } from "src/env.mjs";

export const oauthRouter = createTRPCRouter({
  getClientDetails: publicProcedure
    .input(getClientDetailsSchema)
    .query(async (req) => {
      const { input, ctx } = req;

      const { client_id } = await getClientDetailsSchema.parseAsync(input);

      const app = await ctx.prisma.registeredApps.findUnique({
        where: {
          clientId: client_id,
        },
      });

      if (!app) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App not found.",
        });
      }

      return {
        clientName: app.name,
      };
    }),
  saveLoginRequest: highFeatureProcedure
    .input(saveLoginRequestSchema)
    .mutation(async (req) => {
      const { input, ctx } = req;
      const { client_id, redirect_uri, scope, state, responseType } =
        await saveLoginRequestSchema.parseAsync(input);

      const app = await ctx.prisma.registeredApps.findUnique({
        where: {
          clientId: client_id,
        },
      });

      if (!app) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App not found.",
        });
      }

      // Check if recent request by same client and user exists
      const recentRequest = await ctx.prisma.loginRequest.findFirst({
        where: {
          RegisteredApps: {
            id: app.id,
          },
          user: {
            id: ctx.user.id,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (recentRequest) {
        // Check if recent request is less than 1 minutes old
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);

        if (recentRequest.createdAt > oneMinuteAgo) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests. Try again in a few minutes.",
          });
        }
      }

      // Check whether consent is already given
      const consent = await ctx.prisma.connectedApps.findFirst({
        where: {
          user: {
            id: ctx.user.id,
          },
          app: {
            id: app.id,
          },
        },
      });

      if (consent) {
        const authCode = await ctx.prisma.authorizationTokens.findFirst({
          where: {
            ConnectedApps: {
              id: consent.id,
            },
          },
        });

        if (!authCode) {
          // delete consent
          await ctx.prisma.connectedApps.delete({
            where: {
              id: consent.id,
            },
          });
        } else {
          return {
            consent: true,
            redirectUri: redirect_uri,
            state: state,
            code: authCode.token,
          };
        }
      }

      const loginRequest = await ctx.prisma.loginRequest.create({
        data: {
          RegisteredApps: {
            connect: {
              id: app.id,
            },
          },
          redirectUri: redirect_uri,
          scope,
          state,
          responseType,
          user: {
            connect: {
              id: ctx.user.id,
            },
          },
        },
      });

      return {
        part: loginRequest.id,
        consent: false,
      };
    }),

  getLoginRequest: protectedProcedure
    .input(getLoginRequestSchema)
    .query(async (req) => {
      const { input, ctx } = req;
      const { client_id, part } = await getLoginRequestSchema.parseAsync(input);

      const app = await ctx.prisma.loginRequest.findUnique({
        where: {
          id: part,
        },
        include: {
          RegisteredApps: true,
        },
      });

      if (
        !app ||
        !app.RegisteredApps ||
        app.RegisteredApps.clientId !== client_id ||
        app.userId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App not found.",
        });
      }

      if (app?.createdAt.getTime() + 120000 < Date.now()) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Login request expired.",
        });
      }

      return {
        clientName: app.RegisteredApps.name,
        redirectUri: app.redirectUri,
        scope: app.scope,
        state: app.state,
      };
    }),

  generateAuthorizationCode: highFeatureProcedure
    .input(getLoginRequestSchema)
    .mutation(async (req) => {
      const { input, ctx } = req;
      const { client_id, part } = await getLoginRequestSchema.parseAsync(input);

      const app = await ctx.prisma.loginRequest.findUnique({
        where: {
          id: part,
        },
        include: {
          RegisteredApps: true,
        },
      });

      if (
        !app ||
        !app.RegisteredApps ||
        app.RegisteredApps.clientId !== client_id ||
        app.userId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App not found.",
        });
      }

      const scope = app.scope;

      if (app?.createdAt.getTime() + 120000 < Date.now()) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Login request expired.",
        });
      }

      // Check if app is already connected
      let connectApp = await ctx.prisma.connectedApps.findFirst({
        where: {
          app: {
            id: app.RegisteredApps.id,
          },
          user: {
            id: ctx.user.id,
          },
        },
      });

      if (connectApp == null || connectApp.id === undefined) {
        connectApp = await ctx.prisma.connectedApps.create({
          data: {
            scope,
            app: {
              connect: {
                id: app.RegisteredApps.id,
              },
            },
            user: {
              connect: {
                id: ctx.user.id,
              },
            },
          },
        });
      }

      let authToken = nanoid(32);

      const code = await ctx.prisma.authorizationTokens.create({
        data: {
          token: authToken,
          ConnectedApps: {
            connect: {
              id: connectApp.id,
            },
          },
        },
      });

      if (!code) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }

      // update login request consent to true
      await ctx.prisma.loginRequest.update({
        where: {
          id: part,
        },
        data: {
          consent: true,
        },
      });

      return {
        redirectLink: `${app.redirectUri}?code=${authToken}&state=${app.state}`,
      };
    }),

  getAccessToken: publicProcedure
    .input(getAccessTokenSchema)
    .mutation(async (req) => {
      const { input, ctx } = req;
      const { code, client_id } = await getAccessTokenSchema.parseAsync(input);
      console.log(code, client_id);
      const app = await ctx.prisma.registeredApps.findUnique({
        where: {
          clientId: client_id,
        },
      });

      if (!app) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reg App not found.",
        });
      }

      const connectedApp = await ctx.prisma.authorizationTokens.findFirst({
        where: {
          token: code,
        },
        include: {
          ConnectedApps: true,
        },
      });

      if (
        !connectedApp ||
        !connectedApp.ConnectedApps ||
        !connectedApp.connectedAppsId
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Con App not found.",
        });
      }

      console.log(connectedApp.ConnectedApps?.appId, app.id);

      if (connectedApp.ConnectedApps?.appId !== app.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Code not related.",
        });
      }

      const access_token = nanoid(32);
      const refresh_token = nanoid(32);

      const accessToken = await ctx.prisma.accessTokens.create({
        data: {
          token: access_token,
          ConnectedApps: {
            connect: {
              id: connectedApp.connectedAppsId,
            },
          },
        },
      });

      if (!accessToken) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }

      const refreshToken = await ctx.prisma.refreshTokens.create({
        data: {
          token: refresh_token,
          ConnectedApps: {
            connect: {
              id: connectedApp.connectedAppsId,
            },
          },
        },
      });

      if (!refreshToken) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }

      return {
        access_token: accessToken.token,
        refresh_token: refreshToken.token,
      };
    }),

  getUserInfo: publicProcedure
    .input(getUserInfoSchema)
    .mutation(async (req) => {
      const { input, ctx } = req;
      const { access_token } = await getUserInfoSchema.parseAsync(input);

      const accessToken = await ctx.prisma.accessTokens.findFirst({
        where: {
          token: access_token,
        },
        include: {
          ConnectedApps: true,
        },
      });

      if (!accessToken || !accessToken.ConnectedApps) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App not found.",
        });
      }

      const user = await ctx.prisma.user.findUnique({
        where: {
          id: accessToken.ConnectedApps.userId!,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App not found.",
        });
      }

      const scopeArr = accessToken.ConnectedApps.scope.split(" ");

      const userObj: any = {};

      if (scopeArr.includes("identify")) {
        userObj["id"] = user.id;
        userObj["name"] = user.name;
        userObj["image"] = env.VERCEL_URL + user.image;
      }

      if (scopeArr.includes("email")) {
        userObj["email"] = user.email;
      }

      if (scopeArr.includes("phone")) {
        userObj["phone"] = user.phone;
      }

      if (scopeArr.includes("address")) {
        userObj["address"] = user.address;
      }

      return userObj;
    }),
});
