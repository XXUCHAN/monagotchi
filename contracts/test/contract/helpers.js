const { ethers } = require('hardhat');

const DECIMALS = 8;
const BTC_PRICE = 50_000n * 10n ** 8n;
const ETH_PRICE = 3_500n * 10n ** 8n;
const DEFAULT_EPOCH = 3600;

async function deployCatsFixture() {
    const [owner, player, stranger] = await ethers.getSigners();

    const ChurrToken = await ethers.getContractFactory('ChurrToken');
    const fishToken = await ChurrToken.deploy();

    const MockV3Aggregator = await ethers.getContractFactory('MockV3Aggregator');
    const btcFeed = await MockV3Aggregator.deploy(DECIMALS, BTC_PRICE);
    const ethFeed = await MockV3Aggregator.deploy(DECIMALS, ETH_PRICE);

    const VolatilityCats = await ethers.getContractFactory('VolatilityCats');
    const cats = await VolatilityCats.deploy(await fishToken.getAddress(), DEFAULT_EPOCH);

    await fishToken.transferOwnership(await cats.getAddress());
    await cats.setClanFeed(0, await btcFeed.getAddress(), true);
    await cats.setClanFeed(1, await ethFeed.getAddress(), true);

    return { owner, player, stranger, fishToken, cats, btcFeed, ethFeed };
}

async function mintCat(cats, signer, clan = 0) {
    const tx = await cats.connect(signer).mintRandomCat(clan);
    const receipt = await tx.wait();
    const event = receipt.logs.find((log) => log.fragment && log.fragment.name === 'CatMinted');
    const tokenId = event.args.tokenId;
    return Number(tokenId);
}

module.exports = {
    BTC_PRICE,
    ETH_PRICE,
    DECIMALS,
    DEFAULT_EPOCH,
    deployCatsFixture,
    mintCat,
};
