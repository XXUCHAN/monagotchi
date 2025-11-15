# Quick Start: Chainlink CCIP & Datafeeds Integration

## Prereqs

-   Hardhat 환경 + Node 24+
-   테스트넷 RPC (예: Polygon Amoy, Arbitrum Sepolia) 및 LINK·가스 토큰
-   Chainlink CCIP Router 주소, chain selector, feed 주소 JSON
-   테스트넷 전용 배포 키 (`.env`에 저장, git 미추적)

### Env Matrix (local vs dev/testnet)

-   **local (Hardhat)**: MockV3Aggregator 기반 가격 피드, CCIP Router/fee 없이도 테스트 가능. 프론트엔드는 로컬 VolatilityCats 주소와 ABI만 알면 된다.
-   **dev/testnet (Monad Testnet 등)**: `contracts/testnet-datastream.json`/`network-config.ts`에서 BTC/ETH/SOL/DOGE/PEPE/LINK feed 주소를 로드하여 실제 Chainlink v3 Aggregator 사용, CCIP Router/LINK 설정 필요.

## Scenarios (PASS/FAIL)

1. **PASS**: `pnpm hardhat test test/ccip/` → CCIP 메시지 스키마 및 AssetRegistry 단위테스트 성공  
   **FAIL 대응**: struct version mismatch → `contracts/src/adapters/` 스키마 업데이트
2. **PASS**: `pnpm hardhat run scripts/deploy-ccip.ts --network amoy` → Router/Adapter/VolatilityCats 주소 출력 및 이벤트 기록  
   **FAIL 대응**: LINK fee 부족 → 파우셋에서 보충 후 `ccip-cli check-balance`
3. **PASS**: `pnpm hardhat run scripts/mission-sim.ts --network amoy --asset SOL` → 가격 조회 + 미션 파워 증가 이벤트 발생  
   **FAIL 대응**: `Feed_NotFound` → `network-config.ts` 자산 정의 확인

## Performance Targets

-   CCIP 메시지 처리 가스 < 500k
-   자산 민팅/미션 트랜잭션 30초 이내 확정

## Troubleshooting

-   `CCIP_InvalidSource`: Router allowlist 체크, chain selector 재검토
-   `Feed_StaleData`: 테스트넷 feed 업데이트 지연 → 재시도 전 latency 확인
-   배포 스크립트 중단: `.env` 변수명 불일치 여부 확인 (`TESTNET_RPC_URL`, `TESTNET_DEPLOYER_PRIVATE_KEY`)

## Result Log

| Scenario             | Status | Notes |
| -------------------- | ------ | ----- |
| CCIP 구조 단위테스트 | ☐      |       |
| 테스트넷 배포        | ☐      |       |
| SOL 미션 시뮬레이션  | ☐      |       |
