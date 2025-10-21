import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    quizId: "mock-001",
    questions: [
      {
        question: "다음 중 회귀분석의 가정이 아닌 것은?",
        options: ["정규성", "등분산성", "비선형성", "독립성"],
        answer: "비선형성",
      },
    ],
  });
}
