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
      <Container className="py-8 sm:py-10 md:py-14 max-w-4xl px-4 sm:px-6">
        {/* 코스 ID */}
        <p className="mb-2 text-[11px] sm:text-xs text-gray-500">
          코스 ID: {course.id}
        </p>

        {/* 제목 */}
        <h1 className="mb-3 text-xl sm:text-2xl md:text-3xl font-bold leading-snug">
          {course.title}
        </h1>

        {/* 난이도 */}
        <p className="mb-2 text-sm sm:text-base text-indigo-600 font-medium">
          난이도: {levelLabel}
        </p>

        {/* 설명 */}
        <p className="mb-6 text-sm sm:text-base text-gray-700 leading-relaxed">
          {course.description}
        </p>

        {/* 액션 버튼 */}
        <div className="mb-10 flex flex-wrap gap-2 sm:gap-3">
          {course.quizPath && (
            <a
              href={course.quizPath}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm sm:text-base font-semibold text-white hover:bg-indigo-700 w-full sm:w-auto text-center"
            >
              퀴즈 풀기
            </a>
          )}
          {course.reportPath && (
            <a
              href={course.reportPath}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm sm:text-base font-semibold text-gray-900 hover:bg-gray-50 w-full sm:w-auto text-center"
            >
              리포트 작성하기
            </a>
          )}
          {course.boardPath && (
            <a
              href={course.boardPath}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm sm:text-base font-semibold text-gray-900 hover:bg-gray-50 w-full sm:w-auto text-center"
            >
              질문 올리기 (보드)
            </a>
          )}
        </div>

        {/* 섹션 구성 */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold">코스 구성</h2>

          <div className="rounded-2xl border bg-white p-4 space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-medium">
                1. 오리엔테이션
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                영상 · 5분
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-medium">
                2. 기본 개념 정리
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                노트 · 10분
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-medium">
                3. 실습 과제
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                실습 · 20분
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
