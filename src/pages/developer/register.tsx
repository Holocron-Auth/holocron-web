import { zodResolver } from "@hookform/resolvers/zod";
import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "src/client/layout";
import IntroLayout from "src/client/layout/intro";
import { useUserContext } from "src/context/user.context";

import { api } from "src/utils/api";
import {
  RegisterApp,
  RegisterAppDatabase,
  registerApp,
} from "src/utils/validation/dev";

const RegisterApp: NextPage = () => {
  const router = useRouter();

  const ctxUser = useUserContext();

  if (ctxUser === null) {
    router.push({
      pathname: "/auth/login",
      query: {
        redirect: "/developer/register",
        prompt: "Login to register a new app",
      },
    });
    return <></>;
  }

  const [loggingErrors, setLoggingErrors] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterApp>({
    resolver: zodResolver(registerApp),
  });

  const regAppMutation = api.dev.registerApp.useMutation({
    onSuccess: () => router.push("/developer"),
    onError: (err) => setLoggingErrors(err.message),
  });
  [];

  // const isCompletedProfile = api.authedUsers.isCompletedProfile.useQuery();

  // const isProfileDone = isCompletedProfile.data?.completedProfile;

  // if (isProfileDone !== true && regAppMutation.isError) {
  //   router.push({
  //     pathname: "/profile",
  //   });
  //   return <></>;
  // }

  const createPresignedUrlMutation = api.dev.createPresignedUrl.useMutation({
    onSuccess: () => {
      console.log("successfully generated link");
    },
    onError: (err) => setLoggingErrors(err.message),
  });

  const onSubmit = useCallback(
    async (data: RegisterApp) => {
      const { url, fields } = await createPresignedUrlMutation.mutateAsync();
      const newData: RegisterAppDatabase = {
        appName: data.appName,
        appLogo: "",
        appHomepage: data.appHomepage,
        appPrivacyPolicy: data.appPrivacyPolicy,
        appTermsOfService: data.appTermsOfService,
        appAuthorizedDomains: [],
      };
      newData.appLogo = `https://mailr-attachments.s3.us-west-2.amazonaws.com/${fields.key}`;

      //   upload logo to presigned url
      const file = data.appLogo[0];
      const formData = new FormData();

      Object.entries({ ...fields, file }).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const upload = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (upload.ok) {
        console.log("Uploaded successfully!");
      } else {
        console.error("Upload failed.");
      }
      //   convert data.authorizedUrls to array
      newData.appAuthorizedDomains = data.appAuthorizedDomains.split(",");
      regAppMutation.mutate(newData);
      reset();
    },
    [regAppMutation, reset]
  );

  return (
    <Layout title="Register A New App">
      <div className="mb-6 mt-10 flex w-full flex-col justify-start gap-4">
        <h1 className="text-3xl font-bold text-[#FFB267]">
          Register a New App
        </h1>
        <h2 className="text-lg">
          For more information visit the{" "}
          <a href="" className="text-[#FFB267]">
            Developer Docs
          </a>
        </h2>
      </div>
      {/* Registration Form */}

      <form
        className="flex max-w-xl flex-col gap-4 rounded-lg border-[1px] border-stone-700 bg-stone-800 p-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h3 className="text-lg font-bold text-[#FFB267]">App Information</h3>
        <p className="text-sm text-stone-400">
          This shows in the consent screen, and helps end users know who you are
          and contact you
        </p>
        <label className="flex flex-col gap-2 text-sm">
          App Name:
          <input
            className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
            type="name"
            placeholder="The name of the app asking for consent"
            {...register("appName")}
          />
          {errors.appName && (
            <p className="text-xs text-red-500">{errors.appName?.message}</p>
          )}
        </label>
        <label className="flex flex-col gap-2 text-sm">
          User Support Email:
          <input
            className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
            type="email"
            value={ctxUser.email}
            disabled
          />
        </label>
        <h3 className="text-lg font-bold text-[#FFB267]">App logo</h3>
        <p className="text-sm text-stone-400">
          This is your logo. It helps people recognize your app and is displayed
          on the OAuth consent screen.
        </p>
        <label className="flex flex-col gap-2 text-sm">
          App Logo:
          <input
            className="rounded-lg px-2 py-2 text-sm text-stone-400 file:mr-4 file:rounded-lg file:border-0 file:bg-[#FFB267]/30 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#FFB267] hover:file:bg-[#FFB267]/10"
            type="file"
            {...register("appLogo")}
          />
          {errors.appLogo && (
            <p className="text-xs text-red-500">
              {JSON.stringify(errors.appLogo.message)}
            </p>
          )}
        </label>
        <h3 className="text-lg font-bold text-[#FFB267]">App domain</h3>
        <p className="text-sm text-stone-400">
          To protect you and your users, Holocron only allows apps using OAuth
          to use Authorized Domains. The following information will be shown to
          your users on the consent screen.
        </p>
        <label className="flex flex-col gap-2 text-sm">
          Application Homepage:
          <input
            className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
            type="url"
            placeholder="Provide users a link to your home page"
            {...register("appHomepage")}
          />
          {errors.appHomepage && (
            <p className="text-xs text-red-500">
              {errors.appHomepage?.message}
            </p>
          )}
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Application Privacy Policy:
          <input
            className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
            type="url"
            placeholder="Provide users a link to your public privacy policy"
            {...register("appPrivacyPolicy")}
          />
          {errors.appPrivacyPolicy && (
            <p className="text-xs text-red-500">
              {errors.appPrivacyPolicy?.message}
            </p>
          )}
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Application Terms of Service:
          <input
            className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
            type="url"
            placeholder="Provide users a link to your home page"
            {...register("appTermsOfService")}
          />
          {errors.appTermsOfService && (
            <p className="text-xs text-red-500">
              {errors.appTermsOfService?.message}
            </p>
          )}
        </label>
        <h4 className="font-bold text-[#FFB267]">Authorized domains</h4>
        <p className="text-sm text-stone-400">
          When a domain is used on the consent screen or in an OAuth client’s
          configuration, it must be pre-registered here.
        </p>
        <label className="flex flex-col gap-2 text-sm">
          Add authorized domains (Add , between domains):
          <input
            className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
            type="url"
            placeholder="Authorized Domains"
            {...register("appAuthorizedDomains")}
          />
          {errors.appAuthorizedDomains && (
            <p className="text-xs text-red-500">
              {errors.appAuthorizedDomains?.message}
            </p>
          )}
        </label>
        <button
          className="rounded-lg bg-[#FFB267] p-2 text-sm font-medium text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-orange-900"
          disabled={
            regAppMutation.isLoading || createPresignedUrlMutation.isLoading
          }
          type="submit"
        >
          Register the app
        </button>
        {createPresignedUrlMutation.error && (
          <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
            Something went wrong! {createPresignedUrlMutation.error.message}
          </p>
        )}
        {loggingErrors && (
          <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
            Something went wrong! {loggingErrors}
          </p>
        )}
      </form>
    </Layout>
  );
};

export default RegisterApp;
