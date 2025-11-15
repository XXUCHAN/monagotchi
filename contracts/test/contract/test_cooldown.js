const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");

const { deployCatsFixture, mintCat } = require("./helpers");

const DAILY = 12 * 60 * 60;

describe("VolatilityCats - 쿨다운 조회", () => {
  async function setup() {
    return deployCatsFixture();
  }

  it("미션 후 남은 쿨다운을 반환한다", async () => {
    const { cats, player } = await loadFixture(setup);
    const tokenId = await mintCat(cats, player);

    await cats.connect(player).runMission(tokenId, 0);
    const remaining = await cats.getRemainingCooldown(tokenId, 0);
    expect(remaining).to.be.greaterThan(0);

    await time.increase(DAILY + 1);
    const after = await cats.getRemainingCooldown(tokenId, 0);
    expect(after).to.equal(0);
  });

  it("존재하지 않는 미션 타입 조회 시 최대값 반환", async () => {
    const { cats, player } = await loadFixture(setup);
    const tokenId = await mintCat(cats, player);

    const result = await cats.getRemainingCooldown(tokenId, 7);
    expect(result).to.equal(ethers.MaxUint256);
  });
});
