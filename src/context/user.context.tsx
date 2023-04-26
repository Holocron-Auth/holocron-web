import React, { createContext } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "src/server/api/root";

type RouterOutput = inferRouterOutputs<AppRouter>;

type MeOutput = RouterOutput["auth"]["me"];

const UserContext = createContext<MeOutput>(null);

const UserContextProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: MeOutput | null;
}) => {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

const useUserContext = () => React.useContext(UserContext);

export { UserContextProvider, useUserContext };
