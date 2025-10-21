// src/app/api/library/classrooms/[lectureId]/weeks/[weekId]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type Params = { lectureId: string; weekId: string };

// Next.js 15: params는 Promise
export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
  const { lectureId, weekId } = await ctx.params;

  try {
    // ✅ 실제 테이블은 library_posts
    const { data, error } = await supabase
      .from("library_posts")
      .select("id, title, room_id, week, attachments")
      .eq("room_id", lectureId) // 강의(룸) 필터
      .eq("id", weekId)         // 특정 주차(포스트) id
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "주차 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 프론트에서 쓰는 필드명으로 매핑
    const resp = {
      id: data.id,
      title: data.title,
      lecture_id: data.room_id,
      week_number: data.week,
      file_url: data.attachments?.[0]?.url ?? null, // 첨부 첫 파일 URL
    };

    return NextResponse.json(resp);
  } catch (e) {
    console.error("GET week detail error:", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
