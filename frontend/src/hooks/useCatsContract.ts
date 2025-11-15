import { Contract, type InterfaceAbi } from 'ethers';
import { useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useWallet } from './useWallet';
import { CONTRACTS, TOAST_MESSAGES, MISSION_NAMES_KO } from '../constants';
import { parseContractError, formatCooldownError } from '../lib/errors';
import VolatilityCatsArtifact from '../abi/VolatilityCats.json';

const CATS_ABI = VolatilityCatsArtifact.abi as InterfaceAbi;

/**
 * Custom Hook for VolatilityCats Contract Interactions
 */
export function useCatsContract() {
  const { getProvider, getSigner } = useWallet();

  // Get VolatilityCats contract (read-only)
  const catsContract = useMemo(() => {
    if (!CONTRACTS.CATS) return null;
    const provider = getProvider();
    return new Contract(CONTRACTS.CATS, CATS_ABI, provider);
  }, [getProvider]);

  // Get VolatilityCats contract with signer (for write operations)
  const getCatsContractWithSigner = async () => {
    if (!CONTRACTS.CATS) {
      throw new Error(TOAST_MESSAGES.ERROR_CONTRACT_NOT_CONFIGURED);
    }
    const signer = await getSigner();
    return new Contract(CONTRACTS.CATS, CATS_ABI, signer);
  };

  // ==================== Write Operations ====================

  /**
   * Mint a random cat
   * @param clan - Clan ID (0 = BTC, 1 = ETH, etc.)
   */
  const mintCat = async (clan: number) => {
    try {
      const contract = await getCatsContractWithSigner();
      const tx = await contract.mintRandomCat(clan);

      toast.loading(TOAST_MESSAGES.MINT_LOADING, { id: tx.hash });
      await tx.wait();
      toast.success(TOAST_MESSAGES.MINT_SUCCESS, { id: tx.hash });

      return tx;
    } catch (error: any) {
      const message = parseContractError(error);
      toast.error(message);
      throw error;
    }
  };

  /**
   * Complete mission (runMission in contract)
   * @param tokenId - Cat token ID
   * @param missionType - 0 = Daily, 1 = Weekly, 2 = Monthly
   */
  const completeMission = async (tokenId: bigint, missionType: number) => {
    try {
      // Check cooldown first
      const remaining = await getRemainingCooldown(tokenId, missionType);
      if (remaining > 0n) {
        const message = formatCooldownError(Number(remaining));
        toast.error(message);
        throw new Error(message);
      }

      const contract = await getCatsContractWithSigner();
      const tx = await contract.runMission(tokenId, missionType);

      const missionName = MISSION_NAMES_KO[missionType];
      toast.loading(`${missionName} 미션 실행 중...`, { id: tx.hash });
      await tx.wait();
      toast.success(TOAST_MESSAGES.MISSION_SUCCESS, { id: tx.hash });

      return tx;
    } catch (error: any) {
      const message = parseContractError(error);
      if (!message.includes('쿨다운')) {
        toast.error(message);
      }
      throw error;
    }
  };

  /**
   * Claim reward
   * @param tokenId - Cat token ID
   */
  const claimReward = async (tokenId: bigint) => {
    try {
      const contract = await getCatsContractWithSigner();
      const tx = await contract.claimReward(tokenId);

      toast.loading(TOAST_MESSAGES.CLAIM_LOADING, { id: tx.hash });
      await tx.wait();
      toast.success(TOAST_MESSAGES.CLAIM_SUCCESS, { id: tx.hash });

      return tx;
    } catch (error: any) {
      const message = parseContractError(error);
      toast.error(message);
      throw error;
    }
  };

  // ==================== Read Operations ====================

  /**
   * Get cat data
   * @param tokenId - Cat token ID
   */
  const getCat = async (tokenId: bigint) => {
    if (!catsContract) {
      throw new Error(TOAST_MESSAGES.ERROR_CONTRACT_NOT_INITIALIZED);
    }
    return await catsContract.getCat(tokenId);
  };

  /**
   * Get Oracle Imprint details
   * @param tokenId - Cat token ID
   */
  const getOracleImprint = async (tokenId: bigint) => {
    if (!catsContract) {
      throw new Error(TOAST_MESSAGES.ERROR_CONTRACT_NOT_INITIALIZED);
    }
    return await catsContract.getOracleImprint(tokenId);
  };

  /**
   * Get Game State
   * @param tokenId - Cat token ID
   */
  const getGameState = async (tokenId: bigint) => {
    if (!catsContract) {
      throw new Error(TOAST_MESSAGES.ERROR_CONTRACT_NOT_INITIALIZED);
    }
    return await catsContract.getGameState(tokenId);
  };

  /**
   * Get remaining cooldown for a mission
   * @param tokenId - Cat token ID
   * @param missionType - 0 = Daily, 1 = Weekly, 2 = Monthly
   */
  const getRemainingCooldown = async (
    tokenId: bigint,
    missionType: number
  ) => {
    if (!catsContract) {
      throw new Error(TOAST_MESSAGES.ERROR_CONTRACT_NOT_INITIALIZED);
    }
    return await catsContract.getRemainingCooldown(tokenId, missionType);
  };

  /**
   * Get reward amount (constant)
   */
  const getRewardAmount = async () => {
    if (!catsContract) {
      throw new Error(TOAST_MESSAGES.ERROR_CONTRACT_NOT_INITIALIZED);
    }
    return await catsContract.rewardAmount();
  };

  /**
   * Get user's cat count
   * @param address - User wallet address
   */
  const getUserCatCount = async (address: string) => {
    if (!catsContract) return 0n;
    return await catsContract.balanceOf(address);
  };

  /**
   * Get user's cat token IDs
   * @param address - User wallet address
   */
  const getUserCatTokenIds = async (address: string) => {
    if (!catsContract) return [];
    const balance = await catsContract.balanceOf(address);
    const tokenIds: bigint[] = [];

    for (let i = 0; i < Number(balance); i++) {
      const tokenId = await catsContract.tokenOfOwnerByIndex(address, i);
      tokenIds.push(tokenId);
    }

    return tokenIds;
  };

  return {
    catsContract,
    mintCat,
    completeMission,
    claimReward,
    getCat,
    getOracleImprint,
    getGameState,
    getRemainingCooldown,
    getRewardAmount,
    getUserCatCount,
    getUserCatTokenIds,
  };
}

