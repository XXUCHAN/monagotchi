# Feature Specification: Multichain Teleport & Jackpot

**Feature Branch**: `[003-teleporting-cats]`
**Created**: 2025-11-15
**Status**: Draft
**Input**: 고양이를 다중 체인 사이로 텔레포트시키고 누적 보상을 거는 하이 리스크 미션을 추가해야 한다.

## User Scenarios & Testing

### Primary User Story

플레이어는 이미 보유한 Volatility Cat을 “가상의 CCIP 텔레포트” 미션에 참여시켜 다른 체인의 분위기를 경험할 수 있다. 텔레포트할 때마다 고양이 파워가 감소하고, 목적지·페이로드 정보는 CCIP 연동을 대비해 이벤트에 해시 형태로 저장된다. 새 체인을 최소 5곳 순회하면 글로벌 목표인 **Grand Tour**를 최초로 달성하게 되고, 지금까지 민팅/미션/텔레포트에서 적립된 CHURR 잭팟 풀을 즉시 수령한다. 모든 행동의 일부 CHURR가 잭팟에 누적되며 프론트엔드에서는 `jackpotBalance()`/`getJackpotState()`를 통해 상태를 감시한다. (사망 확률, Daily Treat 등 고위험 요소는 `[POST-MVP]`로 남겨 둔다.)

### Acceptance Scenarios

1. **Teleport Power Cost & Event**  
   Given `teleportConfig()`가 `(3600, 5, 5)`를 반환하고 고양이 파워가 12일 때, When 사용자가 `teleportToChain(tokenId, 2, payload)`를 호출하면, Then 파워는 `powerCost(=5)`만큼 줄고 `TeleportCompleted(tokenId, fromChain, 2, teleportCount, visitedBitmap, keccak256(payload))` 이벤트가 기록된다.
2. **Visited Map & Status Map 노출**  
   Given `teleportState.visitedChainsBitmap`가 체인 1~4 비트를 포함할 때, When 처음으로 체인 5로 텔레포트하면, Then 비트맵이 체인5 비트를 추가하고 `getCat()`/`getTeleportState()`에서 동일한 값이 조회된다.
3. **Jackpot Accrual**  
   Given `jackpotBalance()`가 1 CHURR인 상태에서 새 고양이를 민팅하거나 Daily 미션을 수행하면, When 해당 함수가 성공하면, Then `jackpotBalance()`는 `jackpotConfig().mintFee` 또는 `missionFee` 만큼 증가한다.
4. **Grand Tour Auto Award**  
   Given 어떤 플레이어도 아직 Grand Tour(5개 체인)를 달성하지 않았고 `jackpotBalance()`에 500 CHURR가 쌓여 있을 때, When 특정 고양이가 5번째 고유 체인을 방문하면, Then `JackpotAwarded(tokenId, owner, 500 CHURR)` 이벤트가 발생하고 `jackpotBalance()`는 0이 된다.
5. **Jackpot State View**  
   Given 잭팟이 아직 청구되지 않았을 때, When 프론트엔드가 `getJackpotState()`를 호출하면, Then `(balance, claimed=false, winner=address(0), targetChains=5)`가 반환된다. 잭팟이 지급된 뒤에는 `claimed=true`, `winner=수령자`, `balance=0`을 확인할 수 있다.
6. **Teleport Cooldown Enforcement**  
   Given 방금 텔레포트를 완료했을 때, When 같은 고양이로 즉시 텔레포트를 다시 시도하면, Then `TeleportCooldown(remainingSeconds)` 에러로 revert된다.
7. **Legacy Cat Lazy Init**  
   Given 텔레포트 기능 추가 이전에 민팅된 고양이를 조회할 때, When `getCat(tokenId)`를 호출하면, Then 기본 `TeleportState`(home chain 비트 + `uniqueChainsVisited=0`)가 자동으로 포함되어 반환된다.

### Edge Cases

-   파워가 `powerCostPerHop` 미만인 고양이를 텔레포트하려는 경우
-   동일 체인을 중복 방문했을 때 unique chain 카운트가 증가하지 않아야 함
-   잭팟이 이미 지급된 뒤에도 수수료 누적을 중단해야 함(풀 잠금)
-   Grand Tour 도중 잭팟 풀 잔액이 0인 경우 → 이벤트만 발생하고 지급 없음
-   체인 개수가 목표 미만으로 설정된 경우(설정 오류) → config 검증 필요
-   `[POST-MVP]` 사망/데일리 보상/실제 CCIP 전송은 후속 단계에서 확장

## Requirements

### Functional Requirements

