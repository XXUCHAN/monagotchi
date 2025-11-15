const { ethers } = require("hardhat");

/**
 * Development용 임시 계정 생성 스크립트
 * Monad testnet 배포에 사용할 private key를 생성합니다.
 */
async function main() {
    console.log("🔑 Monad Testnet 개발용 계정 생성 중...");

    // 새로운 지갑 생성
    const wallet = ethers.Wallet.createRandom();

    console.log("\n📋 생성된 계정 정보:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`주소: ${wallet.address}`);
    console.log(`프라이빗 키: ${wallet.privateKey}`);
    console.log(`퍼블릭 키: ${wallet.publicKey}`);
    console.log(`Mnemonic: ${wallet.mnemonic.phrase}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("\n⚠️  보안 주의사항:");
    console.log("- 이 키는 개발/테스트 용도로만 사용하세요");
    console.log("- 실제 자금이 있는 계정에는 절대 사용하지 마세요");
    console.log("- 프라이빗 키를 안전한 곳에 보관하세요");
    console.log("- 사용 후에는 .env 파일에서 제거하세요");

    console.log("\n💡 다음 단계:");
    console.log("1. 생성된 주소를 사용자에게 전달");
    console.log("2. 사용자가 해당 주소로 MONAD와 LINK faucet 실행");
    console.log("3. 잔액 확인 후 배포 진행");

    // .env.example에 추가할 내용 표시
    console.log("\n📝 .env 파일에 추가할 내용:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`MONAD_TESTNET_PRIVATE_KEY=${wallet.privateKey}`);
    console.log(`MONAD_TESTNET_ADDRESS=${wallet.address}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase
    };
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ 계정 생성 실패:", error);
            process.exit(1);
        });
}

module.exports = { main };
