# 스부키 Google Search Console 주간 리포트

이 프로젝트는 Google Search Console API를 사용하여 [스부키(sbooky.net)](https://sbooky.net) 웹사이트의 검색 성능 데이터를 수집하고 Discord 웹훅을 통해 주간 리포트를 보내는 자동화 도구입니다.

[다음 레포](https://github.com/jgjgill/google-search-console-playground)를 참고해서 개발했습니다.

## 기능

- Google Search Console API를 통한 검색 데이터 수집
- 이번 주와 지난 주의 검색 성능 비교 분석
- Discord 웹훅을 통한 주간 리포트 자동 전송
- GitHub Actions를 사용한 매주 수요일 오후 7시 30분(KST) 자동 실행

## 리포트 데이터

주간 리포트에 포함되는 정보:

- 총 클릭 수 (이번 주/지난 주 비교)
- 총 노출 수 (이번 주/지난 주 비교)
- 평균 CTR(클릭률) (이번 주/지난 주 비교)
- 평균 검색 순위 (이번 주/지난 주 비교)

## 설치 및 설정

### 필수 요구사항

- Node.js 20 이상
- pnpm 패키지 관리자

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```
DISCORD_WEBHOOK_URL=your_discord_webhook_url
GOOGLE_CLIENT_EMAIL=your_google_service_account_email
GOOGLE_PRIVATE_KEY=your_google_service_account_private_key
```

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/sbooky-google-webhook.git
cd sbooky-google-webhook

# 의존성 설치
pnpm install
```

### 실행

```bash
# 수동으로 리포트 실행
pnpm start
```

## GitHub Actions 설정

이 프로젝트는 GitHub Actions를 사용하여 자동으로 매주 수요일 오후 7시 30분(KST)에 리포트를 생성하고 전송합니다.

GitHub 저장소 설정에서 다음 시크릿을 추가해야 합니다:

- `DISCORD_WEBHOOK_URL`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

## 프로젝트 구조

```
.
├── .github/
│   └── workflows/
│       └── search-console-report.yaml  # GitHub Actions 워크플로우 설정
├── .gitignore
├── index.ts                            # 메인 애플리케이션 코드
├── package.json
└── tsconfig.json
```

## 기술 스택

- TypeScript
- Node.js
- Google Search Console API
- Discord Webhook API
- Day.js (날짜 처리)
- GitHub Actions (자동화)
- pnpm (패키지 관리)

## 참고 사항

- 리포트 데이터는 3일 전부터 9일 전까지의 데이터를 "이번 주"로, 10일 전부터 16일 전까지의 데이터를 "지난 주"로 계산합니다.
