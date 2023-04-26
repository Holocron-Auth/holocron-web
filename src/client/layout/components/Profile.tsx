import { FC } from "react";
import { api } from "src/utils/api";

const Profile: FC = () => {
  // const { data, isLoading } = api.user.profile.useQuery();

  // if (isLoading) return <LoadingComponent />;

  return (
    <section className="flex w-5/6 flex-row items-center justify-center">
      <h1 className="text-md text-center font-bold opacity-50">
        {/* {data?.result.name} */}
      </h1>
    </section>
  );
};

export default Profile;
