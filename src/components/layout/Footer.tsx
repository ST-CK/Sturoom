import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-white">
      <Container className="py-8 text-sm text-gray-600">
        <div>© {new Date().getFullYear()} Sturoom · 학습은 역시 Sturoom.</div>
        <div>한림대학교 소프트웨어학부 캡스톤 디자인</div>
      </Container>
    </footer>
  );
}