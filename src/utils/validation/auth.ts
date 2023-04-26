import { z } from "zod";

const MAX_FILE_SIZE = 1000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const loginSchema = z.object({
  email: z.string().email(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const loginOTPSchema = loginSchema.extend({
  otp: z.string().min(6).max(6),
});

export type LoginOTPSchema = z.infer<typeof loginOTPSchema>;

export const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  name: z.string().min(1),
  dateOfBirth: z.string().min(1),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export const registerOTPSchema = registerSchema.extend({
  otp: z.string().min(6).max(6),
});

export type RegisterOTPSchema = z.infer<typeof registerOTPSchema>;

export const generateOTPSchema = z.object({
  email: z.string().email(),
});

export type GenerateOTPSchema = z.infer<typeof generateOTPSchema>;

export const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
});

export type VerifyOTPSchema = z.infer<typeof verifyOTPSchema>;

export const otpSchema = z.object({
  otp: z.string().min(6).max(6),
});

export type OTPSchema = z.infer<typeof otpSchema>;

export const generateMobileOTPSchema = z.object({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .min(10)
    .max(10),
});

export const registerMobileSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  name: z.string().min(1),
  otp: z.string().min(6).max(6),
});

export const loginMobileSchema = z.object({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .min(10)
    .max(10),
  otp: z.string().min(6).max(6),
});

export const mobileAuthSchema = z.object({
  jwt: z.string(),
});

export const verifyEmailSchema = z.object({
  otp: z.string().min(6).max(6),
  jwt: z.string(),
});

export const updateProfileSchema = mobileAuthSchema.extend({
  dateofbirth: z.string().min(1),
  image: z.string().min(1),
  gender: z.string().min(1),
  address: z.string().min(1),
  pincode: z.string().min(1),
  country: z.string().min(1),
});

export const updateProfileWebSchema = z.object({
  image: z
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
  gender: z.enum(["na", "Male", "Female", "Other"]),
  address: z.string().min(1),
  pincode: z.string().min(1),
  country: z.string().min(1),
});

export const updateProfileWebSchemaDatabase = z.object({
  image: z.string().min(1),
  gender: z.enum(["na", "Male", "Female", "Other"]),
  address: z.string().min(1),
  pincode: z.string().min(1),
  country: z.string().min(1),
});

export type UpdateProfileWebSchemaDatabase = z.infer<
  typeof updateProfileWebSchemaDatabase
>;

export type UpdateProfileWebSchema = z.infer<typeof updateProfileWebSchema>;
