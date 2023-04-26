import { z } from "zod";

export const getAccessTokenSchema = z.object({
  code: z.string().min(1),
  client_id: z.string().min(1),
});

export const getClientDetailsSchema = z.object({
  client_id: z.string().min(1),
});

export const saveLoginRequestSchema = z.object({
  client_id: z.string().min(1),
  redirect_uri: z.string().min(1),
  scope: z.string().min(1),
  state: z.string().min(1),
  responseType: z.string().min(1),
});

export const getLoginRequestSchema = z.object({
  client_id: z.string().min(1),
  part: z.string().min(1),
});

export const getUserInfoSchema = z.object({
  access_token: z.string().min(1),
});
