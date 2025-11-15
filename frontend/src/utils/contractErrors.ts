/**
 * Contract Error Handling
 * Maps contract errors to user-friendly Korean messages
 */

export const CONTRACT_ERRORS: Record<string, string> = {
  // VolatilityCats errors
  InvalidClan: '지원하지 않는 클랜입니다',
  NotTokenOwner: '고양이 소유자만 실행할 수 있습니다',
  InvalidMissionType: '잘못된 미션 타입입니다',
  MissionCooldown: '미션 쿨다운 중입니다',
  PowerTooLow: '파워가 부족합니다 (최소: 50)',
  AlreadyClaimed: '이미 보상을 받았습니다',
  
  // Common errors
  'insufficient funds': '잔액이 부족합니다',
  'user rejected': '사용자가 트랜잭션을 거부했습니다',
  'execution reverted': '트랜잭션이 실패했습니다',
  'nonce too low': '논스 값이 너무 낮습니다. 잠시 후 다시 시도해주세요',
  'replacement fee too low': '가스비가 너무 낮습니다',
  'network changed': '네트워크가 변경되었습니다',
  'timeout': '트랜잭션 시간이 초과되었습니다',
}

/**
 * Parse contract error and return user-friendly message
 */
export function parseContractError(error: any): string {
  // Already a string
  if (typeof error === 'string') {
    return CONTRACT_ERRORS[error] || error
  }

  // Ethers v6 error with reason
  if (error?.reason) {
    const knownError = CONTRACT_ERRORS[error.reason]
    if (knownError) return knownError
  }

  // Custom error pattern (Solidity 0.8.4+)
  const customErrorMatch = error?.message?.match(/reverted with custom error '(\w+)'/)
  if (customErrorMatch && customErrorMatch[1]) {
    const knownError = CONTRACT_ERRORS[customErrorMatch[1]]
    if (knownError) return knownError
    return `컨트랙트 에러: ${customErrorMatch[1]}`
  }

  // Revert with reason string
  const revertMatch = error?.message?.match(/reverted with reason string '(.*?)'/)
  if (revertMatch && revertMatch[1]) {
    return revertMatch[1]
  }

  // Check error message for known patterns
  if (error?.message) {
    const message = error.message.toLowerCase()
    for (const [key, value] of Object.entries(CONTRACT_ERRORS)) {
      if (message.includes(key.toLowerCase())) {
        return value
      }
    }
    
    // Return first line of error message
    return error.message.split('\n')[0]
  }

  // Check error code
  if (error?.code) {
    switch (error.code) {
      case 'ACTION_REJECTED':
      case 4001:
        return '사용자가 트랜잭션을 거부했습니다'
      case 'INSUFFICIENT_FUNDS':
      case -32000:
        return '잔액이 부족합니다'
      case 'NETWORK_ERROR':
        return '네트워크 오류가 발생했습니다'
      case 'TIMEOUT':
        return '트랜잭션 시간이 초과되었습니다'
      default:
        return `에러 코드: ${error.code}`
    }
  }

  return '알 수 없는 오류가 발생했습니다'
}

/**
 * Format cooldown error message with remaining time
 */
export function formatCooldownError(remainingSeconds: number): string {
  const hours = Math.floor(remainingSeconds / 3600)
  const minutes = Math.floor((remainingSeconds % 3600) / 60)
  
  if (hours > 0) {
    return `미션 쿨다운 중입니다 (남은 시간: ${hours}시간 ${minutes}분)`
  } else if (minutes > 0) {
    return `미션 쿨다운 중입니다 (남은 시간: ${minutes}분)`
  } else {
    return `미션 쿨다운 중입니다 (남은 시간: ${remainingSeconds}초)`
  }
}


