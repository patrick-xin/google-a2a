import { logo } from "@/app/layout.config";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link
      href="/"
      className="flex items-center space-x-3 text-sm font-semibold"
    >
      {logo}
      <span className="font-semibold">A2A Hub</span>
    </Link>
  );
};
