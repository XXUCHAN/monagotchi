/**
 * Cat Attributes Constants
 */

// Temperament Types
export const TEMPERAMENT = {
  PESSIMISTIC: 0,
  NEUTRAL: 1,
  OPTIMISTIC: 2,
} as const;

export const TEMPERAMENT_NAMES = {
  [TEMPERAMENT.PESSIMISTIC]: 'Pessimistic',
  [TEMPERAMENT.NEUTRAL]: 'Neutral',
  [TEMPERAMENT.OPTIMISTIC]: 'Optimistic',
} as const;

// Fortune Tier
export const FORTUNE_TIER = {
  POOR: 0,
  NORMAL: 1,
  RICH: 2,
} as const;

export const FORTUNE_NAMES = {
  [FORTUNE_TIER.POOR]: 'Poor',
  [FORTUNE_TIER.NORMAL]: 'Normal',
  [FORTUNE_TIER.RICH]: 'Rich',
} as const;

// Rarity Tier
export const RARITY_TIER = {
  COMMON: 0,
  RARE: 1,
  LEGENDARY: 2,
} as const;

export const RARITY_NAMES = {
  [RARITY_TIER.COMMON]: 'Common',
  [RARITY_TIER.RARE]: 'Rare',
  [RARITY_TIER.LEGENDARY]: 'Legendary',
} as const;

export const RARITY_COLORS = {
  [RARITY_TIER.COMMON]: '#9CA3AF', // gray
  [RARITY_TIER.RARE]: '#3B82F6', // blue
  [RARITY_TIER.LEGENDARY]: '#F59E0B', // gold
} as const;

// Type helpers
export type TemperamentType =
  (typeof TEMPERAMENT)[keyof typeof TEMPERAMENT];
export type FortuneTierType =
  (typeof FORTUNE_TIER)[keyof typeof FORTUNE_TIER];
export type RarityTierType = (typeof RARITY_TIER)[keyof typeof RARITY_TIER];

