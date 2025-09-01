export type Course = {
  id: string;
  title: string;
  tagline: string;
};

export const COURSES: Course[] = [
  { id: "1", title: "웹 풀스택 시작하기", tagline: "Next.js · Supabase" },
  { id: "2", title: "자료구조 & 알고리즘", tagline: "JS/TS · 실습 위주" },
  { id: "3", title: "사회복지 프로그램 기획", tagline: "현장 문서 · 평가" },
];
