import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "src/client/layout";
import { useUserContext } from "src/context/user.context";
import { useCallback } from "react";
import redirect from "nextjs-redirect";

import { api } from "src/utils/api";
import OAuth from "src/client/layout/oauth";
import Logo from "src/client/layout/components/Logo";
import { Scope } from "src/client/scope";

const DevPage: NextPage = () => {
  const router = useRouter();

  const ctxUser = useUserContext();

  if (ctxUser === null) {
    router.push({
      pathname: "/oauth/login",
      query: {
        redirect: router.asPath,
        prompt: "Login to complete signup",
      },
    });
    return <></>;
  }

  // const isCompletedProfile = api.authedUsers.isCompletedProfile.useQuery();

  // const isProfileDone = isCompletedProfile.data?.completedProfile;

  // if (isProfileDone !== true) {
  //   router.push({
  //     pathname: "/profile",
  //   });
  //   return <></>;
  // }

  //   get query params

  const { client_id, part } = router.query;

  const getLoginRequest = api.oauth.getLoginRequest.useQuery({
    client_id: client_id as string,
    part: part as string,
  });

  const generateAuthorizationCodeMutation =
    api.oauth.generateAuthorizationCode.useMutation({
      onSuccess: (data) => {
        redirect(data.redirectLink);
      },
    });

  const handleAccept = useCallback(() => {
    generateAuthorizationCodeMutation.mutate({
      client_id: client_id as string,
      part: part as string,
    });
  }, [client_id, part]);

  if (getLoginRequest.isError) {
    return (
      <OAuth title="Sign In">
        <h1 className="text-2xl font-medium">Authorize Access</h1>
        <h2 className="my-2 flex items-center justify-start gap-2 text-sm font-medium">
          Verified by <span className="text-[#EF4626]">Holocron</span>
          <img src="/logo.svg" alt="Holocron symbol" />
        </h2>
        <section className="flex flex-col items-start justify-between gap-4">
          <h3 className="rounded-md border-2 border-red-500 p-3 text-xl font-medium">
            {getLoginRequest.error?.message}
          </h3>
        </section>
        {/* <div className="flex flex-col gap-2 rounded-xl bg-stone-200 p-4">
          <p>Dev Info [Need to Hide]</p>
          <p className="text-sm font-medium ">client_id: {client_id}</p>
          <p className="text-sm font-medium ">part: {part}</p>
        </div> */}
      </OAuth>
    );
  }

  return (
    <OAuth title="Sign In">
      <h1 className="text-2xl font-medium">Authorize Access</h1>
      <h2 className="my-2 flex items-center justify-start gap-2 text-sm font-medium">
        Verified by <span className="text-[#EF4626]">Holocron</span>
        <img src="/logo.svg" alt="Holocron symbol" />
      </h2>
      <section className="flex flex-col items-start justify-between gap-4">
        <h3 className="text-xl font-medium">
          This will allow {getLoginRequest.data?.clientName} to:
        </h3>
        {getLoginRequest.data?.scope.split(" ") !== undefined && (
          <Scope scope={getLoginRequest.data?.scope.split(" ")} />
        )}
        <p className="text-xs">
          By clicking Accept, you all this app and Holocron to use your
          information in accordance with their respective terms of service and
          privacy policy. You can change this and other account permissions at
          any times.
          <a href="/tos" className="text-[#EF4626]">
            Terms and Conditions
          </a>
        </p>
        <section className="flex w-full flex-col items-center gap-1">
          <button
            className="w-full rounded-lg bg-[#EF4626] py-2 text-xl text-white"
            onClick={handleAccept}
          >
            Accept
          </button>
          <button className="text-[#EF4626]">
            I do not want to share these information
          </button>
        </section>
      </section>
      {/* <div className="flex flex-col gap-2 rounded-xl bg-stone-200 p-4">
        <p>Dev Info [Need to Hide]</p>
        <p className="text-sm font-medium ">client_id: {client_id}</p>
        <p className="text-sm font-medium ">part: {part}</p>
      </div> */}
    </OAuth>
  );
};

export default DevPage;
