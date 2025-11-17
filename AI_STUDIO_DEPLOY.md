# 🚀 Google AI Studio 배포 가이드

## 방법 1: AI Studio 웹사이트에서 직접 업로드 (가장 쉬움)

### 단계별 가이드:

1. **프로젝트 파일 압축**
   ```bash
   # 현재 폴더에서 실행 (Page-Evolve 폴더 안에서)
   # node_modules, .git 제외하고 압축
   zip -r page-evolve-update.zip . -x "node_modules/*" -x ".git/*" -x "dist/*"
   ```

2. **AI Studio 접속**
   - https://aistudio.google.com 접속
   - Google 계정으로 로그인

3. **기존 앱 업데이트**
   - 왼쪽 메뉴에서 "Apps" 클릭
   - 기존 앱 찾기: "page-evolve" 또는 ID로 검색
   - 앱 열기
   - 우측 상단 "⋮" (더보기) 메뉴 클릭
   - "Update files" 또는 "Replace files" 선택
   - zip 파일 업로드

4. **새 앱으로 생성 (대안)**
   - "Create" 버튼 클릭
   - "Upload files" 선택
   - zip 파일 드래그 앤 드롭
   - 프로젝트 이름 입력: "Page-Evolve v2.0"
   - "Deploy" 클릭

## 방법 2: GitHub 연동 (자동 배포)

### 1단계: AI Studio에서 GitHub 연동

```
AI Studio → Settings → Integrations → GitHub
→ "Connect GitHub" 클릭
→ 권한 승인
```

### 2단계: 저장소 연결

```
Apps → New App → Import from GitHub
→ 저장소 선택: SiYoung9010/Page-Evolve
→ 브랜치 선택: claude/review-page-evolve-architecture-018E54oStNCC8bzpkBrSYfeE
→ Deploy
```

### 3단계: 자동 배포 설정

```
Settings → Deployment
→ Auto-deploy: ON
→ Branch: main 또는 현재 브랜치

이제 GitHub에 푸시할 때마다 자동 배포됨!
```

## 방법 3: AI Studio CLI (고급)

### 설치

```bash
npm install -g @google/aistudio-cli
```

### 로그인

```bash
aistudio login
```

### 배포

```bash
# 프로젝트 폴더에서
aistudio deploy

# 특정 앱 업데이트
aistudio update --app-id 10YiHYwnQT80we32G1x7i21Qjgw6U7Adt
```

## 🔑 환경 변수 설정 (중요!)

AI Studio에서 API 키 설정:

1. 앱 열기
2. Settings → Environment Variables
3. 추가:
   - Name: `API_KEY`
   - Value: (Gemini API 키 입력)
4. Save

## 📊 현재 프로젝트 상태

- ✅ GitHub에 푸시됨: `claude/review-page-evolve-architecture-018E54oStNCC8bzpkBrSYfeE` 브랜치
- ✅ 최신 커밋: `74fa925` (Image Studio 통합)
- ✅ 모든 파일 포함됨

## 🎯 추천 방법

### 빠른 테스트용:
→ **방법 1** (직접 업로드)
- 5분 소요
- 즉시 확인 가능

### 지속적 개발용:
→ **방법 2** (GitHub 연동)
- 초기 설정 10분
- 이후 자동 배포

## 🚨 주의사항

### 업로드 전 확인:

1. **빌드 성공 확인**
   ```bash
   npm run build
   # ✓ built in 2.33s 확인
   ```

2. **package.json 확인**
   - dependencies 모두 포함되었는지
   - scripts 설정 확인

3. **환경 변수 준비**
   - Gemini API 키 준비
   - .env.local은 업로드 안 됨 (보안상 제외됨)

4. **용량 확인**
   ```bash
   du -sh . --exclude=node_modules --exclude=.git
   # 보통 1-5MB 정도
   ```

## 📦 업로드할 파일 목록

**포함되어야 할 것:**
- ✅ 모든 .tsx, .ts 파일
- ✅ package.json
- ✅ index.html
- ✅ vite.config.ts
- ✅ tsconfig.json

**제외해야 할 것:**
- ❌ node_modules/
- ❌ .git/
- ❌ dist/
- ❌ .env.local

## 🔄 업데이트 후 확인

1. AI Studio에서 앱 열기
2. 콘솔 확인 (F12)
3. 새 기능 테스트:
   - 🎨 Image Studio 탭 작동 확인
   - 이미지 업로드 테스트
   - 빠른 편집 테스트

## 💡 트러블슈팅

### "빌드 실패"
```bash
# 로컬에서 먼저 테스트
npm run build

# 성공하면 다시 업로드
```

### "모듈을 찾을 수 없음"
```bash
# package.json의 dependencies 확인
# AI Studio에서 자동으로 npm install 실행됨
```

### "API 키 오류"
- AI Studio Settings → Environment Variables
- API_KEY 설정 확인
- 값에 공백 없는지 확인

## 📱 배포 후 공유

배포 완료 후:
```
https://aistudio.google.com/app/[YOUR_APP_ID]

또는

https://ai.studio/apps/drive/[YOUR_APP_ID]
```

링크를 복사해서 팀원들과 공유!

## 🎉 완료!

배포 성공 후:
1. 앱 URL 복사
2. 브라우저에서 열기
3. 모든 기능 테스트
4. 팀원/고객에게 공유

