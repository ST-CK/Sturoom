"use client";

import { v4 as uuid } from "uuid";
import type { Post, Comment, Attachment, ListParams, ListResult } from "@/types/board";

const KEY = "sturoom_board_v1";

type DB = {
  posts: Post[];
  comments: Comment[];
  attachments: Attachment[];
};

function load(): DB {
  const raw = (typeof window !== "undefined") ? localStorage.getItem(KEY) : null;
  if (raw) return JSON.parse(raw);
  const seed: DB = {
    posts: [
      {
        id: uuid(),
        title: "환영합니다 👋",
        content: "첫 글입니다.",
        author: "demo@sturoom.dev",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: true,
        likeUserIds: [],
      },
    ],
    comments: [],
    attachments: [],
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(seed));
  }
  return seed;
}
function save(db: DB) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(db));
  }
}

export const boardRepo = {
  async list(params: ListParams): Promise<ListResult> {
    const { q = "", field = "title_content", page = 1, pageSize = 10, onlyMine, me } = params;
    let { posts } = load();

    if (q.trim()) {
      const like = (s: string) => s.toLowerCase().includes(q.toLowerCase());
      posts = posts.filter(p =>
        field === "title" ? like(p.title) :
        field === "content" ? like(p.content) :
        like(p.title) || like(p.content)
      );
    }
    if (onlyMine && me) posts = posts.filter(p => p.author === me);

    // 고정글 우선 + 최신순
    posts = posts.sort((a, b) =>
      (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) ||
      (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );

    const total = posts.length;
    const start = (page - 1) * pageSize;
    const items = posts.slice(start, start + pageSize);
    return { items, total };
  },

  async get(id: string): Promise<Post | null> {
    const { posts } = load();
    return posts.find(p => p.id === id) ?? null;
  },

  async create(input: { title: string; content: string; author: string; attachments?: File[] }): Promise<string> {
    const db = load();
    const id = uuid();
    const now = new Date().toISOString();
    db.posts.unshift({
      id,
      title: input.title,
      content: input.content,
      author: input.author,
      createdAt: now,
      updatedAt: now,
      isPinned: false,
      likeUserIds: [],
    });

    if (input.attachments?.length) {
      for (const f of input.attachments) {
        const url = await fileToDataURL(f);
        db.attachments.push({ id: uuid(), postId: id, fileName: f.name, url });
      }
    }
    save(db);
    return id;
  },

  async update(id: string, patch: Partial<Pick<Post, "title" | "content" | "isPinned">>) {
    const db = load();
    const target = db.posts.find(p => p.id === id);
    if (!target) return;
    Object.assign(target, patch);
    target.updatedAt = new Date().toISOString();
    save(db);
  },

  async remove(id: string) {
    const db = load();
    db.posts = db.posts.filter(p => p.id !== id);
    db.comments = db.comments.filter(c => c.postId !== id);
    db.attachments = db.attachments.filter(a => a.postId !== id);
    save(db);
  },

  async toggleLike(id: string, userId: string) {
    const db = load();
    const p = db.posts.find(p => p.id === id);
    if (!p) return;
    const i = p.likeUserIds.indexOf(userId);
    if (i >= 0) p.likeUserIds.splice(i, 1); else p.likeUserIds.push(userId);
    save(db);
  },

  async addComment(postId: string, author: string, content: string) {
    const db = load();
    db.comments.push({ id: uuid(), postId, author, content, createdAt: new Date().toISOString() });
    save(db);
  },

  async listComments(postId: string): Promise<Comment[]> {
    const { comments } = load();
    return comments
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async listAttachments(postId: string): Promise<Attachment[]> {
    const { attachments } = load();
    return attachments.filter(a => a.postId === postId);
  },
};

function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
