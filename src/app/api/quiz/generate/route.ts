import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

// Supabase 서버 클라이언트
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* 
========================================
1️⃣ 세션 생성 (/quiz/session/start)
========================================
*/
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // ✅ 토큰으로 유저 검증
    const { data, error } = await supabaseServer.auth.getUser(token);
    if (error || !data?.user) {
      return NextResponse.json({ error: "세션 만료 또는 잘못된 토큰" }, { status: 401 });
    }

    const user = data.user;
    const body = await req.json();
    const { room_id, post_id, mode } = body;

    const res = await fetch(`${BACKEND_URL}/quiz/session/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        room_id,
        post_id,
        mode,
      }),
    });

    const data2 = await res.json();
    if (!res.ok) throw new Error(data2?.error || "세션 생성 실패");

    return NextResponse.json(data2, { status: 200 });
  } catch (err: any) {
    console.error("❌ /quiz/session/start 에러:", err);
    return NextResponse.json(
      { error: err.message || "서버 내부 오류" },
      { status: 500 }
    );
  }
}

/* 
========================================
2️⃣ 파일 기반 퀴즈 생성 (/quiz/from-url)
========================================
*/
export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { data, error } = await supabaseServer.auth.getUser(token);
    if (error || !data?.user) {
      return NextResponse.json({ error: "세션 만료 또는 잘못된 토큰" }, { status: 401 });
    }

    const user = data.user;
    const body = await req.json();
    const { file_urls, mode, room_id, week_id } = body;

    if (!file_urls || !Array.isArray(file_urls)) {
      return NextResponse.json(
        { error: "file_urls 배열이 필요합니다." },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/quiz/from-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_urls,
        mode,
        user_id: user.id,
        room_id,
        week_id,
      }),
    });

    const data2 = await res.json();
    if (!res.ok) throw new Error(data2?.error || "퀴즈 생성 실패");

    return NextResponse.json(data2, { status: 200 });
  } catch (err: any) {
    console.error("❌ /quiz/from-url 에러:", err);
    return NextResponse.json(
      { error: err.message || "서버 내부 오류" },
      { status: 500 }
    );
  }
}

/* 
========================================
3️⃣ 퀴즈 시도 기록 (/quiz/attempt)
========================================
*/
export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { data, error } = await supabaseServer.auth.getUser(token);
    if (error || !data?.user) {
      return NextResponse.json({ error: "세션 만료 또는 잘못된 토큰" }, { status: 401 });
    }

    const user = data.user;
    const body = await req.json();
    const { session_id, question_id, user_answer } = body;

    if (!question_id || !user_answer) {
      return NextResponse.json(
        { error: "question_id 또는 user_answer 누락" },
        { status: 400 }
      );
    }

    // ✅ DB에서 UUID 확인
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    const res = await fetch(`${BACKEND_URL}/quiz/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id,
        question_id,
        user_answer,
        user_id: profile?.id || user.id,
      }),
    });

    const data2 = await res.json();
    if (!res.ok) throw new Error(data2?.error || "퀴즈 시도 저장 실패");

    return NextResponse.json(data2, { status: 200 });
  } catch (err: any) {
    console.error("❌ /quiz/attempt 에러:", err);
    return NextResponse.json(
      { error: err.message || "서버 내부 오류" },
      { status: 500 }
    );
  }
}