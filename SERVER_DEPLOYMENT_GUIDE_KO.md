# Transight 온체인 추적 실습 서버 설치 안내

이 패키지는 현재 배포된 교육 사이트의 전체 소스입니다. 정답 채점과 단계 진행은 브라우저에서 실행되며 별도 데이터베이스는 필요하지 않습니다. 수강생의 진행 기록은 각 브라우저의 `localStorage`에 저장되므로 기기 간에는 자동 동기화되지 않습니다.

## 권장 환경

- Linux 서버
- Node.js 22.13 이상
- npm
- 공개 도메인을 사용할 경우 Nginx 또는 다른 리버스 프록시

## 방법 1. Docker로 실행

가장 간단한 방식입니다.

1. 압축을 풀고 프로젝트 폴더로 이동합니다.
2. `.env.example`을 `.env`로 복사합니다.
3. `.env`의 `SITE_URL`을 실제 도메인으로 바꿉니다.
4. 다음 명령을 실행합니다.

```bash
docker compose up -d --build
```

기본 접속 주소는 `http://서버-IP:3000`입니다. 운영 환경에서는 Nginx를 앞에 두고 HTTPS를 적용하는 것을 권장합니다.

## 방법 2. Node.js로 직접 실행

Ubuntu 계열이라면 빌드 스크립트에 필요한 도구를 먼저 설치합니다.

```bash
sudo apt-get update
sudo apt-get install -y curl util-linux
```

프로젝트 폴더에서 다음 순서로 실행합니다.

```bash
cp .env.example .env
npm ci
npm run build
npm start
```

`.env` 예시:

```dotenv
SITE_URL=https://your-domain.example
PORT=3000
```

`SITE_URL`은 소셜 공유 이미지와 메타데이터의 기준 주소로 사용됩니다. 도메인을 연결하기 전에 빌드했다면 값을 수정하고 `npm run build`를 다시 실행하세요.

## Nginx 연결 예시

```nginx
server {
    listen 80;
    server_name your-domain.example;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

설정 후 Certbot 또는 서버에서 사용하는 인증서 관리 도구로 HTTPS를 적용하세요.

## 주요 수정 위치

- 문제, 정답 검증, 화면 구성: `app/page.tsx`
- 디자인: `app/globals.css`
- 제목과 공유 메타데이터: `app/layout.tsx`
- 이미지와 아이콘: `public/`

문제나 정답을 수정한 뒤에는 다시 빌드하고 서비스를 재시작해야 합니다.

```bash
npm run build
npm start
```

Docker를 사용한다면 다음 명령으로 새 이미지를 만들고 재시작합니다.

```bash
docker compose up -d --build
```
