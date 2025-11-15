# Tasks: Volatility Cats

## Phase 3.1: Setup

- [x] T001 프로젝트 구조 생성 및 docs 폴더 설정
- [x] T002 Hardhat 환경 설정 및 의존성 설치

## Phase 3.2: Tests First (TDD)

- [ ] T010 [P] Contract test GET /volatility-cats/mint in tests/contract/test_mint.js
- [ ] T011 [P] Contract test POST /volatility-cats/{id}/missions in tests/contract/test_mission.js
- [ ] T012 [P] Contract test POST /volatility-cats/{id}/rewards in tests/contract/test_reward.js
- [ ] T013 [P] Contract test GET /volatility-cats/{id} in tests/contract/test_get_cat.js
- [ ] T014 [P] Contract test GET /volatility-cats/{id}/cooldowns/{type} in tests/contract/test_cooldown.js
- [ ] T015 [P] Contract test Oracle Imprint 생성/조회 (clan, temperament, fortuneTier, rarityTier, birthTrendBps, birthVolBucket, epochId, entropy)
- [ ] T016 [P] Contract test 변동성 High 버킷 시 보너스 룰렛/보상 동작 검증 `[POST-MVP]`

## Phase 3.3: Core Implementation

- [ ] T020 FishToken.sol 구현 및 배포
- [ ] T021 VolatilityCats.sol 코어 구조 구현 (생성자, 상태 변수)
- [ ] T022 mintRandomCat 함수 구현 (Oracle Imprint 초기화 포함)
- [ ] T023 runMission 함수 구현 (Chainlink 통합)
- [ ] T024 claimReward 함수 구현
- [ ] T025 View 함수들 구현 (getCat, getRemainingCooldown)
- [ ] T026 Oracle Imprint 조회용 View 보강 (imprint + game 상태 동시 반환)
- [ ] T027 변동성 기반 보너스 룰렛/보상 로직 구현 `[POST-MVP]`

## Phase 3.4: Integration

- [ ] T030 컨트랙트 간 통합 테스트 (VolatilityCats ↔ FishToken)
- [ ] T031 Chainlink 가격 피드 통합 테스트
- [ ] T032 이벤트 발생 검증
- [ ] T033 에러 케이스 통합 테스트

## Phase 3.5: Polish

- [ ] T040 가스 최적화 검토 및 개선
- [ ] T041 보안 감사 포인트 확인
- [ ] T042 배포 스크립트 작성
- [ ] T043 환경 설정 문서화

## Dependencies

- T020 → T021 (FishToken 먼저 배포되어야 VolatilityCats 생성 가능)
- T022 → T023 (민팅 후 미션 실행 가능)
- T010-014 → T020-025 (테스트 먼저 작성 후 구현)

## Parallel Examples

- T010-014: 민팅, 미션, 보상, 조회 테스트는 서로 독립적
- T022-025: 코어 함수들은 순차적이지만 개별 구현 가능

## Validation Checklist

- [ ] 각 함수별 happy path 테스트 존재
- [ ] 에러 케이스 테스트 존재 (권한, 쿨다운, 파라미터 검증)
- [ ] Chainlink 가격 데이터 활용 검증
- [ ] 이벤트 로깅 검증
- [ ] 가스 사용량 적정 수준
- [ ] 컨트랙트 간 상호작용 정상
- [ ] 배포 및 초기화 성공

## Definition of Done

각 태스크 완료 조건:
- **테스트 태스크 (T010-014)**: 실패하는 테스트 작성, 구현 후 통과 확인
- **구현 태스크 (T020-025)**: 코드 작성, 관련 테스트 모두 통과
- **통합 태스크 (T030-033)**: 여러 컴포넌트 연동 테스트 통과
- **폴리시 태스크 (T040-043)**: 코드 리뷰 완료, 문서화 완료
