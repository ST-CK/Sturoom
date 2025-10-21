import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    // ✅ 실제 테이블: library_rooms
    const { data, error } = await supabase
      .from("library_rooms")
      .select("id, title")
      .order("title", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("❌ 강의 불러오기 실패:", err);
    // 프론트가 빈 배열도 처리하도록 200 + [] 반환
    return NextResponse.json([], { status: 200 });
  }
}
