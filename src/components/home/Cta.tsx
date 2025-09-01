import Container from "../layout/Container";

export default function Cta() {
  return (
    <section id="cta">
      <Container className="py-16 md:py-20">
        <div className="overflow-hidden rounded-3xl border bg-gradient-to-tr from-indigo-600 to-sky-500 p-8 text-white md:p-12">
          <h2 className="mb-2 text-2xl font-bold md:text-3xl">5분 만에 첫 코스 만들기</h2>
          <p className="mb-6 text-indigo-50">템플릿으로 빠르게 시작하세요.</p>
          <div className="flex flex-wrap gap-3">
            <a href="#" className="rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700">대시보드 열기</a>
            <a href="#" className="rounded-xl border border-white/60 px-5 py-3 font-semibold text-white hover:bg-white/10">문서 보기</a>
          </div>
        </div>
      </Container>
    </section>
  );
}
