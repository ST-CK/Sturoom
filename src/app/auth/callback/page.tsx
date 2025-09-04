"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  useEffect(() => {
    (async () => {
      try {
        await supabase.auth.exchangeCodeForSession(window.location.href);
      } catch (e) {
        console.error("exchangeCodeForSession error:", e);
      } finally {
        // 로그인후 갈 경로 정해주는 코드 (중요)
        window.location.replace("/");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-sm text-gray-600">로그인 처리 중입니다...</p>
    </div>
  );
}
