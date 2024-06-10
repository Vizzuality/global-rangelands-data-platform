import { PropsWithChildren } from "react";

const Navigation = ({ children }: PropsWithChildren) => {
  return (
    <div className="pointer-events-none absolute left-0 top-6 flex h-12 w-full justify-center overflow-visible">
      <div className="pointer-events-auto flex h-12 items-center justify-center space-x-2 rounded-[40px] bg-white/40 p-1 backdrop-blur-lg">
        {children}
      </div>
    </div>
  );
};

export default Navigation;
