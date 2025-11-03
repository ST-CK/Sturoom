import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type Params = { roomId: string; weekId: string };

// ✅ 주차별 자료 리스트
export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
  const { roomId, weekId } = await ctx.params;

  const { data, error } = await supabase
    .from("library_posts")
    .select("id, title, summary, created_at")
    .eq("room_id", roomId)
    .eq("week", weekId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ 주차별 자료 조회 실패:", error);
    return NextResponse.json(
      { error: "자료를 불러오지 못했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
