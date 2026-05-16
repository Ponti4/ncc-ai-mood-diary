# 작업 진행 상황 (PROGRESS.md)

> **다른 Claude 세션에서 이 프로젝트를 이어서 작업할 때 반드시 먼저 읽어주세요.**
> 사용자는 비개발자(국립암센터 AI 교육 담당)이며, 모든 설명은 중학생 수준으로 쉽게, 실생활 비유를 들어가며 해야 합니다.

---

## 🎯 프로젝트 개요

- **목적:** 국립암센터 AI 교육 실습용 — 코딩 모르는 사람도 AI(Claude)와 함께 웹서비스 만들 수 있다는 걸 보여주는 예제
- **기능:** 날짜별 기분(이모지) + 짧은 메모(여러 개) 기록할 수 있는 일기 웹앱
- **저장소:** https://github.com/Ponti4/ncc-ai-mood-diary (Public)
- **사용자 이메일:** dev.pontifex@gmail.com

---

## 🧰 기술 스택

| 영역 | 사용 기술 | 버전 |
|------|----------|------|
| 프레임워크 | Next.js (App Router) | 16.x |
| UI | React | 19.x |
| 스타일 | Tailwind CSS | v4 |
| DB | better-sqlite3 (WAL 모드) | - |
| 인증 | Auth.js v5 (next-auth@beta) + Google OAuth | - |
| 언어 | TypeScript | - |

**⚠️ 중요:** Next.js 16은 기존 학습 데이터와 다른 부분이 많음. 코드 작성 전 `node_modules/next/dist/docs/` 에서 관련 가이드 확인 필수 (AGENTS.md 참조).

---

## 📦 완료된 작업 (버전 히스토리)

| 버전 | 커밋 | 내용 |
|------|------|------|
| **v1.0.0** | `68ffcd5` | 기분 기록 웹서비스 초기 구현 (달력 + 기분 + 코멘트 CRUD) |
| **v1.1.0** | `6c44e87` | README에 국립암센터 AI 교육자료 안내 추가 |
| **v1.2.0** | `ec27bc4` | 달력 색상 흰색 → 초록색으로 변경 |
| **v1.3.0** | `3ca7757` | 암뮤니티 로고 추가 (헤더 좌측) |
| **v1.4.0** | `b224b9b` | 로그인 1단계: Auth.js v5 + Google OAuth 연결 (로컬 태그, 깃허브 릴리스 미발행) |

GitHub Releases: v1.0.0 ~ v1.3.0 발행됨. v1.4.0은 로컬 태그만.

---

## 🔐 로그인 기능 개발 5단계 계획

전체 계획은 `~/.claude/plans/piped-soaring-breeze.md` 에 있음. 요약:

### 규칙
- 기분(mood): 로그인 없이 누구나 변경 가능 (공유)
- 코멘트 작성: 로그인 필요
- 코멘트 수정/삭제: 본인 것만 가능 (user_id = 구글 이메일로 식별)
- 기존 코멘트(로그인 전): `user_id='anonymous'` → 누구도 수정/삭제 불가

### 단계별 상태

| 단계 | 내용 | 상태 |
|------|------|------|
| **1단계** | Auth.js 설치 + Google OAuth 연결 (`src/auth.ts`, `api/auth/[...nextauth]/route.ts`, `.env.local`) | ✅ 완료 (v1.4.0) |
| **2단계** | 헤더에 로그인/로그아웃 UI (`src/app/layout.tsx`에 `auth()` + 서버 액션) | ✅ 완료 (구글 로그인 실제 동작 확인) |
| **3단계** | DB 코멘트 테이블에 `user_id`, `user_name` 컬럼 추가 (`src/lib/db.ts`) | ⏳ 대기 |
| **4단계** | 코멘트 작성 시 유저 정보 저장 + 작성자 이름 표시 | ⏳ 대기 |
| **5단계** | 코멘트 수정/삭제 권한 체크 (클라이언트 UI + 서버 API 이중 보호) | ⏳ 대기 |

