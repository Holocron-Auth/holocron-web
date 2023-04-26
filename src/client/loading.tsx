import Logo from "./layout/components/Logo";

// component
export const Loading = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-stone-900">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center space-x-2">
          {/* Animate circle */}
          {/* <div className="h-20 w-20 animate-spin rounded-full border-b-4 border-l-4 border-[#FFB267]"></div> */}
          <img src="/loading.gif" alt="Loading" className="h-4" />
        </div>
        <Logo />
      </div>
    </div>
  );
};
