/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    remotePatterns: [],
  },
  webpack: (config) => {
    // This is necessary for SVG and other asset imports
    config.module.rules.push({
      test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
      type: "asset/resource",
    });

    return config;
  },
};

export default nextConfig;
