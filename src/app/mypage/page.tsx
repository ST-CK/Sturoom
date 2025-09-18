// /src/app/mypage/page.tsx
"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import useAuth from "@/hooks/useAuth";

import TimetableGrid from "@/components/timetable/TimetableGrid";
import CourseForm, { type CoursePayload } from "@/components/timetable/CourseForm";
import { type Stage, type Timetable, type TimetableEntry } from "@/lib/timetable";

type Role = "student" | "parent" | "teacher";

type ProfileForm = {
  full_name: string;
  role: Role;
  school_name: string;
  phone: string;
  education_stage: Stage;
};

export default function MyPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    role: "student",
    school_name: "",
    phone: "",
    education_stage: "university",
  });
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // 시간표 상태
  const [ttLoading, setTtLoading] = useState(true);
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TimetableEntry | null>(null);

  // ===== 프로필/시간표 초기화 =====
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login?next=/mypage");
      return;
    }

    // 프로필이 도착했을 때 한 번만 폼을 DB 값으로 채움
    if (!initialized && profile) {
      const stage = (profile.education_stage as Stage) ?? "university";
      setForm({
        full_name: profile.full_name ?? "",
        role: (profile.role as Role) ?? "student",
        school_name: profile.school_name ?? "",
        phone: profile.phone ?? "",
        education_stage: stage,
      });
      setInitialized(true);
      ensureDefaultTimetable(stage);
    }

    // 프로필 레코드 자체가 없다면 기본값으로 초기화
    if (!initialized && profile === null) {
      setInitialized(true);
      ensureDefaultTimetable("university");
    }
  }, [loading, user, profile, initialized, router]);

  async function ensureDefaultTimetable(stage: Stage) {
    if (!user) return;
    setTtLoading(true);
    let { data: tt, error } = await supabase
      .from("timetables")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle();
    if (error) console.error(error);

    if (!tt) {
      const { data: created, error: e2 } = await supabase
        .from("timetables")
        .insert({ user_id: user.id, stage, name: "내 시간표", is_default: true })
        .select("*")
        .single();
      if (e2) console.error(e2);
      tt = created ?? null;
    }

    setTimetable(tt as Timetable);
    if (tt) await loadEntries(tt.id);
    setTtLoading(false);
  }

  const email = useMemo(() => user?.email ?? "(이메일 없음)", [user]);

  const onChange =
    (key: keyof ProfileForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value as any;
      setForm((f) => ({ ...f, [key]: value }));
    };

  const validate = () => {
    if (!form.full_name.trim()) return "이름을 입력해 주세요.";
    if (!form.role) return "역할을 선택해 주세요.";
    if (!form.school_name.trim()) return "학교명을 입력해 주세요.";
    if (!form.phone.trim()) return "전화번호를 입력해 주세요.";
    if (!form.education_stage) return "학년군을 선택해 주세요.";
    return null;
  };

  const onSave = async () => {
    setErr(null);
    setMsg(null);
    if (!user) {
      setErr("로그인이 필요합니다.");
      router.replace("/login?next=/mypage");
      return;
    }
    if (!initialized) return;

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
        education_stage: form.education_stage,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
      if (error) throw error;

      // 기본 시간표의 stage 동기화
      await supabase
        .from("timetables")
        .update({ stage: form.education_stage })
        .eq("user_id", user.id)
        .eq("is_default", true);

      setMsg("저장되었습니다.");
      router.refresh();
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

  async function loadEntries(timetable_id: string) {
    const { data, error } = await supabase
      .from("timetable_entries")
      .select("*")
      .eq("timetable_id", timetable_id)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });
    if (error) console.error(error);
    setEntries((data ?? []) as TimetableEntry[]);
  }

  // ✅ 여러 슬롯(분반) 지원
  async function upsertCourse(payload: CoursePayload) {
    if (!timetable) return;

    const rows = payload.slots.flatMap((slot) =>
      slot.days.map((d) => ({
        timetable_id: timetable.id,
        title: payload.title,
        location: payload.location ?? null,
        instructor: payload.instructor ?? null,
        color: payload.color ?? null,
        day_of_week: d,
        start_time: `${slot.start_time}:00`,
        end_time: `${slot.end_time}:00`,
        period_from: slot.period_from ?? null,
        period_to: slot.period_to ?? null,
        memo: payload.memo ?? null,
      }))
    );

    if (editing) {
      // 첫 번째 블록으로 현재 항목 업데이트
      const [first, ...rest] = rows;
      if (first) {
        const { error: e1 } = await supabase
          .from("timetable_entries")
          .update({
            title: first.title,
            location: first.location,
            instructor: first.instructor,
            color: first.color,
            day_of_week: first.day_of_week,
            start_time: first.start_time,
            end_time: first.end_time,
            period_from: first.period_from,
            period_to: first.period_to,
            memo: first.memo,
          })
          .eq("id", editing.id);
        if (e1) console.error(e1);
      }
      // 나머지 블록은 새로 추가
      if (rows.length > 1) {
        const { error: e2 } = await supabase.from("timetable_entries").insert(rows.slice(1));
        if (e2) console.error(e2);
      }
    } else {
      if (rows.length > 0) {
        const { error } = await supabase.from("timetable_entries").insert(rows);
        if (error) console.error(error);
      }
    }

    setShowForm(false);
    setEditing(null);
    await loadEntries(timetable.id);
  }

  async function deleteEntry(entry: TimetableEntry) {
    if (!timetable) return;
    const { error } = await supabase.from("timetable_entries").delete().eq("id", entry.id);
    if (error) console.error(error);
    await loadEntries(timetable.id);
  }

  if (loading || !initialized) {
    return <div className="mx-auto max-w-3xl p-6 text-gray-600">불러오는 중…</div>;
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
          <h2 className="text-base font-semibold text-slate-800">회원 정보 관리</h2>
          <p className="mt-0.5 text-xs text-slate-500">이름/역할/학교/전화번호를 수정할 수 있어요.</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* 이메일 (읽기 전용) */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">이메일</label>
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
            </div>

            {/* 이름 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">이름</label>
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
              <label className="mb-1 block text-sm font-medium text-slate-700">역할</label>
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
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▼</span>
              </div>
            </div>

            {/* 학교 */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">학교</label>
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
                  placeholder="학교명을 입력하세요"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-10 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {/* 전화번호 */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">전화번호</label>
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
              disabled={saving || !initialized}
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

      {/* ===== 시간표 섹션 ===== */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">내 시간표</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-xl border" onClick={() => setShowForm(true)}>
              + 수업 추가
            </button>
          </div>
        </div>

        <div className="p-2">
          {ttLoading || !timetable ? (
            <div className="p-6 text-sm text-slate-600">시간표 불러오는 중…</div>
          ) : (
            <div className="rounded-2xl border bg-white p-2">
              <TimetableGrid
                stage={form.education_stage}
                entries={entries}
                onClickEmpty={() => setShowForm(true)}
                onClickEntry={(e) => {
                  setEditing(e);
                  setShowForm(true);
                }}
                onDeleteEntry={(e) => deleteEntry(e)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 수업 추가/수정 모달 */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowForm(false);
            setEditing(null);
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 pt-4">
              <h2 className="text-lg font-semibold">{editing ? "수업 수정" : "수업 추가"}</h2>
              <button
                className="rounded-lg px-2 py-1 border"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                닫기
              </button>
            </div>
            <CourseForm
              stage={form.education_stage}
              initial={editing ? { ...editing, days: [editing.day_of_week] } : undefined}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
              onSave={upsertCourse}
            />
          </div>
        </div>
      )}

      {/* 위험 구역 */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-rose-200 bg-rose-50/70 shadow-sm">
        <div className="border-b border-rose-200 px-6 py-3">
          <h3 className="text-sm font-semibold text-rose-700">위험 구역</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-rose-700">탈퇴는 복구할 수 없습니다. (관리자 승인 또는 별도 프로세스 필요)</p>
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
