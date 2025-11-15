export interface Cat {
  alignment: number        // 0 = BTC, 1 = ETH
  power: number
  lastMissionDaily: number
  lastMissionWeekly: number
  lastMissionMonthly: number
  rewarded: boolean
}

export enum MissionType {
  DAILY = 0,
  WEEKLY = 1,
  MONTHLY = 2,
}

export enum Alignment {
  BTC = 0,
  ETH = 1,
}

