import Container from "../layout/Container";

const items = [
  { title: "코스 · 모듈", desc: "짧은 레슨과 체크리스트로 학습 흐름을 설계." },
  { title: "실습 과제", desc: "코드/보고서 과제를 바로 제출하고 피드백." },
  { title: "팀 협업", desc: "코멘트·보드로 프로젝트 진행 관리." },
];

export default function Features() {
  return (
    <section id="features">
      <Container className="py-16 md:py-20">
        <h2 className="mb-10 text-2xl font-bold md:text-3xl">핵심 기능</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 h-10 w-10 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400" />
              <h3 className="mb-1 font-semibold">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
