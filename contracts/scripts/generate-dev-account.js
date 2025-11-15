const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔑 Generating development account for Monad testnet...");

  // 임의의 private key 생성
  const wallet = ethers.Wallet.createRandom();

  const accountInfo = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase,
    network: "Monad Testnet",
    chainId: 10143,
    rpcUrl: "https://testnet-rpc.monad.xyz/",
    note: "This account is for development/testing only. Please fund with MON and LINK tokens.",
    generatedAt: new Date().toISOString()
  };

  // .env.example에 추가할 내용
  const envExampleContent = `
# Monad Testnet Development Account (Generated)
TESTNET_DEPLOYER_ADDRESS=${accountInfo.address}
TESTNET_DEPLOYER_PRIVATE_KEY=${accountInfo.privateKey}
TESTNET_RPC_URL=${accountInfo.rpcUrl}
TESTNET_CHAIN_ID=${accountInfo.chainId}
`;

  // .env 파일에 실제 키 저장 (주의: 실제 사용 시 .env는 .gitignore에 추가되어야 함)
  const envContent = `
# Monad Testnet Development Account
TESTNET_DEPLOYER_ADDRESS=${accountInfo.address}
TESTNET_DEPLOYER_PRIVATE_KEY=${accountInfo.privateKey}
TESTNET_RPC_URL=${accountInfo.rpcUrl}
TESTNET_CHAIN_ID=${accountInfo.chainId}
`;

  console.log("✅ Account generated successfully!");
  console.log("📋 Account Details:");
  console.log(`   Address: ${accountInfo.address}`);
  console.log(`   Private Key: ${accountInfo.privateKey}`);
  console.log(`   Network: ${accountInfo.network}`);
  console.log(`   RPC URL: ${accountInfo.rpcUrl}`);
  console.log(`   Chain ID: ${accountInfo.chainId}`);

  console.log("\n⚠️  IMPORTANT:");
  console.log("1. Please fund this address with MON tokens (at least 0.2 MON for gas)");
  console.log("2. Please fund this address with LINK tokens (at least 2 LINK for CCIP fees)");
  console.log("3. Use Monad faucet: https://faucet.monad.xyz/");
  console.log("4. Use Chainlink faucet for LINK tokens");

  // .env.example 파일이 있으면 업데이트
  const envExamplePath = path.join(__dirname, "../.env.example");
  if (fs.existsSync(envExamplePath)) {
    const existingContent = fs.readFileSync(envExamplePath, "utf8");
    if (!existingContent.includes("TESTNET_DEPLOYER_ADDRESS")) {
      fs.appendFileSync(envExamplePath, envExampleContent);
      console.log("\n📝 Updated .env.example with account details");
    }
  } else {
    fs.writeFileSync(envExamplePath, envExampleContent.trim());
    console.log("\n📝 Created .env.example with account details");
  }

  // 실제 .env 파일 생성 (주의: 실제 운영에서는 안전하게 관리해야 함)
  const envPath = path.join(__dirname, "../.env");
  fs.writeFileSync(envPath, envContent.trim());
  console.log("📝 Created .env with account details (⚠️  Keep this file secure!)");

  // JSON 형식으로도 저장
  const accountJsonPath = path.join(__dirname, "../dev-account.json");
  fs.writeFileSync(accountJsonPath, JSON.stringify(accountInfo, null, 2));
  console.log("📝 Saved account details to dev-account.json");

  console.log("\n🚀 Next steps:");
  console.log("1. Fund the address with MON and LINK tokens");
  console.log("2. Run: npx hardhat run scripts/deploy-ccip.ts --network monadTestnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
