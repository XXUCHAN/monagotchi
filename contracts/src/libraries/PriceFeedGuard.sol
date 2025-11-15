// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title Price Feed Guard Library
 * @notice Provides price validation and safety checks for Chainlink price feeds
 * @dev Contains functions for stale data detection and price validation
 */
library PriceFeedGuard {
    // Custom errors
    error StalePriceData(uint256 updatedAt, uint256 maxAge);
    error InvalidPriceFeed(address feedAddress);
    error PriceFeedRoundMismatch(uint80 roundId, uint80 answeredInRound);
    error NegativePrice(int256 price);
    error PriceTooOld(uint256 age, uint256 maxAge);
    error PriceDeviationTooHigh(int256 price, int256 expectedPrice, uint256 maxDeviationBps);

    // Price data structure
    struct PriceData {
        int256 price;          // Latest price from feed
        uint80 roundId;        // Round ID
        uint256 updatedAt;     // Timestamp of latest update
        uint8 decimals;        // Feed decimals
        bool isValid;          // Whether price is valid
    }

    // Constants
    uint256 private constant MAX_PRICE_AGE = 24 hours; // 24시간
    uint256 private constant BPS_DENOMINATOR = 10000;  // 100% = 10000 bps

    /**
     * @notice Get validated price data from Chainlink feed
     * @param feedAddress Chainlink price feed address
     * @return Validated price data
     */
    function getValidatedPrice(address feedAddress) internal view returns (PriceData memory) {
        return getValidatedPrice(feedAddress, MAX_PRICE_AGE);
    }

    /**
     * @notice Get validated price data with custom max age
     * @param feedAddress Chainlink price feed address
     * @param maxAge Maximum allowed age in seconds
     * @return Validated price data
     */
    function getValidatedPrice(address feedAddress, uint256 maxAge) internal view returns (PriceData memory) {
        if (feedAddress == address(0)) revert InvalidPriceFeed(feedAddress);

        AggregatorV3Interface priceFeed = AggregatorV3Interface(feedAddress);

        (
            uint80 roundId,
            int256 price,
            ,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();

        // Basic validations
        if (price <= 0) revert NegativePrice(price);
        if (roundId == 0 || answeredInRound == 0) revert PriceFeedRoundMismatch(roundId, answeredInRound);

        // Age validation
        uint256 age = block.timestamp - updatedAt;
        if (age > maxAge) revert PriceTooOld(age, maxAge);

        uint8 decimals = priceFeed.decimals();

        return PriceData({
            price: price,
            roundId: roundId,
            updatedAt: updatedAt,
            decimals: decimals,
            isValid: true
        });
    }

    /**
     * @notice Get validated price data with deviation check
     * @param feedAddress Chainlink price feed address
     * @param expectedPrice Expected price for deviation check
     * @param maxDeviationBps Maximum allowed deviation in basis points
     * @return Validated price data
     */
    function getValidatedPriceWithDeviation(
        address feedAddress,
        int256 expectedPrice,
        uint256 maxDeviationBps
    ) internal view returns (PriceData memory) {
        return getValidatedPriceWithDeviation(feedAddress, expectedPrice, maxDeviationBps, MAX_PRICE_AGE);
    }

    /**
     * @notice Get validated price data with deviation check and custom max age
     * @param feedAddress Chainlink price feed address
     * @param expectedPrice Expected price for deviation check
     * @param maxDeviationBps Maximum allowed deviation in basis points
     * @param maxAge Maximum allowed age in seconds
     * @return Validated price data
     */
    function getValidatedPriceWithDeviation(
        address feedAddress,
        int256 expectedPrice,
        uint256 maxDeviationBps,
        uint256 maxAge
    ) internal view returns (PriceData memory) {
        PriceData memory priceData = getValidatedPrice(feedAddress, maxAge);

        // Deviation check
        if (expectedPrice > 0) {
            uint256 deviation = calculateDeviation(priceData.price, expectedPrice);
            if (deviation > maxDeviationBps) {
                revert PriceDeviationTooHigh(priceData.price, expectedPrice, maxDeviationBps);
            }
        }

        return priceData;
    }

    /**
     * @notice Check if price data is stale
     * @param updatedAt Timestamp when price was updated
     * @param maxAge Maximum allowed age in seconds
     * @return Whether price is stale
     */
    function isPriceStale(uint256 updatedAt, uint256 maxAge) internal view returns (bool) {
        return (block.timestamp - updatedAt) > maxAge;
    }

    /**
     * @notice Check if price data is stale (default max age)
     * @param updatedAt Timestamp when price was updated
     * @return Whether price is stale
     */
    function isPriceStale(uint256 updatedAt) internal view returns (bool) {
        return isPriceStale(updatedAt, MAX_PRICE_AGE);
    }

    /**
     * @notice Calculate price deviation in basis points
     * @param currentPrice Current price
     * @param referencePrice Reference price
     * @return Deviation in basis points (100 = 1%)
     */
    function calculateDeviation(int256 currentPrice, int256 referencePrice) internal pure returns (uint256) {
        if (referencePrice == 0) return 0;

        int256 diff = currentPrice > referencePrice ?
            currentPrice - referencePrice :
            referencePrice - currentPrice;

        // Calculate deviation as (diff / reference) * BPS_DENOMINATOR
        // Using integer arithmetic to avoid precision loss
        uint256 deviation = (uint256(diff) * BPS_DENOMINATOR) / uint256(referencePrice);

        return deviation;
    }

    /**
     * @notice Convert price to 18 decimal places for consistency
     * @param price Raw price from feed
     * @param feedDecimals Feed decimals
     * @return Normalized price (18 decimals)
     */
    function normalizePrice(int256 price, uint8 feedDecimals) internal pure returns (int256) {
        if (feedDecimals == 18) return price;
        if (feedDecimals > 18) return price / int256(10 ** (feedDecimals - 18));
        return price * int256(10 ** (18 - feedDecimals));
    }

    /**
     * @notice Convert normalized price back to feed decimals
     * @param normalizedPrice Price in 18 decimals
     * @param feedDecimals Target feed decimals
     * @return Price in feed decimals
     */
    function denormalizePrice(int256 normalizedPrice, uint8 feedDecimals) internal pure returns (int256) {
        if (feedDecimals == 18) return normalizedPrice;
        if (feedDecimals > 18) return normalizedPrice * int256(10 ** (feedDecimals - 18));
        return normalizedPrice / int256(10 ** (18 - feedDecimals));
    }

    /**
     * @notice Get feed metadata
     * @param feedAddress Chainlink price feed address
     * @return decimals Feed decimals
     * @return description Feed description
     */
    function getFeedMetadata(address feedAddress) internal view returns (uint8 decimals, string memory description) {
        if (feedAddress == address(0)) revert InvalidPriceFeed(feedAddress);

        AggregatorV3Interface priceFeed = AggregatorV3Interface(feedAddress);
        decimals = priceFeed.decimals();
        description = priceFeed.description();
    }

    /**
     * @notice Validate multiple feeds at once
     * @param feedAddresses Array of Chainlink price feed addresses
     * @param maxAge Maximum allowed age in seconds
     * @return Array of validated price data
     */
    function validateMultipleFeeds(
        address[] memory feedAddresses,
        uint256 maxAge
    ) internal view returns (PriceData[] memory) {
        PriceData[] memory priceData = new PriceData[](feedAddresses.length);

        for (uint256 i = 0; i < feedAddresses.length; i++) {
            if (feedAddresses[i] != address(0)) {
                priceData[i] = getValidatedPrice(feedAddresses[i], maxAge);
            }
        }

        return priceData;
    }

    /**
     * @notice Check if feed is operational (not returning stale or invalid data)
     * @param feedAddress Chainlink price feed address
     * @param maxAge Maximum allowed age in seconds
     * @return Whether feed is operational
     */
    function isFeedOperational(address feedAddress, uint256 maxAge) internal view returns (bool) {
        if (feedAddress == address(0)) return false;

        // Check basic operational status by attempting to read from feed
        try AggregatorV3Interface(feedAddress).latestRoundData() returns (
            uint80 roundId,
            int256 price,
            uint256,
            uint256 updatedAt,
            uint80 answeredInRound
        ) {
            // Basic validation
            if (roundId == 0 || answeredInRound == 0 || price <= 0) return false;
            if ((block.timestamp - updatedAt) > maxAge) return false;
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @notice Check if feed is operational (default max age)
     * @param feedAddress Chainlink price feed address
     * @return Whether feed is operational
     */
    function isFeedOperational(address feedAddress) internal view returns (bool) {
        return isFeedOperational(feedAddress, MAX_PRICE_AGE);
    }
}
