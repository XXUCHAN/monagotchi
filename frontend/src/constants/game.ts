/**
 * Game Mechanics Constants
 */

// Clan Types (Alignment)
export const CLAN = {
  BTC: 0,
  ETH: 1,
  SOL: 2,
  LINK: 3,
  DOGE: 4,
  PEPE: 5,
} as const;

export const CLAN_NAMES = {
  [CLAN.BTC]: 'Bitcoin',
  [CLAN.ETH]: 'Ethereum',
  [CLAN.SOL]: 'Solana',
  [CLAN.LINK]: 'Chainlink',
  [CLAN.DOGE]: 'Dogecoin',
  [CLAN.PEPE]: 'Pepe',
} as const;

export const CLAN_COLORS = {
  [CLAN.BTC]: '#F7931A',
  [CLAN.ETH]: '#627EEA',
  [CLAN.SOL]: '#14F195',
  [CLAN.LINK]: '#2A5ADA',
  [CLAN.DOGE]: '#C2A633',
  [CLAN.PEPE]: '#3B9B4E',
} as const;

export const CLAN_ICONS = {
  [CLAN.BTC]: '₿',
  [CLAN.ETH]: 'Ξ',
  [CLAN.SOL]: '◎',
  [CLAN.LINK]: '⬡',
  [CLAN.DOGE]: 'Ð',
  [CLAN.PEPE]: '🐸',
} as const;

// Mission Types
export const MISSION_TYPE = {
  DAILY: 0,
  WEEKLY: 1,
  MONTHLY: 2,
} as const;

export const MISSION_NAMES = {
  [MISSION_TYPE.DAILY]: 'Daily Mission',
  [MISSION_TYPE.WEEKLY]: 'Weekly Mission',
  [MISSION_TYPE.MONTHLY]: 'Monthly Mission',
} as const;

// Cooldown Times (in seconds) - from VolatilityCats contract
export const COOLDOWN_TIMES = {
  [MISSION_TYPE.DAILY]: 12 * 60 * 60, // 12 hours
  [MISSION_TYPE.WEEKLY]: 7 * 24 * 60 * 60, // 7 days
  [MISSION_TYPE.MONTHLY]: 30 * 24 * 60 * 60, // 30 days
} as const;

// Game Balance Constants
export const POWER_THRESHOLD = 50; // Minimum power for missions
export const REWARD_AMOUNT = 10; // CHURR tokens per mission

// Type helpers
export type ClanType = (typeof CLAN)[keyof typeof CLAN];
export type MissionTypeValue = (typeof MISSION_TYPE)[keyof typeof MISSION_TYPE];

