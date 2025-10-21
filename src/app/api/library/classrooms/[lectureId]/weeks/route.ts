import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type Params = { lectureId: string };

// Next.js 15 대응: params는 Promise로 감싸짐
export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
  const { lectureId } = await ctx.params;

  try {
    // ✅ 실제 테이블: library_posts
    const { data, error } = await supabase
      .from("library_posts")
      .select("id, title, week, attachments, room_id")
      .eq("room_id", lectureId)
      .order("week", { ascending: true });

    if (error) throw error;

    // ✅ 필요한 형태로 변환
    const parsed = (data ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      file_url: row.attachments?.[0]?.url ?? null,
      week_number: row.week, // 프론트와 이름 맞추기
    }));

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("❌ Supabase error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
