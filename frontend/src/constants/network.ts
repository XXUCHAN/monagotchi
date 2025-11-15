/**
 * Network Configuration
 */

export const NETWORK = {
  chainId: Number(import.meta.env.VITE_CHAIN_ID) || 31337, // Default to Hardhat
  name: import.meta.env.DEV ? 'Hardhat Local' : 'Monad Testnet',
  rpcUrl: import.meta.env.VITE_RPC_URL || 'http://localhost:8545', // Default to local
  blockExplorer:
    import.meta.env.VITE_EXPLORER_URL || 'http://localhost:8545',
} as const;

