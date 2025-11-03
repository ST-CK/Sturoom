import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// ✅ 강의실별 주차 목록 불러오기
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await ctx.params; // ⚠️ Promise 해제 중요

  if (!roomId) {
    return NextResponse.json(
      { error: "roomId가 지정되지 않았습니다." },
      { status: 400 }
    );
  }

  // Supabase에서 room_id 기준으로 해당 강의의 자료 목록 조회
  const { data, error } = await supabase
    .from("library_posts")
    .select("id, title, week")
    .eq("room_id", roomId)
    .order("week", { ascending: true });

  if (error) {
    console.error("❌ 주차 전체 조회 실패:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 프론트에서 보기 쉽게 week_number로 포맷
  const formatted = (data || []).map((p) => ({
    id: p.id,
    title: p.title,
    week_number: p.week,
  }));

  return NextResponse.json(formatted);
}
