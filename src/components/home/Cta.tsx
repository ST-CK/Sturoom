import Container from "../layout/Container";
import { Bot } from "lucide-react";

export default function Cta() {
  return (
    <section id="cta">
      <Container className="py-12 md:py-16">
        <div className="rounded-3xl bg-gradient-to-tr from-indigo-600 to-sky-500 px-6 py-8 md:px-8 md:py-10 text-white shadow-lg text-center">
          {/* Smaller Icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Bot className="h-8 w-8 text-white" />
          </div>

          {/* Shorter Text */}
          <h2 className="mb-2 text-2xl font-bold">
            AI가 학습을 도와드려요
          </h2>

          <p className="mb-6 text-indigo-100 text-sm md:text-base">
            문제 풀이부터 리포트까지 한번에 진행해보세요.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/quiz"
              className="w-full sm:w-auto rounded-xl bg-white px-5 py-2.5 text-center text-sm sm:text-base font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50"
            >
              AI 퀴즈 풀기
            </a>
            <a
              href="/report"
              className="w-full sm:w-auto rounded-xl border border-white/70 px-5 py-2.5 text-center text-sm sm:text-base font-semibold text-white hover:bg-white/10"
            >
              학습 리포트 보기
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}