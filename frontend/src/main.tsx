import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import './index.css'
import App from './App.tsx'
import { NETWORK } from './utils/constants'

// 디버깅: 실제 로드된 네트워크 확인
console.log('🔍 Environment:', import.meta.env.VITE_TARGET_NETWORK);
console.log('🌐 NETWORK Config:', NETWORK);

// 로컬/테스트넷 체인 정의
const customChain = {
  id: NETWORK.chainId,
  name: NETWORK.name,
  network: NETWORK.name.toLowerCase().replace(/\s+/g, '-'),
  nativeCurrency: {
    decimals: 18,
    name: NETWORK.chainId === 31337 ? 'Ether' : 'MONAD',
    symbol: NETWORK.chainId === 31337 ? 'ETH' : 'MON',
  },
  rpcUrls: {
    default: { http: [NETWORK.rpcUrl] },
    public: { http: [NETWORK.rpcUrl] },
  },
  blockExplorers: NETWORK.blockExplorer ? {
    default: { name: 'Explorer', url: NETWORK.blockExplorer },
  } : undefined,
  testnet: true,
}

console.log('⛓️ Custom Chain:', customChain);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['email', 'google', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
        },
        defaultChain: customChain,
        supportedChains: [customChain],
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
)
