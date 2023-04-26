import Link from "next/link";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { FC, useCallback, useRef, useState } from "react";
import Layout from "src/client/layout";
import Logo from "src/client/layout/components/Logo";
import { useUserContext } from "src/context/user.context";
import { api } from "src/utils/api";
import Pie from "src/client/layout/components/Percentage";
import Doughnut from "src/client/layout/components/Percentage";
import { RegisteredApps } from "@prisma/client";

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
      <Link href={href.replace("/", "#")}>
        <div className="flex items-center gap-2">
          <img src={href + ".svg"} alt="icon" />
          <span className="w-full text-white">{children}</span>
        </div>
      </Link>
    </li>
  );
};

interface AccordionProps {
  app: RegisteredApps;
  scope: string;
}

const AccordionItem: FC<AccordionProps> = ({ app, scope }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <p
      className="flex flex-col items-start gap-4 rounded-xl border-2 border-stone-200 p-2 text-lg text-white"
      onClick={() => setIsOpen(!isOpen)}
    >
      <p className="flex items-center justify-start gap-6">
        <img
          src={app?.logo!}
          alt={app?.name + " logo"}
          className="h-10 w-10 rounded-xl"
        />
        {app?.name}
      </p>
      {isOpen && (
        <div className="">
          <p className="pl-8">
            <span className="font-bold">Information Access:</span>
            <ul>
              {scope.split(" ").map((scope) => (
                <li className=" ml-4 list-disc">{scope}</li>
              ))}
            </ul>
          </p>
        </div>
      )}
    </p>
  );
};

