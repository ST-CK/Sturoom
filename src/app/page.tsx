export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-200 via-red-300 to-yellow-200 flex flex-col items-center justify-center text-center p-10">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">Tailwind ✅ 적용 성공!</h1>
      <p className="text-xl text-gray-600">이제 본격적으로 개발 시작해보자 ✨</p>
      <button className="mt-6 px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition">
        확인용 버튼
      </button>
    </main>
  );
}
