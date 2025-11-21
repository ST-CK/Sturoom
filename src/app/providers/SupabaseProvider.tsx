"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClientComponentClient, Session, SupabaseClient } from "@supabase/auth-helpers-nextjs";

type SupabaseContextType = {
  supabase: SupabaseClient;
  session: Session | null;
};

const Context = createContext<SupabaseContextType | undefined>(undefined);

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientComponentClient());
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // ✅ 앱 첫 로드 시 세션 복원
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    // ✅ 세션 상태 실시간 반영 (로그인 / 로그아웃 시)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log("🔄 Supabase 세션 상태:", session ? "유지됨 ✅" : "없음 ❌");
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return <Context.Provider value={{ supabase, session }}>{children}</Context.Provider>;
}

export function useSupabase() {
  const context = useContext(Context);
  if (!context) throw new Error("useSupabase must be used inside SupabaseProvider");
  return context;
}
