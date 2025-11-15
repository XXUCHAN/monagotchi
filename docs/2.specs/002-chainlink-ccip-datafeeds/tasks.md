# Tasks: Chainlink CCIP & Datafeeds Integration

## Phase 3.1: Setup
- [ ] T001 정적 분석: CCIP Router/chain selector/fee token 정보 수집 및 `network-config.ts` 초안 작성
- [ ] T002 Asset feed 목록 정리(`testnet-datastream.json` 확장) 및 위험 파라미터 정의

## Phase 3.2: Tests First (TDD)
- [ ] T010 CCIP 메시지 스키마 단위테스트 (`contracts/test/ccip/test_message_schema.ts`)
- [ ] T020 AssetRegistry 단위테스트 (자산 추가/비활성/파라미터 검증)
- [ ] T030 PriceFeedGuard 단위테스트 (stale/deviation 시나리오)
- [ ] T040 CCIP mock 통합테스트 (Router → Adapter → VolatilityCats 훅)
- [ ] T050 다중 자산 민팅/미션 플로우 시나리오 테스트 (BTC, ETH, SOL, DOGE, PEPE, LINK)
- [ ] T055 로컬(MockV3Aggregator) vs dev/testnet(실제 Aggregator) 환경별 feed 설정/조회 시나리오 테스트 및 프론트엔드 컨피그(JSON) 검증

## Phase 3.3: Core Implementation
- [ ] T060 ChainlinkCCIPAdapter 구현 및 `VolatilityCats` 연동 훅 추가
- [ ] T070 AssetRegistry/관리자 함수 및 config 라이브러리 구현
- [ ] T080 PriceFeedGuard/Feed 조회 모듈 구현
- [ ] T090 Hardhat 스크립트 업데이트 (배포/검증, config 공유)
‑ [ ] T095 환경별 feed 초기화 로직 구현 (local: MockV3Aggregator 배포 및 주입, dev/testnet: `testnet-datastream.json` 기반 실제 feed 주소 세팅)

## Phase 3.4: Integration
- [ ] T100 테스트넷 배포 Dry-run (퍼블릭 RPC, 테스트 키 사용)
- [ ] T110 LINK 수수료 모니터링/경보 로직 또는 매뉴얼 마련
- [ ] T120 Release 문서 업데이트 및 보고서(한국어) 작성

## Phase 3.5: Polish
- [ ] T130 문서 정리: quickstart, data model, README 배포 섹션 반영
- [ ] T140 피드 주소/자산 파라미터 변경 절차 가이드 작성
‑ [ ] T150 프론트엔드용 네트워크 컨피그(JSON) 및 사용 가이드 작성 (local=mock, dev/testnet=실제 feed)

## Dependencies
- CCIP 테스트넷 지원 여부 확인 후 진행 (T001 → T040)
- 테스트넷 키/LINK 확보 후 Dry-run 가능 (T002 → T100)

## Parallel Examples
- [P] T020/T030 (별도 라이브러리)  
- [P] T060/T070 (서로 다른 컨트랙트 파일이지만 인터페이스 확정 후 병행 가능)

## Validation Checklist
- [ ] 모든 자산(BTC, ETH, SOL, DOGE, PEPE, LINK) 테스트 포함
- [ ] CCIP 메시지 재생 공격 방어 테스트 포함
- [ ] 배포 스크립트가 config와 동일 소스를 참조하는지 확인
- [ ] Release 노트에 주소/체인/커밋 기록

