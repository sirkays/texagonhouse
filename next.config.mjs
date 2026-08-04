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
  serverExternalPackages: ["@stream-io/video-react-sdk", "@mediapipe/tasks-vision"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns"
    ],
  },
};

export default nextConfig;
