# Implementation Plan: Chainlink CCIP & Datafeeds Integration

**Branch**: `[002-chainlink-ccip-datafeeds]` | **Date**: 2025-11-15 | **Spec**: `docs/2.specs/002-chainlink-ccip-datafeeds/spec.md`

## Summary

Chainlink CCIP 기반 메시지 처리와 Data Feed/Stream 가격 검증을 Volatility Cats 아키텍처에 통합하고, BTC/ETH 중심 구조를 SOL/DOGE/PEPE/LINK 등 다중 자산으로 확장한다. 또한 테스트넷 배포를 반복 가능하게 만드는 환경 구성·문서화·릴리스 절차를 마련한다.

## Technical Context

-   **Language**: Solidity 0.8.x, TypeScript (Hardhat/Foundry scripts), Markdown docs
-   **Dependencies**: `@chainlink/contracts-ccip`, Data Feed ABI, OZ libraries
-   **Storage**: On-chain `AssetRegistry`, CCIP state (messageId replay guard)
-   **Testing**: Hardhat + CCIP mock contracts, fork tests for feed integration
-   **Platform**: Monad/ETH-compatible testnets (Polygon Amoy, Arbitrum Sepolia 등), later Monad mainnet
-   **Performance**: 미션 실행 가스 < 350k, CCIP 메시지 처리 < 500k
-   **Constraints**: 테스트넷 LINK 수급, CCIP Router 지원 체인, 시간 제한(해커톤)
-   **Scale**: 초기 6~8 자산, 향후 확장 가능하도록 매개변수화

## Constitution Check

-   **Simplicity**: 메시지 스키마·자산 레지스트리로 최소 단위 분리, 과도한 추상화 금지
-   **Architecture**: CCIP 수신 어댑터 ↔ 게임 로직 분리, Config는 라이브러리+스토리지 패턴
-   **Testing**: TDD 우선, CCIP mock → Integration → On-chain dry-run 순으로 진행
-   **Observability**: 필수 이벤트(`CCIPMessageProcessed`, `FeedCheckFailed`) 정의, docs에 로그 규칙
-   **Versioning**: 자산 레지스트리와 메시지 스키마 버전 필드 관리

## Project Structure

```
docs/2.specs/002-chainlink-ccip-datafeeds/
  ├─ spec.md
  ├─ plan.md
  ├─ tasks.md
  └─ quickstart.md (추후)
contracts/
  ├─ src/
  │   ├─ adapters/ChainlinkCCIPAdapter.sol
  │   ├─ registry/AssetRegistry.sol
  │   └─ libraries/PriceFeedGuard.sol
  └─ scripts/network-config.ts
tests/
  ├─ contract/ccip/
  └─ integration/asset-registry/
```

## Phase 0: Outline & Research

-   CCIP Router 주소·chain selector·fee 토큰 매핑 조사
-   지원 가능한 Data Feed/Data Stream 목록 정리
-   테스트넷 LINK 파우셋 및 billing 정책 검토 `[OPEN]`

## Phase 1: Design & Contracts

-   메시지 스키마 정의, ABI/struct version 필수 필드 확정
-   AssetRegistry 저장 구조·권한 모델 설계
-   Stale data/Deviation 검증 로직 설계
-   배포/릴리즈 문서 템플릿 초안 작성

## Phase 2: Task Planning Approach

-   기능 단위를 TDD 순으로 분리: (1) contract tests for registry, (2) CCIP mock tests, (3) integration tests, (4) deployment scripts
-   각 자산·체인별 설정을 config JSON/TS로 분리하여 테스트와 스크립트가 동일 소스를 사용하도록 한다.

## Rapid 3-Hour Execution Plan (Hackathon)

| Slot | 시간 (분) | Owner        | 목표                    | 주요 작업                                                                                              | 산출물                                                                  | 위험/완화                                          |
| ---- | --------- | ------------ | ----------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------- |
| 0    | 0-20      | Agent        | 환경 스캔 & 입력 확보   | `testnet-datastream.json` → AssetConfig 초안, CCIP Router/selector 표 업데이트, `.env.example` 키 정의 | `contracts/config/network-config.ts` 초안, docs 업데이트                | Router 주소 미확정 → Chainlink docs 링크 포함      |
| 1    | 20-70     | Agent        | 최소 요구 테스트 준비   | AssetRegistry 테스트 작성 → 구현, PriceFeedGuard 스텁, CCIP payload struct 정의                        | `test/ccip/` 스위트, `AssetRegistry.sol` 스켈레톤                       | 테스트 시간 부족 → 범위 BTC/ETH/SOL로 축소         |
| 2    | 70-130    | Agent        | CCIP 어댑터 통합        | `ChainlinkCCIPAdapter.sol` stub + `VolatilityCats` 훅, CCIP mock 통합 테스트, config에서 feed 읽기     | 어댑터 코드, passing tests (mock)                                       | CCIP ABI 이해 지연 → 단순 메시지(미션 결과)만 처리 |
| 3    | 130-160   | Agent        | 배포 스크립트 & Dry-run | Hardhat deploy/update scripts, env 검증, `mission-sim.ts` 스크립트로 이벤트 확인                       | `scripts/deploy-ccip.ts`, 로그                                          | RPC rate limit → Amoy 단일 체인 고정               |
| 4    | 160-180   | Agent + User | 테스트넷 릴리스 & 문서  | Agent: deploy + release 노트 초안, User: 프라이빗 키/토큰/LINK 제공                                    | `docs/3.release/RELEASE-2025-11-15.md` 업데이트, yourwork.md 체크리스트 | 토큰 부족 → 사용자 즉시 파우셋 실행                |

### Fallback & Go/No-Go

-   90분 시점까지 CCIP mock 테스트 실패 시: Data Feed 확장 먼저 완료하고 CCIP 통합은 스텁 상태로 기록.
-   150분 시점까지 배포 스크립트 준비 미완료 시: 로컬 시뮬만 제출하고 테스트넷 주소는 문서로 가이드.
-   사용자 제공 자원(키/LINK) 미확보 시: 배포 단계 skip, 보고서에 블로커 명시.

## Complexity Tracking

-   **CCIP Fee 계산**: 체인별 LINK 단가/fee estimation 필요 → 별도 리서치 메모
-   **Data Stream vs Feed 선택**: 레이턴시·비용 비교 필요 시 research.md 작성

## Progress Tracking

-   [ ] Phase 0 완료 (주소/피드 조사)
-   [ ] Phase 1 완료 (스키마·레지스트리 설계)
-   [ ] Phase 2 완료 (테스트 플랜 + 태스크 정의)
-   [ ] 구현/테스트/배포 진행
