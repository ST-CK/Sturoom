import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// ✅ 강의실 목록
export async function GET() {
  const { data, error } = await supabase
    .from("library_rooms")
    .select("id, title, instructor, track, thumbnail, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ 강의 목록 조회 실패:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
