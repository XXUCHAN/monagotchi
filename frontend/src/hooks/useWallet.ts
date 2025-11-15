import { usePrivy } from '@privy-io/react-auth'
import { BrowserProvider } from 'ethers'
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
      throw new Error('No ethereum provider found. Please install MetaMask.')
    }

    const provider = new BrowserProvider(window.ethereum)
    
    // Ensure we're on the correct network
    const network = await provider.getNetwork()
    const currentChainId = Number(network.chainId)
    
    if (currentChainId !== NETWORK.chainId) {
      console.log(`Wrong network (${currentChainId}), switching to ${NETWORK.chainId}...`)
      await switchNetwork()
      // Create new provider after network switch
      const newProvider = new BrowserProvider(window.ethereum)
      return await newProvider.getSigner()
    }
    
    return await provider.getSigner()
  }

  // Get provider for read operations
  // IMPORTANT: Use MetaMask provider to avoid CORS issues
  const getProvider = () => {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found. Please install MetaMask.')
    }
    return new BrowserProvider(window.ethereum)
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

