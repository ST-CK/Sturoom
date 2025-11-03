import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// ✅ 특정 자료 상세 조회 (퀴즈용 file_urls 포함)
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ roomId: string; weekId: string; postId: string }> }
) {
  const { roomId, weekId, postId } = await ctx.params; // ✅ 여기 await 추가!

  const { data, error } = await supabase
    .from("library_posts")
    .select("id, title, attachments")
    .eq("room_id", roomId)
    .eq("id", postId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "자료를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  // attachments 필드에서 URL만 추출
  const file_urls = Array.isArray(data.attachments)
    ? data.attachments.map((a: any) => a.url)
    : [];

  return NextResponse.json({
    id: data.id,
    title: data.title,
    file_urls,
  });
}
