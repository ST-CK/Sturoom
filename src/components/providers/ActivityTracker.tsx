"use client";

import { useEffect, useRef } from "react";
import axios from "axios";
import { useSupabase } from "@/app/providers/SupabaseProvider";

export default function ActivityTracker() {
  const { supabase, session } = useSupabase();   // ⬅ session 직접 가져오기!!
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    console.log("🔥 ActivityTracker 시작!");
    console.log("현재 세션:", session);

    if (!session) {
      console.log("❌ 로그인 정보 없음");
      return;
    }

    const userId = session.user.id;
    console.log("사용자:", userId);

    // 1초마다 출석 저장
    intervalRef.current = setInterval(() => {
      sendTime(userId);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sendTime(userId);
    };
  }, [session]);  // ⬅ 중요!!! session이 로딩된 뒤 작동

  async function sendTime(userId: string) {
    await axios.post("http://127.0.0.1:5000/attendance/log", {
      user_id: userId,
      seconds: 1,
    });
  }

  return null;
}
