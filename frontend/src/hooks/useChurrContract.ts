import { Contract } from 'ethers';
import { useMemo } from 'react';
import { useWallet } from './useWallet';
import { CONTRACTS } from '../constants';
import ChurrTokenABI from '../contracts/abis/ChurrToken.json';

/**
 * Custom Hook for ChurrToken Contract Interactions
 */
export function useChurrContract() {
  const { getProvider } = useWallet();

  // Get ChurrToken contract (read-only)
  const churrContract = useMemo(() => {
    if (!CONTRACTS.CHURR) return null;
    const provider = getProvider();
    return new Contract(CONTRACTS.CHURR, ChurrTokenABI, provider);
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

