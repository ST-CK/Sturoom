export type Stage = 'elementary' | 'middle' | 'high' | 'university';

export type Timetable = {
  id: string;
  user_id: string;
  name: string;
  stage: Stage;
  academic_year: number | null;
  term: string | null;
  start_date: string | null;
  end_date: string | null;
  is_default: boolean;
  created_at: string;
};

export type TimetableEntry = {
  id: string;
  timetable_id: string;
  title: string;
  location: string | null;
  instructor: string | null;
  color: string | null; // tailwind 키("violet") 또는 HEX("#c4b5fd")
  day_of_week: number;  // 1=Mon .. 7=Sun
  start_time: string;   // 'HH:MM:SS'
  end_time: string;     // 'HH:MM:SS'
  period_from: number | null;
  period_to: number | null;
  memo: string | null;
  created_at: string;
};

export const DAYS = ['월', '화', '수', '목', '금', '토', '일']; // 1..7

// K-12 교시 → 시간 자동 매핑
export const periodTimeMap: Record<Stage, (from: number, to: number) => { start: string; end: string } | null> = {
  elementary: (from, to) => mapByGrid(9 * 60, 40, 10, from, to),       // 09:00 시작, 40분 수업 + 10분 쉬는 시간
  middle:     (from, to) => mapByGrid(8 * 60 + 40, 50, 10, from, to),  // 08:40 시작, 50/10
  high:       (from, to) => mapByGrid(8 * 60 + 40, 50, 10, from, to),
  university: () => null,                                              // 대학은 직접 시간 설정
};

function mapByGrid(dayStartMin: number, lessonMin: number, breakMin: number, from: number, to: number) {
  if (from > to) [from, to] = [to, from];
  const start = dayStartMin + (from - 1) * (lessonMin + breakMin);
  const end   = dayStartMin + to * (lessonMin + breakMin) - breakMin; // 마지막 교시는 쉬는시간 제외
  return { start: toHHMM(start), end: toHHMM(end) };
}

export function toHHMM(m: number) {
  const h = Math.floor(m / 60).toString().padStart(2, '0');
  const mm = (m % 60).toString().padStart(2, '0');
  return `${h}:${mm}`;
}

// 색상 유틸 (Tailwind 키 또는 HEX → 인라인 색상)
export function resolveColor(color?: string | null) {
  if (!color) return { bg: '#93c5fd', text: '#111827' }; // default sky-300
  if (color.startsWith('#')) return { bg: color, text: '#111827' };
  const map: Record<string, string> = {
    red: '#fca5a5', orange: '#fdba74', amber: '#fcd34d', yellow: '#fde68a',
    lime: '#bef264', green: '#86efac', emerald: '#6ee7b7', teal: '#5eead4',
    cyan: '#67e8f9', sky: '#7dd3fc', blue: '#93c5fd', indigo: '#a5b4fc',
    violet: '#c4b5fd', purple: '#d8b4fe', fuchsia: '#f0abfc', pink: '#f9a8d4', rose: '#fda4af'
  };
  return { bg: map[color] ?? '#a5b4fc', text: '#111827' };
}
