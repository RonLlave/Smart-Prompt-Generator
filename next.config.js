/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize webpack for Windows
  webpack: (config, { dev }) => {
    if (dev) {
      // Reduce file watching on Windows to prevent UNKNOWN errors
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.next'],
      }
    }
    return config
  },
}

module.exports = nextConfig