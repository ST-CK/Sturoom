import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

// 서버용 Supabase 클라이언트 (토큰 검증용)
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    // ------------------------------
    // 1) 인증 검사
    // ------------------------------
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { data: userData, error: userErr } =
      await supabaseServer.auth.getUser(token);

    if (userErr || !userData?.user) {
      return NextResponse.json(
        { error: "세션 만료 또는 잘못된 토큰" },
        { status: 401 }
      );
    }

    const user = userData.user;

    // ------------------------------
    // 2) 프론트에서 받은 값 읽기
    // ------------------------------
    const { lectureId, weekId, mode } = await req.json();

    if (!lectureId || !weekId) {
      return NextResponse.json(
        { error: "lectureId, weekId가 필요합니다." },
        { status: 400 }
      );
    }

    console.log("📘 입력값:", { lectureId, weekId, mode });

    // ------------------------------
    // 3) FastAPI - 세션 생성
    // ------------------------------
    const sessionRes = await fetch(
      `${BACKEND_URL}/api/quiz/session/start`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: lectureId,
          post_id: weekId,
          mode,
        }),
      }
    );

    const sessionPayload = await sessionRes.json();

    if (!sessionRes.ok) {
      throw new Error(sessionPayload.error || "세션 생성 실패");
    }

    const sessionId = sessionPayload.session_id;
    const runId = sessionPayload.run_id;

    if (!sessionId || !runId) {
      throw new Error("세션 생성 실패 (session_id/run_id 없음)");
    }

    console.log("🔥 세션 생성 완료:", sessionId, runId);

    // ------------------------------
    // 4) Supabase에서 file_urls 가져오기
    // ------------------------------
    const { data: post, error: postErr } = await supabaseServer
      .from("classroom_week_posts")
      .select("file_urls")
      .eq("id", weekId)
      .single();

    if (postErr) {
      throw new Error("파일 목록 로드 실패");
    }

    const file_urls = post?.file_urls || [];

    if (!file_urls.length) {
      return NextResponse.json(
        { error: "해당 주차에 업로드된 파일이 없습니다." },
        { status: 400 }
      );
    }

    console.log("📄 파일 목록:", file_urls);

    // ------------------------------
    // 5) FastAPI - 퀴즈 생성
    // ------------------------------
    const quizRes = await fetch(`${BACKEND_URL}/api/quiz/from-url`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        run_id: runId,
        file_urls,
        mode,
      }),
    });

    const quizPayload = await quizRes.json();

    if (!quizRes.ok) {
      throw new Error(quizPayload.error || "퀴즈 생성 실패");
    }

    const quizList = quizPayload.quiz;

    if (!quizList || quizList.length === 0) {
      throw new Error("퀴즈 생성 결과 없음");
    }

    const first = quizList[0];

    console.log("🎯 첫 번째 문제:", first);

    // ------------------------------
    // 6) 첫 문제를 quiz_messages에 저장
    // ------------------------------
    await supabaseServer.from("quiz_messages").insert({
      session_id: sessionId,
      run_id: runId,
      user_id: user.id,
      role: "ai",
      kind: "quiz",
      payload: JSON.stringify({
        question: first.question,
        choices: first.choices,
        question_id: first.id,
      }),
    });

    // ------------------------------
    // 7) 응답 반환
    // ------------------------------
    return NextResponse.json({
      message: "퀴즈 생성 완료",
      sessionId,
      runId,
      firstQuestion: first,
    });
  } catch (err: any) {
    console.error("❌ generate API 오류:", err);
    return NextResponse.json(
      { error: err.message || "알 수 없는 오류" },
      { status: 500 }
    );
  }
}
