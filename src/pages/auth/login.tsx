import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import IntroLayout from "src/client/layout/intro";
import { useUserContext } from "src/context/user.context";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "src/utils/api";
import {
  LoginSchema,
  OTPSchema,
  loginSchema,
  otpSchema,
} from "src/utils/validation/auth";

type LoginProps = {
  redirect?: string;
  prompt?: string;
};

const Login: NextPage<LoginProps> = ({ redirect = "/dashboard", prompt }) => {
  const router = useRouter();

  const data = useUserContext();

  if (data) {
    router.push(redirect);
  }

  const [otpEnv, setOtpEnv] = useState(false);
  const [logData, setLogData] = useState<LoginSchema>();
  const [loggingErrors, setLoggingErrors] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: reg,
    handleSubmit: hanSubmit,
    formState: { errors: errs },
  } = useForm<OTPSchema>({
    resolver: zodResolver(otpSchema),
  });

  const otpMutation = api.auth.generateOTPWithEmail.useMutation({
    onSuccess: () => setOtpEnv(true),
  });
  const otpVerify = api.auth.loginUserWithEmail.useMutation({
    onSuccess: () => router.reload(),
    onError: (err) => setLoggingErrors(err.message),
  });

  const onOTP = useCallback(
    async (data: OTPSchema) => {
      if (logData !== undefined) {
        otpVerify.mutate({
          email: logData?.email,
          otp: data.otp,
        });
      }
    },
    [logData, otpVerify]
  );

  const onSubmit = useCallback(
    async (data: LoginSchema) => {
      otpMutation.mutate({ email: data.email });
      setLogData(data);
      reset();
    },
    [otpMutation, otpVerify]
  );

  return (
    <IntroLayout title="Login">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-[#FFB267]">
          Welcome Back to Holocron Auth
        </h1>
        <h2 className="text-lg">A Secure and User-Friendly OAuth Platform</h2>
        <div className="max-w-sm">
          {prompt && (
            <p className="rounded-lg border-[1px] border-[#FFB267] bg-[#FFB267]/30 p-2 font-medium text-[#FFB267]">
              {prompt}
            </p>
          )}
        </div>
      </div>
      {/* Login Form */}
      {!otpEnv ? (
        <form
          className="flex max-w-sm flex-col gap-4 rounded-lg border-[1px] border-stone-700 bg-stone-800 p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <label className="flex flex-col gap-2 text-sm">
            Email:
            <input
              className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
              type="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email?.message}</p>
            )}
          </label>
          <button
            className="rounded-lg bg-[#FFB267] p-2 text-sm font-medium text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-orange-900"
            disabled={otpMutation.isLoading}
            type="submit"
          >
            Login
          </button>
          {otpMutation.error && (
            <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
              Something went wrong! {otpMutation.error.message}
            </p>
          )}
          {loggingErrors && (
            <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
              Something went wrong! {loggingErrors}
            </p>
          )}
        </form>
      ) : (
        <form
          className="flex max-w-sm flex-col gap-4 rounded-lg border-[1px] border-stone-700 bg-stone-800 p-4"
          onSubmit={hanSubmit(onOTP)}
        >
          <label className="flex flex-col gap-2 text-sm">
            Enter the OTP sent to your email:
            <input
              className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
              type="otp"
              {...reg("otp")}
            />
            {errs.otp && (
              <p className="text-xs text-red-500">{errs.otp?.message}</p>
            )}
            <p className="text-xs text-red-500"></p>
          </label>
          <button
            className="rounded-lg bg-[#FFB267] p-2 text-sm font-medium text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-orange-900"
            disabled={otpMutation.isLoading}
            type="submit"
          >
            Login
          </button>
          {loggingErrors && (
            <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
              Something went wrong! {loggingErrors}
            </p>
          )}
        </form>
      )}
      <p>
        Don't have an account?{" "}
        <Link href="/auth/register">
          <span className="text-[#FFB267]">Register Now!</span>
        </Link>
      </p>
      <p>
        Are you a developer looking to build using Holocron?{" "}
        <Link href="/developer">
          <span className="text-[#FFB267]">Learn More</span>
        </Link>
      </p>
    </IntroLayout>
  );
};

Login.getInitialProps = async (ctx) => {
  const { redirect, prompt } = ctx.query;
  console.log(redirect, prompt);
  return { redirect: redirect as string, prompt: prompt as string };
};

export default Login;
