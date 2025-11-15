/**
 * Network Configuration
 * Supports both Local (Hardhat) and Monad Testnet
 */

import localAddresses from '../abi/local-addresses.json';

const DEFAULT_FEEDS = {
  BTC_USD: '0x2Cd9D7E85494F68F5aF08EF96d6FD5e8F71B4d31',
  ETH_USD: '0x0c76859E85727683Eeba0C070Bc2e0F57B1337818',
  LINK_USD: '0x46820359650Cd2D88759193ee26600d8A0766e1391',
  SOL_USD: '0x1c2f27C736aC97886F017AbdEedEd81C3C38Af73e',
  DOGE_USD: '0x7F1c8B16B1a16AA5a8e720dA162f0d9191f2e6EC5',
  PEPE_USD: '0x5db2F4591D04CABC9eE5C4016e9477A80d383D298',
} as const;

type NetworkTarget = 'local' | 'testnet';
const TARGET = (import.meta.env.VITE_TARGET_NETWORK || 'testnet').toLowerCase() as NetworkTarget;

console.log('🌐 Network Target:', TARGET);

// Local Development Configuration (Hardhat)
const LOCAL_CONFIG = {
  contracts: {
    CATS: localAddresses?.VolatilityCats || '',
    CHURR: localAddresses?.ChurrToken || '',
  },
  network: {
    chainId: Number(import.meta.env.VITE_LOCAL_CHAIN_ID) || 31337,
    name: import.meta.env.VITE_LOCAL_CHAIN_NAME || 'Hardhat Local',
    rpcUrl: import.meta.env.VITE_LOCAL_RPC_URL || 'http://127.0.0.1:8545',
    blockExplorer: import.meta.env.VITE_LOCAL_EXPLORER_URL || '',
  },
  feeds: DEFAULT_FEEDS,
};

// Monad Testnet Configuration
const TESTNET_CONFIG = {
  contracts: {
    CATS: import.meta.env.VITE_TESTNET_CATS_ADDRESS || '0x141b1F681189E401a0f10bC3ceB76fab74Ba8Bbb',
    CHURR: import.meta.env.VITE_TESTNET_CHURR_ADDRESS || '0x473f4e1426a865ABCADe3ef3CcC129602721F229',
  },
  network: {
    chainId: Number(import.meta.env.VITE_TESTNET_CHAIN_ID) || 10143,
    name: import.meta.env.VITE_TESTNET_CHAIN_NAME || 'Monad Testnet',
    rpcUrl: import.meta.env.VITE_TESTNET_RPC_URL || 'https://testnet-rpc.monad.xyz',
    blockExplorer: import.meta.env.VITE_TESTNET_EXPLORER_URL || 'https://explorer.testnet.monad.xyz',
  },
  feeds: {
    BTC_USD: import.meta.env.VITE_BTC_USD_FEED || DEFAULT_FEEDS.BTC_USD,
    ETH_USD: import.meta.env.VITE_ETH_USD_FEED || DEFAULT_FEEDS.ETH_USD,
    LINK_USD: import.meta.env.VITE_LINK_USD_FEED || DEFAULT_FEEDS.LINK_USD,
    SOL_USD: import.meta.env.VITE_SOL_USD_FEED || DEFAULT_FEEDS.SOL_USD,
    DOGE_USD: import.meta.env.VITE_DOGE_USD_FEED || DEFAULT_FEEDS.DOGE_USD,
    PEPE_USD: import.meta.env.VITE_PEPE_USD_FEED || DEFAULT_FEEDS.PEPE_USD,
  },
};

// Select active configuration
const ACTIVE_CONFIG = TARGET === 'local' ? LOCAL_CONFIG : TESTNET_CONFIG;

console.log('✅ Active Config:', ACTIVE_CONFIG);

// Export active configuration
export const CONTRACTS = ACTIVE_CONFIG.contracts;
export const PRICE_FEEDS = ACTIVE_CONFIG.feeds;
export const NETWORK = ACTIVE_CONFIG.network;

