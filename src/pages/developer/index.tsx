import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "src/client/layout";
import { useUserContext } from "src/context/user.context";
import { useCallback } from "react";

import { api } from "src/utils/api";

const DevPage: NextPage = () => {
  const router = useRouter();

  const ctxUser = useUserContext();

  if (ctxUser === null) {
    router.push({
      pathname: "/auth/login",
      query: {
        redirect: "/developer",
        prompt: "Login to access developer page",
      },
    });
    return <></>;
  }

  const registeredApps = api.dev.getRegisteredApps.useQuery();

  const deleteAppMutation = api.dev.deleteRegisteredApp.useMutation({
    onSuccess: () => {
      console.log("successfully deleted app");
      registeredApps.refetch();
    },
    onError: (err) => console.log(err.message),
  });

  const deleteApp = useCallback(
    async (id: string) => {
      await deleteAppMutation.mutate({ appId: id });
    },
    [deleteAppMutation]
  );

  return (
    <Layout title="Developer Page">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-[#FFB267]">
          Welcome to Holocron Auth Developer Page
        </h1>
        <h2 className="text-lg">
          Thanks for showing interest in using Holocron Auth, {ctxUser.name}
        </h2>
      </div>
      <div className="flex w-full flex-col gap-4">
        <section className="mt-8 flex items-center justify-between">
          <h2 className="text-xl font-medium text-[#FFB267]">
            Registered Apps:
          </h2>
          <Link href="/developer/register">
            <p className="text-md flex items-center justify-center gap-2 rounded-md bg-[#FFB267] px-4 py-2 font-bold text-stone-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>New App</span>
            </p>
          </Link>
        </section>
        {/* If not registered Apps */}
        <>
          {registeredApps.data?.newApps.length === 0 && (
            <p>You have not registered any apps yet.</p>
          )}
        </>
        <section className="grid w-full grid-cols-3 gap-4">
          {(registeredApps.data?.newApps ?? []).map((app) => (
            <div
              key={app.id}
              className="flex gap-4 rounded-lg border-[1px] border-stone-700 bg-stone-800 px-4 py-4"
            >
              <img
                src={app.logo + ""}
                alt={app.name}
                className="h-12 w-12 rounded-full border-[1px] border-stone-700"
              />
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3>{app.name}</h3>
                  <div className="flex items-center gap-2">
                    {/* <button className="rounded-md bg-[#FFB267] px-2 font-medium text-stone-800">
                      Edit
                    </button> */}
                    <button
                      className="rounded-md bg-red-500 px-2 font-medium text-stone-200 disabled:bg-red-600"
                      onClick={() => deleteApp(app.id)}
                      disabled={deleteAppMutation.isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p>
                  <span className="font-bold">Client Id:</span> {app.clientId}
                </p>
                <div>
                  <p>
                    <a href={app.homePageUrl}>
                      <span className="font-medium text-[#FFB267]/80">
                        🔗 Homepage
                      </span>
                    </a>
                  </p>
                  <p>
                    <a href={app.privacyPolicyUrl}>
                      <span className="font-medium text-[#FFB267]/80">
                        🔗 Privacy Policy
                      </span>
                    </a>
                  </p>
                  <p>
                    <a href={app.termsOfServiceUrl}>
                      <span className="font-medium text-[#FFB267]/80">
                        🔗 Terms of Service
                      </span>
                    </a>
                  </p>
                </div>
                <div>
                  <p className="font-bold">Authorized Domains:</p>
                  <ul className="list-inside list-disc">
                    {app.authorizedDomains.map((domain: string) => (
                      <li key={domain}>{domain}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </Layout>
  );
};

export default DevPage;
