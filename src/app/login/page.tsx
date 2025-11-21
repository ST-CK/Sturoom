import Container from "@/components/layout/Container";
import Login from "@/components/login/Login";

export default function LoginPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <Container className="px-4 sm:px-6">
        {/* 화면 중앙 정렬 + 모바일/데스크탑 균형 */}
        <div className="min-h-[70vh] py-14 sm:py-20 flex items-center justify-center">
          <div className="w-full max-w-sm sm:max-w-md mx-auto">
            {/* 모바일에선 꽉 차게, 데스크탑에선 너무 넓지 않게 */}
            <Login />
          </div>
        </div>
      </Container>
    </main>
  );
}