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
              <li>Sturoom 소개</li>
              <li>Sturoom 피드</li>
              <li>수강평 모아보기</li>
              <li>블로그</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">신청하기</h4>
            <ul>
              <li>지식공유참여</li>
              <li>멘토링 소개</li>
              <li>Sturoom 비즈니스</li>
              <li>Sturoom 제휴</li>
              <li>Sturoom 마케팅 파트너스</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">코드 등록</h4>
            <ul>
              <li>수강코드 등록</li>
              <li>포인트코드 등록</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">고객센터</h4>
            <ul>
              <li>공지사항</li>
              <li>자주묻는 질문</li>
              <li>저작권 신고센터</li>
              <li>강의·기능요청</li>
            </ul>
          </div>
        </div>
        {/* 하단 회사 정보 & 소셜 아이콘 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-4">
          <div>
            <div className="font-bold text-[#0673ca] mb-1">Sturoom | 개인정보처리방침 | 이용약관 </div>
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