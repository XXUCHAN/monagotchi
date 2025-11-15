import { usePrivy } from '@privy-io/react-auth'
import { BrowserProvider, JsonRpcProvider } from 'ethers'
import { useMemo } from 'react'
import { NETWORK } from '../constants'

export function useWallet() {
  const { ready, authenticated, user } = usePrivy()

  // Get wallet address
  const walletAddress = useMemo(() => {
    if (!authenticated || !user?.wallet) return null
    return user.wallet.address
  }, [authenticated, user])

  // Get signer for write operations
  const getSigner = async () => {
    if (!authenticated) {
      throw new Error('Not authenticated')
    }

    if (!window.ethereum) {
      throw new Error('No ethereum provider found')
    }

    const provider = new BrowserProvider(window.ethereum)
    return await provider.getSigner()
  }

  // Get provider for read operations
  const getProvider = () => {
    return new JsonRpcProvider(NETWORK.rpcUrl)
  }

  // Request account access (if needed)
  const requestAccounts = async () => {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found')
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
    } catch (error) {
      console.error('Failed to request accounts:', error)
      throw error
    }
  }

  // Switch to correct network
  const switchNetwork = async () => {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK.chainId.toString(16)}` }],
      })
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${NETWORK.chainId.toString(16)}`,
              chainName: NETWORK.name,
              rpcUrls: [NETWORK.rpcUrl],
              blockExplorerUrls: [NETWORK.blockExplorer],
              nativeCurrency: {
                name: 'MONAD',
                symbol: 'MON',
                decimals: 18,
              },
            },
          ],
        })
      } else {
        throw error
      }
    }
  }

  return {
    ready,
    authenticated,
    walletAddress,
    user,
    getSigner,
    getProvider,
    requestAccounts,
    switchNetwork,
  }
}

