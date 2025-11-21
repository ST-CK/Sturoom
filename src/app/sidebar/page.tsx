import SturoomLanding from "@/components/sidebar/SideBar";
import { Sidebar } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {/* 모바일에서는 크게, PC에서는 기본 크기 */}
      <Sidebar className="w-16 h-16 sm:w-20 sm:h-20 text-gray-800" />
    </div>
  );
}