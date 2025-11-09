import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ 빌드할 때 ESLint 검사 무시
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ 타입 에러 있어도 빌드 진행
    ignoreBuildErrors: true,
  },
  experimental: {
    // ✅ Tailwind CSS 최적화 비활성화 (Vercel에서 스타일 깨짐 방지)
    optimizeCss: false,
  },
};

export default nextConfig;
