import { type AppType } from "next/app";

import { api } from "src/utils/api";

import { UserContextProvider } from "src/context/user.context";

import "src/styles/globals.css";
import { Loading } from "src/client/loading";

const MyApp: AppType = ({ Component, pageProps }) => {
  const { data, isLoading } = api.auth.me.useQuery();

  if (isLoading) return <Loading />;

  return (
    <UserContextProvider value={data!}>
      <Component {...pageProps} />
    </UserContextProvider>
  );
};

export default api.withTRPC(MyApp);
