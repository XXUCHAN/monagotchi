import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import './index.css'
import App from './App.tsx'
import { NETWORK, CONTRACTS } from './constants'

// 디버깅: 실제 로드된 네트워크 확인
console.log('🔍 Target Network:', import.meta.env.VITE_TARGET_NETWORK || 'testnet (default)');
console.log('🌐 NETWORK Config:', NETWORK);
console.log('📝 Contract Addresses:', CONTRACTS);

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

const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;

if (!privyAppId) {
  console.error('❌ VITE_PRIVY_APP_ID is not set! Please add it to your .env file.');
}

console.log('🔐 Privy App ID:', privyAppId ? '✅ Set' : '❌ Missing');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId={privyAppId || ''}
      config={{
        loginMethods: ['email', 'google', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#fb5a49', // Monagotchi primary color
        },
        defaultChain: customChain,
        supportedChains: [customChain],
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
)
