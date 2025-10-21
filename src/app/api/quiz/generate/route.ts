import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { content, mode } = await req.json();

  const prompt = `
  아래는 수업 자료입니다.
  ===
  ${content}
  ===

  위 내용을 바탕으로 ${mode === "ox" ? "OX 문제" : mode === "short" ? "단답형 문제" : "객관식 5지선다형 문제"} 한 문제를 만들어줘.
  문제와 선택지(있다면)만 JSON 형태로 응답해.
  예시:
  { "question": "...", "options": ["...","..."], "answer": "..." }
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0].message?.content;
  const json = JSON.parse(text ?? "{}");
  return NextResponse.json(json);
}
