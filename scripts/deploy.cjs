const hre = require("hardhat");

async function main() {
  // Endereço do contrato USDC na rede Base Sepolia (exemplo, pode variar)
  // Este é o endereço do USDC na Base Sepolia para fins de teste.
  // Em produção, use o endereço oficial do USDC na rede Base Mainnet.
  const usdcTokenAddress = "0x036Fc71447876003275791993739773875077255"; 
  
  const PaymentReceiver = await hre.ethers.getContractFactory("PaymentReceiver");
  const paymentReceiver = await PaymentReceiver.deploy(usdcTokenAddress);

  console.log("PaymentReceiver implantado em:", paymentReceiver.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


