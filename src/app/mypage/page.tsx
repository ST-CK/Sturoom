// // src/app/mypage/page.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { supabase } from "@/lib/supabaseClient";
// import useAuth from "@/hooks/useAuth";

// type Role = "student" | "parent" | "teacher";
// type Profile = {
//   full_name: string | null;
//   role: Role | null;
//   school_name: string | null;
//   phone: string | null;
// };

// export default function MyPage() {
//   const router = useRouter();
//   const { user, profile, loading } = useAuth();

//   const [form, setForm] = useState<Profile>({
//     full_name: "",
//     role: "student",
//     school_name: "",
//     phone: "",
//   });
//   const [saving, setSaving] = useState(false);
//   const [msg, setMsg] = useState<string | null>(null);
//   const [err, setErr] = useState<string | null>(null);

//   // 초기 값 로드
//   useEffect(() => {
//     if (!loading) {
//       if (!user) {
//         router.replace("/login?next=/mypage");
//         return;
//       }
//       setForm({
//         full_name: profile?.full_name ?? "",
//         role: (profile?.role as Role) ?? "student",
//         school_name: profile?.school_name ?? "",
//         phone: profile?.phone ?? "",
//       });
//     }
//   }, [loading, user, profile, router]);

//   const email = useMemo(() => user?.email ?? "(이메일 없음)", [user]);

//   const onChange =
//     (key: keyof Profile) =>
//     (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//       setForm((f) => ({ ...f, [key]: e.target.value }));
//     };

//   const validate = () => {
//     if (!form.full_name?.trim()) return "이름을 입력해 주세요.";
//     if (!form.role) return "역할을 선택해 주세요.";
//     if (!form.school_name?.trim()) return "학교명을 입력해 주세요.";
//     if (!form.phone?.trim()) return "전화번호를 입력해 주세요.";
//     return null;
//   };

//   const onSave = async () => {
//     setErr(null);
//     setMsg(null);
//     const v = validate();
//     if (v) {
//       setErr(v);
//       return;
//     }
//     try {
//       setSaving(true);
//       const payload = {
//         id: user!.id,
//         full_name: form.full_name.trim(),
//         role: form.role,
//         school_name: form.school_name.trim(),
//         phone: form.phone.trim(),
//         updated_at: new Date().toISOString(),
//       };
//       const { error } = await supabase
//         .from("profiles")
//         .upsert(payload, { onConflict: "id" });
//       if (error) throw error;

//       setMsg("저장되었습니다.");
//       router.refresh();
//     } catch (e: any) {
//       console.error(e);
//       setErr(e?.message ?? "저장 중 오류가 발생했습니다.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onSignOut = async () => {
//     await supabase.auth.signOut();
//     router.replace("/");
//   };

//   if (loading) {
//     return (
//       <div className="mx-auto max-w-3xl p-6 text-gray-600">불러오는 중…</div>
//     );
//   }

//   // 이니셜 아바타
//   const initials = (() => {
//     const name = (form.full_name || "").trim();
//     if (!name) return "ST";
//     const parts = name.split(/\s+/);
//     if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
//     return (parts[0][0] + parts[1][0]).toUpperCase();
//   })();

//   return (
//     <div className="mx-auto max-w-3xl p-6">
//       {/* 상단 프로필 헤더 */}
//       <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
//         <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-teal-50" />
//         <div className="flex items-center gap-4 p-6">
//           <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-base font-extrabold text-white shadow">
//             {initials}
//           </div>
//           <div className="min-w-0">
//             <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">
//               {form.full_name || "이름을 설정해 주세요"}
//             </h1>
//             <p className="truncate text-sm text-slate-600">{email}</p>
//           </div>
//           <div className="ml-auto hidden gap-2 sm:flex">
//             <Link
//               href="/reset-password"
//               className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
//             >
//               비밀번호 재설정
//             </Link>
//             <button
//               onClick={onSignOut}
//               className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
//             >
//               로그아웃
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* 폼 카드 */}
//       <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
//         <div className="border-b border-slate-200 bg-slate-50/60 px-6 py-4">
//           <h2 className="text-base font-semibold text-slate-800">
//             회원 정보 관리
//           </h2>
//           <p className="mt-0.5 text-xs text-slate-500">
//             이름/역할/학교/전화번호를 수정할 수 있어요.
//           </p>
//         </div>

