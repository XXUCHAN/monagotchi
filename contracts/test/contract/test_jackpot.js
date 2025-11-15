const { expect } = require('chai');
const { loadFixture, time } = require('@nomicfoundation/hardhat-network-helpers');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');

const { deployCatsFixture, mintCat, ensurePower } = require('./helpers');

describe('VolatilityCats - Jackpot', () => {
    async function setup() {
        return deployCatsFixture();
    }

    it('Grand Tour 최초 달성자가 잭팟을 수령한다', async () => {
        const { cats, player, btcFeed } = await loadFixture(setup);
        const tokenId = await mintCat(cats, player);

        const initialBalance = await cats.jackpotBalance();
        const [mintFee] = await cats.jackpotConfig();
        expect(initialBalance).to.equal(mintFee);

        const [cooldownSeconds, targetChains, powerCost] = await cats.teleportConfig();

        for (let chainId = 1; chainId <= Number(targetChains); chainId++) {
            await ensurePower(cats, player, tokenId, Number(powerCost) + 5, 0, btcFeed);
            if (chainId > 1) {
                await time.increase(Number(cooldownSeconds) + 1);
            }
            const tx = await cats.connect(player).teleportToChain(tokenId, chainId, '0x');
            if (chainId === Number(targetChains)) {
                await expect(tx).to.emit(cats, 'JackpotAwarded').withArgs(tokenId, player.address, anyValue);
            } else {
                await tx.wait();
            }
        }

        const jackpotBalance = await cats.jackpotBalance();
        expect(jackpotBalance).to.equal(0n);

        const jackpotState = await cats.getJackpotState();
        expect(jackpotState.claimed).to.equal(true);
        expect(jackpotState.winner).to.equal(player.address);
        expect(jackpotState.balance).to.equal(0n);
    });
});
