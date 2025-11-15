# Implementation Plan: Multichain Teleport & Jackpot

**Branch**: `[003-teleporting-cats]` | **Date**: 2025-11-15 | **Spec**: `docs/2.specs/003-teleporting-cats/spec.md`

## Summary

Volatility Cats에 “체인 간 텔레포트” 게임 루프와 잭팟 은행을 추가한다. 텔레포트는 파워를 소모하고 CCIP 페이로드를 더미로 기록하며, 5개 체인을 모두 방문한 최초의 고양이가 자동으로 잭팟 금고(민팅·미션·텔레포트 수수료로 적립된 CHURR)를 수령한다. Death/DailyTreat/실제 CCIP 호출은 `[POST-MVP]`로 미루고, 현재는 TeleportState/Jackpot 상태와 뷰 함수, 테스트를 우선 구현한다.

## Technical Context

-   **Language**: Solidity 0.8.20 (Hardhat), TypeScript (tests/scripts), Markdown docs
-   **Dependencies**: OpenZeppelin ERC721/Ownable, Chainlink price feed(엔트로피), Hardhat network
-   **Storage**: `teleportStates[tokenId]`, `jackpotPool`, `jackpotClaimed`, `jackpotWinner`를 VolatilityCats 내부에 추가
-   **Testing**: Hardhat + Mocha/Chai (contract tests), focus on teleport happy path, cooldown, jackpot accrual/award, fee bookkeeping
-   **Platform**: 로컬 Hardhat(필수), Monad Testnet(옵션) — 체인 ID는 상수(0~5)로 관리
-   **Performance**: teleport ≤200k gas, auto-award 포함 200k gas 이하 목표
-   **Constraints**: CCIP는 payload hash만 저장, death/treat는 후속 단계, 기존 스토리지 레이아웃 유지

### Env Strategy (Local → Testnet)

1. **Local Hardhat**: teleport RNG를 pseudo(random)으로 구현하고, payable fee를 Ether 대신 mock ERC20으로 처리해 빠른 반복 테스트.
2. **Monad Testnet**: `network-config.ts`에 5개 체인 ID 매핑 추가, 텔레포트 수수료를 CHURR (ERC20) 기준으로 누적. Daily Treat 지급은 ChurrToken owner 권한을 이용해 mint or transfer.
3. **Observability**: Hardhat Network에서 이벤트 로그를 스냅샷으로 덤프하여 Quickstart와 Result Log에 첨부.

## Constitution Check

-   **Simplicity**: Teleport와 기존 미션 로직을 분리하되 동일 컨트랙트 안에서 internal helper로 유지한다.
-   **Architecture**: Jackpot 금고는 VolatilityCats 내부 `jackpotPool` 로컬 상태와 CHURR 잔액으로 표현하고, auto-award 이후 fee accrual을 중단한다.
-   **Testing**: 실패하는 테스트를 먼저 작성 (teleport happy path, cooldown, jackpot accrual/award, fee delta) 후 구현.
-   **Observability**: `TeleportCompleted`, `JackpotAccrued`, `JackpotAwarded` 3종 이벤트만으로 상태 추적 가능하도록 한다.
-   **Versioning**: rulesVersion은 v2로 올리고 TeleportState는 lazy-init으로 기존 cat에 부여한다.

## Project Structure

```
docs/2.specs/003-teleporting-cats/
  ├─ spec.md
  ├─ plan.md
  ├─ data-model.md
  ├─ quickstart.md
  └─ tasks.md
contracts/src/
  ├─ VolatilityCats.sol        # teleport/jackpot 상태 및 이벤트
tests/contract/
  ├─ test_teleport.js
  ├─ test_jackpot.js
  └─ (optional) 추가 검증 테스트
scripts/
  └─ teleport-sim.js (선택)    # 5체인 투어 시뮬레이터
```

## Phase 0: Outline & Research

-   [ ] 체인 인덱스(0~5) 및 Grand Tour 목표 수치 확정
-   [ ] Jackpot fee를 CHURR mint 방식으로 적립할지 여부 확정 (ETH 경로는 `[POST-MVP]`)
-   [ ] CCIP payload hash 포맷(32바이트 vs 가변 길이) 결정
-   [ ] `[POST-MVP]` Death/Treat/유연 파라미터 범위 문서화

## Phase 1: Design & Contracts

-   [ ] `TeleportState`, `jackpotPool`, `jackpotWinner` 저장 구조와 getter 시그니처 정의
-   [ ] Lazy-init 전략: 기존 고양이 호출 시 TeleportState 기본값 부여 방식 확정
-   [ ] 이벤트 스키마/에러 코드 정의, spec ↔ code traceability 문서화
-   [ ] `[POST-MVP]` Death/Treat 확장 시 필요한 필드 표시

## Phase 2: Task Planning Approach

-   [ ] 테스트 우선 순서: (1) teleport happy path, (2) power gate & cooldown, (3) jackpot accrual & auto-award, (4) fee delta 확인
-   [ ] 각 테스트가 실패하는지 확인한 뒤 최소 구현 추가
-   [ ] Hardhat fixture에 mock feed 업데이트 헬퍼, jackpot balance assertion 포함
-   [ ] `[POST-MVP]` Death/DailyTreat 테스트는 별도 파일에 보류

## Rapid Execution Windows (Hackathon-Friendly)

| Slot | 시간(분) | 목표                      | 주요 산출물                                   | 리스크/완화                                |
| ---- | -------- | ------------------------- | --------------------------------------------- | ------------------------------------------ |
| 0    | 0-30     | 요구사항 수치 확정 & 설계 | 체인 맵, death curve, fee 정책 초안           | 수치 미확정 → `[NEEDS CLARIFICATION]` 표시 |
| 1    | 30-80    | Teleport 테스트 & 스텁    | `test_teleport.js` (happy path+쿨다운)        | Feeds stale → mock update                  |
| 2    | 80-140   | Jackpot accrual/award     | `test_jackpot.js`, fee delta assertion        | Pool 부족 → mint owner로 주입              |
| 3    | 140-180  | 문서화 & config getter    | spec/plan/quickstart 업데이트, view 함수 확인 | 추후 Death/Treat 항목에 `[POST-MVP]` 표시  |

## Complexity Tracking

-   **Death Probability Calibration**: 확률 곡선이 UX에 큰 영향 → 별도 시뮬 스크립트로 검증 필요
-   **Storage Expansion Risk**: ERC721 상태 옆에 새 struct 추가 시 storage layout 주의 (proxy 미사용이므로 재배포 허용)
-   **Multi-chain Narrative**: 실제 CCIP 미구현이므로, 사용자에게 “가상 체인 hop”이라는 점을 문서에 명시

## Progress Tracking

-   [ ] Phase 0 완료 (수치 확정 & 미정 항목 문서화)
-   [ ] Phase 1 완료 (설계/struct/이벤트 정의)
-   [ ] Phase 2 완료 (테스트 플랜 → 태스크)
-   [ ] 구현 & 배포 진행
