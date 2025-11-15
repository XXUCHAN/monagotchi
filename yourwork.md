# Your Work Checklist (Hackathon D-3h)

## 지금 바로 준비할 것

1. **테스트넷 선택 확정**: ✅ Monad testnet 선택됨 → RPC URL: https://testnet-rpc.monad.xyz/ (Chain ID: 10143)
2. **배포 키 제공**: ✅ Agent가 임의 계정 생성 완료 (0xB01E0188665fc89a1335b602aaB741272a5AaD41) → MON/LINK faucet 전송 필요 (최소 잔액: MON 0.2, LINK 2)
3. **Feed/Router 정보 확인**: Agent가 `contracts/testnet-datastream.json` 및 network-config.ts 업데이트 진행 중
4. **파우셋 실행**: 사용자가 MON faucet (https://faucet.monad.xyz/) 및 LINK faucet 실행 필요, Transaction hash 기록
5. **비상 연락/승인**: 보안·비용 관련 A2 승인 필요 여부 판단, Slack/DM로 즉시 응답 가능 상태 유지

## Agent 실행 중 모니터링 포인트

-   배포 스크립트가 실패하면 RPC/LINK 잔액 로그를 받아 빠르게 보충
-   CCIP Router 정보가 불확실하면 Chainlink Discord/Docs에서 확인 후 전달
-   테스트넷 배포 완료 시 주소를 검증하고 explorer 링크를 Release 노트에 첨부

## 해커톤 제출 직전

-   `docs/3.release/RELEASE-2025-11-15.md`의 기록을 검토하고 Presenter용 슬라이드에 반영
-   `docs/reports/`에 저장된 한국어 리포트 요약본을 데모 스크립트에 포함
-   미완료 항목(예: CCIP 실배포) 존재 시 장애 사유와 다음 액션을 한 문장으로 정리해 심사 응대 준비

## Answer

1. 테스트넷: Monad testnet
