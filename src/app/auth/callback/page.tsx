"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  useEffect(() => {
    (async () => {
      try {
        await supabase.auth.exchangeCodeForSession(window.location.href);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return window.location.replace("/login");

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, school_name, full_name, phone")
          .eq("id", user.id)
          .maybeSingle();

        const incomplete = !profile || !profile.role || !profile.school_name || !profile.full_name || !profile.phone;
        if (incomplete) return window.location.replace("/onboarding");
      } catch (e) {
        console.error("auth callback error", e);
      }
      window.location.replace("/");
    })();
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-sm text-gray-600">로그인 처리 중입니다...</p>
    </div>
  );
}
