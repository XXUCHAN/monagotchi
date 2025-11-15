import { Contract, type InterfaceAbi } from 'ethers'
import { useMemo } from 'react'
import { useWallet } from './useWallet'
import { CONTRACTS } from '../utils/constants'
import VolatilityCatsArtifact from '../abi/VolatilityCats.json'
import ChurrTokenArtifact from '../abi/ChurrToken.json'

const CATS_ABI = VolatilityCatsArtifact.abi as InterfaceAbi
const CHURR_ABI = ChurrTokenArtifact.abi as InterfaceAbi

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
    const tx = await contract.mintRandomCat(clan)
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
  const runMission = async (tokenId: bigint, missionType: number) => {
    const contract = await getCatsContractWithSigner()
    const tx = await contract.runMission(tokenId, missionType)
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
    runMission,
    claimReward,
    getUserCatCount,
    getUserCatTokenIds,
    getChurrBalance,
  }
}

