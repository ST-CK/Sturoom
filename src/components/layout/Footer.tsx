import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-white">
      <Container className="py-6 md:py-8 text-[10px] md:text-sm text-gray-600">

        {/* 상단 메뉴 - 모바일 ultra compact */}
        <div className="flex flex-row gap-2 md:gap-8 mb-6 md:mb-8 justify-between whitespace-nowrap">

          <div>
            <h4 className="font-bold mb-2 md:mb-3 text-[11px] md:text-base whitespace-nowrap">
              Sturoom
            </h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">Sturoom 소개</a></li>
              <li><a href="#" className="hover:underline">Sturoom 피드</a></li>
              <li><a href="#" className="hover:underline">수강평 모아보기</a></li>
              <li><a href="#" className="hover:underline">블로그</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-2 md:mb-3 text-[11px] md:text-base whitespace-nowrap">
              신청하기
            </h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">지식공유참여</a></li>
              <li><a href="#" className="hover:underline">멘토링 소개</a></li>
              <li><a href="#" className="hover:underline">Sturoom 비즈니스</a></li>
              <li><a href="#" className="hover:underline">Sturoom 제휴</a></li>
              <li><a href="#" className="hover:underline">Sturoom 마케팅 파트너스</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-2 md:mb-3 text-[11px] md:text-base whitespace-nowrap">
              코드 등록
            </h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">수강코드 등록</a></li>
              <li><a href="#" className="hover:underline">포인트코드 등록</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-2 md:mb-3 text-[11px] md:text-base whitespace-nowrap">
              고객센터
            </h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">공지사항</a></li>
              <li><a href="#" className="hover:underline">자주묻는 질문</a></li>
              <li><a href="#" className="hover:underline">저작권 신고센터</a></li>
              <li><a href="#" className="hover:underline">강의·기능요청</a></li>
            </ul>
          </div>

        </div>

        {/* 하단 회사 정보 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-t pt-3 md:pt-4">

          <div className="whitespace-nowrap">
            <div className="font-bold text-[#0673ca] mb-1 text-[10px] md:text-sm">
              <a href="#" className="hover:underline">Sturoom</a> |{" "}
              <a href="#" className="hover:underline">개인정보처리방침</a> |{" "}
              <a href="#" className="hover:underline">이용약관</a>
            </div>

            <div className="text-[9px] md:text-sm leading-relaxed whitespace-nowrap">
              ƧTΛCK³ | 김은채, 김찬영, 최지은 | 2025년도 2학기 소프트웨어 캡스톤 디자인 <br />
              ©Sturoom. ALL RIGHTS RESERVED
            </div>
          </div>

        </div>

      </Container>
    </footer>
  );
}