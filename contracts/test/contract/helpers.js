const { ethers } = require('hardhat');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

const DECIMALS = 8;
const BTC_PRICE = 50_000n * 10n ** 8n;
const ETH_PRICE = 3_500n * 10n ** 8n;
const DEFAULT_EPOCH = 3600;

const BTC_ASSET_ID = ethers.keccak256(ethers.toUtf8Bytes('BTC_USD'));
const ETH_ASSET_ID = ethers.keccak256(ethers.toUtf8Bytes('ETH_USD'));

async function deployCatsFixture() {
    const [owner, player, stranger] = await ethers.getSigners();

    const ChurrToken = await ethers.getContractFactory('ChurrToken');
    const fishToken = await ChurrToken.deploy();

    const MockV3Aggregator = await ethers.getContractFactory('MockV3Aggregator');
    const btcFeed = await MockV3Aggregator.deploy(DECIMALS, BTC_PRICE);
    const ethFeed = await MockV3Aggregator.deploy(DECIMALS, ETH_PRICE);

    const AssetRegistry = await ethers.getContractFactory('AssetRegistry');
    const assetRegistry = await AssetRegistry.deploy();

    await assetRegistry.addAsset(BTC_ASSET_ID, await btcFeed.getAddress(), DECIMALS, 2, 5000);
    await assetRegistry.addAsset(ETH_ASSET_ID, await ethFeed.getAddress(), DECIMALS, 2, 6000);

    const VolatilityCats = await ethers.getContractFactory('VolatilityCats');
    const cats = await VolatilityCats.deploy(
        await fishToken.getAddress(),
        await assetRegistry.getAddress(),
        DEFAULT_EPOCH
    );

    await fishToken.transferOwnership(await cats.getAddress());

    return {
        owner,
        player,
        stranger,
        fishToken,
        cats,
        btcFeed,
        ethFeed,
        assetRegistry,
    };
}

async function mintCat(cats, signer, clan = 0) {
    const tx = await cats.connect(signer).mintRandomCat(clan);
    const receipt = await tx.wait();
    const event = receipt.logs.find((log) => log.fragment && log.fragment.name === 'CatMinted');
    const tokenId = event.args.tokenId;
    return Number(tokenId);
}

async function ensurePower(cats, signer, tokenId, minPower, missionType = 0, feed) {
    const DAILY = 12 * 60 * 60;
    while (true) {
        const [, , gameState] = await cats.getCat(tokenId);
        if (gameState.power >= BigInt(minPower)) {
            break;
        }
        await cats.connect(signer).runMission(tokenId, missionType);
        await time.increase(DAILY + 1);
        if (feed) {
            await feed.updateAnswer(BTC_PRICE);
        }
    }
}

module.exports = {
    BTC_PRICE,
    ETH_PRICE,
    DECIMALS,
    DEFAULT_EPOCH,
    BTC_ASSET_ID,
    ETH_ASSET_ID,
    deployCatsFixture,
    mintCat,
    ensurePower,
};
