export type Room = {
  id: string;                // 과목번호
  title: string;             // 과목명
  instructor: string;        // 교수명
  track?: string;            // 교과(오프라인) 등
  thumbnail?: string | null; // 목록 썸네일 (없으면 null => 그라데이션)
  isNew?: boolean;           // NEW 뱃지 표시용(선택)
};

export const rooms: Room[] = [
  // 1
  {
    id: "701028-01",
    title: "AI를 활용한 통계학 기초",
    instructor: "한준희",
    track: "교과(오프라인)",
    thumbnail: null, // 예: "/images/courses/701028-01.jpg"
  },
  // 2
  {
    id: "904500-04",
    title: "[삶의질문]삶의큰질문:인생",
    instructor: "이수현",
    track: "교과(오프라인)",
    thumbnail: null,
  },
  // 3
  {
    id: "603137-01",
    title: "웹프레임워크활용",
    instructor: "김은주",
    track: "교과(오프라인)",
    thumbnail: null,
  },
  // 4
  {
    id: "603103-01",
    title: "소프트웨어캡스톤디자인",
    instructor: "박승용",
    track: "교과(오프라인)",
    thumbnail: null,
  },
  // 5
  {
    id: "603136-01",
    title: "SW창업전략과펀딩",
    instructor: "박지현",
    track: "교과(오프라인)",
    thumbnail: null,
  },
  // 6 (NEW)
  {
    id: "603105-01",
    title: "소프트웨어특강II",
    instructor: "박승용",
    track: "교과(오프라인)",
    thumbnail: null,
    isNew: true,
  },
];

export type Attachment = { id: string; name: string; size?: string; url?: string };
export type Post = {
  id: string;
  roomId: string;
  week: number;
  title: string;
  status?: "진행중" | "마감" | "공지";
  dueAt?: string;
  summary?: string;
  thumbnail?: string | null;
  tags?: string[];
  attachments?: Attachment[];
  body?: string;
  images?: string[];
};

export function listWeeks(roomId: string) {
  return [3, 2, 1];
}

export function listPosts(roomId: string): Post[] {
  return [
    {
      id: "p1",
      roomId, week: 3,
      title: "피커 뷰 사용해 원하는 항목 선택하기",
      status: "진행중",
      dueAt: "2025-12-14 24:00:00",
      summary: "강의 수강",
      thumbnail: null,
      tags: ["노트(수강 완료)"],
      attachments: [{ id: "a1", name: "3주차_설명(1).pdf", size: "4.8MB" }],
      body: "이번 주는 피커 뷰의 기본 사용법과 데이터 바인딩을 다룹니다.",
      images: [],
    },
    {
      id: "p2",
      roomId, week: 3,
      title: "멀티 컴포넌트 피커 뷰 만들기",
      status: "진행중",
      dueAt: "2025-09-23 13:00:00",
      summary: "과제 제출",
      thumbnail: null,
      tags: ["과제(진행 중)"],
      attachments: [{ id: "a2", name: "샘플코드.zip", size: "18.7MB" }],
      body: "두 개 이상의 컴포넌트를 가진 피커 뷰를 구현합니다.",
      images: [],
    },
    {
      id: "p3",
      roomId, week: 2,
      title: "화면에 원하는 이미지 출력하기 - 이미지 뷰",
      status: "진행중",
      dueAt: "2025-12-14 24:00:00",
      summary: "강의 수강",
      thumbnail: null,
      tags: ["노트(수강 완료)"],
      attachments: [],
      body: "UIImageView의 콘텐츠 모드와 캐싱 전략을 실습합니다.",
      images: [],
    },
  ];
}
