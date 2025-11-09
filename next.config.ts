import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ 빌드할 때 ESLint 검사 무시
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ 타입 에러 있어도 빌드 진행 (선택)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
