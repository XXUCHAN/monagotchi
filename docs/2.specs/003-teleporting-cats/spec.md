# Feature Specification: Multichain Teleport & Jackpot

**Feature Branch**: `[003-teleporting-cats]`
**Created**: 2025-11-15
**Status**: Draft
**Input**: 고양이를 다중 체인 사이로 텔레포트시키고 누적 보상을 거는 하이 리스크 미션을 추가해야 한다.

## User Scenarios & Testing

### Primary User Story

플레이어는 이미 보유한 Volatility Cat을 체인 간 텔레포트 미션에 참여시켜 다른 체인의 미션에 도전할 수 있다. 텔레포트할 때마다 파워가 소모되고 고양이가 사망할 확률이 있지만, 충분한 파워를 유지하면서 5개 체인을 모두 순회하면 잭팟 금고에 쌓인 수수료·보상을 전부 가져가는 “Multichain Grand Tour”를 완수할 수 있다. Daily 미션을 성공한 플레이어는 고양이에게 츄르(CHURR) 보상을 추가로 받고, 모든 트랜잭션의 일부 수수료는 잭팟 금고에 적립된다.

### Acceptance Scenarios

1. **Teleport Power Cost**  
   Given 텔레포트 설정의 `powerCostPerHop`이 10으로 설정되어 있고 고양이 파워가 60일 때, When 사용자가 다른 체인으로 텔레포트를 실행하면, Then 파워는 50으로 감소하고 `TeleportPerformed` 이벤트가 기록된다.
2. **Death Probability Scaling**  
   Given 고양이 파워가 15이고 `baseDeathBps`가 2000(20%)이며 `powerSafetyPerPointBps`가 50일 때, When 텔레포트를 수행하면, Then 컨트랙트는 `deathChance = max(0, baseDeathBps - power*powerSafetyPerPointBps)`를 계산해 사망 여부를 결정하며, 죽으면 `CatMortality` 이벤트와 함께 파워가 0으로 고정된다. `[NEEDS CLARIFICATION: 정확한 사망 확률 곡선과 최소/최대 보정치]`
3. **Unique Chain Tracking & Jackpot Eligibility**  
   Given `teleportState.visitedChainsBitmap`가 4번째 체인까지 방문을 기록하고 있을 때, When 플레이어가 아직 방문하지 않은 5번째 체인으로 텔레포트를 완료하면, Then `visitedChainsBitmap`가 업데이트되고 `jackpotEligible=true`가 되며 `JackpotReady` 이벤트가 발생한다.
4. **Jackpot Claim After Grand Tour**  
   Given 고양이가 `jackpotEligible == true`이고 `jackpotState.pool`에 2,000 CHURR가 쌓여 있을 때, When 소유자가 `claimJackpot(tokenId)`를 호출하면, Then 풀 잔액이 소유자에게 이전되고 `jackpotState.pool`이 0이 되며 `JackpotClaimed(tokenId, amount)` 이벤트가 나온다.
5. **Daily Treat Bonus**  
   Given 플레이어가 Daily 미션을 성공적으로 완료했을 때, When `grantDailyTreat(owner)`가 실행되면, Then 해당 사용자 지갑으로 `treatAmount` 만큼의 CHURR 혹은 츄르 토큰이 전송되고 `DailyTreatGranted(owner, amount)` 이벤트가 기록된다. `[NEEDS CLARIFICATION: treatAmount 및 별도 토큰 사용 여부]`
6. **Fee Accrual To Jackpot Vault**  
   Given 텔레포트 혹은 다른 유료 트랜잭션이 실행될 때, When `msg.value` 혹은 CHURR 수수료 중 `jackpotFeeBps`에 해당하는 금액이 계산되면, Then 해당 금액이 `jackpotVault.pool`에 적립되고 `FeeSkimmed(amount, source)` 이벤트가 발생한다.
7. **Teleport Cooldown & Power Floor**  
   Given 텔레포트가 방금 실행되어 `teleportCooldown`이 1시간으로 설정되어 있을 때, When 같은 고양이로 즉시 텔레포트를 재시도하면, Then `TeleportCooldown` 에러와 함께 revert된다.  

### Edge Cases

- 이미 사망했거나 파워가 `powerCostPerHop` 미만인 고양이를 텔레포트하려는 경우
- 동일 체인을 중복 방문했을 때 unique chain 카운트가 증가하지 않아야 함
- 텔레포트 중 revert 후 수수료가 과금되었는지 여부 (payable 함수 처리)
- 잭팟 풀 잔액이 0이거나 이전 트랜잭션에서 이미 청구된 경우
- Daily Treat 보상이 하루에 여러 번 청구되는 것을 차단
- 다양한 체인 ID가 5개 미만으로 설정된 경우 Grand Tour 달성 불가 시나리오

## Requirements

### Functional Requirements

