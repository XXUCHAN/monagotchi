const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const { deployCatsFixture, mintCat, BTC_PRICE } = require("./helpers");

describe("VolatilityCats - Oracle Imprint", () => {
  async function setup() {
    return deployCatsFixture();
  }

  it("Imprint 필드들이 허용 범위 내에 생성된다", async () => {
    const { cats, player } = await loadFixture(setup);
    const tokenId = await mintCat(cats, player, 0);
    const imprint = await cats.getOracleImprint(tokenId);

    expect(imprint.clan).to.equal(0);
    expect(imprint.temperament).to.be.within(0, 2);
    expect(imprint.fortuneTier).to.be.within(0, 2);
    expect(imprint.rarityTier).to.be.within(0, 2);
    expect(imprint.birthTrendBps).to.be.at.least(-10000);
    expect(imprint.birthTrendBps).to.be.at.most(10000);
    expect(imprint.birthVolBucket).to.be.within(0, 2);
  });

  it("Oracle Imprint 생성 시 적절한 값 범위를 가진다", async () => {
    const { cats, player } = await loadFixture(setup);

    const tokenId = await mintCat(cats, player, 0);
    const imprint = await cats.getOracleImprint(tokenId);

    // birthTrendBps는 -10000 ~ +10000 범위
    expect(imprint[4]).to.be.at.least(-10000);
    expect(imprint[4]).to.be.at.most(10000);

    // birthVolBucket는 0-2 범위
    expect(imprint[5]).to.be.within(0, 2);

    // 다른 필드들도 적절한 범위
    expect(imprint[0]).to.equal(0); // clan
    expect(imprint[1]).to.be.within(0, 2); // temperament
    expect(imprint[2]).to.be.within(0, 2); // fortuneTier
    expect(imprint[3]).to.be.within(0, 2); // rarityTier
  });
});
