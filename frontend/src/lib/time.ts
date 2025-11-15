/**
 * Time Utilities
 */

/**
 * Format remaining time in human-readable format
 * @param seconds - Time in seconds
 * @returns Formatted string (e.g., "2h 30m" or "45m 20s")
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Ready!';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Format timestamp to date string
 * @param timestamp - Unix timestamp
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  const now = Math.floor(Date.now() / 1000);
  const nextAvailable = lastMissionTime + cooldownDuration;
  const remaining = nextAvailable - now;
  return Math.max(0, remaining);
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
  return getRemainingCooldown(lastMissionTime, cooldownDuration) === 0;
}

/**
 * Wait for specified milliseconds
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

