export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",    // ✅ src 내부 모두
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // ✅ App Router
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // ✅ 컴포넌트 폴더
    "./src/styles/**/*.{css,scss}",       // ✅ 스타일 폴더
    "./public/**/*.html"                  // ✅ public 파일 (만약 정적 HTML 있다면)
  ],
};
