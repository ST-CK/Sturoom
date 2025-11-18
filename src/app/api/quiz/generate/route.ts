import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // ← 여기 변경됨
);

export async function POST(req: Request) {
  try {
    // -----------------------------
    // 1) 인증 검사
    // -----------------------------
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token)
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );

    const { data: userData, error: userErr } =
      await supabaseServer.auth.getUser(token);

    if (userErr || !userData?.user)
      return NextResponse.json(
        { error: "세션 만료 또는 잘못된 토큰" },
        { status: 401 }
      );

    const user = userData.user;

    // -----------------------------
    // 2) 프론트에서 params 받기
    // -----------------------------
    const { lectureId, weekId, mode } = await req.json();

    if (!lectureId || !weekId)
      return NextResponse.json(
        { error: "lectureId, weekId가 필요합니다." },
        { status: 400 }
      );

    // -----------------------------
    // 3) FastAPI → 세션 생성
    // -----------------------------
    const sessionRes = await fetch(
      `${BACKEND_URL}/api/quiz/session/start`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          room_id: lectureId,
          post_id: weekId,
          mode,
        }),
      }
    );

    const sessionPayload = await sessionRes.json();

    if (!sessionRes.ok)
      throw new Error(sessionPayload?.error || "세션 생성 실패");

    const sessionId = sessionPayload.session_id;
    const runId = sessionPayload.run_id;

    if (!sessionId || !runId)
      throw new Error("세션 생성 실패 (session_id/run_id 없음)");

    // -----------------------------
    // 4) Supabase에서 파일 URL 가져오기
    // -----------------------------
    const { data: post } = await supabaseServer
      .from("classroom_week_posts")
      .select("file_urls")
      .eq("id", Number(weekId))     // ← 숫자로 변환 필수
      .single();

    const file_urls = post?.file_urls || [];

    if (!file_urls.length)
      return NextResponse.json(
        { error: "파일이 없어서 퀴즈를 생성할 수 없습니다." },
        { status: 400 }
      );

    // -----------------------------
    // 5) FastAPI → 퀴즈 생성 요청
    // -----------------------------
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
        user_id: user.id,
        room_id: lectureId,
        week_id: weekId,
        mode,
      }),
    });

    const quizPayload = await quizRes.json();

    if (!quizRes.ok)
      throw new Error(quizPayload?.error || "퀴즈 생성 실패");

    const quizList = quizPayload.quiz;

    if (!quizList || quizList.length === 0)
      throw new Error("퀴즈 생성 결과 없음");

    const first = quizList[0]; // 첫 번째 문제

    // -----------------------------
    // 6) 첫 문제 quiz_messages에 저장
    // -----------------------------
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

    // -----------------------------
    // 7) 첫 문제 반환
    // -----------------------------
    return NextResponse.json({
      message: "퀴즈 생성 완료",
      sessionId,
      runId,
      firstQuestion: first,
    });
  } catch (err: any) {
    console.error("❌ generate 에러:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
