# Feature Specification: Volatility Cats

**Feature Branch**: `[001-volatility-cats]`
**Created**: 2025-11-15
**Status**: Draft
**Input**: Monad Testnet + Chainlink Data Feeds + Privy를 활용한 소셜 펫 게임

## User Scenarios & Testing

### Primary User Story

플레이어는 Monad Testnet에서 BTC/ETH 등 여러 클랜 중 하나를 선택해 **Oracle Imprint Cat**을 민팅하고, 민팅 시점의 시장 상태가 새겨진 능력치·성격을 기반으로 미션/룰렛을 수행하여 파워를 키우고 CHURR 토큰 보상을 받는 온체인 다마고치 게임을 즐길 수 있다.

### Acceptance Scenarios

1. Given 사용자가 BTC 클랜을 선택해 민팅을 요청했을 때, When 트랜잭션이 확정되면, Then 새 고양이는 clan=BTC이고 `birthTrendBps`/`birthVolBucket`/`epochId`/`temperament`/`fortuneTier`/`rarityTier`가 Chainlink BTC 가격과 RNG를 기반으로 초기화된다.
2. Given 고양이가 Daily 미션 쿨다운이 끝난 상태일 때, When 해당 클랜의 미션/룰렛 실행을 요청하면, Then 현재 가격·변동성 버킷과 고양이의 temperament·fortuneTier를 반영한 파워 증가량이 적용되고, MissionCompleted 이벤트에 증가량이 기록된다.
3. Given 선택한 클랜의 변동성 버킷이 "High" 이상일 때, When 특수 변동성 룰렛 미션을 실행하면, Then 일반 미션 대비 더 큰 파워 증가 또는 추가 CHURR 보상 중 하나가 확률적으로 지급된다. `[NEEDS CLARIFICATION: High 버킷 기준과 보너스 분포]`
4. Given 고양이 파워가 보상 임계값 이상이고 rewarded=false 일 때, When 보상 수령을 요청하면, Then CHURR 토큰이 1회에 한해 지급되고 rewarded=true로 변경된다.
5. Given SOL, DOGE 등 새로운 클랜이 컨트랙트에 설정되어 있을 때, When 해당 클랜으로 고양이를 민팅하면, Then 올바른 가격 피드와 클랜 메타데이터를 사용해 Oracle Imprint가 생성된다. `[POST-MVP]`

### Edge Cases

-   가격 피드가 0 이하의 비정상 값을 반환하는 경우
-   동일 고양이로 동시에 여러 미션 실행 시도
-   파워 값이 uint32 최대값에 근접한 경우 오버플로우
-   토큰 ID가 매우 큰 값인 경우

## Requirements

### Functional Requirements

-   **FR-001**: 사용자는 BTC, ETH(및 추후 SOL, MONAD 등) 클랜 중 하나를 선택하여 Oracle Imprint Cat을 민팅할 수 있어야 한다.
-   **FR-002**: 각 고양이는 민팅 시점의 시장 상태를 표현하는 Oracle Imprint( clan, temperament, fortuneTier, rarityTier, birthTrendBps, birthVolBucket, epochId, entropy )가 온체인에 기록되어야 한다.
-   **FR-003**: 사용자는 고양이별 Oracle Imprint와 현재 게임 상태(power, 시즌, 룰셋 버전, 보상 여부, 미션 쿨다운)를 조회할 수 있어야 한다.
-   **FR-004**: 각 고양이는 Daily/Weekly/Monthly 미션을 실행할 수 있어야 하며, 미션 실행 시 Chainlink 가격 데이터와 Oracle Imprint, RNG를 활용해 확률적 파워 증가가 적용되어야 한다.
-   **FR-005**: 변동성이 높은 구간(High 이상)에서는 별도의 변동성 룰렛 또는 보너스 로직이 적용되어야 한다. `[POST-MVP]`
-   **FR-006**: 각 미션 타입별 쿨다운이 적용되어 동일 타입 미션을 연속으로 남용할 수 없어야 한다.
-   **FR-007**: 고양이 파워가 설정된 임계값(예: 50) 이상일 때 CHURR 토큰 보상을 1회에 한해 수령할 수 있어야 한다.
-   **FR-008**: 고양이의 clan/Oracle Imprint 구조는 새로운 클랜(예: SOL, DOGE)을 온체인 설정만으로 추가할 수 있도록 설계되어야 한다. `[POST-MVP]`

