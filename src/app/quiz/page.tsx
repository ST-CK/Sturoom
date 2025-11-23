import HideFooterOnMount from "@/components/layout/HideFooterOnMount";
import QuizChat from "@/components/quiz/QuizChat";

export default function QuizPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="h-[calc(100vh-64px)] overflow-hidden max-sm:h-[calc(100vh-56px)] max-sm:overflow-y-auto">
        <HideFooterOnMount />
        <QuizChat />
      </div>
    </div>
  );
}