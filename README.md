# 10분 포스트잇

> 머릿속 혼란을 포스트잇 한 장의 10분 행동으로 바꾸는 ADHD 계획작성 도구

## 프로젝트 소개

10분 포스트잇은 성인 ADHD를 가진 사람들이 계획을 더 쉽게 세울 수 있도록 돕는 앱입니다.

**핵심 아이디어:**
- 복잡한 할 일 목록 대신, 딱 하나의 "10분 행동 문장"을 만들어냅니다
- AI가 브레인 덤프를 분석해서 가장 작은 첫 행동으로 줄여줍니다
- 포스트잇에 손으로 써서 눈앞에 붙이는 것으로 마무리합니다
- NFC 스티커로 매일 루틴을 강화합니다

**주요 특징:**
- 진단/치료 조언 없음 — 순수 생산성 도구
- XP 보상 시스템으로 작은 성취 축하
- 완료보다 "시작"과 "복귀"를 강조하는 설계
- 모바일 우선, 빠르고 부드러운 UX

---

## 설치 및 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 복사해서 `.env.local`을 만들고 값을 채워주세요:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase에서 schema.sql 실행

Supabase 대시보드 → SQL Editor에서 `supabase/schema.sql` 파일 내용을 붙여넣고 실행합니다.

이렇게 하면:
- 6개 테이블 생성 (profiles, nfc_logs, brain_dumps, plan_sentences, reward_logs, daily_stats)
- Row Level Security 정책 설정
- `increment_xp` RPC 함수 생성
- 신규 회원가입 시 프로필 자동 생성 트리거 설정

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열면 됩니다.

---

## 주요 화면 설명

| 경로 | 화면 | 설명 |
|------|------|------|
| `/` | 랜딩 | 앱 소개 및 시작 화면 |
| `/auth/login` | 로그인/가입 | 이메일 인증 기반 로그인 |
| `/nfc` | NFC 진입 | NFC 태깅 시 도달하는 화면, XP 지급 |
| `/setup` | 계획 시간 설정 | 최초 가입 후 계획 루틴 시간 설정 |
| `/brain-dump` | 브레인 덤프 | 머릿속 생각을 모두 쏟아내는 화면 |
| `/ai-result` | AI 결과 | AI가 분석한 10분 행동 문장 결과 |
| `/postit-confirm` | 포스트잇 확인 | 문장을 포스트잇에 작성하는 단계 |
| `/reward` | 보상 화면 | XP 획득 결과 및 10분 타이머 |
| `/profile` | 성장 기록 | XP, 레벨, 스트릭 등 통계 화면 |

---

## 환경변수 설명

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 필수 | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 필수 | Supabase 익명 키 (공개) |
| `SUPABASE_SERVICE_ROLE_KEY` | 선택 | Supabase 서비스 롤 키 (서버 전용) |
| `OPENAI_API_KEY` | 선택 | OpenAI API 키. 없으면 Mock AI로 동작 |
| `NEXT_PUBLIC_APP_URL` | 선택 | 앱 URL (배포 시 사용) |

> `OPENAI_API_KEY`가 없어도 Mock AI로 동작합니다. 개발 환경에서 테스트 가능합니다.

---

## NFC 스티커 설정 방법

1. NFC 스티커(NTAG213 이상)와 NFC 쓰기 앱 준비 (예: NFC Tools)
2. 스티커에 쓸 URL 설정: `https://your-domain.com/nfc`
3. 스마트폰을 스티커에 대면 앱이 자동으로 열립니다
4. 로그인된 상태면 XP가 자동 지급됩니다

**권장 스티커:** NTAG213 (저렴하고 빠름), 76×51 포스트잇 크기에 붙여도 됩니다

---

## XP 보상 시스템

| 행동 | XP |
|------|-----|
| NFC 태깅 | +10 XP |
| 브레인 덤프 작성 | +10 XP |
| 계획 문장 생성 | +20 XP |
| 포스트잇 작성 완료 | +20 XP |
| 복귀 보너스 | +30 XP |

- 하루에 각 보상은 1회만 지급됩니다
- 레벨 = `floor(총 XP / 100) + 1`
- 레벨에 따라 나무가 성장합니다 🌱→🌿→🌳→🌲

---

## 기술 스택

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Auth + PostgreSQL)
- **AI:** OpenAI GPT-4o-mini (없으면 Mock)
- **Deploy:** Vercel 권장

---

## 라이선스

MIT
