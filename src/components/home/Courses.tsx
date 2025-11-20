import Container from "../layout/Container";
import {
  FileText,
  Brain,
  PenLine,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

// 단계별 카드 색상 (그라데이션)
const gradients = [
  "from-indigo-500 to-sky-400",
  "from-purple-500 to-indigo-500",
  "from-sky-400 to-cyan-400",
  "from-teal-500 to-emerald-400",
  "from-fuchsia-500 to-purple-500",
];

const flow = [
  {
    title: "1. 강의실 자료 분석",
    desc: "업로드 된 강의자료(PDF, PPT 등)를 AI가 내용을 분석해요.",
    icon: FileText,
  },
  {
    title: "2. AI가 문제 생성",
    desc: "자료 기반으로 다양한 문제를 자동으로 생성해요.",
    icon: Brain,
  },
  {
    title: "3. 문제 풀이",
    desc: "학생은 AI가 생성한 문제를 풀면서 학습을 진행해요.",
    icon: PenLine,
  },
  {
    title: "4. 오답 피드백",
    desc: "AI가 답안을 검토해 정답 여부와 해설을 제공해요.",
    icon: CheckCircle2,
  },
  {
    title: "5. 학습 리포트 생성",
    desc: "풀이 기록을 기반으로 나만의 학습 리포트를 자동 생성해요.",
    icon: BarChart3,
  },
];

export default function Courses() {
  return (
    <section id="flow">
      <Container className="pb-12 pt-6 md:pb-16">
        <h2 className="mb-10 text-2xl font-bold md:text-3xl">
          Sturoom은 이렇게 동작해요
        </h2>

        <div className="grid gap-6 md:grid-cols-5">
          {flow.map((step, index) => {
            const Icon = step.icon;
            const gradient = gradients[index];
            return (
              <div
                key={step.title}
                className={`
                  flex flex-col rounded-2xl p-6 shadow-sm transition hover:shadow-md text-white 
                  bg-gradient-to-br ${gradient}
                `}
              >
                <div className="mb-4 rounded-xl bg-white/20 p-3 inline-flex items-center justify-center">
                  <Icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed opacity-90">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}