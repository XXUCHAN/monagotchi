import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useWallet } from '../hooks'
import { toast } from 'react-hot-toast'

/**
 * NetworkGuard 컴포넌트
 * 로그인 후 자동으로 올바른 네트워크로 전환
 */
export function NetworkGuard() {
  const { authenticated } = usePrivy()
  const { switchNetwork } = useWallet()

  useEffect(() => {
    if (authenticated) {
      console.log('🔐 User authenticated, checking network...')
      
      // 짧은 딜레이 후 네트워크 전환 시도
      const timer = setTimeout(async () => {
        try {
          await switchNetwork()
          console.log('✅ Network auto-switched to correct chain')
        } catch (error) {
          console.warn('⚠️ Auto network switch failed:', error)
          // 자동 전환 실패는 무시 (사용자가 수동으로 전환 가능)
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [authenticated, switchNetwork])

  return null // UI를 렌더링하지 않는 가드 컴포넌트
}

