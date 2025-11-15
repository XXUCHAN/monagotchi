import { Contract } from 'ethers'
import { useMemo } from 'react'
import { useWallet } from './useWallet'
import { CONTRACTS } from '../utils/constants'

// Minimal ABI for VolatilityCats contract
const CATS_ABI = [
  'function mintCat(uint8 clan) external',
  'function getCat(uint256 tokenId) external view returns (tuple(tuple(uint8 clan, uint8 temperament, uint8 fortuneTier, uint8 rarityTier, int32 birthTrendBps, uint32 birthVolBucket, uint64 epochId, uint64 entropy) imprint, tuple(uint32 power, uint16 season, uint8 rulesVersion, uint64 lastMissionDaily, uint64 lastMissionWeekly, uint64 lastMissionMonthly, bool rewarded) game))',
  'function completeMission(uint256 tokenId, uint8 missionType) external',
  'function claimReward(uint256 tokenId) external',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
  'event CatMinted(uint256 indexed tokenId, address indexed owner, uint8 clan)',
  'event MissionCompleted(uint256 indexed tokenId, uint8 missionType, uint256 newPower)',
  'event RewardClaimed(uint256 indexed tokenId, address indexed owner, uint256 amount)',
]

// Minimal ABI for ChurrToken contract
const CHURR_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)',
]

export function useContract() {
  const { getProvider, getSigner } = useWallet()

  // Get VolatilityCats contract (read-only)
  const catsContract = useMemo(() => {
    if (!CONTRACTS.CATS) return null
    const provider = getProvider()
    return new Contract(CONTRACTS.CATS, CATS_ABI, provider)
  }, [getProvider])

  // Get ChurrToken contract (read-only)
  const churrContract = useMemo(() => {
    if (!CONTRACTS.CHURR) return null
    const provider = getProvider()
    return new Contract(CONTRACTS.CHURR, CHURR_ABI, provider)
  }, [getProvider])

  // Get VolatilityCats contract with signer (for write operations)
  const getCatsContractWithSigner = async () => {
    if (!CONTRACTS.CATS) {
      throw new Error('Cats contract address not configured')
    }
    const signer = await getSigner()
    return new Contract(CONTRACTS.CATS, CATS_ABI, signer)
  }

  // Mint a cat
  const mintCat = async (clan: number) => {
    const contract = await getCatsContractWithSigner()
    const tx = await contract.mintCat(clan)
    return tx
  }

  // Get cat data
  const getCat = async (tokenId: bigint) => {
    if (!catsContract) {
      throw new Error('Cats contract not initialized')
    }
    return await catsContract.getCat(tokenId)
  }

  // Complete mission
  const completeMission = async (tokenId: bigint, missionType: number) => {
    const contract = await getCatsContractWithSigner()
    const tx = await contract.completeMission(tokenId, missionType)
    return tx
  }

  // Claim reward
  const claimReward = async (tokenId: bigint) => {
    const contract = await getCatsContractWithSigner()
    const tx = await contract.claimReward(tokenId)
    return tx
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
  }
}

