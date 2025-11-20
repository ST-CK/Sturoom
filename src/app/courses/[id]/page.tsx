// src/app/courses/[id]/page.tsx
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import { COURSES, Course } from "@/lib/courses";

type Props = {
  params: { id: string };
};

export default function CourseDetailPage({ params }: Props) {
  const { id } = params;

  const course: Course | undefined = COURSES.find((c) => c.id === id);

  if (!course) {
    notFound();
    return null;
  }

  const levelLabel =
    course.level === "beginner"
      ? "입문"
      : course.level === "intermediate"
      ? "중급"
      : "고급";

  return (
    <section className="bg-gray-50 min-h-screen">
      <Container className="py-10 md:py-14 max-w-4xl">
        <p className="mb-2 text-xs text-gray-500">코스 ID: {course.id}</p>
        <h1 className="mb-3 text-2xl md:text-3xl font-bold">{course.title}</h1>

        <p className="mb-2 text-sm text-indigo-600 font-medium">
          난이도: {levelLabel}
        </p>

        <p className="mb-6 text-sm md:text-base text-gray-700">
          {course.description}
        </p>

        {/* 액션 버튼들 */}
        <div className="mb-10 flex flex-wrap gap-3">
          {course.quizPath && (
            <a
              href={course.quizPath}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              퀴즈 풀기
            </a>
          )}
          {course.reportPath && (
            <a
              href={course.reportPath}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              리포트 작성하기
            </a>
          )}
          {course.boardPath && (
            <a
              href={course.boardPath}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              질문 올리기 (보드)
            </a>
          )}
        </div>

        {/* 예시 섹션/레슨 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">코스 구성</h2>
          <div className="rounded-2xl border bg-white p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">1. 오리엔테이션</span>
              <span className="text-xs text-gray-500">영상 · 5분</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">2. 기본 개념 정리</span>
              <span className="text-xs text-gray-500">노트 · 10분</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">3. 실습 과제</span>
              <span className="text-xs text-gray-500">실습 · 20분</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}