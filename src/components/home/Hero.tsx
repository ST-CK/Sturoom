import Container from "../layout/Container";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-indigo-50">
      <Container className="grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        
        {/* LEFT TEXT */}
        <div>
          <p className="mb-3 inline-block rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-medium text-indigo-700">
            나만의 AI 학습 파트너
          </p>

          {/* 제목 – 모바일에서도 한 줄 유지 */}
          <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl text-center">
          조금 더<br />똑똑하게 공부하고 싶다면,
          </h1>

          <p className="mb-6 text-gray-600 text-base sm:text-lg leading-relaxed">
            AI가 강의자료를 분석해
            <br />
            퀴즈와 학습 리포트를 자동 생성해요.
          </p>

          {/* 버튼 – 모바일: 한 줄 꽉 채움 / PC: 기존처럼 옆으로 */}
          <div className="flex flex-row gap-3 w-full">
  <a
    href="/quiz"
    className="flex-1 text-center rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700"
  >
    AI 퀴즈 시작하기
  </a>
  <a
    href="/report"
    className="flex-1 text-center rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-50"
  >
    학습 리포트 보기
  </a>
</div>

        </div>

        {/* RIGHT SIDE: AI QUIZ PREVIEW BOX */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="rounded-xl border bg-gray-50 p-4">

            <div className="mb-3 h-40 rounded-lg bg-gradient-to-tr from-sky-400 to-indigo-500 
                            flex items-center justify-center text-white font-semibold text-lg">
              영상예정
            </div>

            <div className="mb-1 h-3 w-2/3 rounded bg-gray-200" />
            <div className="mb-1 h-3 w-1/2 rounded bg-gray-200" />
            <div className="h-3 w-1/3 rounded bg-gray-200" />
          </div>
        </div>

      </Container>
    </section>
  );
}