/**
 * Contract Error Handling
 */

export const CONTRACT_ERRORS: { [key: string]: string } = {
  InvalidClan: '지원하지 않는 클랜입니다',
  NotTokenOwner: '고양이 소유자만 실행할 수 있습니다',
  InvalidMissionType: '유효하지 않은 미션 타입입니다',
  MissionCooldown: '미션 쿨다운 중입니다',
  PowerTooLow: '파워가 부족합니다 (최소: 50)',
  AlreadyClaimed: '이미 보상을 받았습니다',
};

/**
 * Parse error message from contract revert
 * @param error - Error object from ethers
 * @returns Human-readable error message in Korean
 */
export function parseContractError(error: any): string {
  // Check for custom error in reason field
  if (error?.reason) {
    return CONTRACT_ERRORS[error.reason] || error.reason;
  }

  // Check for custom error in message
  if (error?.message) {
    const match = error.message.match(/reverted with custom error '(\w+)'/);
    if (match) {
      return CONTRACT_ERRORS[match[1]] || match[1];
    }
    return error.message;
  }

  // Check for data.message
  if (error?.data?.message) {
    return error.data.message;
  }

  return '트랜잭션이 실패했습니다';
}

/**
 * Format cooldown error message in Korean
 * @param remainingSeconds - Remaining cooldown in seconds
 * @returns Formatted cooldown message
 */
export function formatCooldownError(remainingSeconds: number): string {
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

