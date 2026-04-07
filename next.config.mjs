/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  devIndicators: false,
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
