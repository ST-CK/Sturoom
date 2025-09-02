import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-white">
      <Container className="py-8 text-sm text-gray-600">
        © {new Date().getFullYear()} Sturoom · 학습은 역시 Sturoom.
      </Container>
    </footer>
  );
}
