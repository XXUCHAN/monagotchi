import { NETWORK } from './constants'

/**
 * Shorten wallet address
 * @param address - Full wallet address
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Shortened address (e.g., "0x1234...5678")
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return ''
  if (address.length < chars * 2 + 2) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Format remaining time in human-readable format
 * @param seconds - Time in seconds
 * @returns Formatted string (e.g., "2h 30m" or "45m 20s")
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Ready!'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * Format timestamp to date string
 * @param timestamp - Unix timestamp
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calculate remaining cooldown time
 * @param lastMissionTime - Last mission timestamp
 * @param cooldownDuration - Cooldown duration in seconds
 * @returns Remaining seconds (0 if ready)
 */
export function getRemainingCooldown(
  lastMissionTime: number,
  cooldownDuration: number
): number {
  const now = Math.floor(Date.now() / 1000)
  const nextAvailable = lastMissionTime + cooldownDuration
  const remaining = nextAvailable - now
  return Math.max(0, remaining)
}

/**
 * Check if mission is ready
 * @param lastMissionTime - Last mission timestamp
 * @param cooldownDuration - Cooldown duration in seconds
 * @returns true if ready, false if still in cooldown
 */
export function isMissionReady(
  lastMissionTime: number,
  cooldownDuration: number
): boolean {
  return getRemainingCooldown(lastMissionTime, cooldownDuration) === 0
}

/**
 * Get block explorer transaction URL
 * @param txHash - Transaction hash
 * @returns Block explorer URL
 */
export function getExplorerTxUrl(txHash: string): string {
  return `${NETWORK.blockExplorer}/tx/${txHash}`
}

/**
 * Get block explorer address URL
 * @param address - Wallet or contract address
 * @returns Block explorer URL
 */
export function getExplorerAddressUrl(address: string): string {
  return `${NETWORK.blockExplorer}/address/${address}`
}

/**
 * Format large numbers with K/M suffix
 * @param num - Number to format
 * @returns Formatted string (e.g., "1.2K", "3.5M")
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toString()
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
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount
  const divisor = BigInt(10 ** decimals)
  const integerPart = amountBigInt / divisor
  const fractionalPart = amountBigInt % divisor
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  const displayFractional = fractionalStr.slice(0, displayDecimals)
  
  if (displayDecimals === 0) {
    return integerPart.toString()
  }
  
  return `${integerPart}.${displayFractional}`
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

/**
 * Wait for specified milliseconds
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Parse error message from contract revert
 * @param error - Error object
 * @returns Human-readable error message
 */
export function parseContractError(error: any): string {
  if (error?.reason) return error.reason
  if (error?.data?.message) return error.data.message
  if (error?.message) {
    // Extract custom error name if present
    const match = error.message.match(/reverted with custom error '(\w+)'/)
    if (match) return match[1]
    return error.message
  }
  return 'Transaction failed'
}

