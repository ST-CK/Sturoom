import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type Params = { roomId: string };

export async function GET(req: Request, ctx: { params: Promise<Params> }) {
  const { roomId } = await ctx.params;

  try {
    const { data, error } = await supabase
      .from("library_weeks")
      .select("id, title, week_number, created_at")
      .eq("lecture_id", roomId)
      .order("week_number", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("❌ 주차 목록 불러오기 실패:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
