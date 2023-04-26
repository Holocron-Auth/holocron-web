import { zodResolver } from "@hookform/resolvers/zod";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "src/client/layout";
import Logo from "src/client/layout/components/Logo";
import Doughnut from "src/client/layout/components/Percentage";
import { useUserContext } from "src/context/user.context";
import { api } from "src/utils/api";
import {
  UpdateProfileWebSchema,
  UpdateProfileWebSchemaDatabase,
  updateProfileWebSchema,
} from "src/utils/validation/auth";

const SidebarComponent: FC<{
  href: string;
  children: JSX.Element | JSX.Element[] | string;
}> = ({ children, href }) => {
  const router = useRouter();
  // get current route
  const currentRoute = router.pathname;
  return (
    <li
      className={
        "rounded-l-lg py-2 pl-2 hover:bg-[#FFB267] hover:text-white" +
        (currentRoute === href ? " bg-[#FFB267] text-white" : "")
      }
    >
      <Link href={href}>
        <div className="flex items-center gap-2">
          <span className="w-full text-white">{children}</span>
        </div>
      </Link>
    </li>
  );
};

const Profile: NextPage = () => {
  const router = useRouter();

  const ctxUser = useUserContext();

  const ProfilePCT = 50;

  if (ctxUser === null) {
    router.push({
      pathname: "/auth/login",
      query: {
        redirect: "/profile",
        prompt: "Login to access your profile",
      },
    });
    return <></>;
  }

  const isCompletedProfile = api.authedUsers.isCompletedProfile.useQuery();

  const isProfileDone = isCompletedProfile.data?.completedProfile;

  const [loggingErrors, setLoggingErrors] = useState<string>("");
  const [editInfo, setEditInfo] = useState<boolean>(
    isProfileDone! ? true : false
  );

  const { data, isLoading, isError } = api.authedUsers.essentialInfo.useQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileWebSchema>({
    resolver: zodResolver(updateProfileWebSchema),
  });

  const regAppMutation = api.authedUsers.updateProfile.useMutation({
    onSuccess: () => {
      setEditInfo(true);
      router.reload();
    },
    onError: (err) => setLoggingErrors(err.message),
  });
  [];

  const createPresignedUrlMutation = api.dev.createPresignedUrl.useMutation({
    onSuccess: () => {
      console.log("successfully generated link");
    },
    onError: (err) => setLoggingErrors(err.message),
  });

  const onEditSubmit = useCallback(
    async (data: UpdateProfileWebSchema) => {
      const { url, fields } = await createPresignedUrlMutation.mutateAsync();
      const newData: UpdateProfileWebSchemaDatabase = {
        image: "",
        address: data.address,
        pincode: data.pincode,
        country: data.country,
        gender: data.gender,
      };
      newData.image = `https://mailr-attachments.s3.us-west-2.amazonaws.com/${fields.key}`;

      //   upload logo to presigned url
      const file = data.image[0];
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
      regAppMutation.mutate(newData);
      reset();
    },
    [regAppMutation, reset]
  );

  const logout = api.authedUsers.logout.useMutation({
    onSuccess: () => {
      router.reload();
      router.push("/");
    },
  });

  const onSubmit = useCallback(() => {
    logout.mutate();
  }, [logout]);

  console.log(editInfo);

  return (
    <Layout title="Profile">
      <section className="mx-auto mt-10 flex max-w-7xl gap-10">
        <div className="flex w-1/4 flex-col gap-4">
          <section className="rounded-xl bg-[#2E2E2E] py-3 pb-4 pl-5">
            <h2 className="my-2 text-2xl font-medium text-[#FFB267]">
              Complete your Profile
            </h2>
            <ul className="flex flex-col gap-2">
              <SidebarComponent href="#primary-info">
                Primary Information
              </SidebarComponent>
              <SidebarComponent href="#essential-info">
                Essential Information
              </SidebarComponent>
            </ul>
          </section>
        </div>
        <div className="w-3/4">
          {!isCompletedProfile.data?.completedProfile &&
            !isCompletedProfile.isLoading && (
              <section className="mb-6 flex items-center justify-between rounded-xl border-2 border-[#ffb267] bg-[#2E2E2E] p-4 px-12">
                <div className="relative flex h-20 w-1/5 items-center justify-center gap-4">
                  <Doughnut pct={ProfilePCT} title={"profile"} />
                  <p className=" text-3xl font-bold">{ProfilePCT + "%"}</p>
                </div>

                <div>
                  <h2 className="text-2xl font-medium text-[#FFB267]">
                    Profile
                  </h2>
                  <p>Complete Profile to access all features</p>
                </div>

                <Link href="/profile">
                  <p className="flex items-center justify-center gap-2 rounded-xl bg-[#FFB267] px-4 py-2 text-lg font-bold text-white">
                    Complete Your Profile
                  </p>
                </Link>
              </section>
            )}
          <section className=" flex w-full items-center justify-between rounded-xl bg-stone-700 px-8 py-6">
            <h1 className="text-2xl font-semibold text-stone-200">
              Welcome, {ctxUser.name}
            </h1>
            <button
              className="rounded-xl bg-[#FFB267] px-6 py-2 text-lg font-bold text-white"
              onClick={() => onSubmit()}
            >
              {ctxUser ? "Logout" : "Login"}
            </button>
          </section>
          <form
            id="primary-info"
            className="mt-8 flex w-full flex-col rounded-xl border-[1px] border-stone-700 bg-stone-800 p-4"
          >
            <h3 className="py-2 pl-2 text-xl font-bold text-[#FFB267]">
              Primary Information
            </h3>
            <section className="grid grid-cols-2 gap-6 p-2">
              <label className="flex max-w-xl flex-col gap-2 text-sm">
                Name:
                <input
                  className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
                  type="email"
                  value={ctxUser.name}
                  disabled
                />
              </label>
              <label className="flex max-w-xl flex-col gap-2 text-sm">
                Date of Birth (DD/MM/YYYY):
                <input
                  className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
                  type="string"
                  value={new Date(ctxUser.dob).toLocaleDateString("en-IN")}
                  disabled
                />
              </label>
              <label className="flex max-w-xl flex-col gap-2 text-sm">
                Email ID:
                <input
                  className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
                  type="email"
                  value={ctxUser.email}
                  disabled
                />
                {ctxUser.emailVerified ? (
                  <p className="text-green-500">Verified</p>
                ) : (
                  <p className="text-red-500">Not Verified</p>
                )}
              </label>
              <label className="flex max-w-xl flex-col gap-2 text-sm">
                Contact Number:
                <input
                  className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
                  type="email"
                  value={ctxUser.phone}
                  disabled
                />
                {ctxUser.phoneVerified ? (
                  <p className="text-green-500">Verified</p>
                ) : (
                  <p className="text-red-500">Not Verified</p>
                )}
              </label>
            </section>
          </form>
          {!editInfo && (
            <form
              id="essential-info"
              className="mt-8 flex w-full flex-col gap-4 rounded-xl border-[1px] border-stone-700 bg-stone-800 p-4"
              onSubmit={handleSubmit(onEditSubmit)}
            >
              <h3 className="pl-2 pt-2 text-xl font-bold text-[#FFB267]">
                Essential Information
              </h3>
              <p className="pl-2 text-sm text-stone-400">
                Fill the following information to unlock all the features.
              </p>
              <section className="grid grid-cols-2 gap-6 p-2">
                <label className="flex max-w-xl flex-col gap-2 text-sm">
                  Profile Image:
                  <input
                    className="rounded-lg px-2 py-2 text-sm text-stone-400 file:mr-4 file:rounded-xl file:border-0 file:bg-[#FFB267]/30 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#FFB267] hover:file:bg-[#FFB267]/10"
                    type="file"
                    {...register("image")}
                  />
                  {errors.image && (
                    <p className="text-xs text-red-500">
                      {errors.image.message?.toString()}
                    </p>
                  )}
                  {isProfileDone && editInfo && (
                    <img
                      src={data?.image}
                      alt="profile"
                      className="mx-auto w-2/3 rounded-full"
                    />
                  )}
                </label>
                <section className="flex flex-col gap-6">
                  <label className="flex flex-col gap-2 text-sm">
                    Gender:
                    <select
                      className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
                      {...register("gender")}
                    >
                      <option value="na"></option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  {errors.gender && (
                    <p className="text-xs text-red-500">
                      {errors.gender.message?.toString()}
                    </p>
                  )}
                  <label className="flex max-w-xl flex-col gap-2 text-sm">
                    Address:
                    <input
                      className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
                      type="address"
                      {...register("address")}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-500">
                        {errors.address.message?.toString()}
                      </p>
                    )}
                  </label>
                  <label className="flex max-w-xl flex-col gap-2 text-sm">
                    Pincode:
                    <input
                      className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
                      type="number"
                      {...register("pincode")}
                    />
                    {errors.pincode && (
                      <p className="text-xs text-red-500">
                        {errors.pincode.message?.toString()}
                      </p>
                    )}
                  </label>
                  <label className="flex max-w-xl flex-col gap-2 text-sm">
                    Country:
                    <input
                      className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
                      type="country"
                      {...register("country")}
                    />
                    {errors.country && (
                      <p className="text-xs text-red-500">
                        {errors.country.message?.toString()}
                      </p>
                    )}
                  </label>
                </section>
              </section>

              <button
                className="rounded-lg bg-[#FFB267] p-2 text-sm font-medium text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-orange-900"
                type="submit"
              >
                Save
              </button>

              {regAppMutation.error && (
                <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
                  Something went wrong! {regAppMutation.error.message}
                </p>
              )}
              {createPresignedUrlMutation.error && (
                <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
                  Something went wrong!{" "}
                  {createPresignedUrlMutation.error.message}
                </p>
              )}
              {loggingErrors && (
                <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
                  Something went wrong! {loggingErrors}
                </p>
              )}
            </form>
          )}
          {editInfo && (
            <form
              id="essential-info"
              className="mt-8 flex w-full flex-col gap-4 rounded-xl border-[1px] border-stone-700 bg-stone-800 p-4"
              onSubmit={handleSubmit(onEditSubmit)}
            >
              <h3 className="pl-2 pt-2 text-xl font-bold text-[#FFB267]">
                Essential Information
              </h3>
              <p className="pl-2 text-sm text-stone-400">
                Fill the following information to unlock all the features.
              </p>
              <section className="grid grid-cols-2 gap-6 p-2">
                <label className="flex max-w-xl flex-col gap-2 text-sm">
                  Profile Image:
                  <input
                    className="rounded-lg px-2 py-2 text-sm text-stone-400 file:mr-4 file:rounded-xl file:border-0 file:bg-[#FFB267]/30 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#FFB267] hover:file:bg-[#FFB267]/10"
                    type="file"
                    {...register("image")}
                    disabled={editInfo}
                  />
                  {errors.image && (
                    <p className="text-xs text-red-500">
                      {errors.image.message?.toString()}
                    </p>
                  )}
                  {isProfileDone && editInfo && (
                    <img
                      src={data?.image}
                      alt="profile"
                      className="mx-auto w-2/3 rounded-full"
                    />
                  )}
                </label>
                <section className="flex flex-col gap-6">
                  <label className="flex flex-col gap-2 text-sm">
                    Gender:
                    <select
                      className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
                      {...register("gender")}
                      disabled={editInfo}
                      value={isProfileDone && editInfo ? data?.gender : "na"}
                    >
                      <option value="na"></option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  {errors.gender && (
                    <p className="text-xs text-red-500">
                      {errors.gender.message?.toString()}
                    </p>
                  )}
                  <label className="flex max-w-xl flex-col gap-2 text-sm">
                    Address:
                    <input
                      className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
                      type="address"
                      {...register("address")}
                      disabled={editInfo}
                      value={isProfileDone && editInfo ? data?.address : ""}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-500">
                        {errors.address.message?.toString()}
                      </p>
                    )}
                  </label>
                  <label className="flex max-w-xl flex-col gap-2 text-sm">
                    Pincode:
                    <input
                      className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
                      type="number"
                      {...register("pincode")}
                      disabled={editInfo}
                      value={isProfileDone && editInfo ? data?.pincode : ""}
                    />
                    {errors.pincode && (
                      <p className="text-xs text-red-500">
                        {errors.pincode.message?.toString()}
                      </p>
                    )}
                  </label>
                  <label className="flex max-w-xl flex-col gap-2 text-sm">
                    Country:
                    <input
                      className="rounded-lg border-[1px] border-stone-700 bg-stone-900 px-2 py-2 text-white outline-[#FFB267]"
                      type="country"
                      {...register("country")}
                      disabled={editInfo}
                      value={isProfileDone && editInfo ? data?.country : ""}
                    />
                    {errors.country && (
                      <p className="text-xs text-red-500">
                        {errors.country.message?.toString()}
                      </p>
                    )}
                  </label>
                </section>
              </section>
              {!editInfo && (
                <button
                  className="rounded-lg bg-[#FFB267] p-2 text-sm font-medium text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-orange-900"
                  type="submit"
                  disabled={
                    regAppMutation.isLoading ||
                    createPresignedUrlMutation.isLoading
                  }
                >
                  Save
                </button>
              )}
              {editInfo && (
                <button
                  className="rounded-lg bg-[#FFB267] p-2 text-sm font-medium text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-orange-900"
                  onClick={() => {
                    setEditInfo(false);
                  }}
                >
                  Edit
                </button>
              )}
              {regAppMutation.error && (
                <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
                  Something went wrong! {regAppMutation.error.message}
                </p>
              )}
              {createPresignedUrlMutation.error && (
                <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
                  Something went wrong!{" "}
                  {createPresignedUrlMutation.error.message}
                </p>
              )}
              {loggingErrors && (
                <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
                  Something went wrong! {loggingErrors}
                </p>
              )}
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
