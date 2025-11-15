# Frontend 준비 상태 체크리스트

**날짜**: 2025-11-15
**상태**: 🟢 95% 완료 - 컨트랙트 연동 준비 완료!

---

## ✅ 완료된 항목

### 1. 기본 설정

- ✅ Privy 인증 설정
- ✅ Tailwind CSS 글라스모피즘 디자인 시스템
- ✅ TypeScript 설정 (`resolveJsonModule` 추가)
- ✅ ESLint + Prettier 통합
- ✅ Vite 로컬 서버 설정

### 2. 컨트랙트 연동

- ✅ ABI 파일 생성 (`VolatilityCats.json`, `ChurrToken.json`)
- ✅ 환경 변수 구조 (`.env.example`)
- ✅ `useWallet` 훅 (Privy + Ethers 통합)
- ✅ `useContract` 기본 훅
- ✅ 컨트랙트 함수명 매핑:
    - `mintRandomCat()` ✅
    - `runMission()` ✅
    - `claimReward()` ✅
    - `getCat()` ✅
    - `balanceOf()` ✅

### 3. 타입 정의

- ✅ `OracleImprint` 인터페이스
- ✅ `CatGameState` 인터페이스
- ✅ `Cat` 인터페이스
- ✅ `MissionType` enum
- ✅ `Alignment` enum (6개 클랜)

### 4. 상수 및 유틸

- ✅ 쿨다운 시간 (12h, 7d, 30d)
- ✅ Chainlink Price Feeds (6개)
- ✅ 게임 상수 (`POWER_THRESHOLD`, `REWARD_AMOUNT`)
- ✅ Helper 함수들 (`formatTimeRemaining`, `shortenAddress`, etc.)

### 5. UI 컴포넌트

- ✅ Header (fixed)
- ✅ Dashboard
- ✅ HeroSection
- ✅ FeatureCard
- ✅ MissionCard
- ✅ StatsCard

---

## ⚠️ 추가 작업 필요

### 1. **컨트랙트 함수 확장** (중요도: 높음)

현재 `useContract.ts`에 **누락된 컨트랙트 함수들**:

```typescript
// 추가 필요
- getOracleImprint(tokenId: bigint)      // Oracle Imprint 상세 조회
- getGameState(tokenId: bigint)          // Game State 조회
- getRemainingCooldown(tokenId, missionType) // 쿨다운 시간 조회
- rewardAmount()                         // 보상 금액 조회 (10 CHURR)
```

**이유**:

- `getOracleImprint`: 고양이의 성격, 희귀도, 변동성 정보 표시에 필요
- `getRemainingCooldown`: 미션 쿨다운 UI 표시에 필수
- `rewardAmount`: 동적 보상 금액 표시

---

### 2. **에러 핸들링 시스템** (중요도: 높음)

**현재 상태**:

- `react-hot-toast` 설치됨 ✅
- 에러 매핑 로직 없음 ❌

**필요 작업**:

```typescript
// src/utils/contractErrors.ts (신규 파일)
export const CONTRACT_ERRORS = {
    InvalidClan: '지원하지 않는 클랜입니다',
    NotTokenOwner: '고양이 소유자만 실행할 수 있습니다',
    MissionCooldown: '미션 쿨다운 중입니다',
    PowerTooLow: '파워가 부족합니다 (최소: 50)',
    AlreadyClaimed: '이미 보상을 받았습니다',
};

export function parseContractError(error: any): string {
    // Ethers v6 에러 파싱
    if (error.reason) return CONTRACT_ERRORS[error.reason] || error.reason;
    // Custom error 파싱
    const match = error.message?.match(/reverted with custom error '(\w+)'/);
    if (match) return CONTRACT_ERRORS[match[1]] || match[1];
    return '트랜잭션이 실패했습니다';
}
```

**useContract.ts에 적용**:

```typescript
import { toast } from 'react-hot-toast';
import { parseContractError } from '../utils/contractErrors';

const mintCat = async (clan: number) => {
    try {
        const contract = await getCatsContractWithSigner();
        const tx = await contract.mintRandomCat(clan);
        toast.loading('민팅 중...', { id: tx.hash });
        await tx.wait();
        toast.success('고양이가 민팅되었습니다!', { id: tx.hash });
        return tx;
    } catch (error) {
        const message = parseContractError(error);
        toast.error(message);
        throw error;
    }
};
```

