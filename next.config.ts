import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "https",
        hostname: "*.s3.eu-central-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "ty-eu-bizlock.s3.eu-central-1.amazonaws.com",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
