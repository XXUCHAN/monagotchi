import { Contract } from 'ethers'
import { useMemo } from 'react'
import { useWallet } from './useWallet'
import { CONTRACTS } from '../utils/constants'
import { parseContractError, formatCooldownError } from '../utils/contractErrors'
import { toast } from 'react-hot-toast'
import VolatilityCatsABI from '../contracts/abis/VolatilityCats.json'
import ChurrTokenABI from '../contracts/abis/ChurrToken.json'

export function useContract() {
  const { getProvider, getSigner } = useWallet()

  // Get VolatilityCats contract (read-only)
  const catsContract = useMemo(() => {
    if (!CONTRACTS.CATS) return null
    const provider = getProvider()
    return new Contract(CONTRACTS.CATS, VolatilityCatsABI, provider)
  }, [getProvider])

  // Get ChurrToken contract (read-only)
  const churrContract = useMemo(() => {
    if (!CONTRACTS.CHURR) return null
    const provider = getProvider()
    return new Contract(CONTRACTS.CHURR, ChurrTokenABI, provider)
  }, [getProvider])

  // Get VolatilityCats contract with signer (for write operations)
  const getCatsContractWithSigner = async () => {
    if (!CONTRACTS.CATS) {
      throw new Error('Cats contract address not configured')
    }
    const signer = await getSigner()
    return new Contract(CONTRACTS.CATS, VolatilityCatsABI, signer)
  }

  // Mint a cat
  const mintCat = async (clan: number) => {
    try {
      const contract = await getCatsContractWithSigner()
      const tx = await contract.mintRandomCat(clan)
      
      toast.loading('고양이 민팅 중...', { id: tx.hash })
      await tx.wait()
      toast.success('고양이가 성공적으로 민팅되었습니다! 🐱', { id: tx.hash })
      
      return tx
    } catch (error: any) {
      const message = parseContractError(error)
      toast.error(message)
      throw error
    }
  }

  // Get cat data
  const getCat = async (tokenId: bigint) => {
    if (!catsContract) {
      throw new Error('Cats contract not initialized')
    }
    return await catsContract.getCat(tokenId)
  }

  // Complete mission (runMission in contract)
  const completeMission = async (tokenId: bigint, missionType: number) => {
    try {
      // Check cooldown first
      const remaining = await getRemainingCooldown(tokenId, missionType)
      if (remaining > 0n) {
        const message = formatCooldownError(Number(remaining))
        toast.error(message)
        throw new Error(message)
      }

      const contract = await getCatsContractWithSigner()
      const tx = await contract.runMission(tokenId, missionType)
      
      const missionNames = ['Daily', 'Weekly', 'Monthly']
      toast.loading(`${missionNames[missionType]} 미션 실행 중...`, { id: tx.hash })
      await tx.wait()
      toast.success('미션을 완료했습니다! 💪', { id: tx.hash })
      
      return tx
    } catch (error: any) {
      const message = parseContractError(error)
      if (!message.includes('쿨다운')) {
        toast.error(message)
      }
      throw error
    }
  }

  // Claim reward
  const claimReward = async (tokenId: bigint) => {
    try {
      const contract = await getCatsContractWithSigner()
      const tx = await contract.claimReward(tokenId)
      
      toast.loading('보상 수령 중...', { id: tx.hash })
      await tx.wait()
      toast.success('보상을 받았습니다! 🎉', { id: tx.hash })
      
      return tx
    } catch (error: any) {
      const message = parseContractError(error)
      toast.error(message)
      throw error
    }
  }

  // Get user's cat count
  const getUserCatCount = async (address: string) => {
    if (!catsContract) return 0n
    return await catsContract.balanceOf(address)
  }

  // Get user's cat token IDs
  const getUserCatTokenIds = async (address: string) => {
    if (!catsContract) return []
    const balance = await catsContract.balanceOf(address)
    const tokenIds: bigint[] = []
    
    for (let i = 0; i < Number(balance); i++) {
      const tokenId = await catsContract.tokenOfOwnerByIndex(address, i)
      tokenIds.push(tokenId)
    }
    
    return tokenIds
  }

  // Get CHURR token balance
  const getChurrBalance = async (address: string) => {
    if (!churrContract) return 0n
    return await churrContract.balanceOf(address)
  }

  // Get Oracle Imprint details
  const getOracleImprint = async (tokenId: bigint) => {
    if (!catsContract) {
      throw new Error('Cats contract not initialized')
    }
    return await catsContract.getOracleImprint(tokenId)
  }

  // Get Game State
  const getGameState = async (tokenId: bigint) => {
    if (!catsContract) {
      throw new Error('Cats contract not initialized')
    }
    return await catsContract.getGameState(tokenId)
  }

  // Get remaining cooldown for a mission
  const getRemainingCooldown = async (tokenId: bigint, missionType: number) => {
    if (!catsContract) {
      throw new Error('Cats contract not initialized')
    }
    return await catsContract.getRemainingCooldown(tokenId, missionType)
  }

  // Get reward amount (constant)
  const getRewardAmount = async () => {
    if (!catsContract) {
      throw new Error('Cats contract not initialized')
    }
    return await catsContract.rewardAmount()
  }

  return {
    catsContract,
    churrContract,
    mintCat,
    getCat,
    completeMission,
    claimReward,
    getUserCatCount,
    getUserCatTokenIds,
    getChurrBalance,
    getOracleImprint,
    getGameState,
    getRemainingCooldown,
    getRewardAmount,
  }
}

