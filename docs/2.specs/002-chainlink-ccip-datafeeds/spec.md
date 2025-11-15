# Feature Specification: Chainlink CCIP & Datafeeds Integration

**Feature Branch**: `[002-chainlink-ccip-datafeeds]` **Created**: 2025-11-15 **Status**: Draft  
**Input**: "Chainlink CCIP·Datafeeds 기반 크로스체인 메시징과 다중 자산 확장 요구"

## User Scenarios & Testing

### Primary User Story

운영자는 Volatility Cats 게임 컨트랙트에 Chainlink CCIP 메시지 라우팅과 Data Feed/Stream 가격 검증을 붙여, BTC·ETH뿐 아니라 SOL, DOGE, PEPE, LINK 등의 신규 자산을 안전하게 온보딩하고 테스트넷/메인넷 배포를 반복 가능하게 만든다. 크로스체인 미션 결과나 보상 지시가 들어오면 컨트랙트는 CCIP 메시지를 수신해 페이로드를 검증하고 최신 가격 피드로 상태를 갱신한다.

### Acceptance Scenarios

1. Given CCIP 송신 컨트랙트가 게임 체인으로 미션 결과를 전송할 때, When Router가 메시지를 전달하면, Then 수신 컨트랙트는 `CCIPMessagePayload` 구조를 파싱하고 서명/nonce/체인 정보를 검증한 뒤 승인된 Data Feed를 사용해 상태를 업데이트한다.
2. Given 자산 레지스트리에 SOL, DOGE, PEPE, LINK가 구성되어 있을 때, When 사용자가 해당 클랜 고양이를 민팅하거나 미션을 실행하면, Then 컨트랙트는 자산별 피드 주소·변동성 파라미터를 조회해 동일한 로직으로 처리한다.
3. Given Data Feed 응답이 stale(예: 마지막 업데이트가 3분 이상) 하거나 deviation 한도를 초과했을 때, When CCIP 페이로드가 가격 참조를 요구하면, Then 컨트랙트는 트랜잭션을 revert 하고 이벤트로 비정상 상태를 기록한다.
4. Given 테스트넷 배포 프로세스가 실행될 때, When Hardhat 스크립트가 네트워크 설정/키/CCIP Router 주소를 로드하면, Then 모든 컨트랙트 주소·체인·커밋이 `docs/3.release/`에 기록된다.
5. Given CCIP 실행 수수료 부족 혹은 LINK 잔액이 모자랄 때, When 메시지 전송을 시도하면, Then 시스템은 사전에 fee check를 수행하고 실패 시 사용자에게 원인을 노출한다. `[NEEDS CLARIFICATION: fee 한도 및 자동 충전 정책]`
6. Given 프론트엔드 개발자가 로컬 Hardhat 네트워크에서 Volatility Cats를 호출할 때, When 컨트랙트가 가격을 조회하면, Then MockV3Aggregator(로컬 모의 피드)를 사용하고, 동일 코드가 dev/testnet 환경으로 배포되면 `testnet-datastream.json`/config에 정의된 실제 Chainlink v3 Aggregator 주소를 사용한다.

### Edge Cases

-   Feed 응답이 0이거나 음수인 경우
-   CCIP 메시지가 중복 실행되는 경우 (nonce 재사용)
-   신규 자산 온보딩 시 feed 주소가 오타나 미지원 체인을 가리키는 경우
-   테스트넷과 메인넷의 Router/Fee Token 구성이 불일치하여 배포 실패하는 경우
-   CCIP commit-store 지연으로 메시지가 timeout 되는 경우

## Requirements

### Functional Requirements

