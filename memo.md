너는 숙련된 풀스택 개발자이자 UX 디자이너다.

나는 “NFC 포스트잇 기반 ADHD 계획작성 보조 웹앱 MVP”를 만들고 싶다.

이 앱의 목적은 일반적인 할 일 관리 앱이 아니다.
성인 ADHD 사용자가 NFC 포스트잇을 태깅해서 웹사이트에 들어오고, 머릿속 생각을 브레인 덤프로 쏟아낸 뒤, AI가 그것을 ADHD 계획작성법에 맞게 “10분 첫 행동 문장”으로 바꿔주고, 사용자가 그 문장을 실제 포스트잇에 손으로 적게 만든 뒤, 경험치와 보상을 받게 하는 시스템이다.

핵심 제품 정의:
“브레인 덤프는 생각을 꺼내는 단계이고, AI는 그것을 줄이는 단계이며, 포스트잇은 최종 10분 행동을 고정하는 장치다.”

기술 스택:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Supabase Database
- OpenAI API 연동 가능 구조
- 모바일 우선 반응형 UI
- PWA처럼 보이는 웹앱 느낌
- NFC는 별도 하드웨어 제어가 아니라, NFC 스티커에 저장된 URL로 웹앱에 접속하는 구조로 구현한다.

NFC 구조:

- NFC 스티커에는 공통 URL을 넣는다고 가정한다.
- 예: /nfc
- 사용자가 NFC를 태깅하면 /nfc 페이지로 들어온다.
- 로그인하지 않은 사용자는 로그인/회원가입 화면으로 이동한다.
- 로그인한 사용자는 user_id 기준으로 오늘 NFC 진입 기록을 저장한다.
- NFC 태그별 고유 ID는 MVP에서는 사용하지 않는다.
- XP 남용 방지를 위해 user_id 기준 하루 보상 횟수 제한을 건다.

앱의 핵심 플로우:

1. 사용자가 NFC 태깅
2. /nfc 페이지 접속
3. 로그인 여부 확인
4. 로그인 후 오늘 NFC 태깅 기록 저장
5. 사용자가 계획 작성 시간 설정
6. 브레인 덤프 입력
7. AI가 브레인 덤프를 정리
8. 오늘 하나의 할 일을 선택하게 유도
9. AI가 선택한 할 일을 “10분 첫 행동 문장”으로 변환
10. 사용자가 최종 문장을 포스트잇에 손으로 적도록 안내
11. 사용자가 “포스트잇에 작성 완료” 버튼 클릭
12. XP 지급
13. 간단한 성장 화면 표시

필수 화면:

1. 랜딩 화면
2. 로그인/회원가입 화면
3. NFC 진입 화면
4. 계획 작성 시간 설정 화면
5. 브레인 덤프 화면
6. AI 변환 결과 화면
7. 포스트잇 작성 확인 화면
8. XP 보상 화면
9. 마이페이지/성장 화면

화면별 상세 요구사항:

1. 랜딩 화면

- 앱 이름: “10분 포스트잇”
- 설명: “머릿속 혼란을 포스트잇 한 장의 10분 행동으로 바꾸는 ADHD 계획작성 도구”
- CTA 버튼: “NFC 없이 체험하기”
- CTA 버튼: “로그인하기”

2. 로그인/회원가입 화면

- Supabase Auth 사용
- 이메일 로그인만 우선 구현해도 된다.
- 소셜 로그인은 나중에 확장 가능하게 구조만 고려한다.

3. NFC 진입 화면

- 문구:
  “NFC 태깅 성공”
  “오늘의 계획 작성으로 돌아왔어요.”
- 오늘 첫 NFC 접속이면 +10 XP 지급
- 이미 오늘 지급했다면 “오늘 NFC 보상은 이미 받았어요. 그래도 계획 작성은 계속할 수 있어요.” 표시
- 버튼: “오늘 계획 만들기”

4. 계획 작성 시간 설정 화면

- 최초 가입 후 한 번만 보여준다.
- 질문:
  “매일 몇 시에 포스트잇 계획을 작성할까요?”
- 시간 선택 input 제공
- 저장 후 브레인 덤프 화면으로 이동

5. 브레인 덤프 화면

- 상단 문구:
  “정리하려고 하지 않아도 됩니다.”
  “해야 할 일, 걱정, 미룬 것, 떠오르는 것을 전부 적어보세요.”
- 큰 textarea 제공
- placeholder:
  “예: 포트폴리오 해야 함, 사업계획서도 써야 함, 방 정리도 해야 함, 근데 너무 막막함…”
- 버튼: “AI가 10분 행동으로 줄이기”

6. AI 변환 결과 화면

