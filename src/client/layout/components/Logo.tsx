import { FC } from "react";
import Image from "next/image";
import Link from "next/link";

const Logo: FC = () => {
  return (
    <Link href="/dashboard">
      <Image
        src={"/logo-full.png"}
        alt="Holocron Auth Logo"
        width={150}
        height={150}
      />
    </Link>
  );
};

export default Logo;
