# Quick Start: Multichain Teleport & Jackpot

## Prereqs

-   Node.js 18+, npm 10+
-   Hardhat 환경 (`contracts/` 폴더) + 기존 VolatilityCats/ChurrToken 배포
-   Mock 체인 피드(`MockV3Aggregator`) 2개 이상 등록 (BTC/ETH)
-   Hardhat Network에서 `npx hardhat node` 실행 후 `npm run deploy:local`
-   텔레포트 파워/목표/fee는 컨트랙트 상수(`teleportConfig`, `jackpotConfig`)로 고정되므로 별도 설정 불필요

## Scenarios (PASS/FAIL) with steps and success criteria

### 시나리오 1: 텔레포트 1회 성공 ✅

**목적**: 파워 차감, 이벤트, CCIP 해시 확인  
**단계**

1. `mintRandomCat(0)`으로 고양이를 생성하고 `runMission`으로 파워 ≥10 확보.
2. `teleportToChain(tokenId, chainId=1, payload=0x1234)` 호출.
3. `getCat(tokenId)` 혹은 `getTeleportState(tokenId)`으로 `currentChainId` 확인.
   **성공 기준**

-   ✅ 파워가 `teleportConfig().powerCost`만큼 감소
-   ✅ `TeleportCompleted` 이벤트가 `(tokenId, 0, 1, 1, visitedBitmap, keccak256(0x1234))` 형태로 발생
-   ✅ `visitedChainsBitmap`에 체인1 비트가 세트된 값이 반환

### 시나리오 2: 잭팟 수수료 누적 ✅

**목적**: 민팅/미션/텔레포트마다 잭팟 금고가 증가하는지 검증  
**단계**

1. 시나리오1 직후 `jackpotBalance()` 조회 → `jackpotConfig().mintFee` 만큼 증가 확인.
2. Daily 미션 1회 수행 후 `jackpotBalance()` 재확인 → `missionFee`만큼 추가.
3. 텔레포트 1회 수행 후 `jackpotBalance()` 재확인 → `teleportFee`만큼 추가.
   **성공 기준**

-   ✅ 각 단계의 잔액 차이가 `jackpotConfig()`가 반환하는 fee 값과 일치
-   ✅ `JackpotAccrued(source, amount, newBalance)` 이벤트 3회 발생

### 시나리오 3: Grand Tour & Auto Jackpot ✅

**목적**: 5개 체인 방문 후 자동으로 잭팟이 지급되는지 확인  
**단계**

1. 체인 인덱스 1~5 순서로 텔레포트 (각 hop 앞서 `runMission`으로 파워 보충, `teleportConfig().cooldownSeconds` 만큼 `evm_increaseTime`).
2. 마지막 텔레포트 트랜잭션에서 `JackpotAwarded` 이벤트 감시.
3. 트랜잭션 직후 `jackpotBalance()`와 `getJackpotState()` 조회.
   **성공 기준**

-   ✅ 마지막 hop에서 `JackpotAwarded(tokenId, owner, amount)` 이벤트 발생
-   ✅ `jackpotBalance()`가 0, `getJackpotState().claimed == true`, `winner == owner`
-   ✅ 추가 텔레포트/민팅 시 더 이상 `JackpotAccrued` 이벤트가 발생하지 않음

### 시나리오 4: 상태 뷰 함수 검증 ✅

**목적**: 프론트엔드가 필요한 모든 데이터를 한 번에 읽을 수 있는지 검증  
**단계**

1. `getCat(tokenId)`로 Oracle/Game/Teleport/Owner 번들을 읽는다.
2. `getTeleportCooldown(tokenId)` 호출 → 직후 텔레포트 했다면 `>0`.
3. `teleportConfig()`, `jackpotConfig()`를 호출해 상수 파라미터를 확인한다.
4. 기존(업데이트 이전) 토큰 ID를 가정하고 `getTeleportState()` 호출 시 기본값이 반환되는지 확인한다.
   **성공 기준**

-   ✅ `getCat` 튜플이 (tokenId, imprint, game, teleport, owner) 순서로 반환
-   ✅ `getTeleportCooldown`이 초 단위 쿨다운을 반환
-   ✅ Config getter가 문서와 동일한 수치를 노출

## Performance Targets

-   텔레포트: 200k gas 이하
-   잭팟 자동 지급 포함 텔레포트: 220k gas 이하
-   미션 + fee accrual: 기존 대비 30k gas 이하 오버헤드

## Troubleshooting

### 문제: `TeleportDestinationNotAllowed` revert

-   동일 체인으로 이동하려 했는지 확인 (home=0, 허용 체인=1~5)
-   Grand Tour 이후에도 다시 체인 5를 방문하려 하면 unique count는 증가하지 않음

### 문제: `PriceTooOld` (Mock 피드)

-   `ensurePower`와 같이 시간을 이동한 경우 `MockV3Aggregator.updateAnswer()`로 타임스탬프를 새로 작성

### 문제: 잭팟이 이미 소진됨

-   `getJackpotState().claimed`가 true면 fee가 더 이상 누적되지 않으므로, 후속 플레이는 잭팟 없이 진행됨(설계 의도)

## Result Log (table)

| 시나리오     | 결과  | 실행시간 | 가스사용 | 비고                        |
| ------------ | ----- | -------- | -------- | --------------------------- |
| 텔레포트 1회 | ☐ TBD | TBD      | TBD      | 파워 감소 + 이벤트          |
| Fee 누적     | ☐ TBD | TBD      | TBD      | mint/mission/teleport delta |
| Grand Tour   | ☐ TBD | TBD      | TBD      | 잭팟 auto award             |
| 뷰 함수      | ☐ TBD | TBD      | TBD      | config & cooldown 확인      |
