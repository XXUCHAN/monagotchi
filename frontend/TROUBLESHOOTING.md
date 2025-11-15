# Privy 네트워크 연결 문제 해결

## 문제: Privy가 Hardhat Local (Chain ID: 31337)로 연결됨

### 원인
- 환경 변수(`.env`)가 변경되었지만 개발 서버가 재시작되지 않음
- 브라우저 캐시에 이전 설정이 남아있음
- Privy 세션이 이전 네트워크로 연결되어 있음

### 해결 방법

#### 1단계: 개발 서버 완전 재시작
```bash
# 터미널에서 Ctrl+C로 개발 서버 중지
cd /Users/liupei/Desktop/monad-v2/monagotchi/frontend
npm run dev
```

#### 2단계: 브라우저 캐시 클리어
1. **Chrome/Edge**:
   - `Cmd+Shift+Delete` (Mac) / `Ctrl+Shift+Delete` (Windows)
   - "캐시된 이미지 및 파일" 선택
   - "데이터 삭제"
   
2. **Firefox**:
   - `Cmd+Shift+Delete` (Mac) / `Ctrl+Shift+Delete` (Windows)
   - "캐시" 선택
   - "지금 지우기"

#### 3단계: Privy 연결 해제
1. 페이지 새로고침 (`Cmd+Shift+R`)
2. **Logout** 버튼 클릭
3. MetaMask에서 `localhost:5173` 연결 해제:
   - MetaMask → ⋮ 메뉴 → "연결된 사이트" → `localhost:5173` 제거

#### 4단계: 재연결
1. 페이지 다시 로드
2. **Connect** 버튼 클릭
3. MetaMask 팝업에서 네트워크 확인:
   - ✅ **Monad Testnet (Chain ID: 41454)** 이어야 함
   - ❌ Hardhat Local (Chain ID: 31337) 아님

#### 5단계: 콘솔 로그 확인
개발자 도구(F12) → Console에서:
```
🔍 Target Network: testnet
🌐 NETWORK Config: {
  chainId: 41454,
  name: "Monad Testnet",
  rpcUrl: "https://testnet.monad.xyz",
  blockExplorer: "https://explorer.testnet.monad.xyz"
}
⛓️ Custom Chain for Privy: {
  id: 41454,
  name: "Monad Testnet",
  ...
}
🔐 Privy App ID: ✅ Set
```

### 여전히 문제가 있다면

#### 옵션 A: 시크릿/프라이빗 모드 테스트
- Chrome: `Cmd+Shift+N` / `Ctrl+Shift+N`
- Firefox: `Cmd+Shift+P` / `Ctrl+Shift+P`
- 캐시 없는 환경에서 테스트

#### 옵션 B: .env 파일 재확인
```bash
cd /Users/liupei/Desktop/monad-v2/monagotchi/frontend
cat .env
```

다음이 있어야 함:
```
VITE_TARGET_NETWORK=testnet
VITE_TESTNET_CHAIN_ID=41454
VITE_TESTNET_RPC_URL=https://testnet.monad.xyz
```

#### 옵션 C: 빌드 후 재시도
```bash
npm run build
npm run preview
```

### 확인 체크리스트

- [ ] `.env` 파일에 `VITE_TARGET_NETWORK=testnet` 설정
- [ ] 개발 서버 재시작 완료
- [ ] 브라우저 캐시 클리어 완료
- [ ] Privy/MetaMask 연결 해제 후 재연결
- [ ] 콘솔에서 `chainId: 41454` 확인
- [ ] MetaMask 팝업에서 "Monad Testnet" 표시 확인

### 성공 시 화면

MetaMask 서명 요청 화면에:
```
네트워크: Monad Testnet
체인 ID: 41454 (0xa8e6)
```

### 추가 디버깅

만약 계속 문제가 발생하면 다음 정보를 제공해주세요:
1. 콘솔 로그 전체 스크린샷
2. `.env` 파일 내용 (민감정보 제외)
3. `npm run dev` 실행 시 터미널 출력

