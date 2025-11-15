require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const { MONAD_RPC_URL, MONAD_PRIVATE_KEY } = process.env;

module.exports = {
    solidity: {
        version: '0.8.20',
        settings: {
            optimizer: { enabled: true, runs: 200 },
        },
    },
    networks: {
        monadTestnet: {
            url: MONAD_RPC_URL || 'https://rpc.testnet.monad.xyz',
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
