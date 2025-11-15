# Monad Testnet 연결 가이드

## 1. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Privy Configuration
VITE_PRIVY_APP_ID=your_privy_app_id_here

# Network Configuration - Monad Testnet 사용
VITE_TARGET_NETWORK=testnet

# Monad Testnet
VITE_TESTNET_RPC_URL=https://rpc.testnet.monad.xyz
VITE_TESTNET_CHAIN_ID=41454
VITE_TESTNET_CHAIN_NAME=Monad Testnet
VITE_TESTNET_EXPLORER_URL=https://explorer.testnet.monad.xyz

# Smart Contract Addresses (Deployed on Monad Testnet)
VITE_TESTNET_CATS_ADDRESS=0x8a062D558ea29DF60EA4a185DdC2069426dEb1Fd
VITE_TESTNET_CHURR_ADDRESS=0xBF0ad8513dCf383aBacb5A41775bd2C42C26DdE9

# Chainlink Price Feeds (Monad Testnet)
VITE_BTC_USD_FEED=0x2Cd9D7E85494F68F5aF08EF96d6FD5e8F71B4d31
VITE_ETH_USD_FEED=0x0c76859E85727683Eeba0C070Bc2e0F57B1337818
VITE_LINK_USD_FEED=0x46820359650Cd2D88759193ee26600d8A0766e1391
VITE_SOL_USD_FEED=0x1c2f27C736aC97886F017AbdEedEd81C3C38Af73e
VITE_DOGE_USD_FEED=0x7F1c8B16B1a16AA5a8e720dA162f0d9191f2e6EC5
VITE_PEPE_USD_FEED=0x5db2F4591D04CABC9eE5C4016e9477A80d383D298
```

## 2. Privy App ID 발급

1. https://dashboard.privy.io/ 접속
2. 새 앱 생성 (Create New App)
3. App ID 복사
4. `.env` 파일의 `VITE_PRIVY_APP_ID`에 붙여넣기
5. **App Settings**에서 다음 도메인 추가:
   - `http://localhost:5173`
   - `http://localhost:4173`
   - 배포 도메인 (예: `https://yourdomain.com`)

## 3. MetaMask에 Monad Testnet 추가

### 자동 추가 (권장)
프론트엔드 실행 후 지갑 연결 시 자동으로 네트워크 추가 요청이 표시됩니다.

### 수동 추가
MetaMask → 네트워크 추가 → 수동으로 네트워크 추가:

```
Network Name: Monad Testnet
RPC URL: https://rpc.testnet.monad.xyz
Chain ID: 41454
Currency Symbol: MON
Block Explorer URL: https://explorer.testnet.monad.xyz
```

## 4. Privy 설정 확인

`src/main.tsx`에서 자동으로 설정됩니다:

```typescript
<PrivyProvider
  appId={privyAppId}
  config={{
    loginMethods: ['email', 'google', 'wallet'],
    appearance: {
      theme: 'dark',
      accentColor: '#fb5a49', // Monagotchi 브랜드 컬러
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
    },
    defaultChain: customChain,      // Monad Testnet (41454)
    supportedChains: [customChain],
  }}
>
```

## 5. 실행 및 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# http://localhost:5173
```

### 콘솔 로그 확인

브라우저 개발자 도구(F12) → Console에서 다음 로그 확인:

```
🔍 Target Network: testnet
🌐 NETWORK Config: { chainId: 41454, name: "Monad Testnet", ... }
📝 Contract Addresses: { CATS: "0x8a062...", CHURR: "0xBF0ad..." }
⛓️ Custom Chain for Privy: { id: 41454, name: "Monad Testnet", ... }
🔐 Privy App ID: ✅ Set
```

## 6. 로컬 개발으로 전환 (선택)

테스트를 위해 로컬 Hardhat 네트워크로 전환하려면:

```bash
# .env 파일 수정
VITE_TARGET_NETWORK=local

# Hardhat 노드 실행 (contracts 디렉토리)
cd ../contracts
npx hardhat node

# 다른 터미널에서 컨트랙트 배포
npx hardhat run scripts/deploy.js --network localhost
```

## 7. 문제 해결

### Privy App ID 오류
```
❌ VITE_PRIVY_APP_ID is not set!
```
→ `.env` 파일에 `VITE_PRIVY_APP_ID` 추가

### 네트워크 연결 실패
```
Unable to connect to Monad Testnet
```
→ MetaMask에서 네트워크 수동 추가
→ RPC URL이 올바른지 확인

### 컨트랙트 주소 오류
```
Contract not deployed at address...
```
→ 컨트랙트 주소가 올바른지 확인
→ 백엔드 `.env`의 주소와 일치하는지 확인

## 8. 배포된 컨트랙트 정보

### Monad Testnet

- **VolatilityCats (NFT)**: `0x8a062D558ea29DF60EA4a185DdC2069426dEb1Fd`
- **ChurrToken (ERC20)**: `0xBF0ad8513dCf383aBacb5A41775bd2C42C26DdE9`

### Price Feeds (Chainlink)

- BTC/USD: `0x2Cd9D7E85494F68F5aF08EF96d6FD5e8F71B4d31`
- ETH/USD: `0x0c76859E85727683Eeba0C070Bc2e0F57B1337818`
- SOL/USD: `0x1c2f27C736aC97886F017AbdEedEd81C3C38Af73e`
- DOGE/USD: `0x7F1c8B16B1a16AA5a8e720dA162f0d9191f2e6EC5`
- PEPE/USD: `0x5db2F4591D04CABC9eE5C4016e9477A80d383D298`

## 9. 참고 링크

- Monad Testnet Explorer: https://explorer.testnet.monad.xyz
- Privy Dashboard: https://dashboard.privy.io/
- Monad Docs: https://docs.monad.xyz/

## 10. 네트워크 자동 전환

프론트엔드는 `NetworkGuard` 컴포넌트를 통해 자동으로 올바른 네트워크로 전환을 시도합니다.
로그인 후 1초 뒤에 자동 전환이 실행되며, 실패 시 사용자가 수동으로 MetaMask에서 전환할 수 있습니다.

