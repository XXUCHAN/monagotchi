import { useCatsContract } from './useCatsContract';
import { useChurrContract } from './useChurrContract';

/**
 * Unified Contract Hook
 * Combines VolatilityCats and ChurrToken contracts
 */
export function useContract() {
  const catsHook = useCatsContract();
  const churrHook = useChurrContract();

  return {
    // Contracts
    catsContract: catsHook.catsContract,
    churrContract: churrHook.churrContract,

    // VolatilityCats - Write Operations
    mintCat: catsHook.mintCat,
    completeMission: catsHook.completeMission,
    claimReward: catsHook.claimReward,

    // VolatilityCats - Read Operations
    getCat: catsHook.getCat,
    getOracleImprint: catsHook.getOracleImprint,
    getGameState: catsHook.getGameState,
    getRemainingCooldown: catsHook.getRemainingCooldown,
    getRewardAmount: catsHook.getRewardAmount,
    getUserCatCount: catsHook.getUserCatCount,
    getUserCatTokenIds: catsHook.getUserCatTokenIds,

    // ChurrToken - Read Operations
    getChurrBalance: churrHook.getChurrBalance,
  };
}
