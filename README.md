# 📘 STUROOM

> **MCP 프로토콜 기반 지능형 학습 에이전트**  
> 참여 유도를 위한 멀티채널 에이전트 설계 프로젝트

**기간**: 2025년 8월 4일 ~ 8월 22일  
**과정**: 한림대학교 SW중심대학 Pre-Capstone Design

---


## ✨ 프로젝트 개요

**Sturoom**은 단순 Q&A 커뮤니티를 넘어서,  
AI가 학습 전반을 자동화하고 학생이 능동적으로 참여하도록 유도하는  
**지능형 학습지원 플랫폼**입니다.

- 질문 추천 및 신뢰도 필터
- 자동 퀴즈/설문/과제 생성
- 감정 기반 피드백 및 리포트
- AI 기반 캘린더, 푸시 알림, 참여 시각화
- 참여 저조 시 맞춤형 AI DM 전송

> GPT 기반의 에이전트들과 상호작용하며, **학생과 AI가 공존·협업하는 새로운 학습 환경**을 목표로 합니다.

---

## 🧑‍💻 팀 소개

**팀명**: ƧTΛCK³ (Stack Cubed)  
**구성**: 3인의 풀스택 웹 개발자

| [<img src="https://avatars.githubusercontent.com/Chae0227" width="100px;" alt="Chae0227"/>](https://github.com/Chae0227) | [<img src="https://avatars.githubusercontent.com/chanyoung1256" width="100px;" alt="chanyoung1256"/>](https://github.com/chanyoung1256) | [<img src="https://avatars.githubusercontent.com/wldms-04" width="100px;" alt="wldms-04"/>](https://github.com/wldms-04) |
| :------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: |
| <a href="https://github.com/Chae0227"><strong>김은채 (팀장)</strong></a><br>콘텐츠IT | <a href="https://github.com/chanyoung1256"><strong>김찬영</strong></a><br>빅데이터 | <a href="https://github.com/wldms-04"><strong>최지은</strong></a><br>빅데이터 |


---

## 🛠 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js (v15) + Tailwind CSS |
| 백엔드 | Node.js + Supabase + Firebase |
| AI 기능 | OpenAI GPT API |
| 협업 | Git + GitHub (브랜치 전략 + 커밋 컨벤션 적용) |

---

## 📌 주요 기능 요약

### 🧠 AI 튜터 + Q&A 고도화
- 질문 추천, 유사 Q&A 연계, 뱃지 기반 신뢰도 정렬

### 📝 자동 퀴즈/과제/설문 생성
- PDF 업로드 → 5문항 생성 + 정답률 분석 + 오답 피드백

### 🎭 감정 피드백 & 리포트
- 이모지 기반 감정 입력, 활동 분석, 자동 리포트 생성

### 📅 AI 일정 캘린더 & 알림
- 과제 자동 등록, 주차별 마일스톤, 실시간 알림

### 💬 참여 유도 시스템
- 저조 참여자 대상 AI DM 발송, 미답변/인기순 정렬

---

## 👥 Cooperation
###  💭 Message Format
 | Message Type      | Description          | Example               |
|:----------------:|:--------------------:|:---------------------:|
| Issue          | 이슈 작성시,이슈 메시지에 <수정사항> 작성후, 수정사항에 대해 간단히 작성 | `<수정사항> README.md 수정` |
| Commit        | 이슈번호 + [키워드] + 수정사항| `#1 [Docs] README.md 수정`   |
| PullRequest  | 이슈번호 + [키워드] + 수정사항   | `#1 [Docs] README.md 수정`|

### 🔑 Keyword Type
|태그 이름|태그 설명|
|:---:|:---:|
|✨ Feat|새로운 기능 추가|
|🐛 Fix|버그 수정|
|🚑 HOTFIX|치명적 버그 수정|
|📁 Build|빌드 관련 파일 수정|
|🎨 Design|CSS를 포함 UI 디자인 변경|
|📄 Docs|문서(문서 추가, 수정, 삭제)|
|📝 Test|테스트(테스트 코드 추가, 수정, 삭제: 비즈니스 로직에 변경 없는 경우)|
|♻️ Rename|파일, 폴더명 이름 수정|
|🔥 Remove|파일, 폴더 삭제|

### 🎋 Branch Convention
#### Branch Structure 
- **main**: 배포용 브랜치 (항상 안정적인 상태 유지)
- **develop**: 통합 개발 브랜치 (다음 배포를 준비)
- **feature/**: 기능 개발 및 이슈 해결 브랜치 (작업 단위)
#### Branch Flow
 ```
Main Branch
  ▲
  └── Develop Branch ── 테스트 완료 후 병합 
                              ▲
                              └── Feature Branch ── 작업 완료 후 병합 
                                          └── 새로운 기능 추가

 ```
#### RuleSet
1. Reviewer가(2명 이상) PR을 승인할 시에, PR Merge 가능
2. PR에 새로운 commit 추가 시, 이전의 PR 승인을 무효화하고 재검토
