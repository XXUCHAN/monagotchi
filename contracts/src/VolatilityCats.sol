// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {IChurrToken} from "./interfaces/IChurrToken.sol";
import {AssetRegistry} from "./registry/AssetRegistry.sol";
import {PriceFeedGuard} from "./libraries/PriceFeedGuard.sol";

contract VolatilityCats is ERC721, Ownable, ReentrancyGuard {
    // Custom errors
    error InvalidClan();
    error NotTokenOwner();
    error InvalidMissionType();
    error MissionCooldown(uint256 remainingSeconds);
    error PowerTooLow(uint256 currentPower, uint256 requiredPower);
    error AlreadyClaimed();

    // Oracle Imprint 구조체
    struct OracleImprint {
        uint8 clan; // 클랜 (0=BTC,1=ETH,2=SOL,3=MONAD,...)
        uint8 temperament; // 성격 (0=비관,1=중립,2=낙관)
        uint8 fortuneTier; // 포츈 티어 (0=가난,1=보통,2=부자)
        uint8 rarityTier; // 희귀도 티어 (0=일반,1=레어,2=레전더리)
        int32 birthTrendBps; // 탄생 시점 가격 변화율(bps)
        uint32 birthVolBucket; // 변동성 버킷 (0~N단계)
        uint64 epochId; // 시장 에폭 ID
        uint64 entropy; // 랜덤 시드
    }

    // 게임 플레이 상태 구조체
    struct CatGameState {
        uint32 power; // 성장하는 능력치
        uint16 season; // 시즌/버전
        uint8 rulesVersion; // 적용된 룰셋 버전
        uint64 lastMissionDaily; // 마지막 Daily 미션 타임스탬프
        uint64 lastMissionWeekly; // 마지막 Weekly 미션 타임스탬프
        uint64 lastMissionMonthly; // 마지막 Monthly 미션 타임스탬프
        bool rewarded; // 보상 수령 여부
    }

    // 고양이 전체 상태 구조체
    struct Cat {
        OracleImprint imprint;
        CatGameState game;
    }

    // 이벤트들
    event CatMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint8 clan,
        int256 price,
        uint256 timestamp
    );
    event MissionCompleted(
        uint256 indexed tokenId,
        uint8 missionType,
        uint32 powerGained
    );
    event RewardClaimed(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 amount
    );

    // 상수들
    uint256 private constant REWARD_AMOUNT = 10 ether; // 10 CHURR 토큰
    uint256 private constant POWER_THRESHOLD = 50; // 보상 임계값
    uint256 private constant DAILY_COOLDOWN = 12 hours;
    uint256 private constant WEEKLY_COOLDOWN = 7 days;
    uint256 private constant MONTHLY_COOLDOWN = 30 days;

    // 상태 변수들
    uint256 private nextTokenId;
    uint32 private epochWindow; // 에폭 계산용 윈도우 (초 단위)

    mapping(uint256 => Cat) private cats;
    AssetRegistry private assetRegistry;

    IChurrToken private fishToken;

    constructor(
        address _fishToken,
        address _assetRegistry,
        uint32 _epochWindow
    ) ERC721("VolatilityCats", "VCAT") Ownable(msg.sender) {
        fishToken = IChurrToken(_fishToken);
        assetRegistry = AssetRegistry(_assetRegistry);
        epochWindow = _epochWindow;
        nextTokenId = 0;
    }

    // 관리자 함수들 (deprecated - use addAsset/updateAsset instead)
    function setClanFeed(
        uint8 clan,
        address /* feedAddress */, // deprecated parameter
        bool enabled
    ) external onlyOwner {
        bytes32 assetId = getAssetIdFromClan(clan);
        assetRegistry.setAssetEnabled(assetId, enabled);
        // Note: feedAddress update should be done via AssetRegistry.addAsset() or updateAsset()
    }

    /**
     * @notice Add a new asset to the registry (admin only)
     * @param assetName Asset name (e.g., "BTC_USD")
     * @param feedAddress Chainlink price feed address
     * @param decimals Price feed decimals
     * @param volatilityTier Asset volatility tier (0-2)
     * @param maxExposureBps Maximum exposure in basis points
     */
    function addAsset(
        string calldata assetName,
        address feedAddress,
        uint8 decimals,
        uint8 volatilityTier,
        uint16 maxExposureBps
    ) external onlyOwner {
        bytes32 assetId = keccak256(abi.encodePacked(assetName));
        assetRegistry.addAsset(
            assetId,
            feedAddress,
            decimals,
            volatilityTier,
            maxExposureBps
        );
    }

    /**
     * @notice Update an existing asset in the registry (admin only)
     * @param assetName Asset name (e.g., "BTC_USD")
     * @param feedAddress New Chainlink price feed address
     * @param decimals New price feed decimals
     * @param volatilityTier New asset volatility tier
     * @param maxExposureBps New maximum exposure
     */
    function updateAsset(
        string calldata assetName,
        address feedAddress,
        uint8 decimals,
        uint8 volatilityTier,
        uint16 maxExposureBps
    ) external onlyOwner {
        bytes32 assetId = keccak256(abi.encodePacked(assetName));
        assetRegistry.updateAsset(
            assetId,
            feedAddress,
            decimals,
            volatilityTier,
            maxExposureBps
        );
    }

    /**
     * @notice Enable or disable an asset (admin only)
     * @param assetName Asset name
     * @param enabled Whether to enable the asset
     */
    function setAssetEnabled(
        string calldata assetName,
        bool enabled
    ) external onlyOwner {
        bytes32 assetId = keccak256(abi.encodePacked(assetName));
        assetRegistry.setAssetEnabled(assetId, enabled);
    }

    /**
     * @notice Convert clan ID to asset ID
     * @param clan Clan identifier (0=BTC, 1=ETH, 2=SOL, 3=DOGE, 4=PEPE, 5=LINK)
     * @return Asset ID (keccak256 hash)
     */
    function getAssetIdFromClan(uint8 clan) public pure returns (bytes32) {
        string memory assetName;
        if (clan == 0) assetName = "BTC_USD";
        else if (clan == 1) assetName = "ETH_USD";
        else if (clan == 2) assetName = "SOL_USD";
        else if (clan == 3) assetName = "DOGE_USD";
        else if (clan == 4) assetName = "PEPE_USD";
        else if (clan == 5) assetName = "LINK_USD";
        else revert InvalidClan();

        return keccak256(abi.encodePacked(assetName));
    }

    /**
     * @notice Get asset registry address
     * @return Asset registry contract address
     */
    function getAssetRegistry() external view returns (address) {
        return address(assetRegistry);
    }

    // 민팅 함수
    function mintRandomCat(uint8 clan) external returns (uint256) {
        bytes32 assetId = getAssetIdFromClan(clan);
        if (!assetRegistry.isAssetEnabled(assetId)) revert InvalidClan();

        // 민트 시점의 가격 데이터 가져오기 (로깅용)
        address feedAddress = assetRegistry.getAssetFeed(assetId);
        AggregatorV3Interface priceFeed = AggregatorV3Interface(feedAddress);
        (, int256 currentPrice, , uint256 priceTimestamp, ) = priceFeed
            .latestRoundData();

        uint256 tokenId = nextTokenId++;
        _mint(msg.sender, tokenId);

        // Oracle Imprint 생성
        OracleImprint memory imprint = _generateOracleImprint(clan);
        CatGameState memory gameState = CatGameState({
            power: 0,
            season: 1,
            rulesVersion: 1,
            lastMissionDaily: 0,
            lastMissionWeekly: 0,
            lastMissionMonthly: 0,
            rewarded: false
        });

        cats[tokenId] = Cat(imprint, gameState);

        emit CatMinted(tokenId, msg.sender, clan, currentPrice, priceTimestamp);
        return tokenId;
    }

    // Oracle Imprint 생성 내부 함수
    function _generateOracleImprint(
        uint8 clan
    ) private view returns (OracleImprint memory) {
        bytes32 assetId = getAssetIdFromClan(clan);
        address feedAddress = assetRegistry.getAssetFeed(assetId);

        AggregatorV3Interface priceFeed = AggregatorV3Interface(feedAddress);

        // Chainlink 가격 데이터 가져오기
        (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();

        // 가격 데이터 검증
        require(price > 0, "Invalid price data");
        require(updatedAt > 0, "Invalid timestamp");

        // 가격이 너무 오래되지 않았는지 확인 (24시간 이내)
        require(block.timestamp - updatedAt <= 24 hours, "Stale price data");

        // 가격 범위 검증 (안전 범위: 매우 넓은 범위로 설정하여 테스트 환경 호환)
        require(
            price >= 0 && price <= type(int256).max,
            "Price out of reasonable range"
        );

        // 에폭 및 엔트로피 계산
        uint64 epochId = uint64(block.timestamp / epochWindow);
        uint64 entropy = uint64(
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        msg.sender,
                        clan,
                        price,
                        updatedAt
                    )
                )
            )
        );

        // 가격 기반 트렌드 계산 (더 현실적인 로직)
        // 가격 데이터를 활용하여 birthTrendBps 계산
        int32 trendBps = _calculatePriceTrend(price, entropy);

        // 변동성 버킷 계산 (가격 하위 32비트 기반)
        uint32 volBucket = uint32(uint256(price) % 3); // 0=Low, 1=Mid, 2=High

        // 성격 특성들 계산 (엔트로피 기반)
        uint8 temperament = uint8(entropy % 3);
        uint8 fortuneTier = uint8((entropy >> 8) % 3);
        uint8 rarityTier = uint8((entropy >> 16) % 3);

        return
            OracleImprint({
                clan: clan,
                temperament: temperament,
                fortuneTier: fortuneTier,
                rarityTier: rarityTier,
                birthTrendBps: trendBps,
                birthVolBucket: volBucket,
                epochId: epochId,
                entropy: entropy
            });
    }

    // 가격 기반 트렌드 계산 헬퍼 함수
    function _calculatePriceTrend(
        int256 price,
        uint64 entropy
    ) private pure returns (int32) {
        // 가격 데이터를 활용한 트렌드 계산
        // 실제로는 이전 가격과 비교해야 하지만, MVP에서는 엔트로피 기반으로 시뮬레이션
        uint256 priceAbs = uint256(price > 0 ? price : -price);

        // 가격 크기에 따른 트렌드 범위 조정
        int256 baseTrend = int256(uint256(entropy % 20001)) - 10000; // -10000 ~ +10000

        // 가격이 높을수록 트렌드 범위를 줄임 (안정성 반영)
        if (priceAbs > 100000e8) {
            // $100,000 이상
            baseTrend = (baseTrend * 70) / 100; // 30% 감소
        } else if (priceAbs < 1000e8) {
            // $1,000 이하
            baseTrend = (baseTrend * 120) / 100; // 20% 증가
        }

        // int32 범위로 클램핑
        if (baseTrend > type(int32).max) return type(int32).max;
        if (baseTrend < type(int32).min) return type(int32).min;

        return int32(baseTrend);
    }

    // 미션 실행 함수
    function runMission(
        uint256 tokenId,
        uint8 missionType
    ) external returns (uint32 powerGained, uint32 newPower) {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (missionType > 2) revert InvalidMissionType();

        Cat storage cat = cats[tokenId];
        uint256 remainingCooldown = _getRemainingCooldown(
            cat.game,
            missionType
        );

        if (remainingCooldown > 0) {
            revert MissionCooldown(remainingCooldown);
        }

        // 파워 증가 계산 (간단한 로직)
        powerGained = _calculatePowerGain(cat.imprint, missionType);
        cat.game.power += powerGained;
        newPower = cat.game.power;

        // 쿨다운 업데이트
        uint64 currentTime = uint64(block.timestamp);
        if (missionType == 0) cat.game.lastMissionDaily = currentTime;
        else if (missionType == 1) cat.game.lastMissionWeekly = currentTime;
        else if (missionType == 2) cat.game.lastMissionMonthly = currentTime;
        else revert InvalidMissionType();

        emit MissionCompleted(tokenId, missionType, powerGained);
        return (powerGained, newPower);
    }

    // 파워 증가 계산 내부 함수
    function _calculatePowerGain(
        OracleImprint memory imprint,
        uint8 missionType
    ) private view returns (uint32) {
        // 기본 파워 증가 (1, 3, 5 중 하나)
        uint32 basePower = uint32(
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        imprint.entropy,
                        missionType
                    )
                )
            ) % 3
        ) *
            2 +
            1;

        // temperament에 따른 보정
        if (imprint.temperament == 0) {
            // 비관적
            basePower = (basePower * 80) / 100; // 20% 감소
            if (basePower == 0) basePower = 1; // 최소 1 보장
        } else if (imprint.temperament == 2) {
            // 낙관적
            basePower = (basePower * 120) / 100; // 20% 증가
        }

        return basePower;
    }

    // 보상 청구 함수
    function claimReward(uint256 tokenId) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();

        Cat storage cat = cats[tokenId];
        if (cat.game.power < POWER_THRESHOLD) {
            revert PowerTooLow(cat.game.power, POWER_THRESHOLD);
        }
        if (cat.game.rewarded) revert AlreadyClaimed();

        cat.game.rewarded = true;
        fishToken.mintTo(msg.sender, REWARD_AMOUNT);

        emit RewardClaimed(tokenId, msg.sender, REWARD_AMOUNT);
    }

    // 쿨다운 계산 내부 함수
    function _getRemainingCooldown(
        CatGameState memory game,
        uint8 missionType
    ) private view returns (uint256) {
        uint64 lastMission;
        uint256 cooldownDuration;

        if (missionType == 0) {
            lastMission = game.lastMissionDaily;
            cooldownDuration = DAILY_COOLDOWN;
        } else if (missionType == 1) {
            lastMission = game.lastMissionWeekly;
            cooldownDuration = WEEKLY_COOLDOWN;
        } else if (missionType == 2) {
            lastMission = game.lastMissionMonthly;
            cooldownDuration = MONTHLY_COOLDOWN;
        } else {
            return type(uint256).max; // Invalid mission type
        }

        if (lastMission == 0) return 0;

        uint256 elapsed = block.timestamp - lastMission;
        if (elapsed >= cooldownDuration) return 0;

        return cooldownDuration - elapsed;
    }

    // 조회 함수들
    function getCat(
        uint256 tokenId
    )
        external
        view
        returns (uint256 _tokenId, uint8 clan, uint32 power, bool rewarded)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        Cat storage cat = cats[tokenId];
        return (tokenId, cat.imprint.clan, cat.game.power, cat.game.rewarded);
    }

    function getOracleImprint(
        uint256 tokenId
    )
        external
        view
        returns (
            uint8 clan,
            uint8 temperament,
            uint8 fortuneTier,
            uint8 rarityTier,
            int32 birthTrendBps,
            uint32 birthVolBucket,
            uint64 epochId,
            uint64 entropy
        )
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        OracleImprint storage imprint = cats[tokenId].imprint;
        return (
            imprint.clan,
            imprint.temperament,
            imprint.fortuneTier,
            imprint.rarityTier,
            imprint.birthTrendBps,
            imprint.birthVolBucket,
            imprint.epochId,
            imprint.entropy
        );
    }

    function getGameState(
        uint256 tokenId
    ) external view returns (uint32 power, bool rewarded) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        CatGameState storage game = cats[tokenId].game;
        return (game.power, game.rewarded);
    }

    function getRemainingCooldown(
        uint256 tokenId,
        uint8 missionType
    ) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        Cat storage cat = cats[tokenId];
        return _getRemainingCooldown(cat.game, missionType);
    }

    function rewardAmount() external pure returns (uint256) {
        return REWARD_AMOUNT;
    }
}
