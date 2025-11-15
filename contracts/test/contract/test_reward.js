const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const { deployCatsFixture, mintCat } = require("./helpers");

const DAILY = 12 * 60 * 60;

async function reachRewardThreshold(cats, player, tokenId) {
  while (true) {
    const cat = await cats.getCat(tokenId);
    if (cat[2] >= 50) { // power is at index 2
      break;
    }
    await cats.connect(player).runMission(tokenId, 0);
    await time.increase(DAILY + 1);
  }
}

describe("VolatilityCats - claimReward", () => {
  async function setup() {
    return deployCatsFixture();
  }

  it("파워가 부족하면 보상 청구가 실패한다", async () => {
    const { cats, player } = await loadFixture(setup);
    const tokenId = await mintCat(cats, player);

    await expect(cats.connect(player).claimReward(tokenId)).to.be.revertedWithCustomError(
      cats,
      "PowerTooLow"
    );
  });

  it("임계값 충족 시 1회만 보상을 지급한다", async () => {
    const { cats, fishToken, player, stranger } = await loadFixture(setup);
    const tokenId = await mintCat(cats, player);

    await reachRewardThreshold(cats, player, tokenId);

    const rewardAmount = await cats.rewardAmount();

    await expect(cats.connect(player).claimReward(tokenId))
      .to.emit(cats, "RewardClaimed")
      .withArgs(tokenId, player.address, rewardAmount);

    const balance = await fishToken.balanceOf(player.address);
    expect(balance).to.equal(rewardAmount);

    await expect(cats.connect(player).claimReward(tokenId)).to.be.revertedWithCustomError(
      cats,
      "AlreadyClaimed"
    );

    await expect(cats.connect(stranger).claimReward(tokenId)).to.be.revertedWithCustomError(
      cats,
      "NotTokenOwner"
    );
  });
});
