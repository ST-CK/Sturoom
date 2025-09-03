import Container from "@/components/layout/Container";
import ClientLogin from "./_ClientLogin";

export default function LoginPage() {
  // 화면 상‧하 여백을 동일하게: 모바일(py-14) / 데스크톱(py-20)
  return (
    <section className="py-14 md:py-20">
      <Container>
        <ClientLogin />
      </Container>
    </section>
  );
}
