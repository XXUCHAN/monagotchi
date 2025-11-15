/**
 * Formatting Utilities
 */

/**
 * Format large numbers with K/M suffix
 * @param num - Number to format
 * @returns Formatted string (e.g., "1.2K", "3.5M")
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format token amount
 * @param amount - Token amount (can be bigint or string)
 * @param decimals - Token decimals (default: 18)
 * @param displayDecimals - Number of decimals to display (default: 2)
 * @returns Formatted string
 */
export function formatTokenAmount(
  amount: bigint | string,
  decimals = 18,
  displayDecimals = 2
): string {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;
  const divisor = BigInt(10 ** decimals);
  const integerPart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const displayFractional = fractionalStr.slice(0, displayDecimals);

  if (displayDecimals === 0) {
    return integerPart.toString();
  }

  return `${integerPart}.${displayFractional}`;
}

