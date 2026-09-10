/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Prevent Windows ENOENT PackFileCacheStrategy vendor-chunks cache corruption
      config.cache = false;
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/track",
        destination: "/track-order",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
