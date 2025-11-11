// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "@/styles/globals.css";
// import Header from "@/components/layout/Header";
// import Footer from "@/components/layout/Footer";
// import ChatBotWidget from "@/components/common/ChatBotWidget"; // 💬 추가

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Sturoom • Learn, Build, Share",
//   description: "학생과 멘토를 위한 교육용 데모",
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="ko">
//       <body className={`${inter.className} bg-gray-50 text-gray-900`}>
//         <Header />
//         <main className="min-h-[calc(100vh-64px)]">{children}</main>
//         <Footer />

//         {/* 💬 전역 챗봇 아이콘 */}
//         <ChatBotWidget />
//       </body>
//     </html>
//   );
// }
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatBotWidget from "@/components/common/ChatBotWidget";
import SupabaseProvider from "@/app/providers/SupabaseProvider"; // ✅ 추가

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sturoom • Learn, Build, Share",
  description: "학생과 멘토를 위한 교육용 데모",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <SupabaseProvider>
          <Header />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <Footer />
          <ChatBotWidget />
        </SupabaseProvider>
      </body>
    </html>
  );
}
