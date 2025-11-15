# Data Model: Multichain Teleport & Jackpot

## Core Entities

```typescript
interface TeleportState {
    uint32 currentChainId;      // 현재 체인
    uint32 homeChainId;         // 민팅 체인
    uint64 lastTeleportAt;      // 마지막 텔레포트 타임스탬프
    uint256 visitedChainsBitmap;// 최대 256개 체인까지 방문 여부 기록
    uint8 teleportCount;        // 총 텔레포트 횟수
    uint8 uniqueChains;         // 고유 방문 체인 수 (<=32)
    bool isAlive;               // 사망 여부
    bool jackpotEligible;       // Grand Tour 조건 충족 여부
    bool jackpotClaimed;        // 잭팟 수령 여부
}

interface JackpotVault {
    uint256 pool;               // 누적된 CHURR 혹은 ETH
    uint16 jackpotFeeBps;       // 텔레포트/미션 수수료 비율
    uint8 minUniqueChains;      // Grand Tour 목표 (기본 5)
    uint64 lastTopUpAt;
}

interface DailyTreatState {
    mapping(address => uint64) lastClaimAt; // 하루 1회 제한
    uint256 treatAmount;                    // 1회 보상
    address rewardToken;                    // CHURR (ERC20) or Treat token
}

interface TeleportSettings {
    uint16 powerCostPerHop;      // 예: 10
    uint16 minPowerToTeleport;   // 텔레포트 최소 파워
    uint32 teleportCooldown;     // 초 단위
    uint16 baseDeathBps;         // 기본 사망 확률(0-10000)
    uint16 powerSafetyPerPointBps;// 파워당 사망 확률 감소량
}

interface VolatilityCatExtended {
    uint256 tokenId;
    OracleImprint imprint;
    CatGameState game;
    TeleportState teleport;
}
```

## Relationships

- **VolatilityCatExtended.teleport.currentChainId → ChainRegistry**: 체인 ID ↔ 인덱스 매핑 테이블과 연결.
- **TeleportState.visitedChainsBitmap ↔ JackpotVault.minUniqueChains**: 고유 방문 수가 목표 이상이면 잭팟 자격 부여.
- **JackpotVault.pool ↔ Fee Sources**: 텔레포트/미션/claim 트랜잭션의 fee가 vault로 유입.
- **DailyTreatState.lastClaimAt ↔ CHURR token**: treat 지급 시 CHURR balances 전송.

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


