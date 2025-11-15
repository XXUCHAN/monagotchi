# Volatility Cats Frontend

React + Vite 대시보드로 VolatilityCats/ChurrToken 컨트랙트를 호출합니다.  
`VITE_TARGET_NETWORK` 값에 따라 **Monad Testnet(dev)** 또는 **Hardhat Localhost(local)** 로 전환할 수 있습니다.

---

## 0. 한눈에 보는 사용 가이드

| 사용처 | 목적 | 체크리스트 |
| --- | --- | --- |
| **Local Dev (Hardhat)** | 빠른 기능 개발 및 UI 검증 | ① `npx hardhat node` ② `npm run deploy:local` ③ `npm run build:abi` ④ `.env`에서 `VITE_TARGET_NETWORK=local` ⑤ `npm run dev` |
| **Dev/Testnet (Monad)** | 실 배포 버전 테스트 | ① `.env`에 RPC/키/피드 입력 ② `npm run deploy` ③ `npm run build:abi` ④ 프런트 `.env`에 주소 입력 ⑤ `npm run dev` |
| **상태/스모크** | 잔액·고양이·CHURR 확인 | `npm run account:info`, `npm run test:live` (contracts 디렉터리) |

아래 섹션에서 각각의 상세 절차를 확인하세요.

---

## 1. 환경 변수

`.env.example`을 복사해서 원하는 네트워크에 맞게 채워 주세요.

```bash
cp .env.example .env
```

필수 변수

| 변수 | 설명 |
| --- | --- |
| `VITE_TARGET_NETWORK` | `testnet` (기본) 또는 `local` |
| `VITE_CATS_CONTRACT_ADDRESS`, `VITE_CHURR_CONTRACT_ADDRESS` | Testnet 배포 주소 |
| `VITE_RPC_URL`, `VITE_CHAIN_ID`, `VITE_EXPLORER_URL` | Testnet RPC/Chain 정보 |
| `VITE_LOCAL_RPC_URL`, `VITE_LOCAL_CHAIN_ID` | 로컬 Hardhat 노드 정보 (선택) |

`VITE_TARGET_NETWORK=local` 인 경우 `frontend/src/abi/local-addresses.json`에 있는 주소를 사용합니다.  
이 파일은 로컬 배포 스크립트가 자동으로 갱신합니다.

---

## 2. Local 환경 (Hardhat)

> 목표: 프론트+컨트랙트를 한 번에 띄워 로컬에서 개발/디버깅

1. **하드햇 노드 실행**
   ```bash
   cd contracts
   npx hardhat node
   ```
2. **새 터미널에서 로컬 배포 + ABI 추출**
   ```bash
   cd contracts
   npm run deploy:local          # localhost에 배포 (addresses → deployments/local.json)
   npm run build:abi             # ABI + local-addresses.json 동기화
   ```
3. **프론트엔드 설정(`VITE_TARGET_NETWORK=local`)**
   ```bash
   cd ../frontend
   cp .env.example .env
   # .env 파일에서 VITE_TARGET_NETWORK=local 로 지정
   npm install
   npm run dev
   ```
4. **Metamask/Privy 지갑**
   - Hardhat 노드 계정을 Metamask에 import 하거나 Privy Gas Tank를 끈 상태에서 직접 서명합니다.
   - 프론트에서 `mint`, `runMission`, `claimReward` 버튼이 로컬 컨트랙트와 바로 상호작용합니다.

> `npm run deploy:local`을 다시 실행하면 `frontend/src/abi/local-addresses.json`이 최신 주소로 갱신되어 프론트가 자동으로 새 컨트랙트와 통신합니다.

---

## 3. Dev/Testnet(=Monad) 워크플로우

1. **컨트랙트 배포**
   ```bash
   cd contracts
   npm run deploy           # MONAD_PRIVATE_KEY 및 feed 주소를 .env 에 설정해야 함
   npm run build:abi
   ```
2. **프론트 설정**
   ```bash
   cd ../frontend
   cp .env.example .env
   # VITE_TARGET_NETWORK=testnet
   # VITE_CATS_CONTRACT_ADDRESS / VITE_CHURR_CONTRACT_ADDRESS 에 배포 주소 입력
   npm install
   npm run dev
   ```
3. **지갑 네트워크 스위치**
   - `useWallet` 훅의 `switchNetwork()`를 호출하면 Metamask에 Monad Testnet 체인을 추가/스위치합니다.
   - Privy Gas Tank를 사용하면 사용자의 가스 없이 트랜잭션 서명이 가능합니다.

---

## 4. 유용한 스크립트

| 스크립트 | 설명 |
| --- | --- |
| `npm run deploy:local` (contracts) | Hardhat 로컬 배포 + 주소 기록 + `local-addresses.json` 갱신 |
| `npm run build:abi` (contracts) | Hardhat compile + ABI/주소 export |
| `npm run test:live` (contracts) | Testnet 컨트랙트 스모크 테스트 |
| `npm run account:info` (contracts) | 잔액 + 보유 고양이 + CHURR 현황 |

---

## 5. 트러블슈팅

- 로컬 연결이 안 될 때
  - Hardhat 노드가 켜져 있는지, `VITE_LOCAL_RPC_URL`이 올바른지 확인합니다.
  - `frontend/src/abi/local-addresses.json`에 최신 주소가 있는지 확인합니다.
- 컨트랙트 주소가 빈 문자열로 표시될 때
  - `.env`에서 올바르게 설정했는지 또는 로컬 JSON이 갱신되었는지 확인하세요.

필요한 추가 기능이나 문서화 항목이 있으면 README를 계속 갱신해 주세요. 🔥
