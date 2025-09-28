export type LibraryRoom = {
  id: string;
  title: string;
  instructor: string;
  track: string | null;
  thumbnail: string | null;
  is_new?: boolean;
  created_at: string;
};

export type LibraryPost = {
  id: string;
  room_id: string;
  title: string;
  body?: string;
  summary?: string;
  week: number;
  status?: string;
  tags?: string[];
  due_at?: string;
  attachments?: { id: string; name: string; url: string | null; size?: string }[];
  images?: string[];
  created_at: string;
};
