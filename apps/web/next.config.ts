import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@easycert/ui", "@easycert/types"],
  reactStrictMode: true,
};

export default config;
