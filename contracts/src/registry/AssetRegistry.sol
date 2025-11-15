// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Asset Registry for Volatility Cats
 * @notice Manages asset configurations including Chainlink price feeds
 * @dev Supports multiple crypto assets with volatility parameters
 */
contract AssetRegistry is Ownable {
    // Custom errors
    error AssetNotFound(bytes32 assetId);
    error AssetAlreadyExists(bytes32 assetId);
    error InvalidAssetId();
    error InvalidFeedAddress();
    error AssetDisabled(bytes32 assetId);

    // Asset configuration structure
    struct AssetConfig {
        bytes32 assetId;           // keccak256 hash of asset name (e.g., keccak256("BTC_USD"))
        address feedAddress;       // Chainlink Data Feed address
        uint8 decimals;           // Price feed decimals
        uint8 volatilityTier;     // 0=Low, 1=Mid, 2=High volatility
        uint16 maxExposureBps;    // Maximum exposure in basis points (0-10000)
        bool enabled;             // Whether asset is enabled for use
        uint256 createdAt;        // Timestamp when asset was added
        uint256 updatedAt;        // Timestamp when asset was last updated
    }

    // Events
    event AssetAdded(
        bytes32 indexed assetId,
        address indexed feedAddress,
        uint8 decimals,
        uint8 volatilityTier
    );

    event AssetUpdated(
        bytes32 indexed assetId,
        address indexed oldFeedAddress,
        address indexed newFeedAddress,
        uint8 volatilityTier
    );

    event AssetEnabled(bytes32 indexed assetId, bool enabled);
    event AssetRemoved(bytes32 indexed assetId);

    // State variables
    mapping(bytes32 => AssetConfig) private assets;
    bytes32[] private assetList;
    mapping(bytes32 => uint256) private assetIndex; // for efficient removal

    uint256 private constant MAX_EXPOSURE_BPS = 10000; // 100%

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Add a new asset to the registry
     * @param assetId The keccak256 hash of the asset name (e.g., keccak256("BTC_USD"))
     * @param feedAddress Chainlink price feed address
     * @param decimals Price feed decimals
     * @param volatilityTier Asset volatility tier (0-2)
     * @param maxExposureBps Maximum exposure in basis points
     */
    function addAsset(
        bytes32 assetId,
        address feedAddress,
        uint8 decimals,
        uint8 volatilityTier,
        uint16 maxExposureBps
    ) external onlyOwner {
        if (assetId == bytes32(0)) revert InvalidAssetId();
        if (feedAddress == address(0)) revert InvalidFeedAddress();
        if (assets[assetId].assetId != bytes32(0)) revert AssetAlreadyExists(assetId);
        if (maxExposureBps > MAX_EXPOSURE_BPS) revert("MaxExposureTooHigh");

        AssetConfig memory config = AssetConfig({
            assetId: assetId,
            feedAddress: feedAddress,
            decimals: decimals,
            volatilityTier: volatilityTier,
            maxExposureBps: maxExposureBps,
            enabled: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        assets[assetId] = config;
        assetList.push(assetId);
        assetIndex[assetId] = assetList.length - 1;

        emit AssetAdded(assetId, feedAddress, decimals, volatilityTier);
    }

    /**
     * @notice Update an existing asset configuration
     * @param assetId Asset identifier
     * @param feedAddress New Chainlink price feed address
     * @param decimals New price feed decimals
     * @param volatilityTier New volatility tier
     * @param maxExposureBps New maximum exposure
     */
    function updateAsset(
        bytes32 assetId,
        address feedAddress,
        uint8 decimals,
        uint8 volatilityTier,
        uint16 maxExposureBps
    ) external onlyOwner {
        if (assets[assetId].assetId == bytes32(0)) revert AssetNotFound(assetId);
        if (feedAddress == address(0)) revert InvalidFeedAddress();
        if (maxExposureBps > MAX_EXPOSURE_BPS) revert("MaxExposureTooHigh");

        address oldFeedAddress = assets[assetId].feedAddress;

        assets[assetId].feedAddress = feedAddress;
        assets[assetId].decimals = decimals;
        assets[assetId].volatilityTier = volatilityTier;
        assets[assetId].maxExposureBps = maxExposureBps;
        assets[assetId].updatedAt = block.timestamp;

        emit AssetUpdated(assetId, oldFeedAddress, feedAddress, volatilityTier);
    }

    /**
     * @notice Enable or disable an asset
     * @param assetId Asset identifier
     * @param enabled Whether to enable the asset
     */
    function setAssetEnabled(bytes32 assetId, bool enabled) external onlyOwner {
        if (assets[assetId].assetId == bytes32(0)) revert AssetNotFound(assetId);

        assets[assetId].enabled = enabled;
        assets[assetId].updatedAt = block.timestamp;

        emit AssetEnabled(assetId, enabled);
    }

    /**
     * @notice Remove an asset from the registry
     * @param assetId Asset identifier to remove
     */
    function removeAsset(bytes32 assetId) external onlyOwner {
        if (assets[assetId].assetId == bytes32(0)) revert AssetNotFound(assetId);

        // Remove from array (swap with last element for gas efficiency)
        uint256 index = assetIndex[assetId];
        uint256 lastIndex = assetList.length - 1;

        if (index != lastIndex) {
            bytes32 lastAssetId = assetList[lastIndex];
            assetList[index] = lastAssetId;
            assetIndex[lastAssetId] = index;
        }

        assetList.pop();
        delete assetIndex[assetId];
        delete assets[assetId];

        emit AssetRemoved(assetId);
    }

    /**
     * @notice Get asset configuration
     * @param assetId Asset identifier
     * @return Asset configuration
     */
    function getAsset(bytes32 assetId) external view returns (AssetConfig memory) {
        if (assets[assetId].assetId == bytes32(0)) revert AssetNotFound(assetId);
        return assets[assetId];
    }

    /**
     * @notice Check if asset is enabled
     * @param assetId Asset identifier
     * @return Whether the asset is enabled
     */
    function isAssetEnabled(bytes32 assetId) external view returns (bool) {
        return assets[assetId].enabled && assets[assetId].assetId != bytes32(0);
    }

    /**
     * @notice Get asset feed address
     * @param assetId Asset identifier
     * @return Chainlink price feed address
     */
    function getAssetFeed(bytes32 assetId) external view returns (address) {
        if (assets[assetId].assetId == bytes32(0)) revert AssetNotFound(assetId);
        if (!assets[assetId].enabled) revert AssetDisabled(assetId);
        return assets[assetId].feedAddress;
    }

    /**
     * @notice Get asset decimals
     * @param assetId Asset identifier
     * @return Price feed decimals
     */
    function getAssetDecimals(bytes32 assetId) external view returns (uint8) {
        if (assets[assetId].assetId == bytes32(0)) revert AssetNotFound(assetId);
        return assets[assetId].decimals;
    }

    /**
     * @notice Get asset volatility tier
     * @param assetId Asset identifier
     * @return Volatility tier (0-2)
     */
    function getAssetVolatilityTier(bytes32 assetId) external view returns (uint8) {
        if (assets[assetId].assetId == bytes32(0)) revert AssetNotFound(assetId);
        return assets[assetId].volatilityTier;
    }

    /**
     * @notice Get asset maximum exposure
     * @param assetId Asset identifier
     * @return Maximum exposure in basis points
     */
    function getAssetMaxExposure(bytes32 assetId) external view returns (uint16) {
        if (assets[assetId].assetId == bytes32(0)) revert AssetNotFound(assetId);
        return assets[assetId].maxExposureBps;
    }

    /**
     * @notice Get all asset IDs
     * @return Array of all registered asset IDs
     */
    function getAllAssetIds() external view returns (bytes32[] memory) {
        return assetList;
    }

    /**
     * @notice Get total number of registered assets
     * @return Number of assets
     */
    function getAssetCount() external view returns (uint256) {
        return assetList.length;
    }

    /**
     * @notice Get paginated asset list
     * @param offset Starting index
     * @param limit Maximum number of assets to return
     * @return Array of asset configurations
     */
    function getAssets(uint256 offset, uint256 limit) external view returns (AssetConfig[] memory) {
        uint256 total = assetList.length;
        if (offset >= total) return new AssetConfig[](0);

        uint256 end = offset + limit;
        if (end > total) end = total;

        AssetConfig[] memory result = new AssetConfig[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = assets[assetList[i]];
        }

        return result;
    }

    /**
     * @notice Batch update asset enabled status
     * @param assetIds Array of asset identifiers
     * @param enabled Array of enabled status
     */
    function batchSetAssetEnabled(bytes32[] calldata assetIds, bool[] calldata enabled) external onlyOwner {
        require(assetIds.length == enabled.length, "ArrayLengthMismatch");

        for (uint256 i = 0; i < assetIds.length; i++) {
            if (assets[assetIds[i]].assetId != bytes32(0)) {
                assets[assetIds[i]].enabled = enabled[i];
                assets[assetIds[i]].updatedAt = block.timestamp;
                emit AssetEnabled(assetIds[i], enabled[i]);
            }
        }
    }
}
