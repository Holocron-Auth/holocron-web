import { z } from "zod";

const MAX_FILE_SIZE = 1000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const registerApp = z.object({
  appName: z.string().min(1),
  appLogo: z
    .any()
    .refine((files) => files?.length == 1, "File is required.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 1MB.`
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpeg, .jpg, .png, .webp files are accepted."
    ),
  appHomepage: z.string().min(1),
  appPrivacyPolicy: z.string().min(1),
  appTermsOfService: z.string().min(1),
  appAuthorizedDomains: z.string().min(1),
});

export type RegisterApp = z.infer<typeof registerApp>;

export const registerAppDatabase = z.object({
  appName: z.string().min(1),
  appLogo: z.string().min(1),
  appHomepage: z.string().min(1),
  appPrivacyPolicy: z.string().min(1),
  appTermsOfService: z.string().min(1),
  appAuthorizedDomains: z.array(z.string().min(1)),
});

export type RegisterAppDatabase = z.infer<typeof registerAppDatabase>;

export const deleteRegisterApp = z.object({
  appId: z.string().min(1),
});

export const registerAppEdit = z.object({
  appId: z.string().min(1),
  appName: z.string().min(1).optional(),
  appLogo: z.string().min(1).optional(),
  appHomepage: z.string().min(1).optional(),
  appPrivacyPolicy: z.string().min(1).optional(),
  appTermsOfService: z.string().min(1).optional(),
  appAuthorizedDomains: z.array(z.string().min(1)).optional(),
});
