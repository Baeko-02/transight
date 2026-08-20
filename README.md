# Transight 온체인 추적 실습 기초

하나의 Ethereum 지갑 주소에서 발생한 세 가지 활동을 단계별로 추적하는 초급 교육용 웹사이트입니다.

- CEX 출금 출처와 트랜잭션 해시 확인
- 323 USDC 브릿지 플랫폼과 트랜잭션 해시 확인
- DeFi 예치 플랫폼과 수령 토큰 확인
- 단계별 정답 채점, 힌트, 해설 제공
- 진행 기록은 브라우저 `localStorage`에 저장

![Transight 온체인 추적 실습 기초](public/og.png)

## 실행 환경

- Node.js 22.13 이상
- npm
- Linux 권장

## 로컬 실행

```bash
cp .env.example .env
npm ci
npm run build
npm start
```

기본 접속 주소는 `http://localhost:3000`입니다.

## Docker 실행

```bash
cp .env.example .env
docker compose up -d --build
```

실제 도메인을 사용할 경우 `.env`의 `SITE_URL`을 수정한 뒤 다시 빌드하세요.

## 주요 파일

- `app/page.tsx`: 문제, 정답 검증, 화면 구성
- `app/globals.css`: 전체 디자인
- `app/layout.tsx`: 사이트 제목과 공유 메타데이터
- `public/`: 이미지와 아이콘
- `SERVER_DEPLOYMENT_GUIDE_KO.md`: Linux 서버 배포 안내

## 유의사항

이 프로젝트에는 별도 데이터베이스가 없습니다. 수강생의 진행 기록은 각 브라우저에만 저장되며 다른 기기와 동기화되지 않습니다.
