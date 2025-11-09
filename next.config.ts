import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizeCss: false,
  },
  // 로컬 개발용 프록시
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/mcp/:path*',
          destination: 'http://127.0.0.1:5000/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