### 해결된 이슈: 401 invalid_client (2026-05-16 해결)
- **증상:** 로그인 버튼 클릭 → 구글 로그인 페이지에서 `Error 401: invalid_client`
- **원인:** Auth.js v5는 환경변수를 자동으로 `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` 이름으로 찾는데, `.env.local`에는 `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`로 저장되어 있어 자격증명이 비어있는 채로 구글에 요청됨 → 구글이 401 거부
- **해결:** `src/auth.ts`에서 환경변수 이름을 명시적으로 지정
  ```typescript
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  })
  ```
- **다음에 비슷한 문제 보면:** Auth.js v4 → v5 마이그레이션 자료들이 인터넷에 많은데, v5는 환경변수 이름 규칙이 바뀌었음(`AUTH_<PROVIDER>_ID`). 의심스러우면 코드에 `process.env.XXX` 형태로 명시

---

## 📁 주요 파일 구조

```
simple-diary/
├── src/
│   ├── auth.ts                                    # NextAuth 설정 (Google provider)
│   ├── app/
│   │   ├── layout.tsx                             # 헤더 로고 + 로그인/로그아웃 UI (서버 컴포넌트)
│   │   ├── [year]/[month]/page.tsx                # 달력 화면
│   │   ├── diary/[date]/
│   │   │   ├── page.tsx                           # 일기 서버 컴포넌트
│   │   │   └── DiaryEditor.tsx                    # 일기 클라이언트 컴포넌트 (기분 + 코멘트)
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts        # Auth.js 핸들러
│   │       ├── entries/[date]/route.ts            # 기분 GET/PUT
│   │       ├── entries/[date]/comments/route.ts   # 코멘트 GET/POST
│   │       └── comments/[id]/route.ts             # 코멘트 PUT/DELETE
│   └── lib/db.ts                                  # SQLite (entries + comments 테이블)
├── data/                                          # SQLite DB 파일 (.gitignore)
├── public/암뮤니티 로고.png                       # 헤더 로고
├── .env.local                                     # AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET (.gitignore)
├── README.md                                      # 일반 사용자용 안내
├── AGENTS.md                                      # Next.js 16 주의사항
├── CLAUDE.md                                      # → AGENTS.md, PROGRESS.md 참조
└── PROGRESS.md                                    # ← 이 파일 (작업 히스토리)
```

---

## 🔑 보안 및 인증 관련 메모

- `.env.local`은 `.gitignore`에 포함되어 깃허브에 절대 안 올라감
- `AUTH_SECRET`은 `openssl rand -base64 32`로 생성 (`npx auth secret`는 better-auth 패키지를 설치하므로 사용 금지)
- Auth.js v5는 **SessionProvider 불필요** — 서버 컴포넌트에서 `auth()` 직접 호출
- 서버 액션(`"use server"`)에서 `signIn("google")` / `signOut()` 호출

---

## 💬 사용자와의 작업 스타일

- **사용자는 비개발자**: 코딩 용어를 들으면 무슨 뜻인지 모름
- 항상 **중학생 수준**의 설명, **실생활 비유** 사용
- 명령어를 한 줄씩 알려주고 **각 단계 검증** 후 다음으로 진행
- 사용자가 직접 해야 할 작업(예: 구글 콘솔, 시크릿 키 입력)과 Claude가 할 작업을 명확히 구분
- 변경 후 항상 **로컬 서버에서 시각적으로 검증** (preview_screenshot 사용)
- 단계 끝날 때마다 git 커밋 + 깃허브 푸시 + 릴리스 태그 생성

---

## 🚀 다음 작업 시작 시 체크리스트

1. 이 PROGRESS.md 먼저 읽기
2. `git log --oneline` 으로 현재 상태 확인
3. 현재 막혀있는 이슈(있다면) 우선 해결
4. 사용자에게 어디까지 진행됐는지 한국어로 짧게 요약 후 다음 단계 제안
