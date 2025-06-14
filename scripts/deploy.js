const { ethers } = require("hardhat");

async function main() {
  const Certification = await ethers.getContractFactory("Certification");
  const cert = await Certification.deploy();
  const contractAddress = await cert.getAddress();
  console.log(`CertificateManager deployed to: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
