import Container from "../layout/Container";
import { COURSES } from "@/lib/courses";

export default function Courses() {
  const courses = COURSES; // 로컬 Mock 데이터 사용
  return (
    <section id="courses">
      <Container className="pb-8 md:pb-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">추천 코스</h2>
          <a className="text-sm font-medium text-indigo-700 hover:underline" href="#">
            모두 보기
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {courses.map((c) => (
            <article key={c.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-3 h-28 rounded-xl bg-gradient-to-tr from-violet-400 to-indigo-500" />
              <h3 className="mb-1 font-semibold">{c.title}</h3>
              <p className="text-sm text-gray-600">{c.tagline}</p>
              <button className="mt-4 w-full rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-semibold hover:bg-gray-50">
                미리보기
              </button>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
