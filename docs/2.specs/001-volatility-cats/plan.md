# Implementation Plan: Volatility Cats

**Branch**: `[001-volatility-cats]` | **Date**: 2025-11-15 | **Spec**: [spec.md]

## Summary

Monad Testnet에서 Chainlink Data Feeds를 활용해 **Oracle Imprint Cat**을 온체인으로 키우는 소셜 펫 게임 컨트랙트를 구현한다. 사용자는 BTC/ETH(및 확장 가능한 여러 클랜) 진영의 고양이를 민팅하면, 민팅 시점 시장 상태가 고양이의 성격/희귀도/포츈으로 새겨지고, 이후 미션·룰렛을 통해 파워를 키워 CHURR 토큰 보상을 받을 수 있다.

## Technical Context (Language/Deps/Storage/Testing/Platform/Perf/Constraints/Scale)

-   **Language**: Solidity 0.8.20
-   **Dependencies**:
    -   @openzeppelin/contracts: ERC721, ERC20, Ownable
    -   @chainlink/contracts: AggregatorV3Interface
-   **Storage**: Ethereum-like storage (mapping for cats, price feeds)
-   **Testing**: Hardhat + ethers.js, unit tests for each function
-   **Platform**: Monad Testnet (EVM-compatible)
-   **Performance**: 목표 TPS 10, 가스 최적화 필요
-   **Constraints**: 6시간 MVP 완성 목표, 해커톤 환경
-   **Scale**: 초기 MVP로 사용자 100명 목표

## Constitution Check (Simplicity/Architecture/Testing/Observability/Versioning)

-   **Simplicity**: ✅ 단일 컨트랙트 2개 (NFT + Token), 복잡한 로직 최소화
-   **Architecture**: ✅ 표준 ERC721/ERC20 패턴, Chainlink 오라클 통합
-   **Testing**: ✅ Hardhat 테스트, 각 함수별 단위 테스트 작성
-   **Observability**: ✅ 이벤트 로깅 (Minted/Completed/Claimed), view 함수 제공
-   **Versioning**: ✅ Semantic versioning, 컨트랙트 업그레이드 고려하지 않음

## Project Structure (docs/src/tests layout)

```
contracts/
├── VolatilityCats.sol    # 메인 NFT 컨트랙트
├── ChurrToken.sol        # 보상 토큰 컨트랙트
└── interfaces/           # 인터페이스 정의 (필요시)

test/
├── VolatilityCats.test.js  # 메인 컨트랙트 테스트
└── ChurrToken.test.js      # 토큰 컨트랙트 테스트

docs/2.specs/001-volatility-cats/
├── spec.md               # 요구사항 명세
├── plan.md              # 구현 계획
├── data-model.md        # 데이터 모델
├── contracts/           # API 명세
├── quickstart.md        # 검증 시나리오
└── tasks.md             # 작업 분해
```

## Phase 0: Outline & Research (unknowns list)

-   [ ] Monad Testnet RPC 엔드포인트 및 연결 방법 확인
-   [ ] Chainlink Data Feeds on Monad Testnet 주소 확인
-   [ ] Privy wallet integration 테스트넷 지원 여부 확인
-   [ ] Oracle Imprint 설계: birthTrendBps/birthVolBucket/epochId 계산식 및 변동성 버킷 기준 결정
-   [ ] 가스 비용 측정 및 최적화 필요성 평가

## Phase 1: Design & Contracts (artifacts to produce)

-   [ ] data-model.md: 컨트랙트 엔티티 및 관계 정의
-   [ ] contracts/api.yaml: 컨트랙트 인터페이스 OpenAPI 명세
-   [ ] contracts/schemas.json: 요청/응답 스키마 정의
-   [ ] quickstart.md: 3-5개 주요 검증 시나리오

## Phase 2: Task Planning Approach (how to derive tasks)

TDD-first 방식으로 작업을 분해:

1. **Contract Tests**: 각 함수별 happy path + error case 테스트 우선 작성
2. **Implementation**: 테스트 통과를 위한 최소 코드 구현
3. **Integration**: 컨트랙트 간 상호작용 테스트
4. **E2E**: 전체 사용자 플로우 검증

