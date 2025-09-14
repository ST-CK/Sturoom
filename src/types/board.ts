export type Post = {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  likeUserIds: string[];
};

export type Comment = {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
};

export type Attachment = {
  id: string;
  postId: string;
  fileName: string;
  url: string;
};

export type ListParams = {
  q?: string;
  field?: "title" | "content" | "title_content";
  page?: number;
  pageSize?: number;
  onlyMine?: boolean;
  me?: string;
};

export type ListResult = {
  items: Post[];
  total: number;
};