- AI가 브레인 덤프를 분석해서 다음을 출력한다:
  A. 오늘 바로 다룰 수 있는 것
  B. 나중에 보관할 것
  C. 회피 신호 또는 감정
  D. 추천하는 오늘의 1가지 행동
  E. 최종 포스트잇 문장

최종 포스트잇 문장 공식:
“[대상]을/를 [작은 행동]해서 [작은 결과] 만들기. 10분만.”

예시:
“사업계획서 파일 열고 문제정의 제목 1줄 쓰기. 10분만.”
“포트폴리오 파일 열고 첫 페이지 제목만 확인하기. 10분만.”
“운동복 입고 헬스장 가방만 챙기기. 5분만.”

AI는 절대 큰 목표를 그대로 최종 문장으로 내보내면 안 된다.
“포트폴리오 하기”, “사업계획서 쓰기”, “운동하기” 같은 문장은 실패다.
반드시 행동동사, 작은 결과, 10분 제한이 들어가야 한다.

7. 포스트잇 작성 확인 화면

- 최종 문장을 큰 카드 형태로 보여준다.
- 문구:
  “이 문장을 76×51 포스트잇에 그대로 적어보세요.”
  “손으로 쓰는 것이 오늘의 계획을 눈앞에 고정하는 단계입니다.”
- 버튼:
  “포스트잇에 작성 완료”
  “문장 다시 줄이기”

8. XP 보상 화면

- 포스트잇 작성 완료 시 XP 지급
- 보상 예시:
  - NFC 태깅: +10 XP / 하루 1회
  - 브레인 덤프 작성: +10 XP / 하루 1회
  - 10분 첫 행동 문장 완성: +20 XP / 하루 1회
  - 포스트잇 작성 완료: +20 XP / 하루 1회
  - 며칠 쉬었다가 복귀: +30 XP / 조건 충족 시
- 화면 문구:
  “완료보다 중요한 건 다시 돌아온 것입니다.”
  “오늘의 10분 행동 문장이 완성됐어요.”
- 버튼:
  “10분 타이머 시작”
  “오늘은 여기까지”

9. 성장 화면

- total_xp 표시
- 오늘 획득 XP 표시
- 이번 주 계획 작성 횟수 표시
- 연속 태깅 일수 표시
- 복귀 성공 횟수 표시
- 간단한 성장 시각화:
  - 레벨
  - XP 바
  - 작은 나무 성장 UI 또는 진행률 바
- 랭킹, 코인 마켓, 커뮤니티는 구현하지 않는다.

DB 스키마를 설계하고 Supabase SQL도 제공하라.

필요 테이블:

1. profiles

- id uuid primary key references auth.users(id)
- nickname text
- plan_time time
- total_xp integer default 0
- created_at timestamp

2. nfc_logs

- id uuid primary key
- user_id uuid references profiles(id)
- accessed_at timestamp
- reward_given boolean default false

3. brain_dumps

- id uuid primary key
- user_id uuid references profiles(id)
- content text
- created_at timestamp

4. plan_sentences

- id uuid primary key
- user_id uuid references profiles(id)
- brain_dump_id uuid references brain_dumps(id)
- original_task text
- final_sentence text
- created_at timestamp
- written_confirmed boolean default false

5. reward_logs

- id uuid primary key
- user_id uuid references profiles(id)
- reward_type text
- xp integer
- created_at timestamp

6. daily_stats

- id uuid primary key
- user_id uuid references profiles(id)
- date date
- nfc_count integer default 0
- brain_dump_count integer default 0
- plan_sentence_count integer default 0
- xp_earned integer default 0

보상 로직:

- 같은 reward_type은 하루 1회만 XP 지급되게 한다.
- 단, 나중에 확장할 수 있도록 reward_type별 daily_limit 구조를 코드에 분리한다.
- 오늘 날짜 기준으로 reward_logs를 확인하여 중복 지급 방지.
- 경험치 지급 시 profiles.total_xp 업데이트.

AI API:

- /api/convert-plan 라우트를 만든다.
- 입력: brainDump string
- 출력:
  {
  "immediateTasks": string[],
  "laterTasks": string[],
  "emotionOrAvoidanceSignals": string[],
  "recommendedTask": string,
  "finalPostitSentence": string,
  "reason": string
  }

AI 시스템 프롬프트:
“너는 성인 ADHD 사용자의 계획작성을 돕는 AI다. 사용자의 브레인 덤프를 받아서 하나의 10분 첫 행동 문장으로 줄여야 한다. 진단, 치료, 약물 조언은 하지 않는다. 큰 목표를 그대로 두지 말고 반드시 구체적인 행동동사, 작은 결과, 10분 이하의 시간 제한을 포함한 문장으로 바꾼다. 사용자가 부담을 느끼지 않도록 짧고 따뜻하게 말한다. 완료보다 시작과 복귀를 강조한다.”