-   **FR-001**: CCIP Router 인터페이스를 통해 수신한 메시지를 `processMessage` 함수에서 검증하고 게임 로직에 전달해야 한다.
-   **FR-002**: 모든 CCIP 페이로드는 assetId, actionType, priceProof, nonce를 포함한 스키마를 따라야 하며, 유효성 검사를 통과하지 못하면 revert 해야 한다.
-   **FR-003**: 컨트랙트는 Chainlink Data Feed/Data Stream을 사용해 BTC, ETH, SOL, DOGE, PEPE, LINK 등 자산 가격을 조회하고 stale/round 검증을 수행해야 한다.
-   **FR-004**: `AssetRegistry` 혹은 동등한 저장소를 통해 자산별 feed 주소, volatilityMultiplier, exposureLimit 등을 온체인에 보관하고, 새 자산은 관리자 함수를 통해 추가할 수 있어야 한다.
-   **FR-005**: 테스트넷/메인넷 배포 시 Router 주소, chain selector, LINK 수수료 토큰 주소 등 환경설정이 한 곳(`network-config.ts` 등)에 모여 있어야 한다.
-   **FR-006**: 배포 후 Release 문서에 체인, 주소, 커밋 SHA, 테스트 결과를 기록해야 한다.
‑   **FR-007**: 로컬 개발 환경(local Hardhat)에서는 MockV3Aggregator 기반 피드를 사용하고, dev/testnet 환경에서는 `contracts/testnet-datastream.json` 또는 동등한 config로부터 실제 v3 Aggregator 주소를 로드해 사용해야 하며, 두 환경 모두 동일 ABI를 공유해야 한다.

### Non-Functional Requirements

-   **NFR-001 (Security)**: 수신 메시지는 CCIP Commit/Execute 검증을 통과해야 하며 재진입 방지와 액세스 컨트롤을 적용한다.
-   **NFR-002 (Reliability)**: Data Feed 장애 시 graceful fallback(트랜잭션 revert + 알림)을 제공하고, stale 데이터로 상태를 변경하지 않는다.
-   **NFR-003 (Observability)**: CCIP 메시지 처리와 가격 검증 실패를 이벤트/로그로 남겨 테스트넷 모니터링이 가능해야 한다.
-   **NFR-004 (Operability)**: 신규 자산 추가/제거 작업이 스크립트와 문서에 의해 1시간 이내 수행 가능해야 한다.

## Key Entities

```typescript
interface AssetConfig {
    assetId: bytes32;      // 예: keccak256("BTC_USD")
    feedAddress: address;  // Chainlink Data Feed
    decimals: uint8;
    volatilityTier: uint8; // 0=Low,1=Mid,2=High
    maxExposureBps: uint16;
    enabled: bool;
}

interface CCIPMessagePayload {
    uint64 srcChainSelector;
    bytes32 messageId;
    bytes32 assetId;
    uint8 actionType; // 0=MissionResult,1=Reward,2=Admin
    int256 price;     // latestAnswer
    uint256 updatedAt;
    bytes extraData;  // e.g. powerDelta, mission metadata
}

interface DeploymentRecord {
    string network;
    address router;
    address volatilityCats;
    address churrToken;
    bytes32 gitCommit;
    uint256 timestamp;
}
```

## Error Handling

-   `CCIP_InvalidSource`: 허용되지 않은 체인/주소에서 메시지를 수신한 경우
-   `CCIP_ReplayedMessage`: 이미 처리된 `messageId`가 재사용된 경우
-   `Feed_NotFound`: 등록되지 않은 assetId의 피드를 요청한 경우
-   `Feed_StaleData`: 최신 라운드가 허용된 지연 한도를 초과한 경우
-   `Asset_Disabled`: 비활성 자산으로 작업을 시도한 경우
-   `FeeToken_Insufficient`: CCIP 수수료 LINK가 부족한 경우

## Review & Acceptance Checklist

-   [ ] 모든 Acceptance Scenario에 대한 테스트 케이스가 식별되었는가?
-   [ ] CCIP 메시지 스키마와 자산 레지스트리 요구사항이 명확한가?
-   [ ] 다중 자산 확장을 위한 위험 파라미터가 정의되었는가?
-   [ ] 테스트넷/메인넷 배포 정보 기록 절차가 문서화되었는가?
-   [ ] 모호한 정책(예: fee 한도)이 `[NEEDS CLARIFICATION]`으로 표시되었는가?

