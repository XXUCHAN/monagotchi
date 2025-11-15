# Quick Start: Multichain Teleport & Jackpot

## Prereqs

- Node.js 18+, npm 10+
- Hardhat 환경 (`contracts/` 폴더) + 기존 VolatilityCats/ChurrToken 배포
- 5개 체인 ID 매핑이 기재된 `network-config.ts` (예: MonadTestnet=1, Amoy=2, BaseSepolia=3, ArbitrumSepolia=4, OptimismSepolia=5)
- 테스트용 CHURR 토큰 및 소량 ETH (텔레포트 수수료)
- `.env`에 Teleport 설정(파워 비용, fee BPS) 기입

## Scenarios (PASS/FAIL) with steps and success criteria

### 시나리오 1: 텔레포트 1회 성공 ✅
**목적**: 파워 차감 및 체인 이동 확인  
**단계**
1. `mintRandomCat`로 고양이를 생성하고 파워를 60까지 올린다.
2. `teleportToChain(tokenId, chainId=2, proof=0x00)` 호출.
3. `getCat(tokenId)`로 파워와 `teleportState` 확인.
**성공 기준**
- ✅ 파워가 10 감소 (`powerCostPerHop`)
- ✅ `currentChainId`가 2로 갱신
- ✅ `TeleportPerformed` 이벤트 로그 확인

### 시나리오 2: 사망 확률 처리 ✅
**목적**: 낮은 파워 고양이 사망 로직 검증  
**단계**
1. 파워 15 고양이를 준비 (또는 `setCatPower` 테스트 도우미 사용).
2. `teleportToChain` 연속 호출로 사망 발생을 유도(테스트에서는 deterministic RNG 사용).
3. `getCat(tokenId)`에서 `teleport.isAlive` 확인.
**성공 기준**
- ✅ 사망 시 파워가 0으로 고정
- ✅ `CatMortality(tokenId, chainId)` 이벤트 발생
- ✅ 이후 텔레포트/미션 호출이 `CatDead` 에러로 revert

### 시나리오 3: Grand Tour & Jackpot ✅
**목적**: 5개 체인 방문 후 잭팟 청구  
**단계**
1. 체인 인덱스 1~5 순서로 텔레포트 (중복 없이).
2. 5번째 체인 완료 후 `teleportState.jackpotEligible` 확인.
3. `claimJackpot(tokenId)` 호출.
4. `jackpotVault.pool` 변화 확인.
**성공 기준**
- ✅ 5번째 방문 후 `JackpotReady` 이벤트
- ✅ `claimJackpot` 호출로 잔액이 사용자에게 이전
- ✅ `JackpotClaimed` 이벤트와 `jackpotVault.pool=0`

### 시나리오 4: Daily Treat + Fee Accrual ✅
**목적**: Daily 미션 성공 → Treat 지급, 수수료 누적 검증  
**단계**
1. Daily 미션 성공 시 `grantDailyTreat(owner)` 실행.
2. 사용자 CHURR 잔액 확인 (증가).
3. 같은 날 재호출 시도해 쿨다운 검증.
4. 텔레포트 실행 후 `jackpotVault.pool` 증가량 확인.
**성공 기준**
- ✅ Treat 지급 이벤트 및 잔액 증가
- ✅ 24시간 내 재청구 실패 (`DailyTreatCooldown`)
- ✅ 텔레포트마다 vault 잔액이 fee 만큼 증가

## Performance Targets

- 텔레포트: 250k gas 이하
- 잭팟 청구: 200k gas 이하
- Daily Treat 지급: 120k gas 이하
- Fee 스킴: 30k gas 이하 추가 오버헤드

## Troubleshooting

### 문제: `ChainNotSupported` revert
- 체인 ID ↔ 인덱스 매핑이 초기화되었는지 (`configureChain(chainId, index)`) 확인
- `visitedChainsBitmap`가 해당 체인 비트를 참조하도록 설정되었는지 검증

### 문제: 잭팟 잔액이 0
- 텔레포트/미션 호출 시 `msg.value` 또는 CHURR fee가 전달되었는지 확인
- 관리자 fee 인출 기록이 있는지 (`JackpotClaimed` vs `FeeSkimmed`) 이벤트 확인

### 문제: Daily Treat 중복 지급
- `dailyTreat.lastClaimAt[user]` 값을 로깅해 24시간(86400초) 경과 여부를 확인
- 테스트 환경에서는 `evm_increaseTime`으로 시간을 이동한 뒤 재시도

## Result Log (table)

| 시나리오 | 결과 | 실행시간 | 가스사용 | 비고 |
| --- | --- | --- | --- | --- |
| 텔레포트 1회 | ☐ TBD | TBD | TBD | 파워 감소 확인 |
| 사망 확률 | ☐ TBD | TBD | TBD | 낮은 파워 케이스 |
| Grand Tour | ☐ TBD | TBD | TBD | 잭팟 청구 |
| Daily Treat | ☐ TBD | TBD | TBD | fee 누적 포함 |


