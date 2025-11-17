# 🚀 Page-Evolve 빠른 시작 가이드

## 1️⃣ 로컬 실행 (가장 추천)

### 사전 준비
- Node.js 설치 (https://nodejs.org)
- 코드 에디터 (VS Code 추천)

### 단계별 실행

```bash
# 1. 프로젝트 폴더로 이동
cd Page-Evolve

# 2. 의존성 설치 (최초 1회만)
npm install

# 3. Gemini API 키 설정
# .env.local 파일 생성하고 다음 내용 입력:
# API_KEY=여기에_Gemini_API_키_입력

# 4. 개발 서버 시작
npm run dev

# 5. 브라우저에서 열기
# http://localhost:3000
```

## 2️⃣ AI Studio에서 실행

현재 프로젝트는 이미 AI Studio에 배포되어 있습니다:
https://ai.studio/apps/drive/10YiHYwnQT80we32G1x7i21Qjgw6U7Adt

장점:
- 설치 불필요
- 바로 사용 가능
- 온라인 접근

단점:
- 인터넷 필요
- 수정 불가

## 3️⃣ 배포 (실제 운영용)

### Vercel에 배포 (무료)

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add API_KEY
```

### Netlify에 배포 (무료)

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 배포
netlify deploy --prod
```

## 🔑 Gemini API 키 발급 방법

1. https://aistudio.google.com 접속
2. 로그인
3. "Get API Key" 클릭
4. 새 API 키 생성
5. 복사해서 .env.local에 붙여넣기

## 🛠️ 추천 개발 환경

**에디터:** VS Code
**확장 프로그램:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense

**브라우저:** Chrome (개발자 도구 우수)

## 📱 모바일에서 테스트

```bash
# 로컬 네트워크에서 접근 가능하도록
npm run dev -- --host

# 그러면 다음과 같이 표시됨:
# ➜  Network: http://192.168.x.x:3000/
# 모바일에서 이 주소로 접속
```

## 🐛 문제 해결

### 포트 충돌
```bash
# 다른 포트로 실행
npm run dev -- --port 3001
```

### 의존성 오류
```bash
# 캐시 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### API 키 오류
- .env.local 파일이 프로젝트 루트에 있는지 확인
- API_KEY= 뒤에 공백 없이 입력했는지 확인
- 서버 재시작
