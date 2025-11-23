// src/app/dashboard/page.tsx
import Container from "@/components/layout/Container";
import { COURSES } from "@/lib/courses";

export default function DashboardPage() {
  return (
    <section className="bg-gray-50 min-h-[100svh]">
      <Container className="py-8 sm:py-10 md:py-14 px-4 sm:px-6">
        <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold">
          내 학습 대시보드
        </h1>

        <p className="mb-8 text-sm sm:text-base text-gray-600 leading-relaxed">
          진행 중인 코스와 퀴즈, 리포트, 보드를 한 곳에서 관리합니다.
        </p>

        <h2 className="mb-4 text-base sm:text-lg font-semibold">
          추천/진행 중인 코스
        </h2>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
          {COURSES.map((c) => (
            <article
              key={c.id}
              className="rounded-2xl border bg-white p-4 sm:p-5 shadow-sm"
            >
              <h3 className="mb-1 text-sm sm:text-base font-semibold">
                {c.title}
              </h3>
              <p className="mb-3 text-xs sm:text-sm text-gray-600">
                {c.tagline}
              </p>
              <a
                href={`/courses/${c.id}`}
                className="inline-flex text-xs sm:text-sm font-semibold text-indigo-700 hover:underline"
              >
                코스 보기
              </a>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}