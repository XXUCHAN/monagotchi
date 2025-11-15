const { expect } = require('chai');
const { loadFixture, time } = require('@nomicfoundation/hardhat-network-helpers');

const { deployCatsFixture, mintCat, DEFAULT_EPOCH } = require('./helpers');

describe('VolatilityCats - mintRandomCat', () => {
    async function setup() {
        return deployCatsFixture();
    }

    it('민팅 시 기본 상태와 Oracle Imprint가 저장된다', async () => {
        const { cats, player } = await loadFixture(setup);

        const mintedId = await mintCat(cats, player, 0);
        const [catId, catImprint, catGame, teleportState, ownerAddress] = await cats.getCat(mintedId);

        expect(ownerAddress).to.equal(player.address); // owner 확인
        expect(catId).to.equal(mintedId); // tokenId
        expect(catImprint.clan).to.equal(0); // clan
        expect(catGame.power).to.equal(0); // power
        expect(catGame.rewarded).to.equal(false); // rewarded
        expect(teleportState.isAlive).to.equal(true);
        expect(teleportState.currentChainId).to.equal(0);
        expect(teleportState.visitedChainsBitmap).to.equal(1); // 홈 체인만 방문

        const imprint = await cats.getOracleImprint(mintedId);
        const latest = await time.latest();
        const expectedEpoch = Math.floor(latest / DEFAULT_EPOCH);
        expect(imprint[6]).to.equal(expectedEpoch); // epochId
        expect(imprint[4]).to.be.at.least(-10000); // birthTrendBps
        expect(imprint[4]).to.be.at.most(10000); // birthTrendBps
        expect(imprint[5]).to.be.within(0, 2); // birthVolBucket
        expect(imprint[7]).to.not.equal(0); // entropy
    });

    it('잘못된 clan 값이면 revert된다', async () => {
        const { cats, player } = await loadFixture(setup);

        await expect(cats.connect(player).mintRandomCat(3)).to.be.revertedWithCustomError(cats, 'InvalidClan');
    });
});
