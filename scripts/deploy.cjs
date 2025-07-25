const hre = require("hardhat");

async function main() {
  // Endereço do token USDC na Base Sepolia (testnet)
  // Para mainnet, usar: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
  const usdcTokenAddress = "0x036Fc71447876003275791993739773875077255"; 
  
  console.log("Implantando PaymentReceiver...");
  console.log("Endereço USDC:", usdcTokenAddress);
  
  const PaymentReceiver = await hre.ethers.getContractFactory("PaymentReceiver");
  const paymentReceiver = await PaymentReceiver.deploy(usdcTokenAddress);

  await paymentReceiver.waitForDeployment();

  console.log("PaymentReceiver implantado em:", await paymentReceiver.getAddress());
  console.log("Owner do contrato:", await paymentReceiver.owner());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});