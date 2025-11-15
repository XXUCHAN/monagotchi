/**
 * Volatility Cats - Game Constants
 */

// Contract Addresses
export const CONTRACTS = {
  CATS: import.meta.env.VITE_CATS_CONTRACT_ADDRESS || '',
  CHURR: import.meta.env.VITE_CHURR_CONTRACT_ADDRESS || '',
} as const

// Chainlink Price Feed Addresses (Monad Testnet)
export const PRICE_FEEDS = {
  BTC_USD: '0x2Cd9D7E85494F68F5aF08EF96d6FD5e8F71B4d31',
  ETH_USD: '0x0c76859E85727683Eeba0C070Bc2e0F57B1337818',
  LINK_USD: '0x46820359650Cd2D88759193ee26600d8A0766e1391',
  SOL_USD: '0x1c2f27C736aC97886F017AbdEedEd81C3C38Af73e',
  DOGE_USD: '0x7F1c8B16B1a16AA5a8e720dA162f0d9191f2e6EC5',
  PEPE_USD: '0x5db2F4591D04CABC9eE5C4016e9477A80d383D298',
} as const

// Network Configuration
export const NETWORK = {
  chainId: Number(import.meta.env.VITE_CHAIN_ID) || 41454,
  name: 'Monad Testnet',
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://testnet.monad.xyz',
  blockExplorer: import.meta.env.VITE_EXPLORER_URL || 'https://explorer.testnet.monad.xyz',
} as const

// Clan Types (Alignment)
export const CLAN = {
  BTC: 0,
  ETH: 1,
  SOL: 2,
  LINK: 3,
  DOGE: 4,
  PEPE: 5,
} as const

export const CLAN_NAMES = {
  [CLAN.BTC]: 'Bitcoin',
  [CLAN.ETH]: 'Ethereum',
  [CLAN.SOL]: 'Solana',
  [CLAN.LINK]: 'Chainlink',
  [CLAN.DOGE]: 'Dogecoin',
  [CLAN.PEPE]: 'Pepe',
} as const

export const CLAN_COLORS = {
  [CLAN.BTC]: '#F7931A',
  [CLAN.ETH]: '#627EEA',
  [CLAN.SOL]: '#14F195',
  [CLAN.LINK]: '#2A5ADA',
  [CLAN.DOGE]: '#C2A633',
  [CLAN.PEPE]: '#3B9B4E',
} as const

export const CLAN_ICONS = {
  [CLAN.BTC]: '₿',
  [CLAN.ETH]: 'Ξ',
  [CLAN.SOL]: '◎',
  [CLAN.LINK]: '⬡',
  [CLAN.DOGE]: 'Ð',
  [CLAN.PEPE]: '🐸',
} as const

// Mission Types
export const MISSION_TYPE = {
  DAILY: 0,
  WEEKLY: 1,
  MONTHLY: 2,
} as const

export const MISSION_NAMES = {
  [MISSION_TYPE.DAILY]: 'Daily Mission',
  [MISSION_TYPE.WEEKLY]: 'Weekly Mission',
  [MISSION_TYPE.MONTHLY]: 'Monthly Mission',
} as const

// Cooldown Times (in seconds) - from VolatilityCats contract
export const COOLDOWN_TIMES = {
  [MISSION_TYPE.DAILY]: 12 * 60 * 60,      // 12 hours
  [MISSION_TYPE.WEEKLY]: 7 * 24 * 60 * 60, // 7 days
  [MISSION_TYPE.MONTHLY]: 30 * 24 * 60 * 60, // 30 days
} as const

// Game Constants
export const POWER_THRESHOLD = 50  // Minimum power for missions
export const REWARD_AMOUNT = 10    // CHURR tokens per mission

// Temperament Types
export const TEMPERAMENT = {
  PESSIMISTIC: 0,
  NEUTRAL: 1,
  OPTIMISTIC: 2,
} as const

export const TEMPERAMENT_NAMES = {
  [TEMPERAMENT.PESSIMISTIC]: 'Pessimistic',
  [TEMPERAMENT.NEUTRAL]: 'Neutral',
  [TEMPERAMENT.OPTIMISTIC]: 'Optimistic',
} as const

// Fortune Tier
export const FORTUNE_TIER = {
  POOR: 0,
  NORMAL: 1,
  RICH: 2,
} as const

export const FORTUNE_NAMES = {
  [FORTUNE_TIER.POOR]: 'Poor',
  [FORTUNE_TIER.NORMAL]: 'Normal',
  [FORTUNE_TIER.RICH]: 'Rich',
} as const

// Rarity Tier
export const RARITY_TIER = {
  COMMON: 0,
  RARE: 1,
  LEGENDARY: 2,
} as const

export const RARITY_NAMES = {
  [RARITY_TIER.COMMON]: 'Common',
  [RARITY_TIER.RARE]: 'Rare',
  [RARITY_TIER.LEGENDARY]: 'Legendary',
} as const

export const RARITY_COLORS = {
  [RARITY_TIER.COMMON]: '#9CA3AF',      // gray
  [RARITY_TIER.RARE]: '#3B82F6',        // blue
  [RARITY_TIER.LEGENDARY]: '#F59E0B',   // gold
} as const

// Type helpers
export type ClanType = typeof CLAN[keyof typeof CLAN]
export type MissionTypeValue = typeof MISSION_TYPE[keyof typeof MISSION_TYPE]
export type TemperamentType = typeof TEMPERAMENT[keyof typeof TEMPERAMENT]
export type FortuneTierType = typeof FORTUNE_TIER[keyof typeof FORTUNE_TIER]
export type RarityTierType = typeof RARITY_TIER[keyof typeof RARITY_TIER]

