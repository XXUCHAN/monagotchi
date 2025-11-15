const hre = require('hardhat');
require('dotenv').config();

const {
    VOLATILITY_CATS_ADDRESS = '0x8a062D558ea29DF60EA4a185DdC2069426dEb1Fd',
    CHURR_TOKEN_ADDRESS = '0xBF0ad8513dCf383aBacb5A41775bd2C42C26DdE9',
    ASSET_REGISTRY_ADDRESS = '0x152285CE8DADCCb4B10285eE077de870aF8d53FC',
} = process.env;

async function main() {
    const { ethers } = hre;

    if (!ethers.isAddress(VOLATILITY_CATS_ADDRESS)) {
        throw new Error('VOLATILITY_CATS_ADDRESS env가 필요합니다.');
    }
    if (!ethers.isAddress(CHURR_TOKEN_ADDRESS)) {
        throw new Error('CHURR_TOKEN_ADDRESS env가 필요합니다.');
    }
    if (!ethers.isAddress(ASSET_REGISTRY_ADDRESS)) {
        throw new Error('ASSET_REGISTRY_ADDRESS env가 필요합니다.');
    }

    const [signer] = await ethers.getSigners();
    console.log('🔥 Live smoke test');
    console.log('Signer:', signer.address);
    console.log('Monad RPC:', await signer.provider.getNetwork());

    const cats = await ethers.getContractAt('VolatilityCats', VOLATILITY_CATS_ADDRESS, signer);
    const churr = await ethers.getContractAt('ChurrToken', CHURR_TOKEN_ADDRESS, signer);
    const registry = await ethers.getContractAt('AssetRegistry', ASSET_REGISTRY_ADDRESS, signer);

    console.log('\n[1] Asset Registry 상태 확인');
    const btcId = ethers.keccak256(ethers.toUtf8Bytes('BTC_USD'));
    const btcConfig = await registry.getAsset(btcId);
    console.log('- BTC feed:', btcConfig.feedAddress, 'enabled:', btcConfig.enabled);

    console.log('\n[2] 고양이 민팅');
    const mintTx = await cats.mintRandomCat(0);
    console.log('- mint tx hash:', mintTx.hash);
    const mintReceipt = await mintTx.wait();

    let mintedTokenId = null;
    for (const log of mintReceipt.logs) {
        if (log.address.toLowerCase() !== VOLATILITY_CATS_ADDRESS.toLowerCase()) continue;
        try {
            const parsed = cats.interface.parseLog(log);
            if (parsed.name === 'CatMinted') {
                mintedTokenId = parsed.args.tokenId;
                break;
            }
        } catch (err) {
            // ignore non-matching logs
        }
    }

    if (mintedTokenId === null) {
        throw new Error('CatMinted 이벤트를 찾을 수 없습니다.');
    }
    console.log('- 새 토큰 ID:', mintedTokenId.toString());

    const cat = await cats.getCat(mintedTokenId);
    console.log('- clan:', cat[1], 'power:', cat[2].toString(), 'rewarded:', cat[3]);

    console.log('\n[3] Daily 미션 실행');
    const missionTx = await cats.runMission(mintedTokenId, 0);
    console.log('- mission tx hash:', missionTx.hash);
    await missionTx.wait();

    const updatedCat = await cats.getCat(mintedTokenId);
    console.log('- 새로운 power:', updatedCat[2].toString());

    console.log('\n[4] CHURR 토큰 잔액');
    const churrBalance = await churr.balanceOf(signer.address);
    console.log('- CHURR balance:', ethers.formatEther(churrBalance));

    console.log('\n✅ Smoke test 완료');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