//         <div className="p-6">
//           <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
//             {/* 이메일 (읽기 전용) */}
//             <div className="sm:col-span-2">
//               <label className="mb-1 block text-sm font-medium text-slate-700">
//                 이메일
//               </label>
//               <div className="relative">
//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
//                   {/* mail icon */}
//                   <svg
//                     className="h-5 w-5 text-slate-400"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                   >
//                     <path
//                       d="M4 6h16v12H4z"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                     <path
//                       d="m4 7 8 6 8-6"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//                 <input
//                   value={email}
//                   readOnly
//                   className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-10 py-3 text-slate-700"
//                 />
//               </div>
//               <p className="mt-1 text-xs text-slate-500">
//                 이메일 변경은 인증이 필요합니다. 필요 시{" "}
//                 <Link
//                   href="/reset-password"
//                   className="font-medium text-indigo-600 underline"
//                 >
//                   비밀번호 재설정
//                 </Link>
//                 을 이용하세요.
//               </p>
//             </div>

//             {/* 이름 */}
//             <div>
//               <label className="mb-1 block text-sm font-medium text-slate-700">
//                 이름
//               </label>
//               <div className="relative">
//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
//                   {/* user icon */}
//                   <svg
//                     className="h-5 w-5 text-slate-400"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                   >
//                     <circle
//                       cx="12"
//                       cy="8"
//                       r="3.5"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                     />
//                     <path
//                       d="M5 19a7 7 0 0 1 14 0"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                       strokeLinecap="round"
//                     />
//                   </svg>
//                 </span>
//                 <input
//                   value={form.full_name ?? ""}
//                   onChange={onChange("full_name")}
//                   placeholder="홍길동"
//                   className="w-full rounded-2xl border border-slate-300 bg-white px-10 py-3 outline-none ring-0 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                 />
//               </div>
//             </div>

//             {/* 역할 */}
//             <div>
//               <label className="mb-1 block text-sm font-medium text-slate-700">
//                 역할
//               </label>
//               <div className="relative">
//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
//                   {/* briefcase icon */}
//                   <svg
//                     className="h-5 w-5 text-slate-400"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                   >
//                     <rect
//                       x="3.5"
//                       y="7"
//                       width="17"
//                       height="12"
//                       rx="2"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                     />
//                     <path
//                       d="M9 7V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                     />
//                   </svg>
//                 </span>
//                 <select
//                   value={form.role ?? "student"}
//                   onChange={onChange("role")}
//                   className="w-full appearance-none rounded-2xl border border-slate-300 bg-white px-10 py-3 outline-none ring-0 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                 >
//                   <option value="student">학생</option>
//                   <option value="parent">학부모</option>
//                   <option value="teacher">교사</option>
//                 </select>
//                 <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
//                   ▼
//                 </span>
//               </div>
//             </div>

//             {/* 학교 */}
//             <div className="sm:col-span-2">
//               <label className="mb-1 block text-sm font-medium text-slate-700">
//                 학교
//               </label>
//               <div className="relative">
//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
//                   {/* building icon */}
//                   <svg
//                     className="h-5 w-5 text-slate-400"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                   >
//                     <path
//                       d="M3.5 20.5h17M6 20.5V6.5l6-3 6 3v14"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                     <path
//                       d="M9.5 10.5h5M9.5 14h5"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                       strokeLinecap="round"
//                     />
//                   </svg>
//                 </span>
//                 <input
//                   value={form.school_name ?? ""}
//                   onChange={onChange("school_name")}
//                   placeholder="남춘천여자중학교"
//                   className="w-full rounded-2xl border border-slate-300 bg-white px-10 py-3 outline-none ring-0 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                 />
//               </div>
//             </div>

