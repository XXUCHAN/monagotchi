// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
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
    error TeleportCooldown(uint256 remainingSeconds);
    error TeleportPowerTooLow(uint256 currentPower, uint256 requiredPower);
    error TeleportDestinationNotAllowed(uint32 destination);
    error CatInactive();
    error JackpotPayoutFailed();

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

    struct TeleportState {
        uint32 currentChainId;
        uint32 visitedChainsBitmap;
        uint8 teleportCount;
        uint8 uniqueChainsVisited;
        uint64 lastTeleportAt;
        bool isAlive;
        bool jackpotEligible;
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
    event TeleportCompleted(
        uint256 indexed tokenId,
        uint32 indexed fromChainId,
        uint32 indexed toChainId,
        uint8 teleportCount,
        uint32 visitedBitmap,
        bytes32 payloadHash
    );
    event JackpotAccrued(
        bytes32 indexed source,
        uint256 amount,
        uint256 newBalance
    );
    event JackpotAwarded(
        uint256 indexed tokenId,
        address indexed winner,
        uint256 amount
    );

    // 상수들
    uint256 private constant REWARD_AMOUNT = 10 ether; // 10 CHURR 토큰
    uint256 private constant POWER_THRESHOLD = 50; // 보상 임계값
    uint256 private constant DAILY_COOLDOWN = 12 hours;
    uint256 private constant WEEKLY_COOLDOWN = 7 days;
    uint256 private constant MONTHLY_COOLDOWN = 30 days;
    uint8 private constant GRAND_TOUR_TARGET = 5;
    uint32 private constant TELEPORT_COOLDOWN = 1 hours;
    uint32 private constant TELEPORT_POWER_COST = 5;
    uint32 private constant HOME_CHAIN_ID = 0;
    uint32 private constant MAX_CHAIN_ID = 5;
    uint256 private constant JACKPOT_FEE_PER_MINT = 1 ether;
    uint256 private constant JACKPOT_FEE_PER_MISSION = 0.2 ether;
    uint256 private constant JACKPOT_FEE_PER_TELEPORT = 1 ether;
    bytes32 private constant JACKPOT_SOURCE_MINT = keccak256("JACKPOT_MINT");
    bytes32 private constant JACKPOT_SOURCE_MISSION =
        keccak256("JACKPOT_MISSION");
    bytes32 private constant JACKPOT_SOURCE_TELEPORT =
        keccak256("JACKPOT_TELEPORT");

    // 상태 변수들
    uint256 private nextTokenId;
    uint32 private epochWindow; // 에폭 계산용 윈도우 (초 단위)

    mapping(uint256 => Cat) private cats;
    mapping(uint256 => TeleportState) private teleportStates;
    AssetRegistry private assetRegistry;

    IChurrToken private fishToken;
    uint256 private jackpotPool;
    bool private jackpotClaimed;
    address private jackpotWinner;

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

        PriceFeedGuard.PriceData memory priceData = _getPriceData(assetId);

        uint256 tokenId = nextTokenId++;
        _mint(msg.sender, tokenId);

        // Oracle Imprint 생성
        OracleImprint memory imprint = _generateOracleImprint(
            clan,
            assetId,
            priceData
        );
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
        teleportStates[tokenId] = TeleportState({
            currentChainId: HOME_CHAIN_ID,
            visitedChainsBitmap: _chainMask(HOME_CHAIN_ID),
            teleportCount: 0,
            uniqueChainsVisited: 0,
            lastTeleportAt: 0,
            isAlive: true,
            jackpotEligible: false
        });

        _accrueJackpot(JACKPOT_FEE_PER_MINT, JACKPOT_SOURCE_MINT);

        emit CatMinted(
            tokenId,
            msg.sender,
            clan,
            priceData.price,
            priceData.updatedAt
        );
        return tokenId;
    }

    // Oracle Imprint 생성 내부 함수
    function _generateOracleImprint(
        uint8 clan,
        bytes32 assetId,
        PriceFeedGuard.PriceData memory priceData
    ) private view returns (OracleImprint memory) {
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
                        priceData.price,
                        priceData.roundId,
                        priceData.updatedAt
                    )
                )
            )
        );

        // 가격 기반 트렌드 계산 (더 현실적인 로직)
        // 가격 데이터를 활용하여 birthTrendBps 계산
        int32 trendBps = _calculatePriceTrend(priceData.price, entropy);

        // 변동성 버킷 계산 (AssetRegistry 구성을 그대로 사용)
        uint32 volBucket = uint32(
            assetRegistry.getAssetVolatilityTier(assetId)
        );

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

        bytes32 assetId = getAssetIdFromClan(cat.imprint.clan);
        PriceFeedGuard.PriceData memory priceData = _getPriceData(assetId);
        uint8 volatilityTier = assetRegistry.getAssetVolatilityTier(assetId);

        powerGained = _calculatePowerGain(
            cat.imprint,
            priceData,
            missionType,
            volatilityTier
        );

        uint256 updatedPower = uint256(cat.game.power) + powerGained;
        if (updatedPower > type(uint32).max) {
            cat.game.power = type(uint32).max;
        } else {
            cat.game.power = uint32(updatedPower);
        }
        newPower = cat.game.power;

        // 쿨다운 업데이트
        uint64 currentTime = uint64(block.timestamp);
        if (missionType == 0) cat.game.lastMissionDaily = currentTime;
        else if (missionType == 1) cat.game.lastMissionWeekly = currentTime;
        else if (missionType == 2) cat.game.lastMissionMonthly = currentTime;
        else revert InvalidMissionType();

        emit MissionCompleted(tokenId, missionType, powerGained);
        _accrueJackpot(JACKPOT_FEE_PER_MISSION, JACKPOT_SOURCE_MISSION);
        return (powerGained, newPower);
    }

    // 파워 증가 계산 내부 함수
    function _calculatePowerGain(
        OracleImprint memory imprint,
        PriceFeedGuard.PriceData memory priceData,
        uint8 missionType,
        uint8 volatilityTier
    ) private view returns (uint32) {
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    priceData.roundId,
                    priceData.price,
                    imprint.entropy,
                    missionType
                )
            )
        );

        // 기본 파워 증가 (1, 3, 5 중 하나)
        uint32 basePower = (uint32(seed % 3) * 2) + 1;

        // 미션 타입별 가중치
        if (missionType == 1) {
            basePower += 1; // Weekly 보상
        } else if (missionType == 2) {
            basePower += 2; // Monthly 보상
        }

        // temperament에 따른 보정
        if (imprint.temperament == 0) {
            // 비관적
            basePower = (basePower * 80) / 100; // 20% 감소
            if (basePower == 0) basePower = 1; // 최소 1 보장
        } else if (imprint.temperament == 2) {
            // 낙관적
            basePower = (basePower * 120) / 100; // 20% 증가
        }

        // fortune tier 보정
        if (imprint.fortuneTier == 2) {
            basePower += 1;
        } else if (imprint.fortuneTier == 0 && basePower > 1) {
            basePower -= 1;
        }

        // 현재 가격 트렌드와 탄생 트렌드 비교
        int32 currentTrend = _calculatePriceTrend(
            priceData.price,
            uint64(seed)
        );
        if (currentTrend > imprint.birthTrendBps) {
            basePower += 1;
        } else if (currentTrend < imprint.birthTrendBps && basePower > 1) {
            basePower -= 1;
        }

        // 변동성 티어 보정
        if (volatilityTier >= 2) {
            basePower += 1;
        } else if (volatilityTier == 0 && basePower > 1) {
            basePower -= 1;
        }

        return basePower;
    }

    function teleportToChain(
        uint256 tokenId,
        uint32 destinationChainId,
        bytes calldata ccipPayload
    ) external nonReentrant returns (TeleportState memory) {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        TeleportState storage teleport = _ensureTeleportState(tokenId);
        if (!teleport.isAlive) revert CatInactive();
        if (!_isSupportedDestination(destinationChainId)) {
            revert TeleportDestinationNotAllowed(destinationChainId);
        }
        if (destinationChainId == teleport.currentChainId) {
            revert TeleportDestinationNotAllowed(destinationChainId);
        }

        uint256 cooldownRemaining = _getRemainingTeleportCooldown(teleport);
        if (cooldownRemaining > 0) {
            revert TeleportCooldown(cooldownRemaining);
        }

        Cat storage cat = cats[tokenId];
        if (cat.game.power < TELEPORT_POWER_COST) {
            revert TeleportPowerTooLow(cat.game.power, TELEPORT_POWER_COST);
        }

        cat.game.power -= TELEPORT_POWER_COST;

        uint32 previousChain = teleport.currentChainId;
        teleport.currentChainId = destinationChainId;
        teleport.lastTeleportAt = uint64(block.timestamp);
        teleport.teleportCount += 1;

        uint32 mask = _chainMask(destinationChainId);
        if ((teleport.visitedChainsBitmap & mask) == 0) {
            teleport.visitedChainsBitmap |= mask;
            teleport.uniqueChainsVisited += 1;
        }

        bytes32 payloadHash = keccak256(ccipPayload);

        emit TeleportCompleted(
            tokenId,
            previousChain,
            destinationChainId,
            teleport.teleportCount,
            teleport.visitedChainsBitmap,
            payloadHash
        );

        _accrueJackpot(JACKPOT_FEE_PER_TELEPORT, JACKPOT_SOURCE_TELEPORT);

        if (
            !teleport.jackpotEligible &&
            teleport.uniqueChainsVisited >= GRAND_TOUR_TARGET
        ) {
            teleport.jackpotEligible = true;
            if (!jackpotClaimed && jackpotPool > 0) {
                _awardJackpot(tokenId, msg.sender);
            }
        }

        return teleport;
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

    function _getRemainingTeleportCooldown(
        TeleportState memory teleport
    ) private view returns (uint256) {
        if (teleport.lastTeleportAt == 0) {
            return 0;
        }
        uint256 elapsed = block.timestamp - teleport.lastTeleportAt;
        if (elapsed >= TELEPORT_COOLDOWN) {
            return 0;
        }
        return TELEPORT_COOLDOWN - elapsed;
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
        returns (
            uint256 tokenId_,
            OracleImprint memory imprint,
            CatGameState memory game,
            TeleportState memory teleport,
            address ownerAddress
        )
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        Cat storage cat = cats[tokenId];
        OracleImprint memory imprintData = cat.imprint;
        CatGameState memory gameData = cat.game;
        address catOwner = ownerOf(tokenId);
        TeleportState memory teleportData = teleportStates[tokenId];
        if (teleportData.visitedChainsBitmap == 0) {
            teleportData = TeleportState({
                currentChainId: HOME_CHAIN_ID,
                visitedChainsBitmap: _chainMask(HOME_CHAIN_ID),
                teleportCount: 0,
                uniqueChainsVisited: 0,
                lastTeleportAt: 0,
                isAlive: true,
                jackpotEligible: false
            });
        }
        return (tokenId, imprintData, gameData, teleportData, catOwner);
    }

    function getTeleportState(
        uint256 tokenId
    ) external view returns (TeleportState memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        TeleportState memory teleport = teleportStates[tokenId];
        if (teleport.visitedChainsBitmap == 0) {
            teleport = TeleportState({
                currentChainId: HOME_CHAIN_ID,
                visitedChainsBitmap: _chainMask(HOME_CHAIN_ID),
                teleportCount: 0,
                uniqueChainsVisited: 0,
                lastTeleportAt: 0,
                isAlive: true,
                jackpotEligible: false
            });
        }
        return teleport;
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

    function teleportConfig()
        external
        pure
        returns (uint32 cooldownSeconds, uint8 targetChains, uint32 powerCost)
    {
        return (TELEPORT_COOLDOWN, GRAND_TOUR_TARGET, TELEPORT_POWER_COST);
    }

    function jackpotConfig()
        external
        pure
        returns (uint256 mintFee, uint256 missionFee, uint256 teleportFee)
    {
        return (
            JACKPOT_FEE_PER_MINT,
            JACKPOT_FEE_PER_MISSION,
            JACKPOT_FEE_PER_TELEPORT
        );
    }

    function jackpotBalance() external view returns (uint256) {
        return jackpotPool;
    }

    function getJackpotState()
        external
        view
        returns (
            uint256 balance,
            bool claimed,
            address winner,
            uint8 targetChains
        )
    {
        return (jackpotPool, jackpotClaimed, jackpotWinner, GRAND_TOUR_TARGET);
    }

    function getTeleportCooldown(
        uint256 tokenId
    ) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        TeleportState memory teleport = teleportStates[tokenId];
        return _getRemainingTeleportCooldown(teleport);
    }

    function _ensureTeleportState(
        uint256 tokenId
    ) private returns (TeleportState storage) {
        TeleportState storage teleport = teleportStates[tokenId];
        if (teleport.visitedChainsBitmap == 0) {
            teleport.currentChainId = HOME_CHAIN_ID;
            teleport.visitedChainsBitmap = _chainMask(HOME_CHAIN_ID);
            teleport.uniqueChainsVisited = 0;
            teleport.isAlive = true;
        }
        return teleport;
    }

    function _accrueJackpot(uint256 amount, bytes32 source) private {
        if (jackpotClaimed || amount == 0) {
            return;
        }
        fishToken.mintTo(address(this), amount);
        jackpotPool += amount;
        emit JackpotAccrued(source, amount, jackpotPool);
    }

    function _awardJackpot(uint256 tokenId, address winner) private {
        uint256 payout = jackpotPool;
        jackpotPool = 0;
        jackpotClaimed = true;
        jackpotWinner = winner;
        bool success = fishToken.transfer(winner, payout);
        if (!success) revert JackpotPayoutFailed();
        emit JackpotAwarded(tokenId, winner, payout);
    }

    function _chainMask(uint32 chainId) private pure returns (uint32) {
        return uint32(1) << chainId;
    }

    function _isSupportedDestination(
        uint32 chainId
    ) private pure returns (bool) {
        return chainId > HOME_CHAIN_ID && chainId <= MAX_CHAIN_ID;
    }

    function _getPriceData(
        bytes32 assetId
    ) private view returns (PriceFeedGuard.PriceData memory) {
        address feedAddress = assetRegistry.getAssetFeed(assetId);
        return PriceFeedGuard.getValidatedPrice(feedAddress);
    }
}
