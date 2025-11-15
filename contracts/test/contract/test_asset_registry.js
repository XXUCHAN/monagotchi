const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('AssetRegistry', function () {
    let assetRegistry;
    let owner, addr1, addr2;

    const BTC_USD_ID = ethers.keccak256(ethers.toUtf8Bytes('BTC_USD'));
    const ETH_USD_ID = ethers.keccak256(ethers.toUtf8Bytes('ETH_USD'));

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const AssetRegistry = await ethers.getContractFactory('AssetRegistry');
        assetRegistry = await AssetRegistry.deploy();
        await assetRegistry.waitForDeployment();
    });

    describe('Deployment', function () {
        it('Should set the right owner', async function () {
            expect(await assetRegistry.owner()).to.equal(owner.address);
        });
    });

    describe('Asset Management', function () {
        it('Should add a new asset', async function () {
            const feedAddress = '0x1234567890123456789012345678901234567890';
            const decimals = 8;
            const volatilityTier = 2; // High volatility
            const maxExposureBps = 5000; // 50%

            await expect(assetRegistry.addAsset(BTC_USD_ID, feedAddress, decimals, volatilityTier, maxExposureBps))
                .to.emit(assetRegistry, 'AssetAdded')
                .withArgs(BTC_USD_ID, feedAddress, decimals, volatilityTier);

            const config = await assetRegistry.getAsset(BTC_USD_ID);
            expect(config.feedAddress).to.equal(feedAddress);
            expect(config.decimals).to.equal(decimals);
            expect(config.volatilityTier).to.equal(volatilityTier);
            expect(config.maxExposureBps).to.equal(maxExposureBps);
            expect(config.enabled).to.equal(true);
        });

        it('Should revert when adding duplicate asset', async function () {
            const feedAddress = '0x1234567890123456789012345678901234567890';

            await assetRegistry.addAsset(BTC_USD_ID, feedAddress, 8, 2, 5000);

            await expect(assetRegistry.addAsset(BTC_USD_ID, feedAddress, 8, 2, 5000)).to.be.revertedWithCustomError(
                assetRegistry,
                'AssetAlreadyExists'
            );
        });

        it('Should update an existing asset', async function () {
            const oldFeedAddress = '0x1234567890123456789012345678901234567890';
            const newFeedAddress = '0x0987654321098765432109876543210987654321';

            // Add asset
            await assetRegistry.addAsset(BTC_USD_ID, oldFeedAddress, 8, 2, 5000);

            // Update asset
            await expect(
                assetRegistry.updateAsset(
                    BTC_USD_ID,
                    newFeedAddress,
                    8,
                    1, // Changed volatility tier
                    3000 // Changed max exposure
                )
            )
                .to.emit(assetRegistry, 'AssetUpdated')
                .withArgs(BTC_USD_ID, oldFeedAddress, newFeedAddress, 1);

            const config = await assetRegistry.getAsset(BTC_USD_ID);
            expect(config.feedAddress).to.equal(newFeedAddress);
            expect(config.volatilityTier).to.equal(1);
            expect(config.maxExposureBps).to.equal(3000);
        });

        it('Should revert when updating non-existent asset', async function () {
            await expect(
                assetRegistry.updateAsset(BTC_USD_ID, '0x1234567890123456789012345678901234567890', 8, 2, 5000)
            ).to.be.revertedWithCustomError(assetRegistry, 'AssetNotFound');
        });

        it('Should enable/disable assets', async function () {
            const feedAddress = '0x1234567890123456789012345678901234567890';

            // Add asset
            await assetRegistry.addAsset(BTC_USD_ID, feedAddress, 8, 2, 5000);

            // Disable asset
            await expect(assetRegistry.setAssetEnabled(BTC_USD_ID, false))
                .to.emit(assetRegistry, 'AssetEnabled')
                .withArgs(BTC_USD_ID, false);

            let config = await assetRegistry.getAsset(BTC_USD_ID);
            expect(config.enabled).to.equal(false);

            // Enable asset
            await expect(assetRegistry.setAssetEnabled(BTC_USD_ID, true))
                .to.emit(assetRegistry, 'AssetEnabled')
                .withArgs(BTC_USD_ID, true);

            config = await assetRegistry.getAsset(BTC_USD_ID);
            expect(config.enabled).to.equal(true);
        });

        it('Should revert when setting status for non-existent asset', async function () {
            await expect(assetRegistry.setAssetEnabled(BTC_USD_ID, false)).to.be.revertedWithCustomError(
                assetRegistry,
                'AssetNotFound'
            );
        });

        it('Should return all asset IDs', async function () {
            await assetRegistry.addAsset(BTC_USD_ID, '0x1234567890123456789012345678901234567890', 8, 2, 5000);
            await assetRegistry.addAsset(ETH_USD_ID, '0x0987654321098765432109876543210987654321', 8, 2, 6000);

            const assetIds = await assetRegistry.getAllAssetIds();
            expect(assetIds).to.have.lengthOf(2);
            expect(assetIds).to.include(BTC_USD_ID);
            expect(assetIds).to.include(ETH_USD_ID);
        });

        it('Should revert when getting config for non-existent asset', async function () {
            await expect(assetRegistry.getAsset(BTC_USD_ID)).to.be.revertedWithCustomError(
                assetRegistry,
                'AssetNotFound'
            );
        });
    });

    describe('Access Control', function () {
        it('Should only allow owner to add assets', async function () {
            await expect(
                assetRegistry
                    .connect(addr1)
                    .addAsset(BTC_USD_ID, '0x1234567890123456789012345678901234567890', 8, 2, 5000)
            )
                .to.be.revertedWithCustomError(assetRegistry, 'OwnableUnauthorizedAccount')
                .withArgs(addr1.address);
        });

        it('Should only allow owner to update assets', async function () {
            await expect(
                assetRegistry
                    .connect(addr1)
                    .updateAsset(BTC_USD_ID, '0x1234567890123456789012345678901234567890', 8, 2, 5000)
            )
                .to.be.revertedWithCustomError(assetRegistry, 'OwnableUnauthorizedAccount')
                .withArgs(addr1.address);
        });

        it('Should only allow owner to set asset status', async function () {
            await expect(assetRegistry.connect(addr1).setAssetEnabled(BTC_USD_ID, false))
                .to.be.revertedWithCustomError(assetRegistry, 'OwnableUnauthorizedAccount')
                .withArgs(addr1.address);
        });
    });
});
