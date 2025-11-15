const hre = require('hardhat');
require('dotenv').config();

const {
    ACCOUNT_ADDRESS = '',
    VOLATILITY_CATS_ADDRESS = '0x8a062D558ea29DF60EA4a185DdC2069426dEb1Fd',
    CHURR_TOKEN_ADDRESS = '0xBF0ad8513dCf383aBacb5A41775bd2C42C26DdE9',
} = process.env;

async function main() {
    const { ethers } = hre;

    let targetAddress = ACCOUNT_ADDRESS.trim();
    let fromEnv = false;

    if (ethers.isAddress(targetAddress)) {
        fromEnv = true;
    } else {
        const [signer] = await ethers.getSigners();
        targetAddress = signer.address;
    }

    if (!ethers.isAddress(VOLATILITY_CATS_ADDRESS)) {
        throw new Error('VOLATILITY_CATS_ADDRESS env가 필요합니다.');
    }
    if (!ethers.isAddress(CHURR_TOKEN_ADDRESS)) {
        throw new Error('CHURR_TOKEN_ADDRESS env가 필요합니다.');
    }

    const provider = ethers.provider;
    const network = await provider.getNetwork();
    const balanceWei = await provider.getBalance(targetAddress);
    const cats = await ethers.getContractAt('VolatilityCats', VOLATILITY_CATS_ADDRESS);
    const churr = await ethers.getContractAt('ChurrToken', CHURR_TOKEN_ADDRESS);
    const catCount = await cats.balanceOf(targetAddress);
    const churrBalance = await churr.balanceOf(targetAddress);

    console.log('📡 Monad Testnet Account Status');
    console.log('Network :', network);
    console.log('Address :', targetAddress, fromEnv ? '(ACCOUNT_ADDRESS env)' : '(default signer)');
    console.log('Balance :', ethers.formatEther(balanceWei), 'MON');
    console.log('Cats    :', catCount.toString(), 'tokens owned');
    console.log('CHURR   :', ethers.formatEther(churrBalance), 'CHURR');

    const latestBlock = await provider.getBlockNumber();
    console.log('Latest block:', latestBlock);

    console.log('\nToken holdings snapshot (up to 5 cats via recent CatMinted events)');
    if (catCount === 0n) {
        console.log('- No cats owned.');
        return;
    }

    const searchWindow = 20000;
    const fromBlock = latestBlock > searchWindow ? latestBlock - searchWindow : 0;
    const batchSize = 100;

    async function queryEventsInBatches(filter) {
        const events = [];
        for (let start = fromBlock; start <= latestBlock; start += batchSize) {
            const end = Math.min(start + batchSize - 1, latestBlock);
            const batch = await cats.queryFilter(filter, start, end);
            events.push(...batch);
        }
        return events;
    }

    const mintedFilter = cats.filters.CatMinted(null, targetAddress);
    const mintedEvents = await queryEventsInBatches(mintedFilter);

    if (mintedEvents.length === 0) {
        console.log('- No recent CatMinted events found for this account (window ~20k blocks).');
        console.log('- Use on-chain explorer if cats were acquired earlier than the window.');
        return;
    }

    const ownedTokenIds = [];
    for (const event of mintedEvents.reverse()) {
        const tokenId = event.args.tokenId;
        const owner = await cats.ownerOf(tokenId);
        if (owner.toLowerCase() === targetAddress.toLowerCase()) {
            ownedTokenIds.push(tokenId);
        }
        if (ownedTokenIds.length >= 5) break;
    }

    if (ownedTokenIds.length === 0) {
        console.log('- No cats in recent window currently owned.');
        return;
    }

    for (const tokenId of ownedTokenIds) {
        const cat = await cats.getCat(tokenId);
        console.log(
            `- tokenId ${tokenId.toString()} | clan ${cat[1]} | power ${cat[2].toString()} | rewarded ${cat[3]}`
        );
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
