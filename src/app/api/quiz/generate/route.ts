import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// ✅ 백엔드 URL — .env.local 에서 NEXT_PUBLIC_API_BASE_URL로 지정
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

/* 
========================================
1️⃣ 세션 생성 (/quiz/session/start)
========================================
*/
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, room_id, post_id, mode } = body;

    if (!user_id || !room_id || !post_id) {
      return NextResponse.json(
        { error: "user_id, room_id, post_id가 필요합니다." },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/quiz/session/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        room_id,
        post_id,
        mode,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "세션 생성 실패");

    return NextResponse.json(data, { status: 200 });
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
    const body = await req.json();
    const { file_urls, mode, user_id, room_id, week_id } = body;

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
        user_id,
        room_id,
        week_id,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "퀴즈 생성 실패");

    return NextResponse.json(data, { status: 200 });
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
    const body = await req.json();
    const { session_id, question_id, user_answer, user_email } = body;

    if (!question_id || !user_email) {
      return NextResponse.json(
        { error: "question_id 또는 user_email 누락" },
        { status: 400 }
      );
    }

    // ✅ 이메일을 uuid로 변환 (profiles 테이블 조회)
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", user_email)
      .single();

    if (profileErr || !profile)
      throw new Error("해당 이메일의 UUID를 찾을 수 없습니다.");

    const user_id = profile.id;

    const res = await fetch(`${BACKEND_URL}/quiz/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id,
        question_id,
        user_answer,
        user_id,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "퀴즈 시도 저장 실패");

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("❌ /quiz/attempt 에러:", err);
    return NextResponse.json(
      { error: err.message || "서버 내부 오류" },
      { status: 500 }
    );
  }
}
