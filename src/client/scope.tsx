import { FC } from "react";

interface ScopeProps {
  scope: string[];
}

const scopeMsg: Record<string, string> = {
  identify: "See your name and profile picture linked to your account",
  email: "See your email address linked to your account",
  phone: "See your phone number linked to your account",
  address: "See your address linked to your account",
};

export const Scope: FC<ScopeProps> = ({ scope }) => {
  return (
    <ul className="flex flex-col gap-2">
      {scope.map((sco: string) => (
        <li className="flex items-center gap-2 rounded-lg border-2 border-black p-3 font-manrope font-thin">
          <p>{scopeMsg[sco]}</p>
        </li>
      ))}
    </ul>
  );
};
