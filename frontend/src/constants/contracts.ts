/**
 * Contract Addresses and ABIs
 */

// Contract Addresses (Environment Variables)
export const CONTRACTS = {
  CATS: import.meta.env.VITE_CATS_CONTRACT_ADDRESS || '',
  CHURR: import.meta.env.VITE_CHURR_CONTRACT_ADDRESS || '',
} as const;

// Chainlink Price Feed Addresses (Monad Testnet)
export const PRICE_FEEDS = {
  BTC_USD: '0x2Cd9D7E85494F68F5aF08EF96d6FD5e8F71B4d31',
  ETH_USD: '0x0c76859E85727683Eeba0C070Bc2e0F57B1337818',
  LINK_USD: '0x46820359650Cd2D88759193ee26600d8A0766e1391',
  SOL_USD: '0x1c2f27C736aC97886F017AbdEedEd81C3C38Af73e',
  DOGE_USD: '0x7F1c8B16B1a16AA5a8e720dA162f0d9191f2e6EC5',
  PEPE_USD: '0x5db2F4591D04CABC9eE5C4016e9477A80d383D298',
} as const;

