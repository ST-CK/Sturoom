import Container from "@/components/layout/Container";
import Signup from "@/components/auth/Signup";

export default function SignupPage() {
  return (
    <main className="bg-gray-50">
      <Container>
        {/* 헤더/푸터 사이 동일 간격 확보 + 중앙 정렬 */}
        <div className="min-h-[70vh] py-16 flex items-center justify-center">
          <Signup />
        </div>
      </Container>
    </main>
  );
}