OpenAI API 키가 없을 때도 앱이 동작하도록 mock 변환 함수를 만들어라.
예: 사용자가 입력한 첫 번째 문장을 기반으로 “파일 열고 첫 줄 쓰기. 10분만.” 형태로 임시 변환.

UX 원칙:

- ADHD 사용자를 비난하지 않는다.
- “실패”, “미달성” 같은 단어를 최소화한다.
- “복귀”, “다시 시작”, “10분만”, “포스트잇 한 장” 같은 표현을 사용한다.
- 한 화면에 너무 많은 정보를 넣지 않는다.
- 버튼은 1~2개만 보여준다.
- 모바일에서 엄지손가락으로 쉽게 누를 수 있게 한다.
- 색상은 부드럽고 차분하게 한다.
- 너무 많은 애니메이션은 넣지 않는다.
- 문장은 짧고 명확하게 쓴다.

구현 우선순위:

1. 인증
2. NFC URL 진입
3. 브레인 덤프 저장
4. AI 변환
5. 포스트잇 문장 확인
6. XP 지급
7. 성장 화면

이번 MVP에서 구현하지 말 것:

- 전화 상담
- 문자 알림
- 전체 랭킹
- 코인 마켓
- 상담사 매칭
- 복잡한 감정 챕터
- 포스트잇 개별 NFC 식별
- 결제 기능
- 관리자 페이지

최종 산출물:

- 실행 가능한 Next.js 프로젝트 코드
- Supabase 테이블 SQL
- 환경변수 예시
- 기본 README
- 로컬 실행 방법
- 주요 컴포넌트 구조
- 모바일 중심 UI

코드를 작성할 때는 파일 구조를 명확히 만들고, 각 기능을 작고 이해하기 쉽게 나누어라.
다음 번 시작할 때 붙여넣기용 프롬프트

이전에 같이 만들던 "10분 포스트잇" ADHD 계획작성 웹앱 프로젝트를 이어서 작업하자.

## 현재 상태

- 프로젝트 위치: C:\Users\문성하\OneDrive\바탕 화면\ADHD_POSTIT
- Next.js 14 App Router + TypeScript + Tailwind CSS + Supabase + OpenAI 구조로 32개 파일 전부 생성 완료
- npm install까지 완료됨
- Supabase 프로젝트 생성 및 DB 스키마 실행은 아직 안 함
- .env.local 파일도 아직 없음

## 오늘 할 일

Supabase 설정을 완료하고 앱을 실행해서 동작 확인하기.

순서:

1. .env.local 파일 생성 (내가 Supabase 키 줄게)
2. supabase/schema.sql을 Supabase SQL Editor에서 실행
3. npm run dev로 로컬 실행
4. 각 화면 동작 확인 및 버그 수정

Supabase 키값: [여기에 본인 키 붙여넣기]

- NEXT_PUBLIC_SUPABASE_URL=
- NEXT_PUBLIC_SUPABASE_ANON_KEY=
- SUPABASE_SERVICE_ROLE_KEY=

---

"10분 포스트잇" 앱 — Web Push 알림 시스템 구현 이어가기

프로젝트 위치: C:\Users\문성하\OneDrive\바탕 화면\ADHD_POSTIT
스택: Next.js 14 App Router + TypeScript + Supabase + Tailwind

오늘 구현할 기능:
NFC 태깅을 멈춘 사용자에게 회복탄력성 Web Push 알림을 보내는 시스템.

구현 순서:

1. public/manifest.json + 서비스 워커 추가 → PWA 설정 (manifest.json 404 에러도 동시 해결)
2. Supabase에 push_subscriptions 테이블 추가
3. app/nfc/page.tsx에서 알림 권한 요청 + 구독 정보 저장
4. web-push 패키지로 VAPID 키 생성 및 Supabase Edge Function 작성
5. Supabase cron 트리거 설정 (매일 1회, 3일+ 미태깅 유저 감지 → 발송)

회복 멘트 (이미 기획 완료):

- 3일 미태깅: "잠깐 쉬었군요. 괜찮아요. NFC 한 번만 찍어볼까요? 10분만."
- 7일 미태깅: "돌아오는 것 자체가 실행력이에요. 지금 딱 한 번만요."
- 14일 미태깅: "오랜만이에요. 처음부터 다시가 아니라 지금부터 다시예요."

참고: nfc_logs 테이블에 user_id, accessed_at 컬럼이 있어 미태깅 감지 쿼리 가능. Supabase
프로젝트 URL은 .env.local에 있음.
① cron-job.org 가입 후 새 Job 등록

- URL: https://앱주소/api/push/send
- Method: POST
- Header: x-cron-secret: postit-cron-2026
- Schedule: 매일 오전 9시

② Supabase SQL Editor에서 테이블 생성

- supabase/push_subscriptions.sql 내용 붙여넣고 실행
