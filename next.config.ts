import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Your image domains configuration
  images: {
    domains: ['res.cloudinary.com']
  },

  // Turbopack configuration (no 'enabled' property as it's not supported)
  turbopack: {
  },

  // Your Webpack custom rule
  webpack: (config: any) => {
    config.module.rules.push({
      test: /\/vendor\/symfony\/translation\/Tests\/Fixtures\/.*\.ts$/,
      loader: 'ignore-loader'
    });
    // Important: always return the config
    return config;
  }
};

export default nextConfig;