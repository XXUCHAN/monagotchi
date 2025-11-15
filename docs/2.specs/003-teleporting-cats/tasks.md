# Tasks: Multichain Teleport & Jackpot

## Phase 3.1: Setup

- [ ] T001 Teleport/Jackpot/Treat 요구사항 수치 확정 & `network-config.ts` 확장
- [ ] T002 Teleport fixture 헬퍼 및 Hardhat config 업데이트 (`fixtures/teleport.ts`)

## Phase 3.2: Tests First (TDD)

- [ ] T010 [P] Contract test 텔레포트 happy path (`tests/contract/test_teleport.js`) – 파워 차감, 체인 이동, 이벤트 검증
- [ ] T011 [P] Contract test 텔레포트 실패 케이스 – 파워 부족, 쿨다운, 미지원 체인
- [ ] T012 [P] Contract test 사망 확률 로직 – deterministic RNG로 사망/생존 분기 검증
- [ ] T013 [P] Contract test Grand Tour → 잭팟 자격 및 청구 (`test_jackpot.js`)
- [ ] T014 [P] Contract test Daily Treat 24h 쿨다운 및 CHURR 지급 (`test_daily_treat.js`)
- [ ] T015 [P] Contract test Fee 누적 및 풀 잔액 업데이트 (`test_fee_pool.js`)

## Phase 3.3: Core Implementation

- [ ] T020 TeleportState/TeleportSettings storage 및 getter 추가
- [ ] T021 TeleportLib 구현 (비트맵 조작, deathChance 계산, RNG 헬퍼)
- [ ] T022 `teleportToChain` 함수 구현 (payable/fee 처리 포함)
- [ ] T023 CatMortality 처리 및 `isAlive` enforcement
- [ ] T024 JackpotVault 상태 + `claimJackpot` 구현 (reentrancy guard)
- [ ] T025 Daily Treat 로직 + CHURR mint/transfer 연결

## Phase 3.4: Integration

- [ ] T030 Teleport/DailyTreat를 기존 미션/보상 흐름과 연결 (이벤트·파워 계산)
- [ ] T031 Fee accrual을 모든 진입점(mint, mission, teleport)으로 라우팅
- [ ] T032 Deploy/upgrade 스크립트 업데이트 (configurable params, vault seed)
- [ ] T033 Quickstart/Docs/ResultLog 갱신 (실행 로그 첨부)

## Phase 3.5: Polish

- [ ] T040 가스 최적화 (struct packing, unchecked 증가)
- [ ] T041 보안 점검 (access control, reentrancy, overflow)
- [ ] T042 프론트엔드 컨트랙트 ABI/메시지 스킴 업데이트 안내

## Dependencies

- T001 → T010~T015 (수치 확정 후 테스트 작성 가능)
- T010~T015 → T020~T025 (테스트 실패 확인 후 구현 진행)
- T022 → T024 (잭팟 청구는 텔레포트 상태에 의존)
- T025 → T033 (Daily Treat docs/스크립트 업데이트)

## Parallel Examples

- T010~T015는 서로 다른 기능을 다루므로 병렬 작성 가능
- T020~T023 (Teleport 코어)와 T024~T025 (Jackpot/Treat)는 다른 파일을 주로 수정하므로 병렬 구현 가능하나 스토리지 충돌 주의
- T030~T032는 순차 실행 필요 (통합 → 배포 스크립트)

## Validation Checklist

- [ ] 텔레포트/사망/잭팟/데일리보상/fee 케이스별 happy path & revert 테스트 존재
- [ ] 이벤트와 상태 변수 값이 Quickstart 시나리오와 일치
- [ ] 파워/사망 확률/fee 파라미터 변경이 관리자 전용으로 보호
- [ ] 잭팟 풀 잔액과 실제 CHURR/ETH 잔액이 일치 (`assertEq` or `expect`)
- [ ] Daily Treat 24h 쿨다운 위반 시 revert 검증
- [ ] Storage slot 증가로 인한 기존 데이터 파괴 방지 (migration script)

## Definition of Done

- **TDD 태스크**: 실패하는 테스트를 먼저 작성하고, 구현 후 모든 테스트 통과.
- **구현 태스크**: 관련 테스트 전부 통과 + 가스 리포트 확인 + 이벤트 로그 상이 없음.
- **통합/문서 태스크**: Quickstart/Spec과 실제 구현 상태가 동기화되었음을 검증, 필요 시 릴리스 노트에 영향 기록.


