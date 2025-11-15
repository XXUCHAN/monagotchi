import { Contract, type InterfaceAbi } from 'ethers';
import { useMemo } from 'react';
import { useWallet } from './useWallet';
import { CONTRACTS } from '../constants';
import ChurrTokenArtifact from '../abi/ChurrToken.json';

const CHURR_ABI = ChurrTokenArtifact.abi as InterfaceAbi;

/**
 * Custom Hook for ChurrToken Contract Interactions
 */
export function useChurrContract() {
  const { getProvider } = useWallet();

  // Get ChurrToken contract (read-only)
  const churrContract = useMemo(() => {
    if (!CONTRACTS.CHURR) return null;
    const provider = getProvider();
    return new Contract(CONTRACTS.CHURR, CHURR_ABI, provider);
  }, [getProvider]);

  /**
   * Get CHURR token balance
   * @param address - User wallet address
   */
  const getChurrBalance = async (address: string) => {
    if (!churrContract) return 0n;
    return await churrContract.balanceOf(address);
  };

  return {
    churrContract,
    getChurrBalance,
  };
}

