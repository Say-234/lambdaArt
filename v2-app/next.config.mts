import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image domains  // Images optimisées
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Suppression de la configuration webpack inutile avec Turbopack
  webpack: null,

  // Enable modern JavaScript features
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Output configuration for better performance
  output: 'standalone',

};

export default nextConfig;