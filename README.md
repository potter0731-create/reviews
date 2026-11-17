# 보고 읽고 (임시 이름)

내가 보고 읽은 영화와 책을 기록하는 개인 리뷰 사이트. 포스터 갤러리 스타일.

- 별점(0.5 단위) + 한줄평 + 리뷰, 보고싶은/읽고싶은 찜 목록
- 인상 깊은 대사·문장 모음, 연도별 통계·결산 (`/stats`)
- `/admin` 에서 비밀번호로 로그인해 제목 검색 → 자동 입력 → 리뷰 작성
  - 영화: TMDB, 책: 카카오 책 검색
- 데이터베이스 없이 `data/reviews.json` 한 파일에 저장합니다.
  관리자 페이지에서 저장하면 GitHub 에 커밋되고, Vercel 이 사이트를 다시 만듭니다. (1~2분)

## 내 컴퓨터에서 실행

```bash
pnpm install
cp .env.example .env.local   # 값 채우기
pnpm dev                     # http://localhost:3000
```

`GITHUB_TOKEN` 을 비워두면 저장 시 `data/reviews.json` 에 바로 씁니다.

## 환경변수 (`.env.example` 참고)

| 이름 | 용도 |
|---|---|
| `ADMIN_PASSWORD`, `SESSION_SECRET` | 관리자 로그인 |
| `TMDB_TOKEN` | 영화 검색 (TMDB API 읽기 액세스 토큰) |
| `KAKAO_REST_KEY` | 책 검색 (카카오 REST API 키) |
| `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH` | 저장 시 GitHub 커밋 (이 저장소 Contents 읽기/쓰기 권한) |

검색 키가 없어도 관리자 페이지에서 직접 입력할 수 있습니다.
