import { supabase } from "@/lib/supabaseClient";
import ClientRoom from "@/components/library/ClientRoom";
import type { LibraryPost } from "@/types/library";

export default async function LibraryRoomPage(props: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await props.params;

  const { data: room, error: roomError } = await supabase
    .from("library_rooms")
    .select("*")
    .eq("id", roomId)
    .maybeSingle();

  if (roomError || !room) {
    return <div className="p-6 text-red-600">해당 강의실을 찾을 수 없습니다.</div>;
  }

  const { data: weeks } = await supabase
    .from("library_posts")
    .select("week")
    .eq("room_id", roomId);

  const uniqueWeeks = Array.from(new Set((weeks ?? []).map((w) => w.week))).sort();

  const { data: posts } = await supabase
    .from("library_posts")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-bold">{room.title}</h1>
      <ClientRoom
        roomId={roomId}
        initialWeeks={uniqueWeeks}
        initialPosts={(posts ?? []) as LibraryPost[]}
      />
    </div>
  );
}
