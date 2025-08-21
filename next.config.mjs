/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // basePath: "/texagon", // 👈 your repo name
  // assetPrefix: "/texagon/",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
