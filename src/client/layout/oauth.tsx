import React, { FC } from "react";
import Head from "next/head";
import Link from "next/link";
import Logo from "./components/Logo";
import { useUserContext } from "src/context/user.context";

type LayoutProps = {
  title: string;
  children: JSX.Element | JSX.Element[];
};
const OAuth: FC<LayoutProps> = ({ title, children }) => {
  const ctxUser = useUserContext();

  return (
    <section className="flex h-screen flex-col items-center justify-center bg-stone-100 font-manrope text-black">
      <Head>
        <title>{title + " | Holocron OAuth"}</title>
        <meta
          name="description"
          content="A secure and user friendly oauth platform"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex flex-col">
        {/* <nav className="flex w-full flex-row justify-between px-12 py-4">
          <div className="flex flex-row items-center gap-6">
            <Logo />
          </div>
          <div className="flex flex-row items-center gap-4">
            <p className="rounded-md bg-stone-700 px-4 py-2">
              <Link href="/profile" className="flex items-center gap-2">
                <img
                  src={ctxUser?.image}
                  alt={ctxUser?.name + "'s Image"}
                  className="h-10 rounded-full border-2 border-[#FFB267]"
                />
                <span className="text-stone-200">Hey {ctxUser?.name}!</span>
              </Link>
            </p>
          </div>
        </nav> */}
        <section className="mx-auto max-w-md rounded-xl border-2 border-white bg-white p-6">
          {children}
        </section>
      </main>
    </section>
  );
};

export default OAuth;
