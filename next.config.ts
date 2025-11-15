import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // React Compiler is experimental and currently breaks Turbopack by throwing
  // Performance.measure errors for server components such as NotePage.
  // Disable it until the Next.js team ships a fix.
  reactCompiler: false,
};

export default nextConfig;
