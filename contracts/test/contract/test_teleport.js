const { expect } = require('chai');
const { loadFixture, time } = require('@nomicfoundation/hardhat-network-helpers');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');

const { deployCatsFixture, mintCat, ensurePower } = require('./helpers');

describe('VolatilityCats - Teleport', () => {
    async function setup() {
        return deployCatsFixture();
    }

    it('텔레포트 성공 시 상태, 파워, 잭팟 풀이 업데이트된다', async () => {
        const { cats, player, btcFeed } = await loadFixture(setup);
        const tokenId = await mintCat(cats, player);

        const [, , , , ownerAddress] = await cats.getCat(tokenId);
        expect(ownerAddress).to.equal(player.address);

        const [, , powerCostBig] = await cats.teleportConfig();
        const powerCost = Number(powerCostBig);

        await ensurePower(cats, player, tokenId, powerCost + 5, 0, btcFeed);
        const [, , gameBefore] = await cats.getCat(tokenId);
        const beforeJackpot = await cats.jackpotBalance();
        const payload = '0x1234';

        const tx = await cats.connect(player).teleportToChain(tokenId, 1, payload);
        await expect(tx).to.emit(cats, 'TeleportCompleted').withArgs(tokenId, 0, 1, 1, anyValue, anyValue);

        const [, , gameAfter, teleportState] = await cats.getCat(tokenId);
        expect(Number(gameAfter.power)).to.equal(Number(gameBefore.power) - powerCost);
        expect(teleportState.currentChainId).to.equal(1);
        expect(teleportState.teleportCount).to.equal(1);
        const visitedBitmap = Number(teleportState.visitedChainsBitmap);
        expect(visitedBitmap & (1 << 1)).to.not.equal(0);

        const afterJackpot = await cats.jackpotBalance();
        const [, , teleportFee] = await cats.jackpotConfig();
        expect(afterJackpot - beforeJackpot).to.equal(teleportFee);
    });

    it('쿨다운 또는 파워 부족 시 텔레포트를 차단한다', async () => {
        const { cats, player, btcFeed } = await loadFixture(setup);
        const tokenId = await mintCat(cats, player);
        const [cooldownSeconds, , powerCost] = await cats.teleportConfig();

        await ensurePower(cats, player, tokenId, Number(powerCost) + 5, 0, btcFeed);
        await cats.connect(player).teleportToChain(tokenId, 1, '0x');

        await expect(cats.connect(player).teleportToChain(tokenId, 2, '0x00')).to.be.revertedWithCustomError(
            cats,
            'TeleportCooldown'
        );

        await time.increase(Number(cooldownSeconds) + 1);
        // 파워 부족 케이스 (새 고양이)
        const tokenId2 = await mintCat(cats, player);
        await expect(cats.connect(player).teleportToChain(tokenId2, 1, '0x02')).to.be.revertedWithCustomError(
            cats,
            'TeleportPowerTooLow'
        );
    });
});
