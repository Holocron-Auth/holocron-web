import React, { FC } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

type LayoutProps = {
  title?: string;
  children: JSX.Element | JSX.Element[];
};
const IntroLayout: FC<LayoutProps> = ({ title = "", children }) => {
  return (
    <>
      <Head>
        {title === "" ? (
          <title>Holocron Auth</title>
        ) : (
          <title>{title + " | Holocron Auth"}</title>
        )}
        <meta
          name="description"
          content="A Secure and User-Friendly OAuth Platform"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex bg-stone-900 text-stone-400">
        <section className="flex h-screen flex-col justify-center gap-10 px-12 sm:px-20 md:w-1/2 2xl:w-1/3">
          <Link href="/">
            <Image
              src={"/logo-full.png"}
              alt="Holocron Auth Logo"
              width={200}
              height={200}
            />
          </Link>
          {children}
        </section>
        <div className="h-screen bg-[url('/lock.jpg')] bg-cover bg-center md:w-1/2 2xl:w-2/3"></div>
      </main>
    </>
  );
};

export default IntroLayout;
