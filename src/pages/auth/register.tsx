import { zodResolver } from "@hookform/resolvers/zod";
import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import IntroLayout from "src/client/layout/intro";
import { useUserContext } from "src/context/user.context";

import { api } from "src/utils/api";
import {
  OTPSchema,
  RegisterOTPSchema,
  RegisterSchema,
  otpSchema,
  registerSchema,
} from "src/utils/validation/auth";

type RegisterProps = {
  redirect?: string;
};

const Register: NextPage<RegisterProps> = ({ redirect = "/dashboard" }) => {
  const router = useRouter();

  const data = useUserContext();

  if (data) {
    router.push(redirect);
  }

  const [otpEnv, setOtpEnv] = useState(false);
  const [regData, setRegData] = useState<RegisterOTPSchema>();
  const [loggingErrors, setLoggingErrors] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
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

  const regUserMutation = api.auth.regUserWithEmail.useMutation({
    onSuccess: () => router.reload(),
    onError: (err) => setLoggingErrors(err.message),
  });

  const onOTP = useCallback(
    async (data: OTPSchema) => {
      if (regData !== undefined) {
        regData.otp = data.otp;
        regUserMutation.mutate(regData);
      }
    },
    [regData, regUserMutation]
  );

  const onSubmit = useCallback(
    async (data: RegisterSchema) => {
      let dob = new Date(data?.dateOfBirth);
      if (new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 16) < dob) {
        setLoggingErrors("You must be 16 years or older to register!");
        return;
      }
      otpMutation.mutate({ email: data.email });
      const newdata: RegisterOTPSchema = { ...data, otp: "123456" };
      setRegData(newdata);
      reset();
    },
    [otpMutation]
  );

  return (
    <IntroLayout title="Register">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-[#FFB267]">
          Welcome to Holocron Auth
        </h1>
        <h2 className="text-lg">A Secure and User-Friendly OAuth Platform</h2>
      </div>
      {/* Registration Form */}
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
              placeholder="john@doe.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email?.message}</p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Name:
            <input
              className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
              type="name"
              placeholder="John Doe"
              {...register("name")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email?.message}</p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Phone:
            <input
              className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
              type="phone"
              placeholder="9989843232"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone?.message}</p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Date of Birth:
            <input
              className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
              type="date"
              {...register("dateOfBirth")}
            />
            {errors.dateOfBirth && (
              <p className="text-xs text-red-500">
                {errors.dateOfBirth?.message}
              </p>
            )}
          </label>
          <button
            className="rounded-lg bg-[#FFB267] p-2 text-sm font-medium text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-orange-900"
            disabled={otpMutation.isLoading}
            type="submit"
          >
            Register
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
            Enter OTP sent to your email:
            <input
              className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
              type="otp"
              {...reg("otp")}
            />
            {errs.otp && (
              <p className="text-xs text-red-500">{errs.otp?.message}</p>
            )}
          </label>
          <button
            className="rounded-lg bg-[#FFB267] p-2 text-sm font-medium text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-orange-900"
            disabled={regUserMutation.isLoading}
            type="submit"
          >
            Register
          </button>
          {regUserMutation.error && (
            <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
              Something went wrong!
            </p>
          )}
          {loggingErrors && (
            <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
              Something went wrong! {loggingErrors}
            </p>
          )}
        </form>
      )}
      <p>
        Already have an account?{" "}
        <Link href="/auth/login">
          <span className="text-[#FFB267]">Login</span>
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

Register.getInitialProps = async (ctx) => {
  const { redirect } = ctx.query;
  console.log(redirect);
  return { redirect: redirect as string };
};

export default Register;
