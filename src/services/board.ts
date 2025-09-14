import { supabase } from "@/lib/supabaseClient";
import type { Attachment, Comment, Post, ListParams, ListResult } from "@/types/board";

const displayName = (r: any) =>
  r.is_anonymous ? "익명" : (r.author_name || r.author_email || "익명");

const fromRow = (r: any): Post => ({
  id: r.id,
  title: r.title,
  content: r.content,
  author: displayName(r),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  isPinned: r.is_pinned,
  likeUserIds: (r.likes ?? []).map((l: any) => l.user_id),
});

async function signUrls(rows: any[]): Promise<Attachment[]> {
  if (!rows?.length) return [];
  const paths = rows.map((r) => r.storage_path);
  const { data } = await supabase.storage.from("board_attachments").createSignedUrls(paths, 600);
  return rows.map((r, i) => ({
    id: r.id,
    postId: r.post_id,
    fileName: r.file_name,
    url: data?.[i]?.signedUrl ?? "",
  }));
}

export const boardRepo = {
  /* 목록 */
  async list(params: ListParams): Promise<ListResult> {
    const { q = "", field = "title_content", page = 1, pageSize = 10, onlyMine = false, me } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("board_posts").select(
      `
      id, title, content,
      author_email, author_name, is_anonymous,
      is_pinned, created_at, updated_at,
      likes:board_likes(user_id)
    `,
      { count: "exact" }
    );

    if (q.trim()) {
      if (field === "title") query = query.ilike("title", `%${q}%`);
      else if (field === "content") query = query.ilike("content", `%${q}%`);
      else query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    }
    if (onlyMine && me) query = query.eq("author_email", me);

    const { data, error, count } = await query
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { items: (data ?? []).map(fromRow), total: count ?? 0 };
  },

  /* 상세 */
  async get(id: string): Promise<Post> {
    const { data, error } = await supabase
      .from("board_posts")
      .select(
        `
        id, title, content,
        author_email, author_name, is_anonymous,
        is_pinned, created_at, updated_at,
        likes:board_likes(user_id)
      `
      )
      .eq("id", id)
      .single();
    if (error) throw error;
    return fromRow(data);
  },

  /* 생성 */
  async create({
    title,
    content,
    authorEmail,
    authorName,
    isAnonymous = false,
    attachments = [],
  }: {
    title: string;
    content: string;
    authorEmail: string;
    authorName: string;      // 프로필 full_name
    isAnonymous?: boolean;
    attachments?: File[];
  }) {
    const { data, error } = await supabase
      .from("board_posts")
      .insert({
        title,
        content,
        author_email: authorEmail,
        author_name: authorName,
        is_anonymous: isAnonymous,
      })
      .select("id")
      .single();
    if (error) throw error;
    const id = data.id as string;
    if (attachments?.length) await this._uploadAttachments(id, attachments);
    return id;
  },

  /* 수정 */
  async update(
    id: string,
    patch: Partial<{ title: string; content: string; isPinned: boolean; isAnonymous: boolean }>
  ) {
    const payload: any = {};
    if (patch.title !== undefined) payload.title = patch.title;
    if (patch.content !== undefined) payload.content = patch.content;
    if (patch.isPinned !== undefined) payload.is_pinned = patch.isPinned;
    if (patch.isAnonymous !== undefined) payload.is_anonymous = patch.isAnonymous;

    const { error } = await supabase.from("board_posts").update(payload).eq("id", id);
    if (error) throw error;
  },

  /* 삭제 */
  async remove(id: string) {
    const { error } = await supabase.from("board_posts").delete().eq("id", id);
    if (error) throw error;
  },

  /* 좋아요 토글 */
  async toggleLike(postId: string, userId: string) {
    const { data: liked } = await supabase
      .from("board_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();
    if (liked) {
      await supabase.from("board_likes").delete().eq("id", liked.id);
    } else {
      await supabase.from("board_likes").insert({ post_id: postId, user_id: userId });
    }
  },

  /* 댓글 */
  async listComments(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from("board_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      postId: r.post_id,
      author: r.author,
      content: r.content,
      createdAt: r.created_at,
    }));
  },

  async addComment(postId: string, author: string, content: string) {
    const { error } = await supabase.from("board_comments").insert({ post_id: postId, author, content });
    if (error) throw error;
  },

  /* 첨부 */
  async listAttachments(postId: string): Promise<Attachment[]> {
    const { data, error } = await supabase
      .from("board_attachments")
      .select("id, post_id, file_name, storage_path")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return signUrls(data ?? []);
  },

  async _uploadAttachments(postId: string, files: File[]) {
    const bucket = supabase.storage.from("board_attachments");
    for (const f of files) {
      const path = `${postId}/${crypto.randomUUID()}-${encodeURIComponent(f.name)}`;
      await bucket.upload(path, f, { upsert: false });
      await supabase.from("board_attachments").insert({
        post_id: postId,
        file_name: f.name,
        storage_path: path,
      });
    }
  },
};