//             {/* 전화번호 */}
//             <div className="sm:col-span-2">
//               <label className="mb-1 block text-sm font-medium text-slate-700">
//                 전화번호
//               </label>
//               <div className="relative">
//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
//                   {/* phone icon */}
//                   <svg
//                     className="h-5 w-5 text-slate-400"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                   >
//                     <path
//                       d="M7 4h3l1 4-2 1a11 11 0 0 0 4 4l1.1-2H18l2 3-2 3c-6 1-12-5-11-11L7 4z"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//                 <input
//                   value={form.phone ?? ""}
//                   onChange={onChange("phone")}
//                   placeholder="010-1234-5678"
//                   className="w-full rounded-2xl border border-slate-300 bg-white px-10 py-3 outline-none ring-0 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* 메시지 */}
//           <div className="mt-4 h-6">
//             {err && <p className="text-sm text-rose-600">{err}</p>}
//             {!err && msg && <p className="text-sm text-emerald-600">{msg}</p>}
//           </div>

//           {/* 액션 */}
//           <div className="mt-2 flex flex-wrap items-center gap-3">
//             <button
//               onClick={onSave}
//               disabled={saving}
//               className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
//             >
//               {saving ? "저장 중..." : "저장"}
//             </button>
//             <Link
//               href="/reset-password"
//               className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
//             >
//               비밀번호 재설정
//             </Link>
//             <button
//               onClick={onSignOut}
//               className="ml-auto rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
//             >
//               로그아웃
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* 위험 구역 */}
//       <div className="mt-6 overflow-hidden rounded-3xl border border-rose-200 bg-rose-50/70 shadow-sm">
//         <div className="border-b border-rose-200 px-6 py-3">
//           <h3 className="text-sm font-semibold text-rose-700">위험 구역</h3>
//         </div>
//         <div className="p-6">
//           <p className="text-sm text-rose-700">
//             탈퇴는 복구할 수 없습니다. (관리자 승인 또는 별도 프로세스 필요)
//           </p>
//           <div className="mt-3">
//             <button
//               disabled
//               className="cursor-not-allowed rounded-2xl border border-rose-300 bg-white/60 px-4 py-2 text-sm font-medium text-rose-700 opacity-60"
//               title="서버/보안 정책에 맞춘 별도 구현 필요"
//             >
//               계정 탈퇴 (준비중)
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* 모바일 하단 퀵 액션 */}
//       <div className="mt-6 flex gap-2 sm:hidden">
//         <Link
//           href="/reset-password"
//           className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
//         >
//           비밀번호 재설정
//         </Link>
//         <button
//           onClick={onSignOut}
//           className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
//         >
//           로그아웃
//         </button>
//       </div>
//     </div>
//   );
// }
// src/app/mypage/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import useAuth from "@/hooks/useAuth";

type Role = "student" | "parent" | "teacher";

/** 폼 상태에서는 null을 쓰지 않도록 단순화 */
type ProfileForm = {
  full_name: string;
  role: Role;
  school_name: string;
  phone: string;
};

