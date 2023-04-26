import { FC } from "react";

const LoadingComponent: FC = () => {
  return (
    <div className="animate-pulse">
      <div className="h-4 rounded bg-slate-700"></div>
    </div>
  );
};

export default LoadingComponent;
