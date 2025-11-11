// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient"; // 전역 클라이언트 사용

// type QuizMode = "multiple" | "ox" | "short" | "mixed";

// type Props = {
//   onStart: (args: {
//     lectureId: string;
//     weekId: string;
//     mode: QuizMode;
//     sessionId: string;
//     runId: string;
//   }) => void;
// };

// export default function QuizCard({ onStart }: Props) {
//   const [lectures, setLectures] = useState<any[]>([]);
//   const [weeks, setWeeks] = useState<any[]>([]);
//   const [lectureId, setLectureId] = useState("");
//   const [weekId, setWeekId] = useState("");
//   const [mode, setMode] = useState<QuizMode>("mixed");
//   const [loading, setLoading] = useState(false);
//   const [ready, setReady] = useState(false);

//   // 🔒 환경변수
//   const BACKEND_URL =
//     process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

//   // ✅ 세션 초기화 보장 (Safari 대응)
//   useEffect(() => {
//     (async () => {
//       const { data } = await supabase.auth.getSession();
//       if (data.session) setReady(true);
//     })();
//   }, []);

//   if (!ready)
//     return (
//       <div className="w-full text-center text-slate-600 py-6">
//         🔄 세션 초기화 중...
//       </div>
//     );

//   // ✅ 강의 목록 불러오기
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch("/api/library/classrooms");
//         if (!res.ok) return;
//         const data = await res.json();
//         setLectures(data || []);
//       } catch {
//         /* ignore */
//       }
//     })();
//   }, []);

//   // ✅ 주차 목록 불러오기
//   useEffect(() => {
//     if (!lectureId) {
//       setWeeks([]);
//       setWeekId("");
//       return;
//     }
//     (async () => {
//       try {
//         const res = await fetch(`/api/library/classrooms/${lectureId}/weeks`);
//         if (!res.ok) return;
//         const data = await res.json();
//         setWeeks(data || []);
//       } catch {
//         /* ignore */
//       }
//     })();
//   }, [lectureId]);

//   // ✅ 세션 생성
//   async function handleStart() {
//     if (!lectureId || !weekId) {
//       alert("강의와 주차를 먼저 선택하세요.");
//       return;
//     }

//     setLoading(true);
//     try {
//       // ✅ 세션 가져오기 (getUser → getSession 변경)
//       const {
//         data: { session },
//         error,
//       } = await supabase.auth.getSession();

//       if (error || !session) {
//         alert("로그인이 필요합니다. 다시 로그인해주세요.");
//         await supabase.auth.signOut();
//         return;
//       }

//       const user = session.user;
//       if (!user?.id) {
//         alert("세션 정보가 없습니다. 다시 로그인해주세요.");
//         return;
//       }

//       // ✅ 백엔드에 토큰 포함 요청
//       const sessionRes = await fetch(`${BACKEND_URL}/quiz/session/start`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${session.access_token}`,
//         },
//         body: JSON.stringify({
//           user_id: user.id,
//           room_id: lectureId,
//           post_id: weekId,
//           mode,
//         }),
//       });

//       const payload = await sessionRes.json();
//       if (!sessionRes.ok)
//         throw new Error(payload?.error || "세션 생성 실패");

//       if (!payload?.session_id || !payload?.run_id)
//         throw new Error("세션 응답이 올바르지 않습니다.");

//       // ✅ 부모로 전달
//       onStart({
//         lectureId,
//         weekId,
//         mode,
//         sessionId: payload.session_id,
//         runId: payload.run_id,
//       });
//     } catch (e: any) {
//       console.error("❌ 세션 생성 오류:", e);
//       alert(e?.message || "세션 생성 중 오류가 발생했습니다.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="mx-auto w-[380px] bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-slate-200/60">
//       <h3 className="text-xl font-semibold text-center mb-4 text-slate-800">
//         📘 AI 퀴즈 생성기
//       </h3>

//       <div className="space-y-4">
//         {/* ✅ 강의 선택 */}
//         <select
//           className="w-full border border-slate-300 rounded-lg px-3 py-2"
//           value={lectureId}
//           onChange={(e) => setLectureId(e.target.value)}
//         >
//           <option value="">강의를 선택하세요</option>
//           {lectures.map((l) => (
//             <option key={l.id} value={l.id}>
//               {l.title}
//             </option>
//           ))}
//         </select>

//         {/* ✅ 주차 선택 */}
//         <select
//           className="w-full border border-slate-300 rounded-lg px-3 py-2"
//           value={weekId}
//           onChange={(e) => setWeekId(e.target.value)}
//           disabled={!lectureId}
//         >
//           <option value="">주차를 선택하세요</option>
//           {weeks.map((w: any) => (
//             <option key={w.id} value={w.id}>
//               {w.week_number}주차 - {w.title}
//             </option>
//           ))}
//         </select>

