import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-white">
      <Container className="py-8 text-sm text-gray-600">
        {/* 모든 메뉴 섹션을 하나의 flex-row 내부에 배치 ▶ 가로 메뉴 */}
        <div className="flex flex-row gap-8 mb-8 justify-between">
          <div>
            <h4 className="font-bold mb-3">Sturoom</h4>
            <ul>
              <li><a href="Sturoom 소개" className="hover:underline">Sturoom 소개</a></li>
              <li><a href="Sturoom 피드" className="hover:underline">Sturoom 피드</a></li>
              <li><a href="수강평 모아보기" className="hover:underline">수강평 모아보기</a></li>
              <li><a href="블로그" className="hover:underline">블로그</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">신청하기</h4>
            <ul>
              <li><a href="지식공유참여" className="hover:underline">지식공유참여</a></li>
              <li><a href="멘토링 소개" className="hover:underline">멘토링 소개</a></li>
              <li><a href="Sturoom 비즈니스" className="hover:underline">Sturoom 비즈니스</a></li>
              <li><a href="Sturoom 제휴" className="hover:underline">Sturoom 제휴</a></li>
              <li><a href="Sturoom 마케팅 파트너스" className="hover:underline">Sturoom 마케팅 파트너스</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">코드 등록</h4>
            <ul>
              <li><a href="수강코드 등록" className="hover:underline">수강코드 등록</a></li>
              <li><a href="포인트코드 등록" className="hover:underline">포인트코드 등록</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">고객센터</h4>
            <ul>
              <li><a href="공지사항" className="hover:underline">공지사항</a></li>
              <li><a href="자주묻는 질문" className="hover:underline">자주묻는 질문</a></li>
              <li><a href="저작권 신고센터" className="hover:underline">저작권 신고센터</a></li>
              <li><a href="강의·기능요청" className="hover:underline">강의·기능요청</a></li>
            </ul>
          </div>
        </div>
        {/* 하단 회사 정보 & 소셜 아이콘 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-4">
          <div>
            <div className="font-bold text-[#0673ca] mb-1">
              <a href="Sturoom" className="hover:underline">Sturoom</a> |{" "}
              <a href="개인정보처리방침" className="hover:underline">개인정보처리방침</a> |{" "}
              <a href="이용약관" className="hover:underline">이용약관</a>
            </div>
            <div>
              ƧTΛCK³ | 김은채, 김찬영, 최지은 | 2025년도 2학기 소프트웨어 캡스톤 디자인 <br />
              ©Sturoom. ALL RIGHTS RESERVED
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}