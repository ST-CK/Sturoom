import Container from "../layout/Container";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  BarChart3,
  Trophy,
  MessageSquareText,
  HelpCircle,
  Home
} from "lucide-react";

const features = [
  {
    title: "강의자료실",
    href: "/library",
    icon: BookOpen,
    desc: "업로드된 강의자료를 확인하고 관리하세요."
  },
  {
    title: "AI 퀴즈",
    href: "/quiz",
    icon: Brain,
    desc: "강의자료 기반 자동 퀴즈 생성 및 풀이."
  },
  {
    title: "AI 리포트",
    href: "/report",
    icon: BarChart3,
    desc: "학습 기록을 분석해 맞춤형 리포트 제공."
  },
  {
    title: "나의 랭킹",
    href: "/lank",
    icon: Trophy,
    desc: "학습 점수 기반 개인 및 전체 랭킹 확인."
  },
  {
    title: "게시판",
    href: "/board",
    icon: MessageSquareText,
    desc: "팀원/학생들과 소통하고 의견 나누기."
  },
  {
    title: "사용 팁",
    href: "/guide",
    icon: HelpCircle,
    desc: "Sturoom을 더 효과적으로 사용하는 방법."
  }
];

export default function MainFeatures() {
  return (
    <section id="main-features">
      <Container className="py-12 sm:py-14 md:py-20">
        <h2 className="mb-8 sm:mb-10 text-xl sm:text-2xl md:text-3xl font-bold text-center md:text-left">
          주요 기능 바로가기
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md hover:bg-gray-50"
              >
                <Icon className="mb-4 h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
                <h3 className="mb-1 font-semibold text-sm sm:text-base">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {item.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}