/**
 * @format
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ["sg-sentry"],
  webpack: (config, { isServer }) => {
    // Handle sg-sentry package
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
