# Agent Execution Plan: 3-Hour Sprint

이 문서는 Agent가 3시간 내 수행할 작업을 시간순으로 정리한 실행 가이드다. 각 단계는 TDD → 구현 → 배포 순으로 최소 기능을 확보하도록 구성했다.

## 필수 입력 (사용자 또는 운영 환경 제공)
1. 테스트넷 선택 및 RPC URL (예: `https://polygon-amoy.g.alchemy.com/v2/...`)
2. Chainlink CCIP Router 주소, chain selector, LINK 토큰 주소 (선택한 체인 기준)
3. `testnet-datastream.json` 확장본: BTC, ETH, SOL, DOGE, PEPE, LINK feed 주소 확인
4. 테스트넷 전용 배포 키(EOA) + 기본 가스 토큰 + 테스트넷 LINK 잔액
5. Hardhat `.env` 템플릿 확인 (`TESTNET_RPC_URL`, `TESTNET_DEPLOYER_PRIVATE_KEY`, `CCIP_ROUTER_ADDRESS`)

## 작업 순서

### Step A (0-20분) - 환경 및 Config 정리
- `contracts/config/network-config.ts` 생성, 체인 selector/Router/LINK 주소/fee token을 JSON 형태로 정의
- `.env.example` 업데이트 (테스트넷 RPC, 배포 키, LINK 잔액 최소값)
- `docs/3.release/RELEASE-2025-11-15.md`에 “준비중” 섹션 추가, 필요한 자산 명시

### Step B (20-70분) - 테스트 우선 자산 레지스트리
- 테스트 파일 `test/ccip/test_asset_registry.ts` 작성: 자산 추가/비활성/파라미터 검증, BTC/ETH/SOL 세 케이스
- `contracts/src/registry/AssetRegistry.sol` 구현(Ownable, pause 없는 단순 구조)
- `contracts/src/libraries/PriceFeedGuard.sol` 스텁: stale/deviation 체크 함수만

### Step C (70-130분) - CCIP 어댑터 및 훅
- `contracts/src/adapters/ChainlinkCCIPAdapter.sol` 생성: Router 인터페이스, allowlist, replay guard
- `contracts/src/VolatilityCats.sol`에 어댑터 훅 추가 (feature flag `ccipEnabled`)
- CCIP mock 테스트 `test/ccip/test_ccip_adapter.js` 작성: 허용 체인/자산 케이스, 중복 메시지 revert

### Step D (130-160분) - 배포 스크립트 & 시뮬
- `scripts/deploy-ccip.ts` 작성: config 로드 → AssetRegistry & Adapter 배포 → VolatilityCats 주소 세팅
- `scripts/mission-sim.ts` 작성: 특정 assetId로 미션 호출, 이벤트 출력
- `docs/2.specs/002-chainlink-ccip-datafeeds/quickstart.md`의 Result Log 갱신

### Step E (160-180분) - 테스트넷 릴리스 & 보고
- Hardhat 배포 실행 (`pnpm hardhat run scripts/deploy-ccip.ts --network <testnet>`)
- Release 문서에 네트워크/주소/커밋 SHA 기록, 실패 시 블로커 명시
- `docs/reports/`에 한국어 테스트 리포트(예: `25111516-CCIP-SMOKE.md`) 생성

## 위험 및 대응
- **키/LINK 부족**: 사용자에게 즉시 알림, yourwork.md 참조
- **CCIP Router 미지원**: 대안 체인 선택(Polygon Amoy 권장)으로 전환
- **시간 초과**: Step C 미완료 시 CCIP 기능은 mock 상태로 문서화하고 Step D~E는 스킵, 릴리스 노트에 남김

