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

          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
            조금 더<br/>똑똑하게 공부하고 싶다면,
          </h1>

          <p className="mb-6 text-gray-600 text-lg leading-relaxed">
            AI가 강의자료를 분석해
            <br />
            퀴즈와 학습 리포트를 자동 생성해요.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="/quiz"
              className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              AI 퀴즈 시작하기
            </a>
            <a
              href="/report"
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-50"
            >
              학습 리포트 보기
            </a>
          </div>
        </div>

        {/* RIGHT SIDE: AI QUIZ PREVIEW BOX */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="rounded-xl border bg-gray-50 p-4">

            {/* Visual Preview */}
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