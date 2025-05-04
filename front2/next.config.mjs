/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/:path*', // Proxy API requests
      },
      {
        source: '/ws/:path*', // Add this rule for WebSocket
        destination: 'http://localhost:8080/connect/:path*', // Proxy WebSocket requests
      },
    ];
  },
  images: {
    unoptimized: true,
    domains: ['kr.object.ncloudstorage.com'],
  },
}

export default nextConfig
