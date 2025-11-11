import HideFooterOnMount from "@/components/layout/HideFooterOnMount";
import QuizChat from "@/components/quiz/QuizChat";

export default function QuizPage() {
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden">
      <HideFooterOnMount />
      <QuizChat />
    </div>
  );
}
