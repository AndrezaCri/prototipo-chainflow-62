require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import("hardhat/config").HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      // Configuração padrão para a rede Hardhat local
    },
    baseMainnet: {
      url: "https://mainnet.base.org", // URL da RPC da Base Mainnet
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [] // Sua chave privada aqui
    },
    baseSepolia: {
      url: "https://sepolia.base.org", // URL da RPC da Base Sepolia
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [] // Sua chave privada aqui
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  etherscan: {
    apiKey: {
      baseMainnet: "VZFDUWB3YGQ1YCDKTCU1D6DDSS", // Sua chave de API do Basescan aqui
      baseSepolia: "VZFDUWB3YGQ1YCDKTCU1D6DDSS" // Sua chave de API do Basescan aqui
    },
    customChains: [
      {
        network: "baseMainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  }
};


