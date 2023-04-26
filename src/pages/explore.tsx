import { type NextPage } from "next";
import Link from "next/link";
import IntroLayout from "src/client/layout/intro";

import { api } from "src/utils/api";

const Home: NextPage = () => {
  return (
    <IntroLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-[#FFB267]">
          Explore Holocron Auth App
        </h1>
        <h2 className="text-lg">A Secure and User-Friendly OAuth Platform</h2>
      </div>
      <div className="flex gap-4">
        <a href="https://holocron-auth.gjd.one/">
          <p className="flex items-center justify-center gap-2 rounded-md bg-[#FFB267] px-4 py-2 text-lg font-bold text-stone-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>

            <span>Official Site</span>
          </p>
        </a>
      </div>
      <div className="flex flex-col justify-start gap-4">
        <h2 className="text-3xl font-bold text-[#FFB267]">Third party apps</h2>
        <div className="flex gap-4">
          <a href="https://rapper-name-gen.gjd.one/">
            <p className="flex items-center justify-center gap-2 rounded-md bg-[#FFB267] px-4 py-2 text-lg font-bold text-stone-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>

              <span>Random Rapper Name Generator</span>
            </p>
          </a>
        </div>
        {/* <Link href="/auth/register">
          <p className="flex items-center justify-center gap-2 rounded-md bg-[#FFB267] px-4 py-2 text-lg font-bold text-stone-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>

            <span>Download</span>
          </p>
        </Link> */}
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