## Phase 3: Execution Plan (for next repo/agent)

1. **Environment (Node 24 기반)**

    - Node.js 24.x 설치 (가능하면 `nvm`으로 관리) 후 `node -v`로 버전 확인.
    - 새 레포에서 `cd contracts && npm install`로 의존성 설치.
    - Monad Testnet RPC/Chainlink 피드 주소는 `.env` 또는 `hardhat.config.ts`에서 **placeholder**로만 정의하고 실제 값은 운영자가 주입.

2. **Contract Tests First**

    - `test/VolatilityCats.test.js`를 확장하여 Oracle Imprint 필드(clan, temperament, fortuneTier, rarityTier, birthTrendBps, birthVolBucket, epochId, entropy)가 민팅 시 올바르게 세팅되는지 검증 (T015 참조).
    - 미션/보상/쿨다운 관련 기존 테스트를 Oracle Imprint 구조와 새 파워 분포 요구사항에 맞게 보강 (T011~T014).
    - CHURR 보상 조건(`power` 임계값, rewarded 플래그 등)과 권한 에러 케이스를 명시적으로 테스트.

3. **Core Implementation (Oracle Imprint + Game State)**

    - `VolatilityCats.sol`의 `Cat` 구조를 Oracle Imprint + GameState 형태로 리팩터링하고, 스토리지 레이아웃 변경에 따른 마이그레이션 필요 여부를 검토 (신규 레포라면 마이그레이션 없음).
    - `mintRandomCat`에서 Chainlink 가격 데이터를 읽어 `birthTrendBps`, `birthVolBucket`, `epochId`, `entropy`를 계산하고, temperament/fortuneTier/rarityTier를 결정하는 순수 함수를 구현 (T022).
    - `getCat` 계열 view 함수를 통해 imprint + game 상태를 한 번에 반환하도록 정리 (T026).

4. **Mission / Roulette & Reward Loop**

    - `runMission`에서 Oracle Imprint와 현재 가격 정보를 함께 사용해 RNG 시드를 구성하고, 스펙에 정의된 파워 증가 분포를 적용 (T023).
    - Daily/Weekly/Monthly 쿨다운 로직을 유지하되, 향후 변동성 High 버킷용 보너스 미션이 추가될 수 있도록 missionType/룰셋 버전 설계를 느슨하게 유지 (T027 `[POST-MVP]`).
    - `claimReward`에서 파워 임계값 및 rewarded 플래그를 이용해 CHURR 보상을 1회만 지급하도록 구현 (T024).

5. **Integration & Handoff**
    - `ChurrToken.sol`과의 통합(보상 지급, owner 권한 위임)을 테스트로 검증하고, Monad Testnet용 배포 스크립트를 최신 상태로 유지 (T020, T030~T033).
    - `quickstart.md`에 새 레포 기준의 실행/검증 시나리오를 업데이트하고, 프론트엔드/다른 에이전트가 참고할 수 있도록 명령어와 주요 함수 시그니처를 정리.
    - 최종적으로 `docs/3.release/RELEASE-YYYY-MM-DD.md`에 어떤 커밋/버전이 배포되었는지, 테스트 상태와 알려진 이슈를 기록하여 다음 에이전트가 바로 이어서 작업할 수 있게 한다.

## Complexity Tracking (if any)

-   **Medium**: Chainlink 가격 데이터와 Oracle Imprint를 함께 사용하는 RNG/룰렛 설계
-   **Low**: 표준 ERC721/ERC20 패턴 사용
-   **Low**: 미션 쿨다운 및 보상 로직 구현

## Progress Tracking (checklist)

-   [x] Phase 0 완료: 리서치 및 환경 설정
-   [x] Phase 1 완료: 설계 산출물 작성
-   [x] Phase 2 완료: 작업 계획 수립
-   [x] 컨트랙트 구현 완료
-   [x] 테스트 작성 및 통과
-   [x] 배포 및 검증
