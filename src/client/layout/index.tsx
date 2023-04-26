import React, { FC } from "react";
import Head from "next/head";
import Link from "next/link";
import Logo from "./components/Logo";
import { useUserContext } from "src/context/user.context";

type LayoutProps = {
  title: string;
  children: JSX.Element | JSX.Element[];
};
const Layout: FC<LayoutProps> = ({ title, children }) => {
  const ctxUser = useUserContext();

  return (
    <section className="flex min-h-screen  flex-col justify-between scroll-smooth bg-[#211D1D] font-manrope tracking-wide text-white">
      <Head>
        <title>{title + " | Holocron Auth"}</title>
        <meta
          name="description"
          content="A secure and user friendly oauth platform"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex flex-col">
        <nav className="flex w-full flex-row justify-between px-12 py-4">
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
        </nav>
        <section className="px-12 pb-12 pt-4">{children}</section>
      </main>
    </section>
  );
};

export default Layout;
