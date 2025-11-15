# Data Model: Multichain Teleport & Jackpot

## Core Entities

```typescript
interface TeleportState {
    uint32 currentChainId;        // 기본 0 (home)
    uint32 visitedChainsBitmap;   // bit i == 1 → 체인 i 방문
    uint8 teleportCount;          // 총 hop 수
    uint8 uniqueChainsVisited;    // 고유 방문 체인 수
    uint64 lastTeleportAt;        // 쿨다운 계산용
    bool isAlive;                 // Post-MVP death flag
    bool jackpotEligible;         // Grand Tour 목표 달성 여부
}

interface JackpotState {
    uint256 balance;   // 누적 CHURR
    bool claimed;      // 이미 지급 여부
    address winner;    // Grand Tour 최초 달성자
    uint8 targetChains;// 기본 5
}

interface JackpotFeeConfig {
    uint256 mintFee;      // 1 CHURR
    uint256 missionFee;   // 0.2 CHURR
    uint256 teleportFee;  // 1 CHURR
}

interface VolatilityCatExtended {
    uint256 tokenId;
    OracleImprint imprint;
    CatGameState game;
    TeleportState teleport;
    address owner;
}
```

## Relationships

- **VolatilityCatExtended.teleport.currentChainId**: 체인 인덱스는 0(홈)~5(원정)까지 하드코딩.
- **TeleportState.visitedChainsBitmap ↔ JackpotState.targetChains**: 고유 방문 수가 목표 이상이면 잭팟 자격 부여.
- **JackpotState.balance ↔ Fee Sources**: 민팅/미션/텔레포트 시 mint한 CHURR이 컨트랙트에 누적된다.

## Validation Rules

- `powerCostPerHop`: 1 ≤ value ≤ 100, 기본 10.
- `minPowerToTeleport`: `powerCostPerHop` 이상이어야 함.
- `visitedChainsBitmap`: 체인 인덱스는 0~63 (MVP), 상위 비트 사용 시 config 필요.
- `teleportCount`: uint8, overflow 방지를 위해 255에서 캡.
- `uniqueChains`: `<= popcount(visitedChainsBitmap)` 조건 유지.
- `teleportCooldown`: 최소 60초, 최대 24시간.
- `baseDeathBps`: 0~10000, `powerSafetyPerPointBps`와의 곱이 음수가 되지 않도록 검증.
- `jackpotFeeBps`: 0~10000; fee 합계가 100% 초과하지 않도록 다른 수수료와 조정.
- `DailyTreatState`는 주소별 24시간(86400초) 쿨다운 적용.
- `JackpotVault.pool`: 0 이상, 잔액을 외부로 이전할 때 reentrancy guard 필요.

## Indexes & Query Patterns

- `teleportStates[tokenId]`: 고양이별 텔레포트 상태 (O(1))
- `visitedChainsBitmap`: popcount를 통해 고유 방문 체인 수 계산.
- `jackpotVault.pool`: 단일 상태 변수 조회 -> 프론트엔드 잔액 표시.
- `dailyTreat.lastClaimAt[owner]`: 주소별 쿨다운 조회.

## Migration Strategy

- **초기화**: 기존 고양이는 첫 텔레포트 시 `TeleportState`가 생성되며 `visitedChainsBitmap`에 home chain이 기록된다.
- **데이터 이전**: 필요 시 `bootstrapTeleportState(tokenId[])` 스크립트로 일괄 초기화 가능.
- **JackpotVault**: 배포 스크립트에서 초기 `pool = 0`, `jackpotFeeBps`, `minUniqueChains` 설정.
- **Treat Token**: CHURR를 재사용하거나 별도 Treat 토큰 도입 시 `rewardToken` 주소 업데이트 및 승인 절차 필요.

## Caching Strategy

- **온체인**: 모든 상태는 영구 저장. 비트맵 연산 비용을 줄이기 위해 TeleportLib에서 inline assembly 없이 pure Solidity로 구현.
- **오프체인**: 프론트엔드는 `TeleportPerformed` 이벤트를 인덱싱해 방문 이력을 복구하고, `JackpotClaimed`로 잔액 스냅샷을 유지.

## Backup & Recovery

- **이벤트 로그**: `TeleportPerformed`, `CatMortality`, `JackpotReady`, `JackpotClaimed`, `DailyTreatGranted`, `FeeSkimmed` 이벤트 로그로 상태 재구성 가능.
- **금고 잔액**: 컨트랙트 잔액 조회 혹은 `jackpotVault.pool`로 파악. 재배포 시 잔액을 새 컨트랙트로 이관하는 마이그레이션 스크립트 필요.
- **Treat 지급**: `DailyTreatGranted` 이벤트를 통해 중복 지급 여부를 재계산할 수 있음.


