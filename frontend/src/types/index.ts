// Oracle Imprint (from contract)
export interface OracleImprint {
  clan: number              // 0=BTC, 1=ETH
  temperament: number       // 0=Pessimistic, 1=Neutral, 2=Optimistic
  fortuneTier: number       // 0=Poor, 1=Normal, 2=Rich
  rarityTier: number        // 0=Common, 1=Rare, 2=Legendary
  birthTrendBps: number     // Birth time price change (basis points)
  birthVolBucket: number    // Volatility bucket
  epochId: bigint           // Market epoch ID
  entropy: bigint           // Random seed
}

// Cat Game State (from contract)
export interface CatGameState {
  power: number                   // Growing ability stat
  season: number                  // Season/version
  rulesVersion: number            // Applied ruleset version
  lastMissionDaily: bigint        // Last daily mission timestamp
  lastMissionWeekly: bigint       // Last weekly mission timestamp
  lastMissionMonthly: bigint      // Last monthly mission timestamp
  rewarded: boolean               // Reward claimed status
}

// Complete Cat data
export interface Cat {
  tokenId: bigint
  owner: string
  imprint: OracleImprint
  game: CatGameState
}

// Simplified Cat for UI
export interface CatDisplay {
  tokenId: string
  clan: number
  power: number
  rarity: number
  lastMissionDaily: number
  lastMissionWeekly: number
  lastMissionMonthly: number
  canClaimReward: boolean
}

// Mission info
export interface MissionInfo {
  type: number              // 0=Daily, 1=Weekly, 2=Monthly
  name: string
  cooldown: number          // Cooldown in seconds
  lastCompleted: number     // Timestamp
  isReady: boolean
  remainingTime: number     // Remaining cooldown
}

// Transaction status
export interface TxStatus {
  status: 'idle' | 'pending' | 'success' | 'error'
  txHash?: string
  error?: string
}

// Enums (keeping for compatibility)
export enum MissionType {
  DAILY = 0,
  WEEKLY = 1,
  MONTHLY = 2,
}

export enum Alignment {
  BTC = 0,
  ETH = 1,
  SOL = 2,
  LINK = 3,
  DOGE = 4,
  PEPE = 5,
}

