# Data Model: Volatility Cats

## Core Entities

```typescript
// 민팅 시점 시장 상태를 담는 Oracle Imprint
interface OracleImprint {
    clan: uint8;            // 클랜 (0=BTC,1=ETH,2=SOL,3=MONAD,...)
    temperament: uint8;     // 성격 (0=비관,1=중립,2=낙관,...)
    fortuneTier: uint8;     // 포츈 티어 (0=가난,1=보통,2=부자)
    rarityTier: uint8;      // 희귀도 티어 (0=일반,1=레어,2=레전더리)
    birthTrendBps: int32;   // 탄생 시점 가격 변화율(bps)
    birthVolBucket: uint32; // 변동성 버킷 (0~N단계)
    epochId: uint64;        // 시장 에폭 ID (예: timestamp / epochWindow)
    entropy: uint64;        // 랜덤 시드 (교배/스킬 등 확장용)
}

// 게임 플레이 상태
interface CatGameState {
    power: uint32;            // 성장하는 능력치
    season: uint16;           // 시즌/버전
    rulesVersion: uint8;      // 적용된 룰셋 버전
    lastMissionDaily: uint64; // 마지막 Daily 미션 타임스탬프
    lastMissionWeekly: uint64;// 마지막 Weekly 미션 타임스탬프
    lastMissionMonthly: uint64;// 마지막 Monthly 미션 타임스탬프
    rewarded: boolean;        // 보상 수령 여부 (고양이당 1회 제한)
}

// 온체인 다마고치 고양이
interface VolatilityCat {
    // ERC721 토큰 식별자
    tokenId: uint256;

    // 탄생 시점 시장 상태
    imprint: OracleImprint;

    // 현재 게임 상태
    game: CatGameState;

    // 소유자 주소 (ERC721에서 파생)
    owner: address;
}

interface ChurrToken {
    // 표준 ERC20 토큰
    name: "Churr";
    symbol: "CHURR";
    decimals: 18;
    totalSupply: uint256;
}
```

## Relationships

- **VolatilityCat.imprint.clan → PriceFeed**: clan별 Chainlink 가격 피드 연결
- **VolatilityCat.game.power → ChurrToken**: 고양이 파워가 임계값 이상일 때 CHURR 토큰 보상
- **Owner → VolatilityCat**: ERC721 소유권 관계 (1:N)

## Validation Rules

### VolatilityCat / OracleImprint
- `imprint.clan`: 0(BTC), 1(ETH)만 MVP에서 사용, 확장 가능 (SOL, MONAD 등)
- `imprint.temperament`: 0(비관), 1(중립), 2(낙관) 중 하나
- `imprint.fortuneTier`: 0(가난), 1(보통), 2(부자) 중 하나
- `imprint.rarityTier`: 0(일반), 1(레어), 2(레전더리) 중 하나
- `imprint.birthTrendBps`: -10000 ≤ birthTrendBps ≤ 10000 (±100% 범위, `_calculatePriceTrend`에서 엔트로피와 가격을 기반으로 산출)
- `imprint.birthVolBucket`: 0=Low, 1=Mid, 2=High (Chainlink 가격의 하위 비트로부터 `price % 3`으로 계산)
- `imprint.epochId`: `block.timestamp / epochWindow` (기본값으로 3600초(1시간) 기준 에폭, 배포 시 epochWindow 설정 가능)
- `game.power`: 0 ≤ power ≤ 2^32-1
- `game.season`: 0 이상 정수, 시즌 변경 시 증가
- `game.rulesVersion`: 룰셋 변경 시 증가 (예: v1=기본, v2=변동성 룰렛 추가)
- `game.lastMission*`: 유닉스 타임스탬프 (초 단위)
- `game.rewarded`: false → true로만 변경 가능
- `tokenId`: 순차 증가 (0부터 시작)

### Mission Execution
- 소유자만 미션 실행 가능
- 쿨다운 시간 준수:
  - Daily: 12시간
  - Weekly: 7일 (604800초)
  - Monthly: 30일 (2592000초)
- Chainlink 가격 데이터 사용 가능성 검증

### Reward Claim
- 파워 ≥ 50 필수
- rewarded = false 필수
- 소유자만 청구 가능

## Indexes & Query Patterns

### Primary Queries
- `cats[tokenId]`: 토큰별 고양이 정보 조회 (O(1))
- `ownerOf(tokenId)`: ERC721 표준 소유자 조회
- `getRemainingCooldown(tokenId, missionType)`: 쿨다운 잔여시간 계산

### Batch Queries
- 전체 고양이 목록: 지원하지 않음 (가스 비용 이슈)
- 소유자별 고양이 목록: ERC721 enumerable 확장 고려 가능

## Migration Strategy (initial/load cadence)

### 초기 배포
- 컨트랙트 생성자에서 가격 피드 주소 설정
- nextTokenId = 0 초기화
- 상수 값들 하드코딩

### 데이터 마이그레이션
- 현재 버전은 마이그레이션 지원하지 않음
- 향후 버전에서 필요한 경우:
  - 새 컨트랙트 배포
  - 기존 토큰 burn/mint로 이전
  - 상태 데이터 별도 마이그레이션 컨트랙트 사용

## Caching Strategy (keys/TTL)

### On-Chain Storage
- 모든 데이터 영구 저장 (블록체인 특성)
- 가격 데이터: Chainlink에서 실시간 조회 (캐싱 불필요)

### Off-Chain Caching
- 프론트엔드에서:
  - 고양이 데이터: localStorage (1시간 TTL)
  - 쿨다운 상태: 메모리 캐시 (실시간 업데이트)
  - 토큰 잔액: wallet provider 캐시 활용

## Backup & Recovery

### 데이터 백업
- 블록체인 네이티브: 모든 트랜잭션 영구 기록
- 이벤트 로그 백업:
  - CatMinted: 민팅 기록
  - MissionCompleted: 미션 실행 기록
  - RewardClaimed: 보상 지급 기록

### 복구 전략
- 스마트 컨트랙트 재배포 시:
  1. 이벤트 로그에서 상태 재구성
  2. 소유자별 토큰 ID 목록 복원
  3. 마지막 미션 타임스탬프 복원
  4. 보상 상태 복원

### 장애 대응
- Chainlink 피드 장애 시:
  - 미션 실행 실패 (fallback 없음)
  - 기존 데이터 보존
  - 피드 복구 후 정상 동작
