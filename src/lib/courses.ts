// lib/courses.ts

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type Course = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  level: CourseLevel;
  quizPath?: string;
  reportPath?: string;
  boardPath?: string;
};

export const COURSES: Course[] = [
  {
    id: "python-basic",
    title: "파이썬 기초",
    tagline: "파이썬 문법부터 차근차근.",
    description: "변수, 조건문, 반복문, 함수까지 실습 중심으로 배우는 기초 코스입니다.",
    level: "beginner",
    quizPath: "/quiz/python-basic",
    reportPath: "/report?courseId=python-basic",
    boardPath: "/board?courseId=python-basic",
  },
  {
    id: "web-basic",
    title: "웹 기초 & 리포트",
    tagline: "HTML/CSS와 리포트 작성까지 한 번에.",
    description: "기본적인 웹 구조를 이해하고, 결과를 리포트로 정리하는 과정을 연습합니다.",
    level: "beginner",
    quizPath: "/quiz/web-basic",
    reportPath: "/report?courseId=web-basic",
    boardPath: "/board?courseId=web-basic",
  },
  // ... 필요에 따라 코스 더 추가
];