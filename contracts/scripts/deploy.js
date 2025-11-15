const hre = require('hardhat');
const { ethers } = hre;

const REQUIRED_ASSETS = [
    {
        name: 'BTC_USD',
        envKey: 'BTC_USD_FEED',
        decimals: 8,
        volatilityTier: 2,
        maxExposureBps: 5000,
    },
    {
        name: 'ETH_USD',
        envKey: 'ETH_USD_FEED',
        decimals: 8,
        volatilityTier: 2,
        maxExposureBps: 6000,
    },
];

const OPTIONAL_ASSETS = [
    { name: 'SOL_USD', envKey: 'SOL_USD_FEED', decimals: 8, volatilityTier: 2, maxExposureBps: 4000 },
    { name: 'DOGE_USD', envKey: 'DOGE_USD_FEED', decimals: 8, volatilityTier: 1, maxExposureBps: 3000 },
    { name: 'PEPE_USD', envKey: 'PEPE_USD_FEED', decimals: 8, volatilityTier: 0, maxExposureBps: 2000 },
    { name: 'LINK_USD', envKey: 'LINK_USD_FEED', decimals: 8, volatilityTier: 1, maxExposureBps: 3500 },
];

const zeroAddress = ethers.ZeroAddress;

const toAssetId = (name) => ethers.keccak256(ethers.toUtf8Bytes(name));

const DEFAULT_FEED_PRICES = {
    BTC_USD: 95_000n * 10n ** 8n,
    ETH_USD: 3_200n * 10n ** 8n,
    SOL_USD: 180n * 10n ** 8n,
    DOGE_USD: 35_000_000n, // 0.35 * 1e8
    PEPE_USD: 1_200n, // 0.000012 * 1e8
    LINK_USD: 18n * 10n ** 8n,
};

async function deployMockFeed(asset) {
    const price = DEFAULT_FEED_PRICES[asset.name];
    if (price === undefined) {
        throw new Error(`Mock price not defined for ${asset.name}`);
    }

    const MockV3Aggregator = await ethers.getContractFactory('MockV3Aggregator');
    const mock = await MockV3Aggregator.deploy(asset.decimals, price);
    await mock.waitForDeployment();
    const mockAddress = await mock.getAddress();
    console.log(`- ${asset.name} (${asset.envKey}) 주소가 없어 MockV3Aggregator 배포 → ${mockAddress}`);
    return mockAddress;
}

async function configureAssets(registry, assets, { strict }) {
    for (const asset of assets) {
        const rawFeed = process.env[asset.envKey];
        const feed = rawFeed ? rawFeed.trim() : '';

        let resolvedFeed;
        if (feed && ethers.isAddress(feed)) {
            resolvedFeed = ethers.getAddress(feed);
        } else if (strict) {
            resolvedFeed = await deployMockFeed(asset);
        } else if (!feed || feed === zeroAddress) {
            console.log(`- ${asset.name} 주소가 없어 스킵합니다 (${asset.envKey})`);
            continue;
        } else {
            console.log(`- ${asset.name} 주소 형식이 잘못되어 Mock 배포를 생략하고 스킵합니다 (${asset.envKey})`);
            continue;
        }

        console.log(`- ${asset.name} (${asset.envKey}) 등록 중: ${resolvedFeed}`);
        await registry.addAsset(
            toAssetId(asset.name),
            resolvedFeed,
            asset.decimals,
            asset.volatilityTier,
            asset.maxExposureBps
        );
    }
}

async function main() {
    console.log('Volatility Cats 컨트랙트 배포 시작...');

    const networkName = hre.network.name;
    console.log('대상 네트워크:', networkName);

    // 계정 확인
    const [deployer] = await ethers.getSigners();
    console.log('배포 계정:', deployer.address);
    console.log('계정 잔액:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

    // ChurrToken 배포
    console.log('ChurrToken 배포 중...');
    const ChurrToken = await ethers.getContractFactory('ChurrToken');
    const fishToken = await ChurrToken.deploy();
    await fishToken.waitForDeployment();
    const fishTokenAddress = await fishToken.getAddress();
    console.log('ChurrToken 배포됨:', fishTokenAddress);

    // AssetRegistry 배포
    console.log('AssetRegistry 배포 중...');
    const AssetRegistry = await ethers.getContractFactory('AssetRegistry');
    const assetRegistry = await AssetRegistry.deploy();
    await assetRegistry.waitForDeployment();
    const assetRegistryAddress = await assetRegistry.getAddress();
    console.log('AssetRegistry 배포됨:', assetRegistryAddress);

    console.log('필수 자산 구성 중...');
    await configureAssets(assetRegistry, REQUIRED_ASSETS, { strict: true });

    console.log('선택 자산 구성 시도...');
    await configureAssets(assetRegistry, OPTIONAL_ASSETS, { strict: false });

    // VolatilityCats 배포 (epochWindow = 1시간)
    const epochWindow = 3600; // 1시간
    console.log('VolatilityCats 배포 중...');
    const VolatilityCats = await ethers.getContractFactory('VolatilityCats');
    const volatilityCats = await VolatilityCats.deploy(fishTokenAddress, assetRegistryAddress, epochWindow);
    await volatilityCats.waitForDeployment();
    const volatilityCatsAddress = await volatilityCats.getAddress();
    console.log('VolatilityCats 배포됨:', volatilityCatsAddress);

    // ChurrToken 소유권 이전
    console.log('ChurrToken 소유권 이전 중...');
    await fishToken.transferOwnership(volatilityCatsAddress);
    console.log('ChurrToken 소유권 이전 완료');

    console.log('\n배포 완료!');
    console.log('====================');
    console.log('ChurrToken 주소:', fishTokenAddress);
    console.log('AssetRegistry 주소:', assetRegistryAddress);
    console.log('VolatilityCats 주소:', volatilityCatsAddress);
    console.log('====================');

    // 검증 (선택사항)
    console.log('\n컨트랙트 검증 중...');
    try {
        await hre.run('verify:verify', {
            address: fishTokenAddress,
            contract: 'contracts/ChurrToken.sol:ChurrToken',
        });
        console.log('ChurrToken 검증 완료');
    } catch (error) {
        console.log('ChurrToken 검증 실패:', error.message);
    }

    try {
        await hre.run('verify:verify', {
            address: assetRegistryAddress,
            contract: 'contracts/registry/AssetRegistry.sol:AssetRegistry',
        });
        console.log('AssetRegistry 검증 완료');
    } catch (error) {
        console.log('AssetRegistry 검증 실패:', error.message);
    }

    try {
        await hre.run('verify:verify', {
            address: volatilityCatsAddress,
            constructorArguments: [fishTokenAddress, assetRegistryAddress, epochWindow],
            contract: 'contracts/VolatilityCats.sol:VolatilityCats',
        });
        console.log('VolatilityCats 검증 완료');
    } catch (error) {
        console.log('VolatilityCats 검증 실패:', error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
