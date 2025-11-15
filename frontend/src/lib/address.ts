import { NETWORK } from '../constants';

/**
 * Address Utilities
 */

/**
 * Shorten wallet address
 * @param address - Full wallet address
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Shortened address (e.g., "0x1234...5678")
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Get block explorer transaction URL
 * @param txHash - Transaction hash
 * @returns Block explorer URL
 */
export function getExplorerTxUrl(txHash: string): string {
  return `${NETWORK.blockExplorer}/tx/${txHash}`;
}

/**
 * Get block explorer address URL
 * @param address - Wallet or contract address
 * @returns Block explorer URL
 */
export function getExplorerAddressUrl(address: string): string {
  return `${NETWORK.blockExplorer}/address/${address}`;
}

