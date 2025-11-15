# Suggestion Ingest

Date: 2025-11-15
Folder: docs/1.suggestion/2025-11-15-01
Author/Requester: User

## Summary (≤500 chars)

Monad Testnet + Chainlink Data Feeds + Privy를 활용한 소셜 펫 게임 컨트랙트 구현. 사용자는 BTC/ETH 진영 고양이를 민팅하고, Chainlink 가격 데이터를 활용한 미션으로 파워를 키워 FISH 토큰 보상을 받는 게임. 6시간 내 MVP 완성 목표로 프론트엔드는 제외하고 컨트랙트 구현에 집중.

## Context & Sources

- Files: contracts/VolatilityCats.sol, contracts/FishToken.sol
- Links: https://docs.monad.xyz/, https://dev.chain.link/changelog/data-feeds-on-monad-testnet

## Problem Statement

해커톤 환경에서 Monad Testnet 생태계를 활용한 재미있는 블록체인 게임을 빠르게 구현해야 함. Chainlink 오라클을 활용한 실시간 데이터 기반 게임 메커닉을 보여주고자 함.

## Goals & Non-Goals

- Goals: Volatility Cats 컨트랙트 완성, Chainlink 통합, 기본 게임 루프 구현
- Non-Goals: 프론트엔드 구현, 복잡한 게임 메커닉, 다중 토큰 이코노미

## Proposed Scope (candidate feature)

- In-Scope: 고양이 민팅, 미션 시스템, 보상 시스템, Chainlink 가격 데이터 활용
- Out-of-Scope: 프론트엔드, 고급 게임 기능, 커뮤니티 기능

## Evidence & References

- Signals/Observations: Monad Testnet 해커톤 참여, Chainlink Data Feeds 활용 가능성 확인
- Data/Benchmarks: 목표 6시간 구현, 100명 규모 테스트넷 사용자 타겟

## Acceptance Criteria Seeds

1. Given 사용자가 BTC 진영 선택 시, When 민팅하면, Then BTC alignment 고양이 생성
2. Given 고양이가 미션 실행 시, When Chainlink 가격 데이터 활용하면, Then 확률적 파워 증가
3. Given 파워 50 이상 고양이, When 보상 청구하면, Then 10 FISH 토큰 지급

## Risks & Constraints

- Risks: Chainlink 피드 다운타임, 가스 비용 증가, 해커톤 시간 제약
- Constraints: 6시간 구현 시간, Monad Testnet만 사용, 컨트랙트 포커스

## Open Questions

- Q1: Monad Testnet Chainlink 피드 주소는?
- Q2: Privy wallet integration은 프론트에서만 필요한가?
- Q3: 테스트넷 토큰 확보 방법은?

## Attachments

- .cursor/rules: 프로젝트 아이디어 및 요구사항 상세
- contracts/: 기존 컨트랙트 코드베이스

## Redactions

- 없음
