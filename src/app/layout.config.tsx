import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
import Logo from "@/public/logo.png";

export const logo = (
  <>
    <Image
      alt="A2A Hub"
      src={Logo}
      sizes="100px"
      className="size-6 [.uwu_&]:block"
      aria-label="A2A Hub"
    />
  </>
);

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        logo
        <span className="font-medium [.uwu_&]:hidden [header_&]:text-[15px]">
          A2A
        </span>
      </>
    ),
    transparentMode: "top",
    url: "/",
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  links: [],
};
