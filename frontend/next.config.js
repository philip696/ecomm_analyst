/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // Disable for macOS compatibility with static export
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
    NEXT_PUBLIC_APP_NAME: 'MarketLens',
  },
  
  // Cloudflare Pages compatibility - static export
  output: 'export',
  
  // Image optimization
  images: {
    unoptimized: process.env.NEXT_PUBLIC_DISABLE_IMAGE_OPTIMIZATION === 'true',
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  
  // Note: headers() and rewrites() don't work with 'output: export'
  // API requests use NEXT_PUBLIC_API_URL environment variable directly
};

module.exports = nextConfig;
