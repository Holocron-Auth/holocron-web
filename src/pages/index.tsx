import { type NextPage } from "next";
import Link from "next/link";
import IntroLayout from "src/client/layout/intro";

import { api } from "src/utils/api";

const Home: NextPage = () => {
  return (
    <IntroLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-[#FFB267]">
          Welcome to Holocron Auth
        </h1>
        <h2 className="text-lg">A Secure and User-Friendly OAuth Platform</h2>
      </div>
      <div className="flex gap-4">
        <Link href="/auth/register">
          <p className="flex items-center justify-center gap-2 rounded-md bg-[#FFB267] px-4 py-2 text-lg font-bold text-stone-900">
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
            <span>Register</span>
          </p>
        </Link>
        <Link href="/auth/login">
          <p className="flex items-center justify-center gap-2 rounded-md bg-[#FFB267] px-4 py-2 text-lg font-bold text-stone-900">
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
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
            <span>Login</span>
          </p>
        </Link>
      </div>
      <p>
        Are you a developer looking to build using Holocron?{" "}
        <Link href="/developer">
          <span className="text-[#FFB267]">Learn More</span>
        </Link>
      </p>
    </IntroLayout>
  );
};

export default Home;
