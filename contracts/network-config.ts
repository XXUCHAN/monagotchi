// Network configuration for Chainlink CCIP & Data Feeds
// Updated: 2025-11-15

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  ccip?: {
    router: string;
    chainSelector: string;
    linkToken: string;
    feeTokens: string[];
  };
  feeds: {
    [asset: string]: string; // assetId -> feedAddress
  };
  assets: {
    [assetId: string]: {
      symbol: string;
      decimals: number;
      volatilityTier: number;
      maxExposureBps: number;
      enabled: boolean;
    };
  };
}

export const networks: { [key: string]: NetworkConfig } = {
  monadTestnet: {
    name: "Monad Testnet",
    chainId: 10143,
    rpcUrl: "https://testnet-rpc.monad.xyz/",
    // CCIP: Monad testnet may not support CCIP yet, will update when available
    ccip: undefined, // TODO: Add when CCIP is supported on Monad testnet
    feeds: {
      // TODO: Replace with actual Monad testnet Chainlink feed addresses
      // Current addresses are placeholders - need to be updated with real feeds
      BTC_USD: "0x0000000000000000000000000000000000000000", // TODO
      ETH_USD: "0x0000000000000000000000000000000000000000", // TODO
      SOL_USD: "0x0000000000000000000000000000000000000000", // TODO
      DOGE_USD: "0x0000000000000000000000000000000000000000", // TODO
      PEPE_USD: "0x0000000000000000000000000000000000000000", // TODO
      LINK_USD: "0x0000000000000000000000000000000000000000", // TODO
    },
    assets: {
      BTC_USD: {
        symbol: "BTC",
        decimals: 8,
        volatilityTier: 2, // High volatility
        maxExposureBps: 5000, // 50%
        enabled: true,
      },
      ETH_USD: {
        symbol: "ETH",
        decimals: 8,
        volatilityTier: 2,
        maxExposureBps: 6000, // 60%
        enabled: true,
      },
      SOL_USD: {
        symbol: "SOL",
        decimals: 8,
        volatilityTier: 2,
        maxExposureBps: 4000, // 40%
        enabled: true,
      },
      DOGE_USD: {
        symbol: "DOGE",
        decimals: 8,
        volatilityTier: 1,
        maxExposureBps: 3000, // 30%
        enabled: true,
      },
      PEPE_USD: {
        symbol: "PEPE",
        decimals: 8,
        volatilityTier: 0,
        maxExposureBps: 2000, // 20%
        enabled: true,
      },
      LINK_USD: {
        symbol: "LINK",
        decimals: 8,
        volatilityTier: 1,
        maxExposureBps: 3500, // 35%
        enabled: true,
      },
    },
  },

  // For comparison - Polygon Amoy (current testnet-datastream.json)
  polygonAmoy: {
    name: "Polygon Amoy",
    chainId: 80002,
    rpcUrl: "https://rpc-amoy.polygon.technology/",
    ccip: {
      router: "0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb843dF", // Placeholder
      chainSelector: "16281711391670634445", // Placeholder
      linkToken: "0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b19077", // Placeholder
      feeTokens: ["0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b19077"],
    },
    feeds: {
      BTC_USD: "0x2Cd9D7E85494F68F5aF08EF96d6FD5e8F71B4d31",
      ETH_USD: "0x0c76859E85727683Eeba0C070Bc2e0F57B1337818",
      LINK_USD: "0x46820359650Cd2D88759193ee26600d8A0766e1391",
      USDC_USD: "0x70BB0758a38ae43418ffcEd9A25273d04e804D15",
      USDT_USD: "0x14eE6bE30A919B8951Dc23203E41C804D4D71d441",
      SOL_USD: "0x1c2f27C736aC97886F017AbdEedEd81C3C38Af73e",
      DOGE_USD: "0x7F1c8B16B1a16AA5a8e720dA162f0d9191f2e6EC5",
      PEPE_USD: "0x5db2F4591D04CABC9eE5C4016e9477A80d383D298",
    },
    assets: {
      BTC_USD: {
        symbol: "BTC",
        decimals: 8,
        volatilityTier: 2,
        maxExposureBps: 5000,
        enabled: true,
      },
      ETH_USD: {
        symbol: "ETH",
        decimals: 8,
        volatilityTier: 2,
        maxExposureBps: 6000,
        enabled: true,
      },
      SOL_USD: {
        symbol: "SOL",
        decimals: 8,
        volatilityTier: 2,
        maxExposureBps: 4000,
        enabled: true,
      },
      DOGE_USD: {
        symbol: "DOGE",
        decimals: 8,
        volatilityTier: 1,
        maxExposureBps: 3000,
        enabled: true,
      },
      PEPE_USD: {
        symbol: "PEPE",
        decimals: 8,
        volatilityTier: 0,
        maxExposureBps: 2000,
        enabled: true,
      },
      LINK_USD: {
        symbol: "LINK",
        decimals: 8,
        volatilityTier: 1,
        maxExposureBps: 3500,
        enabled: true,
      },
    },
  },

  localhost: {
    name: "Hardhat Localhost",
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545/",
    feeds: {
      // Use MockV3Aggregator addresses deployed locally
      BTC_USD: "0x0000000000000000000000000000000000000000", // Will be set by deployment script
      ETH_USD: "0x0000000000000000000000000000000000000000",
      SOL_USD: "0x0000000000000000000000000000000000000000",
      DOGE_USD: "0x0000000000000000000000000000000000000000",
      PEPE_USD: "0x0000000000000000000000000000000000000000",
      LINK_USD: "0x0000000000000000000000000000000000000000",
    },
    assets: {
      BTC_USD: {
        symbol: "BTC",
        decimals: 8,
        volatilityTier: 2,
        maxExposureBps: 5000,
        enabled: true,
      },
      ETH_USD: {
        symbol: "ETH",
        decimals: 8,
        volatilityTier: 2,
        maxExposureBps: 6000,
        enabled: true,
      },
      SOL_USD: {
        symbol: "SOL",
        decimals: 8,
        volatilityTier: 2,
        maxExposureBps: 4000,
        enabled: true,
      },
      DOGE_USD: {
        symbol: "DOGE",
        decimals: 8,
        volatilityTier: 1,
        maxExposureBps: 3000,
        enabled: true,
      },
      PEPE_USD: {
        symbol: "PEPE",
        decimals: 8,
        volatilityTier: 0,
        maxExposureBps: 2000,
        enabled: true,
      },
      LINK_USD: {
        symbol: "LINK",
        decimals: 8,
        volatilityTier: 1,
        maxExposureBps: 3500,
        enabled: true,
      },
    },
  },
};

// Helper functions
export function getNetworkConfig(networkName: string): NetworkConfig {
  const config = networks[networkName];
  if (!config) {
    throw new Error(`Network config not found for: ${networkName}`);
  }
  return config;
}

export function getFeedAddress(networkName: string, assetId: string): string {
  const config = getNetworkConfig(networkName);
  const address = config.feeds[assetId];
  if (!address) {
    throw new Error(`Feed address not found for ${assetId} on ${networkName}`);
  }
  return address;
}

export function getAssetConfig(networkName: string, assetId: string) {
  const config = getNetworkConfig(networkName);
  const asset = config.assets[assetId];
  if (!asset) {
    throw new Error(`Asset config not found for ${assetId} on ${networkName}`);
  }
  return asset;
}
