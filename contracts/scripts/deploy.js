const { ethers } = require("hardhat");

async function main() {
  console.log("Volatility Cats 컨트랙트 배포 시작...");

  // 계정 확인
  const [deployer] = await ethers.getSigners();
  console.log("배포 계정:", deployer.address);
  console.log("계정 잔액:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // ChurrToken 배포
  console.log("ChurrToken 배포 중...");
  const ChurrToken = await ethers.getContractFactory("ChurrToken");
  const fishToken = await ChurrToken.deploy();
  await fishToken.waitForDeployment();
  const fishTokenAddress = await fishToken.getAddress();
  console.log("ChurrToken 배포됨:", fishTokenAddress);

  // VolatilityCats 배포 (epochWindow = 1시간)
  const epochWindow = 3600; // 1시간
  console.log("VolatilityCats 배포 중...");
  const VolatilityCats = await ethers.getContractFactory("VolatilityCats");
  const volatilityCats = await VolatilityCats.deploy(fishTokenAddress, epochWindow);
  await volatilityCats.waitForDeployment();
  const volatilityCatsAddress = await volatilityCats.getAddress();
  console.log("VolatilityCats 배포됨:", volatilityCatsAddress);

  // ChurrToken 소유권 이전
  console.log("ChurrToken 소유권 이전 중...");
  await fishToken.transferOwnership(volatilityCatsAddress);
  console.log("ChurrToken 소유권 이전 완료");

  // 가격 피드 설정 (테스트넷용 더미 주소)
  console.log("가격 피드 설정 중...");
  // BTC/USD: 실제 Monad Testnet 주소로 교체 필요
  const BTC_FEED = "0x0000000000000000000000000000000000000000"; // TODO: 실제 주소로 변경
  const ETH_FEED = "0x0000000000000000000000000000000000000000"; // TODO: 실제 주소로 변경

  await volatilityCats.setClanFeed(0, BTC_FEED, true); // BTC
  await volatilityCats.setClanFeed(1, ETH_FEED, true); // ETH
  console.log("가격 피드 설정 완료");

  console.log("\n배포 완료!");
  console.log("====================");
  console.log("ChurrToken 주소:", fishTokenAddress);
  console.log("VolatilityCats 주소:", volatilityCatsAddress);
  console.log("BTC Feed 주소:", BTC_FEED);
  console.log("ETH Feed 주소:", ETH_FEED);
  console.log("====================");

  // 검증 (선택사항)
  console.log("\n컨트랙트 검증 중...");
  try {
    await hre.run("verify:verify", {
      address: fishTokenAddress,
      contract: "contracts/ChurrToken.sol:ChurrToken"
    });
    console.log("ChurrToken 검증 완료");
  } catch (error) {
    console.log("ChurrToken 검증 실패:", error.message);
  }

  try {
    await hre.run("verify:verify", {
      address: volatilityCatsAddress,
      constructorArguments: [fishTokenAddress, epochWindow],
      contract: "contracts/VolatilityCats.sol:VolatilityCats"
    });
    console.log("VolatilityCats 검증 완료");
  } catch (error) {
    console.log("VolatilityCats 검증 실패:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
