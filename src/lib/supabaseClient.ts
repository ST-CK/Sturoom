// ✅ Next.js App Router 전용 Supabase 클라이언트
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const supabase = createClientComponentClient();
