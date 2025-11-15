# Implementation Plan: Multichain Teleport & Jackpot
**Branch**: `[003-teleporting-cats]` | **Date**: 2025-11-15 | **Spec**: `docs/2.specs/003-teleporting-cats/spec.md`

## Summary

Volatility Cats에 “체인 간 텔레포트” 게임 루프와 잭팟 은행을 추가한다. 각 텔레포트는 파워를 소모하고 사망 확률을 수반하며, 5개 체인을 모두 방문한 고양이는 잭팟 금고를 청구할 수 있다. Daily 미션 성공 시 츄르(CHURR) 보상이 지급되고, 모든 유료 트랜잭션의 일부가 잭팟으로 누적된다. 기존 컨트랙트 상태를 보존하면서 신규 `teleportState`, `jackpotVault`, `dailyTreatState`를 점진적으로 붙인다.

## Technical Context

- **Language**: Solidity 0.8.21, TypeScript (Hardhat scripts/tests), Markdown docs
- **Dependencies**: OpenZeppelin ERC721/Ownable, Chainlink price feed (entropy), Hardhat network/Monad Testnet
- **Storage**: 기존 `VolatilityCats` 맵에 `TeleportState` 매핑 추가, `JackpotVault` 단일 구조, `DailyTreatState.lastClaimAt` 맵
- **Testing**: Hardhat + Mocha/Chai, Foundry-style fuzz optional; focus on contract unit tests + integration (teleport/death/jackpot)
- **Platform**: 로컬 Hardhat(기본), Monad Testnet (배포 대상), 기타 체인 ID는 config 테이블에 기록
- **Performance**: teleport ≤250k gas, jackpot claim ≤200k gas, treat grant ≤120k gas
- **Constraints**: 실체인 간 CCIP 구현 대신 “가상의 체인 hop”으로 모델링, death 확률 함수·fee 자산에 대한 명확화 필요, 기존 스토리지 레이아웃 보존

### Env Strategy (Local → Testnet)

1. **Local Hardhat**: teleport RNG를 pseudo(random)으로 구현하고, payable fee를 Ether 대신 mock ERC20으로 처리해 빠른 반복 테스트.
2. **Monad Testnet**: `network-config.ts`에 5개 체인 ID 매핑 추가, 텔레포트 수수료를 CHURR (ERC20) 기준으로 누적. Daily Treat 지급은 ChurrToken owner 권한을 이용해 mint or transfer.
3. **Observability**: Hardhat Network에서 이벤트 로그를 스냅샷으로 덤프하여 Quickstart와 Result Log에 첨부.

## Constitution Check

- **Simplicity**: Teleport/Jackpot/DailyTreat을 각각 독립 모듈화(라이브러리 or internal struct)하여 단일 함수에 과도한 책임이 몰리지 않도록 한다.
- **Architecture**: 기존 미션 로직과 텔레포트 로직을 분리, jackpotVault는 은행 계약 대신 VolatilityCats 내부 금고(관리자만 파라미터 변경).
- **Testing**: 모든 기능은 failing test → 구현 순; 텔레포트 happy path/사망/잭팟/데일리 보상/fee 누적 테스트를 우선 작성.
- **Observability**: `TeleportPerformed`, `CatMortality`, `JackpotReady`, `JackpotClaimed`, `DailyTreatGranted`, `FeeSkimmed` 이벤트 필수화.
- **Versioning**: `gameState.rulesVersion`를 증가시키고 `teleportState.version` 필드로 새 규칙 적용 여부를 추적.

## Project Structure

```
docs/2.specs/003-teleporting-cats/
  ├─ spec.md
  ├─ plan.md
  ├─ data-model.md
  ├─ quickstart.md
  └─ tasks.md
contracts/src/
  ├─ VolatilityCats.sol        # teleport/jackpot 상태 추가
  ├─ libraries/TeleportLib.sol # (신규) 확률 계산/비트맵 도우미
  └─ jackpot/JackpotBank.sol?  # 필요 시 내부 금고 추출
tests/contract/
  ├─ test_teleport.js
  ├─ test_jackpot.js
  ├─ test_daily_treat.js
  └─ test_fee_pool.js
scripts/
  └─ teleport-sim.js           # 5체인 투어 시뮬레이터
```

## Phase 0: Outline & Research

- [ ] 확정 체인 목록(5개) 및 체인 인덱스 ↔ 체인 ID 매핑 정의
- [ ] Death 확률 곡선(기울기, 최소·최대 위험) 수치 확정 `[NEEDS CLARIFICATION]`
- [ ] 잭팟 수수료 자산 종류(ETH vs CHURR) 및 분배 정책 결정
- [ ] Daily Treat 보상량 및 쿨다운 24h 여부 확정

## Phase 1: Design & Contracts

- [ ] `TeleportSettings`, `TeleportState`, `JackpotVault`, `DailyTreatState` 저장 구조 설계
- [ ] `TeleportLib` (비트맵 set/unset, deathChance 계산) 설계
- [ ] Lazy-init 전략: 기존 고양이 호출 시 상태 자동 생성 로직 작성
- [ ] 이벤트 스키마/에러 코드 정의, spec ↔ code traceability 문서화

## Phase 2: Task Planning Approach

- [ ] 테스트 우선 순서: (1) teleport happy path, (2) power gate & cooldown, (3) death path, (4) jackpot accrual/claim, (5) daily treat, (6) fee pool
- [ ] 각 테스트가 실패하는지 확인한 뒤 최소 구현 추가
- [ ] Hardhat fixture에 teleport config, mock jackpot vault 초기화 포함
- [ ] Payable fee 처리를 위해 ETH/CHURR 경로 각각 테스트
- [ ] 통합 테스트에서 Grand Tour → jackpot claim → fee reset 전체 여정 검증

## Rapid Execution Windows (Hackathon-Friendly)

| Slot | 시간(분) | 목표 | 주요 산출물 | 리스크/완화 |
| --- | --- | --- | --- | --- |
| 0 | 0-30 | 요구사항 수치 확정 & 설계 | 체인 맵, death curve, fee 정책 초안 | 수치 미확정 → `[NEEDS CLARIFICATION]` 표시 |
| 1 | 30-80 | Teleport 테스트 & 스텁 | `test_teleport.js`, TeleportLib 스켈레톤 | 가스 증가 → struct packing 검토 |
| 2 | 80-140 | Jackpot/DailyTreat 로직 | `test_jackpot.js`, `test_daily_treat.js`, vault stub | 풀 자금 부족 → mock mint로 주입 |
| 3 | 140-180 | Fee 누적 + 문서화 | `test_fee_pool.js`, Quickstart/Docs 업데이트 | 시간 부족 → fee 테스트 최소 happy path |

## Complexity Tracking

- **Death Probability Calibration**: 확률 곡선이 UX에 큰 영향 → 별도 시뮬 스크립트로 검증 필요
- **Storage Expansion Risk**: ERC721 상태 옆에 새 struct 추가 시 storage layout 주의 (proxy 미사용이므로 재배포 허용)
- **Multi-chain Narrative**: 실제 CCIP 미구현이므로, 사용자에게 “가상 체인 hop”이라는 점을 문서에 명시

## Progress Tracking

- [ ] Phase 0 완료 (수치 확정 & 미정 항목 문서화)
- [ ] Phase 1 완료 (설계/struct/이벤트 정의)
- [ ] Phase 2 완료 (테스트 플랜 → 태스크)
- [ ] 구현 & 배포 진행


