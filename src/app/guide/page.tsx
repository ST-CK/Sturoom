"use client";

import { useState } from "react";
import Container from "@/components/layout/Container";

type GuideId =
  | "chatbot"
  | "classroom"
  | "support"
  | "group"
  | "progress"
  | "layout"
  | "feedback";

const SECTIONS: {
  groupTitle: string;
  items: { id: GuideId; label: string }[]; // ✅ items를 배열 타입으로 수정
}[] = [
  {
    groupTitle: "사용법 관리",
    items: [
      { id: "chatbot", label: "챗봇 튜터" },
      { id: "classroom", label: "수업자료·강의실" },
      { id: "support", label: "학습 지원 (퀴즈/리포트)" },
      { id: "group", label: "그룹 활동·보드" },
      { id: "progress", label: "학습자 진척 확인" },
      { id: "layout", label: "학습자 화면 예시" },
    ],
  },
  {
    groupTitle: "개선사항",
    items: [{ id: "feedback", label: "개선사항 제안" }],
  },
];

const GUIDE_CONTENT: Record<
  GuideId,
  {
    title: string;
    subtitle: string;
    description: string;
    bullets: string[];
  }
> = {
  chatbot: {
    title: "챗봇 튜터",
    subtitle: "학생이 언제든 질문할 수 있는 AI 도우미",
    description:
      "챗봇 튜터는 과제, 시험 준비, 개념 이해를 도와주는 실시간 도우미입니다. 교수자가 코스/강의실과 연동해 설정한 범위 안에서만 답변하도록 구성할 수 있습니다.",
    bullets: [
      "메인 화면 우측 하단 챗아이콘을 클릭하면 즉시 사용 가능",
      "수업 자료, 코스 내용, 공지사항을 토대로 답변",
      "학생 질문 로그를 통해 자주 묻는 질문 파악 가능",
    ],
  },
  classroom: {
    title: "수업자료 · 강의실",
    subtitle: "주차별 자료와 과제가 모여 있는 공간",
    description:
      "강의실에서는 주차별 수업 자료, 과제, 공지사항을 한 곳에서 관리합니다. 학생은 수업 전·후에 필요한 자료를 쉽게 찾아볼 수 있습니다.",
    bullets: [
      "주차별로 강의 노트, PDF, 링크, 영상을 업로드",
      "과제와 공지를 같은 흐름 안에서 안내",
      "강의실과 챗봇·퀴즈·리포트가 연결되어 학습 흐름 유지",
    ],
  },
  support: {
    title: "학습 지원 (퀴즈 / 리포트)",
    subtitle: "이해도 점검과 개념 정리를 한 번에",
    description:
      "퀴즈와 리포트 기능은 학생의 이해도를 빠르게 확인하고, 스스로 개념을 정리하도록 돕는 도구입니다.",
    bullets: [
      "퀴즈: AI가 개념 문제를 자동 생성, 정답/해설 제공",
      "리포트: 핵심 개념 요약·사례 정리용 템플릿 제공",
      "결과는 향후 수업 설계·피드백에 활용 가능",
    ],
  },
  group: {
    title: "그룹 활동 · 보드",
    subtitle: "팀 프로젝트와 토론을 위한 공간",
    description:
      "보드와 그룹 기능을 통해 학생들이 팀별로 아이디어를 공유하고 토론할 수 있습니다.",
    bullets: [
      "그룹별 보드에서 게시글·댓글로 협업",
      "프로젝트 아이디어 정리, 역할 분담, 진행 상황 공유",
      "AI를 활용해 초안 생성, 구조 제안 가능",
    ],
  },
  progress: {
    title: "학습자 진척 확인",
    subtitle: "누가 어디까지 따라오고 있는지 한 눈에",
    description:
      "퀴즈 결과, 리포트 제출 여부, 강의실 참여 내역을 종합해 학습자의 진척 상황을 확인할 수 있습니다.",
    bullets: [
      "코스별 완료/미완료 상태 표시",
      "퀴즈 정답률·오답 유형으로 난이도 조정에 활용",
      "리포트 제출 여부로 과제 참여도 확인",
    ],
  },
  layout: {
    title: "학습자 화면 예시",
    subtitle: "학생이 실제로 보게 되는 화면 구성",
    description:
      "메인 페이지, 코스 상세, 강의실, 퀴즈/리포트 화면이 하나의 흐름으로 이어지도록 설계되어 있습니다.",
    bullets: [
      "메인 → 추천 코스 선택 → 코스 상세 → 퀴즈/리포트 진입",
      "강의실에서 자료 확인 후 바로 챗봇/퀴즈로 이동",
      "모든 화면은 모바일·PC 모두 대응하는 반응형 레이아웃",
    ],
  },
  feedback: {
    title: "개선사항 제안",
    subtitle: "수업 현장에 맞게 튜터를 함께 발전시키기",
    description:
      "실제 수업에서 사용해본 뒤 불편했던 점, 추가되었으면 하는 기능을 자유롭게 남겨주세요.",
    bullets: [
      "불편했던 점, 개선되면 좋을 점 구체적으로 작성",
      "새로운 기능 아이디어도 환영합니다.",
      "추후 버전 기획 시 우선적으로 검토됩니다.",
    ],
  },
};

export default function GuidePage() {
  const [selectedId, setSelectedId] = useState<GuideId>("chatbot");
  const content = GUIDE_CONTENT[selectedId];

  return (
    <section className="bg-gray-50 min-h-screen">
      <Container className="py-8 md:py-10 px-4">
        {/* 제목 영역 */}
        <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              사용 가이드
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
              Sturoom의 주요 기능을 한 눈에 정리한 안내 페이지입니다.
            </p>
          </div>
        </header>

        {/* 레이아웃 */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* 사이드바 */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0">
            <div className="rounded-2xl border bg-white p-3 shadow-sm">
              {SECTIONS.map((group) => (
                <div key={group.groupTitle} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold">
                    {group.groupTitle}
                  </div>
                  <div className="mt-1 space-y-1">
                    {group.items.map((item) => {
                      const active = item.id === selectedId;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                            active
                              ? "bg-indigo-50 text-indigo-700 font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* 메인 컨텐츠 */}
          <main className="flex-1">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-700 mb-3">
                {content.title}
              </h2>

              <div className="rounded-2xl bg-indigo-50 px-4 py-3 mb-4">
                <p className="text-sm sm:text-base font-medium text-indigo-900">
                  {content.subtitle}
                </p>
                <p className="mt-1 text-xs sm:text-sm text-indigo-900/80">
                  {content.description}
                </p>
              </div>

              <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-sm sm:text-base text-gray-700">
                {content.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>

            {/* 이미지 / 캡처 들어갈 카드 */}
            <div className="rounded-3xl border bg-white p-4 md:p-6 shadow-sm">
              <div className="mb-3 aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 via-white to-indigo-100 flex items-center justify-center">
                <span className="text-xs sm:text-sm md:text-base text-gray-500">
                  여기에는 웹 캡처 이미지를 넣을 예정입니다.
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                ※ 실제 서비스 배포 시, 해당 기능 화면의 스크린샷을 넣어 설명과 함께 보여주면 좋습니다.
              </p>
            </div>
          </main>
        </div>
      </Container>
    </section>
  );
}