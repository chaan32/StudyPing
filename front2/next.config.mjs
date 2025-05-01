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
        destination: 'http://localhost:8080/:path*', // 백엔드 서버 주소
      },
    ];
  },
  images: {
    unoptimized: true,
    domains: ['kr.object.ncloudstorage.com'],
  },
}

export default nextConfig
