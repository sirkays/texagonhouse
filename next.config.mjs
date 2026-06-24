/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ];
  },
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
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@stream-io/video-react-sdk",
      "date-fns"
    ],
  },
};

export default nextConfig;
