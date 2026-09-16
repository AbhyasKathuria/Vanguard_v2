import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname),
  outputFileTracingIncludes: {
    "/**/*": ["./dev.db", "./prisma/dev.db", "./prisma/schema.prisma"],
  },
};

export default nextConfig;