### Non-Functional Requirements

-   **NFR-001 (Performance)**: 미션 실행 트랜잭션이 30초 이내 완료되어야 한다
-   **NFR-002 (Security)**: 컨트랙트는 OpenZeppelin의 검증된 라이브러리를 사용해야 한다
-   **NFR-003 (Reliability)**: Chainlink 가격 피드 장애 시에도 기본 기능이 유지되어야 한다

## Key Entities

```typescript
// 민팅 시점 시장 상태가 새겨진 Oracle Imprint
interface OracleImprint {
    clan: number; // 클랜: 0=BTC, 1=ETH, 2=SOL, 3=DOGE, 4=PEPE, 5=LINK ...
    temperament: number; // 성격: 0=비관, 1=중립, 2=낙관 ...
    fortuneTier: number; // 포츈: 0=가난, 1=보통, 2=부자 ...
    rarityTier: number; // 희귀도: 0=일반, 1=레어, 2=레전더리 ...
    birthTrendBps: number; // 탄생 시점 가격 변화율(bps)
    birthVolBucket: number; // 변동성 버킷 (0=Low,1=Mid,2=High,...)
    epochId: number; // 몇 번째 시장 에폭에서 태어났는지 (예: timestamp / 1시간)
    entropy: string; // 나중에 교배/스킬에 쓰는 랜덤 시드
}

// 고양이의 게임 상태
interface CatGameState {
    power: number; // 성장하는 능력치
    season: number; // 시즌/버전
    rulesVersion: number; // 이 고양이에 적용된 룰셋 버전
    lastMissionDaily: number; // 마지막 Daily 미션 타임스탬프
    lastMissionWeekly: number; // 마지막 Weekly 미션 타임스탬프
    lastMissionMonthly: number; // 마지막 Monthly 미션 타임스탬프
    rewarded: boolean; // 보상 지급 여부
}

// 온체인 다마고치 고양이
interface OracleImprintCat {
    tokenId: string; // ERC721 토큰 ID
    imprint: OracleImprint; // 탄생 시점 시장 상태
    game: CatGameState; // 현재 게임 상태
    owner: string; // 현재 소유자 주소
}

interface MissionCooldown {
    daily: number; // 남은 Daily 쿨다운 (초)
    weekly: number; // 남은 Weekly 쿨다운 (초)
    monthly: number; // 남은 Monthly 쿨다운 (초)
}
```

## Error Handling

-   **INVALID_CLAN**: 지원하지 않는 clan 값으로 민팅을 시도한 경우
-   **NOT_OWNER**: 고양이 소유자가 아닌 주소에서 함수 호출 시
-   **INVALID_MISSION_TYPE**: missionType이 0, 1, 2가 아닌 경우
-   **DAILY_COOLDOWN**: Daily 미션 쿨다운 중 실행 시도 시
-   **WEEKLY_COOLDOWN**: Weekly 미션 쿨다운 중 실행 시도 시
-   **MONTHLY_COOLDOWN**: Monthly 미션 쿨다운 중 실행 시도 시
-   **POWER_TOO_LOW**: 파워가 50 미만일 때 보상 수령 시도 시
-   **ALREADY_CLAIMED**: 이미 보상을 수령한 고양이로 재수령 시도 시

온체인에서는 `InvalidClan`, `NotTokenOwner`, `InvalidMissionType`, `MissionCooldown`, `PowerTooLow`, `AlreadyClaimed` 커스텀 에러로 구현되며, 오프체인/프론트엔드에서는 위 에러 코드를 사용해 매핑한다.

## Review & Acceptance Checklist

-   [ ] 모든 acceptance criteria가 테스트 가능하고 측정 가능한가?
-   [ ] spec.md에 구현 세부사항(기술 스택)이 포함되지 않았는가?
-   [ ] 모든 모호한 부분이 `[NEEDS CLARIFICATION]`으로 표시되었는가?
-   [ ] 사용자 시나리오가 실제 사용자 여정을 반영하는가?
-   [ ] 에러 케이스와 엣지 케이스가 충분히 고려되었는가?