-   **FR-001**: 각 고양이는 `TeleportState { currentChainId, visitedChainsBitmap(uint32), teleportCount(uint8), uniqueChainsVisited(uint8), lastTeleportAt, isAlive, jackpotEligible }` 를 갖고, `isAlive`는 지금은 항상 true지만 향후 확장용으로 유지한다.
-   **FR-002**: `teleportToChain(uint256 tokenId, uint32 chainId, bytes payload)`는 소유자만 호출 가능하며 `teleportConfig()`로 노출된 `powerCost` 이상 파워를 요구하고, 실행 시 파워를 차감한 뒤 `TeleportCompleted` 이벤트를 발생시킨다. `payload`는 실제 CCIP 대신 `keccak256(payload)`만 저장한다.
-   **FR-003**: 체인 방문 여부는 비트맵으로 관리하며 처음 방문한 체인마다 `uniqueChainsVisited`가 증가한다. 목표치(`teleportConfig().targetChains`, 기본 5)를 달성하면 `jackpotEligible=true`로 설정한다.
-   **FR-004**: 잭팟 풀은 CHURR 기준으로 관리되며 `jackpotConfig()`에 정의된 고정 fee(민팅/미션/텔레포트)가 발생할 때마다 컨트랙트가 스스로에게 CHURR을 mint 하여 `jackpotBalance()`에 반영한다.
-   **FR-005**: Grand Tour를 최초로 달성한 고양이는 자동으로 `JackpotAwarded(tokenId, winner, amount)` 이벤트와 함께 풀 잔액 전부를 수령하고, 이후 fee 누적이 중단된다(한 번만 수상). 수령 여부는 `getJackpotState()`로 조회할 수 있다.
-   **FR-006**: `getCat()`은 Oracle/Game/Teleport 상태와 소유자를 동시에 반환해야 하며, `getTeleportState()`, `getTeleportCooldown()`, `teleportConfig()`, `jackpotConfig()` 등 보조 뷰 함수를 통해 프론트엔드가 상태 맵과 파라미터를 읽을 수 있어야 한다.
-   **FR-007**: 텔레포트 시 같은 체인으로 이동하려 하면 `TeleportDestinationNotAllowed`, 쿨다운을 위반하면 `TeleportCooldown`, 파워 부족 시 `TeleportPowerTooLow` 커스텀 에러로 중단한다.
-   **FR-008**: 기존 고양이는 최초 조회 또는 텔레포트 시 lazy-init 방식으로 기본 TeleportState(Home 체인 비트 ON, uniqueChainsVisited=0)를 부여받아야 한다.
-   **FR-009**: `[POST-MVP]` 사망 확률, Daily Treat 지급, 관리자 파라미터 업데이트, payable fee 루트 등은 설계만 유지하고 추후 구현한다.

### Non-Functional Requirements

-   **NFR-001 (Gas)**: 텔레포트 트랜잭션 가스 사용량 250k 이하, JackPot auto-award 포함 200k 이하를 목표로 한다.
-   **NFR-002 (Determinism)**: RNG 대신 Chainlink 가격 데이터를 entropy로 재사용하므로 동일 블록에서 호출해도 이벤트/상태가 재현 가능해야 한다.
-   **NFR-003 (Observability)**: `TeleportCompleted`, `JackpotAccrued`, `JackpotAwarded` 이벤트는 인덱싱 필드를 포함해 프론트엔드가 체인 방문과 잔액 변화를 추적할 수 있어야 한다.
-   **NFR-004 (Stability)**: CCIP 실 구현 전까지 `payload`는 단순 해시로만 저장되며, 나중에 실제 전송을 붙일 때도 이벤트 포맷이 유지되도록 한다.
-   **NFR-005 (Backwards Compatibility)**: 기존 VolatilityCats 스토리지에 slot을 추가하더라도 proxy를 사용하지 않으므로 재배포 시 기존 토큰을 재민팅하지 않도록 lazy-init 전략을 문서화한다.

## Key Entities

```typescript
interface TeleportState {
    uint32 currentChainId;       // 기본 0 (home)
    uint32 visitedChainsBitmap;  // bit i == 1 → 체인 i 방문
    uint8 teleportCount;         // 총 텔레포트 횟수
    uint8 uniqueChainsVisited;   // 고유 방문 체인 수
    uint64 lastTeleportAt;       // 쿨다운 계산용
    bool isAlive;                // 현재 MVP에선 항상 true
    bool jackpotEligible;        // Grand Tour 달성 여부
}

interface TeleportConfigView {
    uint32 cooldownSeconds;  // 3600
    uint8 targetChains;      // 5
    uint32 powerCost;        // 5
}

interface JackpotState {
    uint256 balance;   // 현재 CHURR 잭팟 잔액
    bool claimed;      // 이미 잭팟이 지급되었는지
    address winner;    // Grand Tour 최초 달성자
    uint8 targetChains;// Grand Tour 목표 (5)
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

## Error Handling

-   `TeleportPowerTooLow(currentPower, requiredPower)`: 파워 부족
-   `TeleportCooldown(remainingSeconds)`: 텔레포트 쿨다운 미도래
-   `TeleportDestinationNotAllowed(chainId)`: 미지원/중복 목적지
-   `CatInactive()`: (예약) isAlive=false 상태에서 호출
-   `MissionCooldown(...)`, `InvalidMissionType`, `PowerTooLow`: 기존 미션 로직과 동일
-   `JackpotPayoutFailed`: CHURR 전송 실패 시 (reentrancy guard와 함께 사용)
-   `[POST-MVP]` Death/DailyTreat 관련 커스텀 에러는 이후 단계에서 추가

## Review & Acceptance Checklist

-   [ ] Acceptance Scenarios 1-7을 테스트로 표현했는가?
-   [ ] 사망 확률, fee 구조, treat 보상량의 미정 값에 `[NEEDS CLARIFICATION]`이 표기되었는가?
-   [ ] Teleport/Jackpot 로직이 기존 VolatilityCats 상태와 호환되는가?
-   [ ] 모든 에러 코드가 정의되고 UX에 노출 가능한가?
-   [ ] Observability 요구사항(이벤트)이 충족되는가?
