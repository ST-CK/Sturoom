import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const res = await fetch(`${BACKEND_URL}/api/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) throw new Error("백엔드 연결 실패");

    const data = await res.json();
    return NextResponse.json({ reply: data.reply });
  } catch (error) {
    console.error("❌ API 오류:", error);
    return NextResponse.json(
      { reply: "서버와 연결할 수 없습니다 😥" },
      { status: 500 }
    );
  }
}