//         {/* ✅ 모드 선택 */}
//         <div className="grid grid-cols-4 gap-2">
//           {(["multiple", "ox", "short", "mixed"] as const).map((m) => (
//             <button
//               key={m}
//               onClick={() => setMode(m)}
//               type="button"
//               className={`rounded-lg px-3 py-2 text-sm border transition ${
//                 mode === m
//                   ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold"
//                   : "border-slate-200 hover:bg-slate-50 text-slate-700"
//               }`}
//             >
//               {m === "multiple"
//                 ? "선다형"
//                 : m === "ox"
//                 ? "OX"
//                 : m === "short"
//                 ? "서술형"
//                 : "혼합"}
//             </button>
//           ))}
//         </div>

//         {/* ✅ 시작 버튼 */}
//         <button
//           disabled={loading}
//           onClick={handleStart}
//           className={`w-full mt-3 rounded-lg py-2 font-semibold text-white transition ${
//             loading
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-indigo-600 hover:bg-indigo-700"
//           }`}
//         >
//           {loading ? "세션 생성 중..." : "퀴즈 시작하기"}
//         </button>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type QuizMode = "multiple" | "ox" | "short" | "mixed";

type Props = {
  onStart: (args: {
    lectureId: string;
    weekId: string;
    mode: QuizMode;
    sessionId: string;
    runId: string;
  }) => void;
};

export default function QuizCard({ onStart }: Props) {
  const [lectures, setLectures] = useState<any[]>([]);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [lectureId, setLectureId] = useState("");
  const [weekId, setWeekId] = useState("");
  const [mode, setMode] = useState<QuizMode>("mixed");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(
    typeof window === "undefined" ? true : false
  );

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

  // ✅ 클라이언트에서만 세션 로드
  useEffect(() => {
    if (typeof window === "undefined") return;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setReady(true);
    })();
  }, []);

  if (!ready)
    return (
      <div className="w-full text-center text-slate-600 py-6">
        🔄 세션 초기화 중...
      </div>
    );

  // ✅ 강의 목록
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/library/classrooms");
        if (!res.ok) return;
        const data = await res.json();
        setLectures(Array.isArray(data) ? data : []);
      } catch {
        setLectures([]);
      }
    })();
  }, []);

  // ✅ 주차 목록
  useEffect(() => {
    if (!lectureId) {
      setWeeks([]);
      setWeekId("");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/library/classrooms/${lectureId}/weeks`);
        if (!res.ok) return;
        const data = await res.json();
        setWeeks(Array.isArray(data) ? data : []);
      } catch {
        setWeeks([]);
      }
    })();
  }, [lectureId]);

  // ✅ 세션 생성
  async function handleStart() {
    if (!lectureId || !weekId) {
      alert("강의와 주차를 먼저 선택하세요.");
      return;
    }
    if (typeof onStart !== "function") {
      console.error("❌ onStart prop is not provided");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        alert("로그인이 필요합니다. 다시 로그인해주세요.");
        await supabase.auth.signOut();
        return;
      }

      const { user, access_token } = data.session;
      const sessionRes = await fetch(`${BACKEND_URL}/quiz/session/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          room_id: lectureId,
          post_id: weekId,
          mode,
        }),
      });

      const payload = await sessionRes.json();
      if (!sessionRes.ok) throw new Error(payload?.error || "세션 생성 실패");

      onStart({
        lectureId,
        weekId,
        mode,
        sessionId: payload.session_id,
        runId: payload.run_id,
      });
    } catch (e: any) {
      console.error("❌ 세션 생성 오류:", e);
      alert(e?.message || "세션 생성 중 오류 발생");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-[380px] bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-slate-200/60">
      <h3 className="text-xl font-semibold text-center mb-4 text-slate-800">
        📘 AI 퀴즈 생성기
      </h3>

      <div className="space-y-4">
        {/* 강의 선택 */}
        <select
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          value={lectureId}
          onChange={(e) => setLectureId(e.target.value)}
        >
          <option value="">강의를 선택하세요</option>
          {Array.isArray(lectures) &&
            lectures.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
        </select>

        {/* 주차 선택 */}
        <select
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          value={weekId}
          onChange={(e) => setWeekId(e.target.value)}
          disabled={!lectureId}
        >
          <option value="">주차를 선택하세요</option>
          {Array.isArray(weeks) &&
            weeks.map((w: any) => (
              <option key={w.id} value={w.id}>
                {w.week_number}주차 - {w.title}
              </option>
            ))}
        </select>

        {/* 모드 선택 */}
        <div className="grid grid-cols-4 gap-2">
          {(["multiple", "ox", "short", "mixed"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              type="button"
              className={`rounded-lg px-3 py-2 text-sm border transition ${
                mode === m
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              {m === "multiple"
                ? "선다형"
                : m === "ox"
                ? "OX"
                : m === "short"
                ? "서술형"
                : "혼합"}
            </button>
          ))}
        </div>

        <button
          disabled={loading}
          onClick={handleStart}
          className={`w-full mt-3 rounded-lg py-2 font-semibold text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "세션 생성 중..." : "퀴즈 시작하기"}
        </button>
      </div>
    </div>
  );
}
