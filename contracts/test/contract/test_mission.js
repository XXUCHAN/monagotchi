const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const { deployCatsFixture, mintCat, BTC_PRICE } = require("./helpers");

const DAILY = 12 * 60 * 60;
const WEEKLY = 7 * 24 * 60 * 60;
const MONTHLY = 30 * 24 * 60 * 60;

describe("VolatilityCats - runMission", () => {
  async function setup() {
    return deployCatsFixture();
  }

  it("미션 수행 시 파워가 증가하고 이벤트가 발생한다", async () => {
    const { cats, player } = await loadFixture(setup);
    const tokenId = await mintCat(cats, player);

    const tx = await cats.connect(player).runMission(tokenId, 0);
    await expect(tx)
      .to.emit(cats, "MissionCompleted")
      .withArgs(tokenId, 0, anyValue);

    const [, , gameState] = await cats.getCat(tokenId);
    expect(gameState.power).to.be.greaterThan(0); // power 증가 확인
  });

  it("소유자가 아니면 미션을 실행할 수 없다", async () => {
    const { cats, player, stranger } = await loadFixture(setup);
    const tokenId = await mintCat(cats, player);

    await expect(cats.connect(stranger).runMission(tokenId, 0)).to.be.revertedWithCustomError(
      cats,
      "NotTokenOwner"
    );
  });

  it("쿨다운 중 동일 타입 미션을 실행하면 revert된다", async () => {
    const { cats, player } = await loadFixture(setup);
    const tokenId = await mintCat(cats, player);

    await cats.connect(player).runMission(tokenId, 0);

    await expect(cats.connect(player).runMission(tokenId, 0)).to.be.revertedWithCustomError(
      cats,
      "MissionCooldown"
    );

    await time.increase(DAILY + 1);
    await expect(cats.connect(player).runMission(tokenId, 0)).to.not.be.reverted;
  });

  it("미션 타입이 잘못되면 revert된다", async () => {
    const { cats, player } = await loadFixture(setup);
    const tokenId = await mintCat(cats, player);

    await expect(cats.connect(player).runMission(tokenId, 5)).to.be.revertedWithCustomError(
      cats,
      "InvalidMissionType"
    );
  });

  it("Weekly 미션 쿨다운이 제대로 적용된다", async () => {
    const { cats, player, btcFeed } = await loadFixture(setup);
    const tokenId = await mintCat(cats, player);

    // Weekly 미션 실행
    await cats.connect(player).runMission(tokenId, 1);

    // 바로 재실행 시도 - 쿨다운 에러
    await expect(cats.connect(player).runMission(tokenId, 1)).to.be.revertedWithCustomError(
      cats,
      "MissionCooldown"
    );

    // 시간 경과 후 재실행 - 성공
    await time.increase(WEEKLY + 1);
    await btcFeed.updateAnswer(BTC_PRICE);
    await expect(cats.connect(player).runMission(tokenId, 1)).to.not.be.reverted;
  });

  it("Monthly 미션 쿨다운이 제대로 적용된다", async () => {
    const { cats, player, btcFeed } = await loadFixture(setup);
    const tokenId = await mintCat(cats, player);

    // Monthly 미션 실행
    await cats.connect(player).runMission(tokenId, 2);

    // 바로 재실행 시도 - 쿨다운 에러
    await expect(cats.connect(player).runMission(tokenId, 2)).to.be.revertedWithCustomError(
      cats,
      "MissionCooldown"
    );

    // 시간 경과 후 재실행 - 성공
    await time.increase(MONTHLY + 1);
    await btcFeed.updateAnswer(BTC_PRICE);
    await expect(cats.connect(player).runMission(tokenId, 2)).to.not.be.reverted;
  });
});