- **FR-001**: 각 고양이는 `teleportState` 구조체로 `currentChainId`, `teleportCount`, `visitedChainsBitmap`, `isAlive`, `jackpotEligible`, `lastTeleportAt` 정보를 가진다.
- **FR-002**: `teleportToChain(uint256 tokenId, uint32 chainId, bytes proof)` 함수는 소유자만 호출할 수 있으며, 설정된 `teleportCooldown`을 준수하고 `powerCostPerHop` 이상 파워가 있어야 한다.
- **FR-003**: 텔레포트 성공 시 고양이 파워에서 `powerCostPerHop`만큼 차감되고, 실패 시 파워는 변하지 않아야 한다.
- **FR-004**: 텔레포트마다 사망 확률을 계산해 RNG 결과가 사망일 경우 `isAlive`를 false로 바꾸고 더 이상 텔레포트/미션을 실행할 수 없게 한다.
- **FR-005**: 체인 방문 상태는 비트맵 혹은 Set으로 관리하여 중복 방문을 허용하되 unique 방문 수는 최대 32개까지 추적한다.
- **FR-006**: 고양이가 `minUniqueChains` (기본 5) 이상 방문하면 `jackpotEligible`가 true가 되고 `JackpotReady` 이벤트가 방출된다.
- **FR-007**: `claimJackpot(uint256 tokenId)`는 `jackpotEligible`이고 `isAlive`인 고양이만 호출할 수 있으며, 금고 잔액을 전부 소유자에게 이전하고 `jackpotClaimedAt` 타임스탬프를 기록한다.
- **FR-008**: 모든 텔레포트, Daily Treat 지급, 기타 pay-in 액션에 대해 `jackpotFeeBps` 비율만큼의 수수료가 누적되어 `jackpotVault.pool`에 저장된다. `[NEEDS CLARIFICATION: fee는 ETH vs CHURR 중 무엇으로 적립되는지]`
- **FR-009**: Daily 미션 성공 시 `grantDailyTreat(address player)`가 자동 호출되어 CHURR(또는 별도 Treat 토큰)을 전송하며, 하루 1회 제한이 있다.
- **FR-010**: 텔레포트 이력(`teleportLog`)은 이벤트 로그에 최소 (tokenId, fromChain, toChain, powerBefore, powerAfter, died) 정보를 남겨야 한다.
- **FR-011**: 관리자(Owner)는 `updateTeleportRules` 함수를 통해 `powerCostPerHop`, `minPowerToTeleport`, `deathCurve`, `jackpotFeeBps`, `minUniqueChains` 등을 조정할 수 있어야 한다.
- **FR-012**: 모든 변동은 기존 `VolatilityCats` 데이터 구조와 역호환성을 유지해야 하며, 기존 고양이에게 기본 텔레포트 상태를 lazy-init 방식으로 부여한다.

### Non-Functional Requirements

- **NFR-001 (Gas)**: 텔레포트 트랜잭션 가스 사용량 250k 이하, 잭팟 청구 200k 이하를 목표로 한다.
- **NFR-002 (Fairness)**: RNG는 Chainlink VRF/PriceFeed 엔트로피를 재사용하되, 동일 블록 두 번 호출 시에도 편향이 없어야 한다.
- **NFR-003 (Safety)**: 관리자 파라미터 변경은 2-step(announce + apply) 혹은 timelock을 고려한다. `[NEEDS CLARIFICATION: timelock 필요 여부]`
- **NFR-004 (Observability)**: 텔레포트, 사망, 잭팟, 데일리 보상 이벤트는 모두 인덱싱되어 프론트엔드가 손쉽게 구독할 수 있어야 한다.
- **NFR-005 (Replay Protection)**: 다중 체인 간 통신을 단순화하기 위해 체인 ID 기반 nonce를 사용하며, 동일 요청을 두 번 처리하지 않는다.

## Key Entities

```typescript
interface TeleportSettings {
    powerCostPerHop: uint16;        // 기본 10
    minPowerToTeleport: uint16;     // 최소 파워
    teleportCooldown: uint32;       // 초 단위, 기본 3600
    minUniqueChains: uint8;         // Grand Tour 목표 (기본 5)
    baseDeathBps: uint16;           // 0-10000 범위
    powerSafetyPerPointBps: uint16; // 파워당 위험 감소치
    jackpotFeeBps: uint16;          // 수수료 (예: 200 = 2%)
}

interface TeleportState {
    uint32 currentChainId;
    uint32 homeChainId;
    uint8 teleportCount;
    uint8 uniqueChains;
    uint256 visitedChainsBitmap; // 1비트 = 체인 방문 여부 (chainIndex 매핑)
    uint64 lastTeleportAt;
    bool isAlive;
    bool jackpotEligible;
    bool jackpotClaimed;
}

interface JackpotVault {
    uint256 pool;           // CHURR or ETH
    uint16 feeBps;          // 현재 fee 비율
    address vaultBank;      // fee 수신 계정 (컨트랙트 내)
    uint64 lastTopUpAt;
}

interface DailyTreatState {
    mapping(address => uint64) lastClaimAt;
    uint256 treatAmount;
    address rewardToken; // CHURR (ERC20) 또는 새로운 Treat 토큰
}
```

## Error Handling

- `TeleportPowerTooLow`: 파워가 최소값보다 낮을 때
- `CatDead`: `isAlive == false` 상태에서 호출
- `TeleportCooldown`: 쿨다운 내 호출
- `ChainNotSupported`: 설정되지 않은 체인으로 텔레포트 시도
- `JackpotNotReady`: unique chain 목표 미달인데 잭팟 청구 시
- `JackpotAlreadyClaimed`: 이미 잭팟을 받은 고양이
- `JackpotEmpty`: 잔액이 0
- `DailyTreatCooldown`: 동일 사용자가 24시간 내 두 번 보상 시도
- `Unauthorized`: 소유자가 아닌 사용자가 호출

## Review & Acceptance Checklist

- [ ] Acceptance Scenarios 1-7을 테스트로 표현했는가?
- [ ] 사망 확률, fee 구조, treat 보상량의 미정 값에 `[NEEDS CLARIFICATION]`이 표기되었는가?
- [ ] Teleport/Jackpot 로직이 기존 VolatilityCats 상태와 호환되는가?
- [ ] 모든 에러 코드가 정의되고 UX에 노출 가능한가?
- [ ] Observability 요구사항(이벤트)이 충족되는가?


