# Tasks: Chainlink CCIP & Datafeeds Integration

## Phase 0: 환경 준비 및 조사 (현재 진행 중)

-   [x] **T001** Monad testnet RPC endpoint 확인: `https://monad-testnet.gateway.tatum.io/`
-   [x] **T002** 배포용 개발 계정 생성: `0x606a8D01567974Ad83f554a49E2df4E8126908c5`
-   [ ] **T003** Monad testnet Chainlink 지원 현황 조사 및 대안 계획 수립
-   [ ] **T004** Hardhat 네트워크 설정 (Monad testnet용 config 추가)

-   [x] **T101** `AssetRegistry.sol` 컨트랙트 구현 (v1 완료)
    -   자산별 feed 주소 저장 구조체 정의
    -   관리자 함수: `addAsset()`, `updateAsset()`, `removeAsset()`
    -   조회 함수: `getAsset()`, `isAssetEnabled()`
-   [x] **T102** `PriceFeedGuard.sol` 라이브러리 구현 (v1 완료, 통합 대기)
    -   가격 유효성 검증 로직 (stale check, deviation check)
    -   `PriceData` 구조체 및 검증 함수들
-   [x] **T103** `VolatilityCats.sol`에 가격 조회 통합 (AssetRegistry 사용)
    -   `AssetRegistry`와의 인터페이스 연결
    -   미션 실행 시 가격 검증 로직 추가
-   [ ] **T104** MockV3Aggregator 개선 (Hardhat local 테스트용)
    -   다중 자산 지원 (BTC, ETH, SOL, DOGE, PEPE, LINK)
    -   동적 가격 설정 기능

## Phase 2: 테스트 및 배포 준비

-   [ ] **T201** 단위 테스트 작성 (`test/AssetRegistry.test.js`)
    -   자산 등록/수정/삭제 테스트
    -   권한 제어 테스트
    -   이벤트 emit 테스트
-   [ ] **T202** 통합 테스트 작성 (`test/PriceFeedGuard.test.js`)
    -   가격 검증 로직 테스트
    -   stale/deviation 시나리오 테스트
-   [ ] **T203** VolatilityCats 가격 조회 통합 테스트
    -   미션 실행 시 가격 검증 테스트
    -   다양한 자산 지원 테스트
-   [ ] **T204** Hardhat 스크립트 개선
    -   Monad testnet 배포 스크립트
    -   자산 초기화 스크립트
    -   잔액 확인 및 faucet 지원 스크립트

## Phase 3: 배포 및 검증

-   [ ] **T301** 로컬 Hardhat 네트워크에서 완전 테스트
    -   모든 컨트랙트 배포 및 연결 확인
    -   E2E 시나리오 테스트 (민팅 → 미션 → 보상)
-   [ ] **T302** Monad testnet 배포 준비
    -   `.env` 파일 설정 및 검증
    -   배포 스크립트 실행 및 주소 기록
-   [ ] **T303** 배포 후 검증
    -   컨트랙트 주소 및 커밋 SHA 기록
    -   기본 기능 테스트 (프론트엔드 연결 전)
-   [ ] **T304** 문서화 및 Release 노트 업데이트
    -   `docs/3.release/RELEASE-2025-11-15.md` 업데이트
    -   배포 주소 및 변경사항 기록

## Phase 4: 프론트엔드 통합 준비

-   [ ] **T401** 컨트랙트 ABI 내보내기
    -   TypeScript 타입 정의 생성
    -   프론트엔드에서 사용할 인터페이스 정리
-   [ ] **T402** 네트워크 설정 공유
    -   Monad testnet RPC 및 체인 ID 정보 공유
    -   컨트랙트 주소 및 ABI 공유

## Dependencies

-   **T003** → **T004** (Monad 지원 현황에 따라 배포 전략 결정)
-   **T101** → **T102** (AssetRegistry가 있어야 PriceFeedGuard 구현 가능)
-   **T101**, **T102** → **T103** (두 컴포넌트가 있어야 VolatilityCats 통합 가능)
-   **T101**-**T103** → **T201**-**T203** (구현 후 테스트 작성)
-   **T201**-**T203** → **T204** (테스트 통과 후 배포 스크립트 개선)
-   **T204** → **T301**-**T303** (스크립트 준비 후 배포 진행)

## Parallel Tasks

-   [ ] **T102-P** PriceFeedGuard 라이브러리 (T101과 병렬 가능)
-   [ ] **T104-P** MockV3Aggregator 개선 (기존 코드와 독립적)
-   [ ] **T201-P** 단위 테스트들 (구현과 병렬로 작성 가능)

## Validation Checklist

-   [ ] 모든 컨트랙트에 대한 단위 테스트가 존재하고 통과
-   [ ] 통합 테스트에서 E2E 시나리오 검증
-   [ ] 로컬 Hardhat에서 완전한 기능 작동 확인
-   [ ] 배포 스크립트가 오류 없이 실행되고 주소 기록
-   [ ] Release 문서에 배포 정보 정확히 기록
-   [ ] 프론트엔드 통합을 위한 ABI와 타입 준비

## 현재 상태

**진행 중**: Phase 0 - 환경 준비

-   ✅ Monad testnet RPC endpoint 확인
-   ✅ 배포용 계정 생성 (주소 공유 필요)
-   🔄 Chainlink 지원 현황 조사 중 (CCIP 미지원으로 Data Feeds only로 계획 수정)
-   ⏳ Hardhat 설정 준비 중

**다음 단계**: Chainlink 지원 현황 최종 확인 후 Phase 1 시작
