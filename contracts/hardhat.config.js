require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const { MONAD_RPC_URL, MONAD_PRIVATE_KEY } = process.env;

const normalizeRpcUrl = (url) => {
    if (!url) return undefined;
    const sanitized = url.trim();
    if (sanitized === 'https://rpc.testnet.monad.xyz' || sanitized === 'https://rpc.testnet.monad.xyz/') {
        return 'https://testnet-rpc.monad.xyz/';
    }
    return sanitized;
};

const resolvedMonadRpc = normalizeRpcUrl(MONAD_RPC_URL) || 'https://testnet-rpc.monad.xyz/';

module.exports = {
    solidity: {
        version: '0.8.20',
        settings: {
            optimizer: { enabled: true, runs: 200 },
        },
    },
    networks: {
        localhost: {
            url: 'http://127.0.0.1:8545',
            chainId: 31337,
            accounts: 'remote', // Hardhat의 기본 계정 사용
        },
        monadTestnet: {
            url: resolvedMonadRpc,
            accounts: MONAD_PRIVATE_KEY ? [MONAD_PRIVATE_KEY] : [],
        },
    },
    paths: {
        sources: 'src',
        tests: 'test',
        cache: 'cache',
        artifacts: 'artifacts',
    },
};
