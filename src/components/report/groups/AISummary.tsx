"use client";

import Card from "../parts/Card";

export default function AISummary({ ai }: { ai: any }) {
  if (!ai) {
    return (
      <Card title="📚 AI 학습 리포트">
        <p className="text-sm text-neutral-500">
          AI 리포트를 생성 중입니다...
        </p>
      </Card>
    );
  }

  return (
    <Card title="📚 AI 학습 리포트">
      <div className="space-y-4 text-sm">
        <div>
          <h3 className="font-semibold text-neutral-800">✨ 개요</h3>
          <p className="text-neutral-600">{ai.overview}</p>
        </div>

        <div>
          <h3 className="font-semibold text-neutral-800">💡 강점</h3>
          <ul className="list-disc ml-5 text-neutral-600">
            {ai.strengths?.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-neutral-800">🛠 개선할 점</h3>
          <ul className="list-disc ml-5 text-neutral-600">
            {ai.weaknesses?.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-neutral-800">🚀 추천 학습 방향</h3>
          <p className="text-neutral-600">{ai.recommendation}</p>
        </div>

        <div className="pt-3 border-t text-neutral-700 text-center font-bold">
          “{ai.title}”
        </div>
      </div>
    </Card>
  );
}
