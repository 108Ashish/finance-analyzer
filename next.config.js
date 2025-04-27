/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Force Next.js to use ES Modules
  experimental: {
    esmExternals: true
  }
};

module.exports = nextConfig;