import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "google-a2a.github.io",
        port: "",
        pathname: "/A2A/**",
      },
    ],
  },
};

export default withMDX(config);
