import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth"],
  allowedDevOrigins: ["creamer-ending-unrefined.ngrok-free.dev"]
};

export default nextConfig;
