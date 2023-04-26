import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "src/client/layout";
import { useUserContext } from "src/context/user.context";
import { useCallback, useState } from "react";

import { api } from "src/utils/api";
import OAuth from "src/client/layout/oauth";
import Logo from "src/client/layout/components/Logo";

const DevPage: NextPage = () => {
  const router = useRouter();

  const ctxUser = useUserContext();

  if (ctxUser === null) {
    router.push({
      pathname: "/oauth/login",
      query: {
        redirect: router.asPath,
        prompt: "Login to continue",
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

  const [loggingErrors, setLoggingErrors] = useState<string>("");

  //   get query params

  const { client_id, redirect_uri, response_type, scope, state } = router.query;

  const getClientDetails = api.oauth.getClientDetails.useQuery({
    client_id: client_id as string,
  });

  const saveLoginRequest = api.oauth.saveLoginRequest.useMutation({
    onSuccess: (data) => {
      if (data.consent) {
        router.push({
          pathname: "https://" + data.redirectUri,
          query: {
            code: data.code,
            state: data.state,
          },
        });
      } else {
        router.push({
          pathname: "/oauth/consent",
          query: {
            client_id: client_id as string,
            part: data.part,
          },
        });
      }
    },
    onError: (err) => {
      setLoggingErrors(err.message);
      return (
        <OAuth title="Sign In">
          <h1 className="text-2xl font-medium">
            Login to {getClientDetails.data?.clientName}
          </h1>
          <h2 className="my-2 flex items-center justify-start gap-2 text-sm font-medium">
            Verified by <span className="text-[#EF4626]">Holocron</span>
            <img src="/logo.svg" alt="Holocron symbol" />
          </h2>
          <section className="flex flex-col items-start justify-between gap-4">
            <h3 className="rounded-md border-2 border-red-500 p-3 text-xl font-medium">
              {err.message}
            </h3>
          </section>
        </OAuth>
      );
    },
  });

  const handleLogin = useCallback(async () => {
    const res = await saveLoginRequest.mutateAsync({
      client_id: client_id as string,
      redirect_uri: redirect_uri as string,
      responseType: response_type as string,
      scope: scope as string,
      state: state as string,
    });
  }, [client_id, redirect_uri, response_type, scope, state]);

  const logout = api.authedUsers.logout.useMutation({
    onSuccess: () => {
      router.reload();
      router.push("/");
    },
    onError: (err) => {
      setLoggingErrors(err.message);
    },
  });

  const onSubmit = useCallback(() => {
    logout.mutate();
  }, [logout]);

  return (
    <OAuth title="Sign In">
      <h1 className="text-2xl font-medium">
        Login to {getClientDetails.data?.clientName}
      </h1>
      <h2 className="my-2 flex items-center justify-start gap-2 text-sm font-medium">
        Verified by <span className="text-[#EF4626]">Holocron</span>
        <img src="/logo.svg" alt="Holocron symbol" />
      </h2>
      <section className="flex flex-col items-start justify-between gap-4">
        <section className="flex items-center gap-4 font-medium">
          <img
            src={ctxUser?.image}
            alt={ctxUser?.name + "'s Image"}
            className="h-16 rounded-full border-2 border-black"
          />
          <div className="flex flex-col gap-1">
            <p className="">{ctxUser?.name}</p>

            <p className="text-stone-600">{ctxUser?.email}</p>
          </div>
        </section>
        <section className="flex w-full flex-col items-center gap-1">
          <button
            className="w-full rounded-lg bg-[#EF4626] py-2 text-center text-xl text-white"
            onClick={handleLogin}
          >
            Continue
          </button>
          <button className="text-[#EF4626]" onClick={() => onSubmit()}>
            Login with another account
          </button>
        </section>
        {loggingErrors && (
          <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
            Something went wrong! {loggingErrors}
          </p>
        )}
        <p className="text-xs">
          By continuing, you agree to sharing your details with the concerned
          3rd Part app via Holocron.{" "}
          <a href="/tos" className="text-[#EF4626]">
            Terms and Conditions
          </a>
        </p>
      </section>
      {/* <div className="flex flex-col gap-2 rounded-xl bg-stone-200 p-4">
        <p>Dev Info [Need to Hide]</p>
        <p className="text-sm font-medium ">client_id: {client_id}</p>
        <p className="text-sm font-medium ">response_type: {response_type}</p>
        <p className="text-sm font-medium ">redirect_uri: {redirect_uri}</p>
        <p className="text-sm font-medium ">scope: {scope}</p>
        <p className="text-sm font-medium ">state: {state}</p>
      </div> */}
    </OAuth>
  );
};

export default DevPage;
