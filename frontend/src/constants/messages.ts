/**
 * Toast Messages - Korean
 * Centralized user-facing messages for contract interactions
 */

export const TOAST_MESSAGES = {
  // Mint Cat
  MINT_LOADING: '고양이 민팅 중...',
  MINT_SUCCESS: '고양이가 성공적으로 민팅되었습니다! 🐱',

  // Missions
  MISSION_DAILY_LOADING: 'Daily 미션 실행 중...',
  MISSION_WEEKLY_LOADING: 'Weekly 미션 실행 중...',
  MISSION_MONTHLY_LOADING: 'Monthly 미션 실행 중...',
  MISSION_SUCCESS: '미션을 완료했습니다! 💪',

  // Reward
  CLAIM_LOADING: '보상 수령 중...',
  CLAIM_SUCCESS: '보상을 받았습니다! 🎉',

  // Errors
  ERROR_INVALID_CLAN: '지원하지 않는 클랜입니다',
  ERROR_NOT_OWNER: '고양이 소유자만 실행할 수 있습니다',
  ERROR_INVALID_MISSION: '유효하지 않은 미션 타입입니다',
  ERROR_MISSION_COOLDOWN: '미션 쿨다운 중입니다',
  ERROR_POWER_TOO_LOW: '파워가 부족합니다 (최소: 50)',
  ERROR_ALREADY_CLAIMED: '이미 보상을 받았습니다',
  ERROR_TX_FAILED: '트랜잭션이 실패했습니다',
  ERROR_CONTRACT_NOT_CONFIGURED: 'Cats contract address not configured',
  ERROR_CONTRACT_NOT_INITIALIZED: 'Cats contract not initialized',
} as const;

export const MISSION_NAMES_KO = ['Daily', 'Weekly', 'Monthly'] as const;

/**
 * Format cooldown error message in Korean
 */
export function formatCooldownMessage(remainingSeconds: number): string {
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);

  if (hours > 0) {
    return `미션 쿨다운 중입니다. ${hours}시간 ${minutes}분 남았습니다.`;
  }
  if (minutes > 0) {
    return `미션 쿨다운 중입니다. ${minutes}분 남았습니다.`;
  }
  return `미션 쿨다운 중입니다. ${remainingSeconds}초 남았습니다.`;
}

