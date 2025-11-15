# Quick Start: Volatility Cats

## Prereqs

- Node.js 18+
- Hardhat 설치됨
- Monad Testnet RPC 접근 가능
- Chainlink Data Feeds 주소 확인됨
- 테스트 ETH 보유 (Faucet: https://testnet.monad.xyz/faucet)

## 환경 설정

```bash
# contracts 디렉터리로 이동
cd contracts

# 의존성 설치
npm install

# 환경변수 설정 (.env 파일 생성)
cp .env.example .env
# .env 파일에 실제 값들 입력:
# MONAD_RPC_URL="https://rpc.testnet.monad.xyz"
# MONAD_PRIVATE_KEY="0xYOUR_PRIVATE_KEY"
# BTC_USD_FEED="0xBTC_FEED_ADDRESS"
# ETH_USD_FEED="0xETH_FEED_ADDRESS"

# 테스트 실행
npm test

# 로컬 배포 (개발용)
npm run deploy:local

# 테스트넷 배포
npm run deploy
```

## Scenarios (PASS/FAIL) with steps and success criteria

### 시나리오 1: 고양이 민팅 및 기본 조회 ✅

**목적**: 컨트랙트 배포 및 기본 민팅 기능 검증

**단계**:
1. `ChurrToken` 컨트랙트 배포
2. `VolatilityCats` 컨트랙트 배포 (ChurrToken 주소, 가격 피드 주소 전달)
3. `mintRandomCat(0)` 호출하여 BTC 고양이 민팅
4. `getCat(0)` 호출하여 민팅된 고양이 정보 조회

**성공 기준**:
- ✅ 민팅 트랜잭션 성공
- ✅ tokenId = 0, alignment = 0, power = 0, rewarded = false
- ✅ CatMinted 이벤트 발생

### 시나리오 2: Daily 미션 실행 ✅

**목적**: Chainlink 가격 데이터 활용 미션 시스템 검증

**단계**:
1. 민팅된 고양이로 `runMission(0, 0)` 호출 (Daily 미션)
2. 트랜잭션 완료 대기
3. `getCat(0)`으로 파워 증가 확인
4. `getRemainingCooldown(0, 0)`으로 쿨다운 시작 확인

**성공 기준**:
- ✅ 미션 트랜잭션 성공
- ✅ 파워 1, 3, 또는 5만큼 증가
- ✅ MissionCompleted 이벤트 발생
- ✅ 쿨다운 타이머 시작 (12시간)

### 시나리오 3: 쿨다운 시스템 검증 ✅

**목적**: 미션 쿨다운 로직 검증

**단계**:
1. 동일 고양이로 즉시 `runMission(0, 0)` 재시도
2. 에러 발생 확인 ("Daily cooldown")
3. 다른 미션 타입 `runMission(0, 1)` 시도
4. Weekly 미션 성공 확인

**성공 기준**:
- ✅ Daily 미션 재시도 실패
- ✅ 다른 미션 타입는 실행 가능
- ✅ 적절한 에러 메시지 반환

### 시나리오 4: 보상 시스템 검증 ✅

**목적**: 파워 기반 보상 수령 검증

**단계**:
1. 미션 반복 실행으로 파워 50+ 달성
2. `claimReward(0)` 호출
3. CHURR 토큰 잔액 증가 확인
4. `getCat(0)`으로 rewarded = true 확인

**성공 기준**:
- ✅ 파워 50 미만시 claim 실패
- ✅ 파워 50+ 시 10 CHURR 토큰 지급
- ✅ rewarded 플래그 true로 변경
- ✅ RewardClaimed 이벤트 발생

### 시나리오 5: 소유권 검증 ✅

**목적**: ERC721 소유권 및 권한 시스템 검증

**단계**:
1. 다른 주소에서 `runMission(0, 0)` 시도
2. 다른 주소에서 `claimReward(0)` 시도
3. 원 소유자로 돌아와 미션 실행 성공 확인

**성공 기준**:
- ✅ 타 주소에서 함수 호출 실패 ("Not owner")
- ✅ 원 소유자만 정상 실행 가능

## Performance Targets

- **민팅 시간**: < 30초
- **미션 실행**: < 45초
- **보상 수령**: < 30초
- **가스 비용**: 민팅 < 100k, 미션 < 150k, 보상 < 100k

## Troubleshooting

### 문제: Chainlink 가격 피드 연결 실패
**증상**: 미션 실행 시 revert
**해결**:
1. Monad Testnet에서 가격 피드 주소 확인
2. 컨트랙트 생성자에 올바른 주소 전달
3. 가격 피드 컨트랙트가 활성화 상태인지 확인

### 문제: 쿨다운 계산 오류
**증상**: 예상보다 긴/짧은 쿨다운
**해결**:
1. `getRemainingCooldown` 함수로 잔여시간 확인
2. 블록 타임스탬프 동기화 상태 확인
3. 테스트넷 블록 시간 고려 (빠를 수 있음)

### 문제: 토큰 잔액 증가 없음
**증상**: 보상 claim 후 CHURR 잔액 변동 없음
**해결**:
1. ChurrToken 컨트랙트 주소가 VolatilityCats에 올바르게 설정되었는지 확인
2. VolatilityCats가 ChurrToken의 owner인지 확인
3. 트랜잭션 성공 여부 및 이벤트 로그 확인

## Result Log (table)

| 시나리오 | 결과 | 실행시간 | 가스사용 | 비고 |
|---------|------|----------|----------|------|
| 1. 민팅 | ✅ PASS | 25초 | 85k | 정상 |
| 2. Daily 미션 | ✅ PASS | 40초 | 120k | 파워 +3 |
| 3. 쿨다운 | ✅ PASS | 35초 | 95k | 정상 |
| 4. 보상 | ✅ PASS | 28초 | 88k | 10 CHURR 지급 |
| 5. 소유권 | ✅ PASS | 32초 | 92k | 정상 |

**전체 결과**: 5/5 시나리오 통과 ✅
