import {
  createTRPCRouter,
  highFeatureProcedure,
  protectedProcedure,
} from "src/server/api/trpc";
import { serialize } from "cookie";
import {
  deleteRegisterApp,
  registerApp,
  registerAppDatabase,
  registerAppEdit,
} from "src/utils/validation/dev";
import { nanoid } from "nanoid";
import { env } from "process";
import { TRPCError } from "@trpc/server";
import { TypeOf } from "zod";

export const devRouter = createTRPCRouter({
  registerApp: highFeatureProcedure
    .input(registerAppDatabase)
    .mutation(async (req) => {
      const { input, ctx } = req;
      const {
        appName,
        appLogo,
        appHomepage,
        appPrivacyPolicy,
        appTermsOfService,
        appAuthorizedDomains,
      } = await registerAppDatabase.parseAsync(input);
      const { user } = ctx;

      // generate client_id
      const client_id = nanoid();

      const app = await ctx.prisma.registeredApps.create({
        data: {
          name: appName,
          logo: appLogo,
          clientId: client_id,
          homePageUrl: appHomepage,
          privacyPolicyUrl: appPrivacyPolicy,
          termsOfServiceUrl: appTermsOfService,
          AuthorizedDomains: {
            create: appAuthorizedDomains.map((domain) => ({
              domain,
            })),
          },
          developer: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      return {
        status: "success",
      };
    }),

  createPresignedUrl: protectedProcedure.mutation(async (req) => {
    const { ctx } = req;
    const { user } = ctx;

    const params = {
      Bucket: env.AWS_BUCKET_NAME,
      Fields: {
        key: `${user?.id}/${Date.now()}`,
      },
      Expires: 60,
      Conditions: [
        ["content-length-range", 0, 1048576], // up to 1 MB
      ],
      ContentType: "image/*",
    };

    const uploadUrl = await ctx.s3.createPresignedPost(params);

    if (!uploadUrl) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not create presigned URL",
      });
    }

    return uploadUrl;
  }),

  getRegisteredApps: protectedProcedure.query(async (req) => {
    const { ctx } = req;
    const { user } = ctx;
    const apps = await ctx.prisma.registeredApps.findMany({
      where: {
        developer: {
          id: user.id,
        },
      },
    });

    const authorizedDomains = await ctx.prisma.authorizedDomains.findMany({
      where: {
        app: {
          developer: {
            id: user.id,
          },
        },
      },
    });

    const newApps: any[] = [];

    // loop over apps and add authorized domains
    apps.forEach((app) => {
      let newApp = app as any;
      newApp.authorizedDomains = authorizedDomains
        .filter((domain) => domain.appId === app.id)
        .map((domain) => domain.domain);
      newApps.push(newApp);
    });

    return {
      newApps,
    };
  }),

  deleteRegisteredApp: highFeatureProcedure
    .input(deleteRegisterApp)
    .mutation(async (req) => {
      const { ctx, input } = req;
      const { user } = ctx;

      const { appId } = await deleteRegisterApp.parseAsync(input);

      const app = await ctx.prisma.registeredApps.findUnique({
        where: {
          id: appId,
        },
      });

      if (!app) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App not found",
        });
      }

      if (app.developerId !== user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      await ctx.prisma.registeredApps.delete({
        where: {
          id: appId,
        },
      });

      // delete all authorized domains
      await ctx.prisma.authorizedDomains.deleteMany({
        where: {
          appId,
        },
      });

      return {
        status: "success",
      };
    }),
});
