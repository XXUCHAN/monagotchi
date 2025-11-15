/**
 * Network Configuration
 */

export const NETWORK = {
  chainId: Number(import.meta.env.VITE_CHAIN_ID) || 41454,
  name: 'Monad Testnet',
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://testnet.monad.xyz',
  blockExplorer:
    import.meta.env.VITE_EXPLORER_URL ||
    'https://explorer.testnet.monad.xyz',
} as const;

