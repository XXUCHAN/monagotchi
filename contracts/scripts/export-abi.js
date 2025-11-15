const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const artifactsDir = path.join(rootDir, 'artifacts', 'src');
const frontendAbiDir = path.join(rootDir, '..', 'frontend', 'src', 'abi');

const targets = [
    {
        name: 'VolatilityCats',
        artifact: ['VolatilityCats.sol', 'VolatilityCats.json'],
    },
    {
        name: 'ChurrToken',
        artifact: ['ChurrToken.sol', 'ChurrToken.json'],
    },
];

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function loadArtifact(parts) {
    const artifactPath = path.join(artifactsDir, ...parts);
    if (!fs.existsSync(artifactPath)) {
        throw new Error(`Artifact not found: ${artifactPath}. 먼저 hardhat compile을 실행하세요.`);
    }
    const raw = fs.readFileSync(artifactPath, 'utf8');
    return JSON.parse(raw);
}

function exportAbi() {
    ensureDir(frontendAbiDir);

    targets.forEach(({ name, artifact }) => {
        const artifactJson = loadArtifact(artifact);
        const outputPath = path.join(frontendAbiDir, `${name}.json`);

        const payload = {
            contractName: name,
            abi: artifactJson.abi,
        };

        fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
        console.log(`[export-abi] ${name} ABI -> ${path.relative(process.cwd(), outputPath)}`);
    });
}

exportAbi();
