// // ✅ Next.js App Router 전용 Supabase 클라이언트
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// export const supabase = createClientComponentClient();
// 📁 src/lib/supabaseClient.ts

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