---

### 3. **환경 설정** (중요도: 중간)

**누락 항목**:

1. **MONAD 클랜 추가** (Spec에 언급됨)

```typescript
// constants.ts에 추가
export const CLAN = {
    BTC: 0,
    ETH: 1,
    SOL: 2,
    LINK: 3,
    DOGE: 4,
    PEPE: 5,
    MONAD: 6, // ← 추가 필요 (POST-MVP)
};

export const PRICE_FEEDS = {
    // ...
    MONAD_USD: '0x...', // 배포 후 추가
};
```

2. **DOGE Price Feed 확인**

- `testnet-datastream.json`에 DOGE 없음 (but `constants.ts`에는 있음)
- **Action**: contracts 폴더 testnet-datastream.json 업데이트 필요

---

### 4. **UI 컴포넌트 확장** (중요도: 중간)

**필요한 컴포넌트**:

1. **CatDetailModal** - 고양이 상세 정보 표시

    ```typescript
    - OracleImprint (clan, temperament, fortune, rarity)
    - birthTrendBps, birthVolBucket, epochId
    - 현재 power, 보상 수령 여부
    ```

2. **MissionCooldownTimer** - 미션 쿨다운 표시

    ```typescript
    - getRemainingCooldown() 사용
    - 실시간 카운트다운
    ```

3. **TransactionToast** - 트랜잭션 진행 상태

    ```typescript
    - pending: "트랜잭션 처리 중..."
    - success: "성공! [Explorer 보기]"
    - error: "실패: [에러 메시지]"
    ```

4. **ErrorBoundary** - React 에러 처리

---

### 5. **테스트 및 검증** (중요도: 높음)

**체크리스트**:

- [ ] `.env` 파일 생성 및 `VITE_PRIVY_APP_ID` 설정
- [ ] 컨트랙트 배포 후 주소 설정:
    - `VITE_CATS_CONTRACT_ADDRESS`
    - `VITE_CHURR_CONTRACT_ADDRESS`
- [ ] Privy 대시보드에서 허용 도메인 추가:
    - `localhost:5173`
    - `192.168.x.x:5173` (모바일 테스트 시)
- [ ] 개발 서버 실행 테스트
- [ ] Privy 로그인 테스트
- [ ] 컨트랙트 연동 테스트 (Testnet 배포 후)

---

### 6. **문서화** (중요도: 낮음)

- [ ] 컴포넌트 사용법 문서
- [ ] 환경 변수 설정 가이드
- [ ] 배포 가이드

---

## 📊 우선순위 추천

### 🔴 High Priority (즉시 작업) - ✅ 완료!

1. ✅ 컨트랙트 함수 추가 (`getOracleImprint`, `getRemainingCooldown`, `getGameState`, `getRewardAmount`)
2. ✅ 에러 핸들링 시스템 (`contractErrors.ts`)
3. ✅ Toast 통합 (모든 write 함수에 적용)
4. ✅ Toaster 컴포넌트 App에 추가
5. ⏳ `.env` 파일 설정 (컨트랙트 배포 대기 중)

### 🟡 Medium Priority (이번 주)

4. CatDetailModal 컴포넌트
5. MissionCooldownTimer 컴포넌트
6. MONAD 클랜 추가 (POST-MVP)

### 🟢 Low Priority (여유 시)

7. TransactionToast 고도화
8. ErrorBoundary
9. 문서화

---

## 🚀 다음 단계

1. **Agent 모드에서 실행**:

    ```bash
    # 1. 컨트랙트 함수 추가
    # 2. 에러 핸들링 시스템 구축
    # 3. Toast 통합
    ```

2. **수동 작업**:
    - Privy App ID 발급 및 `.env` 설정
    - 컨트랙트 배포 (contracts 폴더)
    - 배포된 주소를 `.env`에 추가

3. **테스트**:
    ```bash
    npm run dev
    # 브라우저에서 localhost:5173 확인
    # Privy 로그인 테스트
    ```

---

**마지막 업데이트**: 2025-11-15
**작성자**: AI Agent