const Dashboard: NextPage = () => {
  const router = useRouter();

  const ctxUser = useUserContext();

  if (ctxUser === null) {
    router.push({
      pathname: "/auth/login",
      query: {
        redirect: "/dashboard",
        prompt: "Login to access your dashboard",
      },
    });
    return <></>;
  }

  const dashInfo = api.authedUsers.dashboardInfo.useQuery();

  let ProfilePCT: number = 50;
  const isCompletedProfile = api.authedUsers.isCompletedProfile.useQuery();

  if (
    isCompletedProfile.data?.completedProfile ||
    isCompletedProfile.isLoading
  ) {
    ProfilePCT = 100;
  } else {
    ProfilePCT = 50;
  }

  const logout = api.authedUsers.logout.useMutation({
    onSuccess: () => {
      router.reload();
      router.push("/");
    },
  });

  const onSubmit = useCallback(() => {
    logout.mutate();
  }, [logout]);

  return (
    <Layout title="Dashboard">
      <section className="mx-auto mt-10 flex max-w-7xl gap-10">
        <div className="flex w-1/4 flex-col gap-4">
          <section className="rounded-xl bg-[#2E2E2E] py-3 pb-4 pl-5">
            <h2 className="my-2 text-2xl font-medium text-[#FFB267] ">
              Explore
            </h2>
            <ul className="flex flex-col gap-2">
              <SidebarComponent href="/dashboard">Dashboard</SidebarComponent>
              <SidebarComponent href="/review-access">
                Review Access
              </SidebarComponent>
              <SidebarComponent href="/security-fitness-report">
                Security Fitness Report
              </SidebarComponent>
              <SidebarComponent href="/security-tips">
                Security Tips
              </SidebarComponent>
            </ul>
          </section>
        </div>
        <div className="w-3/4">
          {!isCompletedProfile.data?.completedProfile &&
            !isCompletedProfile.isLoading && (
              <section className="mb-4 flex items-center justify-between rounded-xl border-2 border-[#ffb267] bg-[#2E2E2E] p-4 px-12">
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
          <section
            className={
              "mb-4 flex gap-4 " + (ProfilePCT !== 100 ? "blur-sm" : "")
            }
          >
            <div className="grid w-1/2 grid-rows-2 gap-4">
              <section className="grid grid-cols-2 gap-4">
                <section className="flex flex-col items-center rounded-xl bg-stone-600 px-4 py-10">
                  <span className="text-7xl font-bold text-[#ffb267]">
                    {dashInfo.data?.loginAttempts}
                  </span>
                  Login Attempts
                </section>
                <section className="flex flex-col items-center rounded-xl bg-stone-600 px-4 py-10">
                  <span className="text-7xl font-bold text-[#ffb267]">
                    {dashInfo.data?.services}
                  </span>
                  Services
                </section>
              </section>
              <section className="flex flex-col items-center rounded-xl bg-stone-600 px-4 py-10">
                <span className="text-7xl font-bold text-[#ffb267]">
                  {dashInfo.data?.min}
                </span>
                min saved
              </section>
            </div>
            <section className="flex w-1/2 flex-col items-center rounded-xl bg-stone-600 px-4 py-10">
              <span className="text-[8rem] font-bold text-[#ffb267]">
                {dashInfo.data?.permissions}
              </span>
              Permissions Granted
            </section>
          </section>
          <section
            className={"flex gap-4 " + (ProfilePCT !== 100 ? "blur-sm" : "")}
          >
            <section className="flex w-full flex-col gap-3 rounded-xl bg-[#2E2E2E] p-6">
              <h2 className="text-3xl font-medium text-[#ffb267]">
                Review Access
              </h2>
              <p className="text-xl text-white">
                You have used Holocron to log into {dashInfo.data?.services}{" "}
                Service(s)
              </p>
              {dashInfo.data?.connectedApps.map((app) => {
                return (
                  <AccordionItem
                    app={{
                      id: app.app?.id!,
                      clientId: app.app?.clientId!,
                      name: app.app?.name!,
                      logo: app.app?.logo!,
                      homePageUrl: app.app?.homePageUrl!,
                      privacyPolicyUrl: app.app?.privacyPolicyUrl!,
                      termsOfServiceUrl: app.app?.termsOfServiceUrl!,
                      developerId: app.app?.developerId!,
                      createdAt: app.app?.createdAt!,
                      updatedAt: app.app?.updatedAt!,
                    }}
                    scope={app.scope}
                  />
                );
              })}
            </section>
            <section className="flex w-full flex-col gap-3 rounded-xl bg-[#2E2E2E] p-6">
              <h2 className="text-3xl font-medium text-[#ffb267]">
                Security Fitness Report
              </h2>
              <p className="text-xl text-white">
                Secure is your middle name! Your account is secure more than 96%
                of SmartPhone users. Way to make it happen!
              </p>
              <section className="flex items-center justify-center gap-4 rounded-xl border-2 border-stone-200 p-4 text-lg text-white">
                <p className="text-8xl font-bold text-[#ffb267]">
                  {dashInfo.data?.loginRequestsConsentFalse}
                </p>
                <p>Unauthorized Attempts</p>
              </section>
            </section>
          </section>

          <section className="my-4 flex w-full flex-col gap-3 rounded-xl bg-[#2E2E2E] p-6">
            <h2 className="text-3xl font-medium text-[#ffb267]">
              Security Tips
            </h2>
            <p className="text-xl text-white">
              Stay up to date with Best Practices
            </p>
            <p className="rounded-xl border-2 border-stone-200 p-2 text-lg text-white">
              Manage your permissions - Review the permissions granted to each
              app on your device. Ensure that the permissions granted are
              appropriate and necessary for the app to function.
            </p>
            <p className="rounded-xl border-2 border-stone-200 p-2 text-lg text-white">
              Lock your device - Use a PIN, password, or biometric
              authentication to secure your device and prevent unauthorized
              access
            </p>
            <p className="rounded-xl border-2 border-stone-200 p-2 text-lg text-white">
              Be aware of phishing - Don't share sensitive information or click
              on suspicious links, even if they appear to be from a legitimate
              source.
            </p>
          </section>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