export default function MyPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    role: "student",
    school_name: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // 초기 값 로드
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login?next=/mypage");
      return;
    }

    setForm({
      full_name: profile?.full_name ?? "",
      role: (profile?.role as Role) ?? "student",
      school_name: profile?.school_name ?? "",
      phone: profile?.phone ?? "",
    });
  }, [loading, user, profile, router]);

  const email = useMemo(() => user?.email ?? "(이메일 없음)", [user]);

  const onChange =
    (key: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const validate = () => {
    if (!form.full_name.trim()) return "이름을 입력해 주세요.";
    if (!form.role) return "역할을 선택해 주세요.";
    if (!form.school_name.trim()) return "학교명을 입력해 주세요.";
    if (!form.phone.trim()) return "전화번호를 입력해 주세요.";
    return null;
  };

  const onSave = async () => {
    setErr(null);
    setMsg(null);

    // ✅ user null 가드로 TS 안전 확보 (user!.id 제거)
    if (!user) {
      setErr("로그인이 필요합니다.");
      router.replace("/login?next=/mypage");
      return;
    }

    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id: user.id,
        full_name: form.full_name.trim(),
        role: form.role,
        school_name: form.school_name.trim(),
        phone: form.phone.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;

      setMsg("저장되었습니다.");
      router.refresh(); // 헤더 등 전역 상태 반영
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-gray-600">불러오는 중…</div>
    );
  }

  // 이니셜 아바타 텍스트
  const initials = (() => {
    const name = form.full_name.trim();
    if (!name) return "ST";
    const parts = name.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  })();

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* 상단 프로필 헤더 */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-teal-50" />
        <div className="flex items-center gap-4 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-base font-extrabold text-white shadow">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">
              {form.full_name || "이름을 설정해 주세요"}
            </h1>
            <p className="truncate text-sm text-slate-600">{email}</p>
          </div>
          <div className="ml-auto hidden gap-2 sm:flex">
            <Link
              href="/reset-password"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              비밀번호 재설정
            </Link>
            <button
              onClick={onSignOut}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 폼 카드 */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/60 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">
            회원 정보 관리
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            이름/역할/학교/전화번호를 수정할 수 있어요.
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* 이메일 (읽기 전용) */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                이메일
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <input
                  value={email}
                  readOnly
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-10 py-3 text-slate-700"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                이메일 변경은 인증이 필요합니다. 필요 시{" "}
                <Link href="/reset-password" className="font-medium text-indigo-600 underline">
                  비밀번호 재설정
                </Link>
                을 이용하세요.
              </p>
            </div>

            {/* 이름 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                이름
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M5 19a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <input
                  value={form.full_name}
                  onChange={onChange("full_name")}
                  placeholder="홍길동"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-10 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {/* 역할 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                역할
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none">
                    <rect x="3.5" y="7" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M9 7V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <select
                  value={form.role}
                  onChange={onChange("role")}
                  className="w-full appearance-none rounded-2xl border border-slate-300 bg-white px-10 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="student">학생</option>
                  <option value="parent">학부모</option>
                  <option value="teacher">교사</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  ▼
                </span>
              </div>
            </div>

            {/* 학교 */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                학교
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none">
                    <path d="M3.5 20.5h17M6 20.5V6.5l6-3 6 3v14" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M9.5 10.5h5M9.5 14h5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <input
                  value={form.school_name}
                  onChange={onChange("school_name")}
                  placeholder="남춘천여자중학교"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-10 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {/* 전화번호 */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                전화번호
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 4h3l1 4-2 1a11 11 0 0 0 4 4l1.1-2H18l2 3-2 3c-6 1-12-5-11-11L7 4z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
                <input
                  value={form.phone}
                  onChange={onChange("phone")}
                  placeholder="010-1234-5678"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-10 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          </div>

          {/* 메시지 */}
          <div className="mt-4 h-6">
            {err && <p className="text-sm text-rose-600">{err}</p>}
            {!err && msg && <p className="text-sm text-emerald-600">{msg}</p>}
          </div>

          {/* 액션 */}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
            <Link
              href="/reset-password"
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              비밀번호 재설정
            </Link>
            <button
              onClick={onSignOut}
              className="ml-auto rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 위험 구역 */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-rose-200 bg-rose-50/70 shadow-sm">
        <div className="border-b border-rose-200 px-6 py-3">
          <h3 className="text-sm font-semibold text-rose-700">위험 구역</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-rose-700">
            탈퇴는 복구할 수 없습니다. (관리자 승인 또는 별도 프로세스 필요)
          </p>
          <div className="mt-3">
            <button
              disabled
              className="cursor-not-allowed rounded-2xl border border-rose-300 bg-white/60 px-4 py-2 text-sm font-medium text-rose-700 opacity-60"
              title="서버/보안 정책에 맞춘 별도 구현 필요"
            >
              계정 탈퇴 (준비중)
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 하단 퀵 액션 */}
      <div className="mt-6 flex gap-2 sm:hidden">
        <Link
          href="/reset-password"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          비밀번호 재설정
        </Link>
        <button
          onClick={onSignOut}
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
