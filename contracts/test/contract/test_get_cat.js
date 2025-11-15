const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const { deployCatsFixture, mintCat } = require("./helpers");

describe("VolatilityCats - 조회 뷰 함수", () => {
  async function setup() {
    return deployCatsFixture();
  }

  it("getCat이 전체 상태를 반환한다", async () => {
    const { cats, player } = await loadFixture(setup);
    const tokenId = await mintCat(cats, player, 1);

    const cat = await cats.getCat(tokenId);
    expect(cat[0]).to.equal(tokenId); // tokenId
    expect(await cats.ownerOf(tokenId)).to.equal(player.address); // owner
    expect(cat[1]).to.equal(1); // clan
    expect(cat[2]).to.equal(0); // power
  });

  it("Oracle Imprint와 Game State를 개별로 조회할 수 있다", async () => {
    const { cats, player } = await loadFixture(setup);
    const tokenId = await mintCat(cats, player, 0);

    const imprint = await cats.getOracleImprint(tokenId);
    const state = await cats.getGameState(tokenId);

    expect(imprint.clan).to.equal(0);
    expect(state.power).to.equal(0);
    expect(state.rewarded).to.equal(false);
  });
});
