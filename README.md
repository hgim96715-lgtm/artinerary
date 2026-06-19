# Artinerary

공공 문화 API(문화누리)와 관리자 등록 데이터를 통합해, 전시 탐색·찜·관람 기록을 한곳에서 관리하는 **전시 큐레이션 서비스**입니다.

| | URL |
|---|-----|
| **Web** | [artinerary-web.vercel.app](https://artinerary-web.vercel.app) |
| **API** | [artinerary-production.up.railway.app](https://artinerary-production.up.railway.app) |

---

## 소개

| 항목 | 내용 |
|------|------|
| **백엔드** | NestJS · Prisma · PostgreSQL · JWT(httpOnly 쿠키) |
| **프론트** | Next.js App Router · Tailwind CSS |
| **배포** | Vercel(web) · Railway(api) · Neon(DB) |
| **외부 연동** | 문화누리 API 수집 · Claude(관리자 전시 소개) · S3(관람 사진) |

공공 API로 전시 목록을 수집하고, 관리자가 보정·등록한 뒤 사용자가 지역·상태별로 탐색합니다. 찜·관람 기록은 마이페이지에서 티켓 카드 UI로 확인할 수 있습니다.

---

## 로컬 실행

```bash
pnpm docker:up          # PostgreSQL (--env-file .env)
pnpm install
pnpm prisma migrate dev # 최초 1회
pnpm seed               # ADMIN 계정 · 닉네임 변경 시 재실행
pnpm start:dev          # API  :3000
pnpm dev:web            # Web  :3001
```

환경 변수·Docker 설정은 [docs/deployment.md](docs/deployment.md)를 참고하세요.

---

## 프로젝트 구조

```
artinerary/
├── src/                 # Nest API
│   ├── exhibitions/ · collector/ · auth/
│   ├── wishlist/ · visit/ · notice/
│   ├── admin/ · upload/
│   └── prisma/
├── web/                 # Next.js
│   ├── app/             # 공개 · /mypage · /admin
│   └── components/
├── prisma/
└── docker/
```

---

## 아키텍처

```text
[Browser]
    ↓ credentials (httpOnly JWT)
[Next.js :3001]
    │  prod: 브라우저 → /api/nest (same-site 프록시)
    │  서버(RSC)    → API_INTERNAL_URL → Railway
    └─ fetch ──→ [Nest API :3000]
                      ↓
                 [PostgreSQL]
                      ↑
[문화 API] ←── Collector ──┘
[Claude]   ←── ExhibitionAiService (admin edit)
```

운영 환경에서는 Vercel과 Railway 도메인이 달라, 브라우저는 Railway URL로 직접 요청하지 않고 `/api/nest` 프록시를 사용합니다. 인증·역할 가드는 [docs/auth.md](docs/auth.md), 배포 설정은 [docs/deployment.md](docs/deployment.md)에 정리되어 있습니다.

---

## 주요 기능

### 사용자

| 영역 | 내용 |
|------|------|
| 탐색 | 전시 목록·상세 · 지역·상태·키워드 필터 |
| 찜·관람 | 찜 추가/해제 · 관람 등록(별점·후기·사진) · 상세 `me-status` |
| 마이페이지 | 찜·관람 티켓 카드 · 내 정보(닉네임·비밀번호) · 관람 달력 · 공지사항 |
| UX | 전시 상세 → 마이페이지 복귀(`?from=`) · 테마 전환(시스템/라이트/다크) |

상세: [docs/user.md](docs/user.md)

### 관리자

| 영역 | 내용 |
|------|------|
| 전시 | MANUAL CRUD · 공개/비공개 · API 수집 · AI 소개 생성(edit) |
| 공지 | 목록·작성·수정·삭제 · 게시/초안 · 상단 고정 |
| 운영 | 오늘 활동 · 회원 목록 |

상세: [docs/admin.md](docs/admin.md)

### 데이터·수집

- 문화누리 `period2` + `detail2` 수집 · upsert
- `collector-merge`로 MANUAL 전시·관리자 보정 필드 보호

상세: [docs/collector.md](docs/collector.md)

---

## 찜 · 관람 정책

찜은 **가고 싶은 전시**, 관람은 **다녀온 기록**으로 구분합니다.

| | 찜 | 관람 기록 |
|---|-----|-----------|
| 전시 종료·비공개 | 목록 제외 · cron으로 DB 정리 | 삭제하지 않음 · 마이페이지 유지 |
| 이유 | 더 이상 방문 대상이 아님 | 개인 기록·후기 보존 |

관람 목록 API(`GET /me/visits`)는 종료·비공개 전시도 포함하며, UI용 플래그(`isExhibitionVisible`, `isEnded`, `canOpenDetail`)를 함께 반환합니다. 전시 상세 링크는 `canOpenDetail`이 true일 때만 표시됩니다.

정책·카드 UI 상세: [docs/user.md](docs/user.md) · [docs/mypage-plan.md](docs/mypage-plan.md)

---

## 로드맵

| 상태 | 항목 |
|------|------|
| 완료 | 마이페이지 layout · 찜·관람 · 관람 달력 · 내 정보 · 공지(USER·ADMIN) · 테마 전환 · prod `/api/nest` 프록시 |
| 보류 | API 수집 백그라운드 job · 목록 페이지네이션 · 찜함/관람함 필터 · AI 2단계(new) · 공지 md/뱃지 · 고객센터 |

전체 백로그: [docs/backlog.md](docs/backlog.md) · Phase 이력: [docs/roadmap.md](docs/roadmap.md)

---

## 트러블슈팅

| 증상 | 조치 |
|------|------|
| Prisma `P1001` / `ECONNREFUSED` | `pnpm docker:up` · `docker compose --env-file .env` |
| API 수집 중 admin 탭 이동 | 수집 요청이 끊김 — 수집 완료까지 전시 목록에 유지 |
| 모바일 Safari 로그인·목록 401/`Load failed` | `NEXT_PUBLIC_API_URL=/api/nest` · `API_INTERNAL_URL`=Railway URL |
| 관리자 닉네임 미반영 | `.env` `ADMIN_NICKNAME` 변경 후 `pnpm seed` |
| AI 설명 503 | Railway `ANTHROPIC_API_KEY` · 모델 `claude-sonnet-4-6` |

**Vercel (web) 예시**

```env
NEXT_PUBLIC_API_URL=/api/nest
API_INTERNAL_URL=https://artinerary-production.up.railway.app
COOKIE_NAME=artinerary-auth-token
```

추가 이슈: [docs/troubleshooting.md](docs/troubleshooting.md)

---

## 문서

| 문서 | 내용 |
|------|------|
| [docs/user.md](docs/user.md) | 사용자 화면·API |
| [docs/admin.md](docs/admin.md) | 관리자·수집·공지 |
| [docs/api.md](docs/api.md) | 엔드포인트 |
| [docs/deployment.md](docs/deployment.md) | 배포·환경 변수 |
| [docs/mypage-plan.md](docs/mypage-plan.md) | 마이페이지 계획 |
| [docs/backlog.md](docs/backlog.md) | 백로그 |
| [docs/auth.md](docs/auth.md) | 인증·가드 |
| [docs/collector.md](docs/collector.md) | 문화 API 수집 |
| [docs/troubleshooting.md](docs/troubleshooting.md) | 운영 이슈 |
