import Container from "../layout/Container";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-indigo-50">
      <Container className="grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-3 inline-block rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-medium text-indigo-700">
            새 학기 맞이 • 베타 오픈
          </p>
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
            AI와 함께하는
          </h1>
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
            <span className="text-indigo-600">빠르고 정확한 학습</span>
          </h1>
          <p className="mb-6 text-gray-600">
            짧은 강의, 바로 실습, 팀 협업까지 한 곳에서.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#cta"
              className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              지금 시작하기
            </a>
            <a
              href="#features"
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-50"
            >
              기능 보기
            </a>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="rounded-xl border bg-gray-50 p-4">
            <div className="mb-3 h-40 rounded-lg bg-gradient-to-tr from-sky-400 to-indigo-500" />
            <div className="mb-1 h-3 w-2/3 rounded bg-gray-200" />
            <div className="mb-1 h-3 w-1/2 rounded bg-gray-200" />
            <div className="h-3 w-1/3 rounded bg-gray-200" />
          </div>
        </div>
      </Container>
    </section>
  );
}
