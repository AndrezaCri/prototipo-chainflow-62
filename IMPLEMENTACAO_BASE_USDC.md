# Implementação de Pagamentos On-Chain com Base Pay (USDC) no ChainFlow

## Resumo Executivo

Este documento detalha a implementação bem-sucedida de pagamentos on-chain usando USDC na rede Base para o projeto ChainFlow. A implementação inclui a integração de carteiras Web3, desenvolvimento de contratos inteligentes e interface de usuário para pagamentos descentralizados.

## Objetivos Alcançados

✅ **Configuração do ambiente de desenvolvimento**
- Instalação e configuração do Hardhat para desenvolvimento de contratos inteligentes
- Integração do Wagmi e RainbowKit para conectividade de carteiras
- Configuração do projeto ID do WalletConnect

✅ **Desenvolvimento do contrato inteligente**
- Criação do contrato `PaymentReceiver.sol` para receber pagamentos USDC
- Compilação e implantação local do contrato para testes
- Configuração para redes Base Sepolia e Base Mainnet

✅ **Integração da interface de usuário**
- Adição do botão "Connect Wallet" no header
- Implementação da lógica de pagamento USDC no carrinho de compras
- Conversão automática de BRL para USDC

## Arquitetura da Solução

### Componentes Principais

1. **Contrato Inteligente PaymentReceiver**
   - Localização: `/contracts/PaymentReceiver.sol`
   - Função: Receber e gerenciar pagamentos USDC
   - Endereço implantado (local): `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

2. **Interface de Carteira**
   - Componente: `Header.tsx` com RainbowKit ConnectButton
   - Funcionalidade: Conexão e desconexão de carteiras Web3

3. **Sistema de Pagamento**
   - Componente: `CartDrawer.tsx`
   - Funcionalidade: Processamento de pagamentos USDC
   - Taxa de câmbio: 1 USDC = 5 BRL (configurável)

### Fluxo de Pagamento

1. **Conexão da Carteira**
   - Usuário clica em "Connect Wallet" no header
   - RainbowKit apresenta opções de carteiras disponíveis
   - Usuário conecta sua carteira preferida

2. **Seleção de Produtos**
   - Usuário navega pelo marketplace B2B
   - Adiciona produtos ao carrinho
   - Visualiza total em BRL e USDC

3. **Processamento do Pagamento**
   - Usuário clica em "Pagar com USDC (Base)"
   - Sistema calcula valor em USDC baseado na taxa de câmbio
   - Transação é enviada para o contrato PaymentReceiver

## Configurações Técnicas

### Project ID do WalletConnect
```
Project ID: 81f33bfdc2779abb1b9295edb1c591e3
```

### Endereços de Contratos

**USDC na Base Sepolia (Testnet):**
```
0x036Fc71447876003275791993739773875077255
```

**PaymentReceiver (Local/Testnet):**
```
0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### Configuração de Redes

**Base Sepolia:**
- RPC URL: `https://sepolia.base.org`
- Chain ID: 84532
- Explorer: `https://sepolia.basescan.org`

**Base Mainnet:**
- RPC URL: `https://mainnet.base.org`
- Chain ID: 8453
- Explorer: `https://basescan.org`




## Implementação Técnica

### 1. Contrato Inteligente PaymentReceiver

O contrato foi desenvolvido usando Solidity 0.8.20 e OpenZeppelin para segurança:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PaymentReceiver is Ownable {
    event UsdcReceived(address indexed from, uint256 amount);
    event UsdcWithdrawn(address indexed to, uint256 amount);

    IERC20 public usdcToken;

    constructor(address _usdcTokenAddress) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcTokenAddress);
    }

    function receiveUsdc(uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than zero");
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "USDC transfer failed");
        emit UsdcReceived(msg.sender, _amount);
    }

    function withdrawUsdc(uint256 _amount) public onlyOwner {
        require(_amount > 0, "Amount must be greater than zero");
        require(usdcToken.transfer(owner(), _amount), "USDC withdrawal failed");
        emit UsdcWithdrawn(owner(), _amount);
    }

    function withdrawEther() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Ether withdrawal failed");
    }

    receive() external payable {}
    fallback() external payable {}
}
```

### 2. Configuração do Hardhat

Arquivo `hardhat.config.cjs`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      // Configuração padrão para a rede Hardhat local
    },
    baseMainnet: {
      url: "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      baseMainnet: "VZFDUWB3YGQ1YCDKTCU1D6DDSS",
      baseSepolia: "VZFDUWB3YGQ1YCDKTCU1D6DDSS"
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
```

### 3. Script de Implantação

Arquivo `scripts/deploy.cjs`:

```javascript
const hre = require("hardhat");

async function main() {
  const usdcTokenAddress = "0x036Fc71447876003275791993739773875077255"; 
  
  const PaymentReceiver = await hre.ethers.getContractFactory("PaymentReceiver");
  const paymentReceiver = await PaymentReceiver.deploy(usdcTokenAddress);

  console.log("PaymentReceiver implantado em:", paymentReceiver.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### 4. Configuração do Wagmi e RainbowKit

Arquivo `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const config = getDefaultConfig({
  appName: 'ChainFlow',
  projectId: '81f33bfdc2779abb1b9295edb1c591e3',
  chains: [base, baseSepolia],
  ssr: false,
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
```

### 5. Integração no Header

Arquivo `src/components/Header.tsx`:

```typescript
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Adicionado no componente Header:
<ConnectButton />
```

### 6. Lógica de Pagamento no Carrinho

Arquivo `src/components/CartDrawer.tsx` (trecho principal):

```typescript
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { parseUnits } from 'ethers';

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)"
];

// Configuração do pagamento USDC
const paymentReceiverAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const usdcContractAddress = '0x036Fc71447876003275791993739773875077255';
const USDC_EXCHANGE_RATE = 5.0; // 1 USDC = 5 BRL

const { config: usdcTransferConfig } = usePrepareContractWrite({
  address: usdcContractAddress,
  abi: ERC20_ABI,
  functionName: 'transfer',
  args: [paymentReceiverAddress, parseUnits(totalValueUSDC.toFixed(6), 6)],
  enabled: isConnected && totalValueUSDC > 0,
});

const { write: transferUSDC } = useContractWrite(usdcTransferConfig);

const handleCheckoutWithUSDC = () => {
  if (!isConnected) {
    alert('Por favor, conecte sua carteira para pagar com USDC.');
    return;
  }
  transferUSDC?.();
};
```



## Instruções de Uso e Teste

Para testar a implementação localmente, siga os passos abaixo:

1.  **Inicie o nó local do Hardhat:**
    Abra um terminal na raiz do projeto (`/home/ubuntu/prototipo-chainflow-62`) e execute:
    ```bash
    npx hardhat node
    ```
    Este comando iniciará uma blockchain local e exibirá uma lista de contas de teste com 10000 ETH cada. Mantenha este terminal aberto.

2.  **Implante o contrato `PaymentReceiver` na rede local:**
    Abra **outro** terminal na raiz do projeto e execute:
    ```bash
    npx hardhat run scripts/deploy.cjs --network localhost
    ```
    Você verá o endereço do contrato implantado no console (ex: `PaymentReceiver implantado em: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`). Este endereço já está configurado no `CartDrawer.tsx`.

3.  **Inicie o servidor de desenvolvimento do ChainFlow:**
    Abra um **terceiro** terminal na raiz do projeto e execute:
    ```bash
    npm run dev
    ```
    O projeto estará acessível em `http://localhost:8080/` (ou o endereço fornecido pelo Vite).

4.  **Conecte sua carteira (MetaMask ou similar) à rede local do Hardhat:**
    - Abra sua carteira (ex: MetaMask).
    - Clique no seletor de rede e selecione "Adicionar rede".
    - Selecione "Adicionar uma rede manualmente" e insira os seguintes dados:
        - **Nome da Rede:** Hardhat Local
        - **Nova URL RPC:** `http://localhost:8545`
        - **ID da Cadeia:** `31337`
        - **Símbolo da Moeda:** `ETH`
        - **URL do Explorador de Blocos:** (Opcional, deixe em branco)
    - Importe uma das chaves privadas fornecidas pelo `npx hardhat node` (ex: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`) para sua carteira. Isso lhe dará ETH de teste para transações.

5.  **Teste o fluxo de pagamento:**
    - No navegador, acesse o ChainFlow (`http://localhost:8080/`).
    - Clique em "Connect Wallet" no canto superior direito e conecte sua carteira à rede "Hardhat Local".
    - Adicione itens ao carrinho.
    - Clique em "Pagar com USDC (Base)".
    - A carteira solicitará a aprovação da transação. Confirme.

## Próximos Passos para Implantação em Rede Real

Para implantar o contrato e o aplicativo em uma rede pública (Base Sepolia ou Base Mainnet), você precisará:

1.  **Obter ETH real (para Mainnet) ou de teste (para Sepolia):**
    - Para Base Sepolia: Use um faucet como [Base Sepolia Faucet](https://www.base.org/faucet).
    - Para Base Mainnet: Adquira ETH em uma exchange e envie para o endereço da sua carteira.

2.  **Configurar `PRIVATE_KEY` e `BASESCAN_API_KEY`:**
    - Crie um arquivo `.env` na raiz do projeto (se ainda não o fez) e adicione:
        ```
        PRIVATE_KEY=SUA_CHAVE_PRIVADA_AQUI
        BASESCAN_API_KEY=SUA_CHAVE_DE_API_DO_BASESCAN_AQUI
        ```
    - **NUNCA comite este arquivo para o controle de versão (Git)!**

3.  **Implantar o contrato na rede desejada:**
    ```bash
    npx hardhat run scripts/deploy.cjs --network baseSepolia # ou baseMainnet
    ```
    Anote o endereço do contrato implantado.

4.  **Verificar o contrato no Basescan (opcional, mas recomendado):**
    Após a implantação, você pode verificar o código-fonte do contrato no Basescan para torná-lo público e legível. Use o comando:
    ```bash
    npx hardhat verify --network baseSepolia SEU_ENDERECO_DO_CONTRATO "0x036Fc71447876003275791993739773875077255"
    ```
    Substitua `SEU_ENDERECO_DO_CONTRATO` pelo endereço real do contrato implantado e `0x036Fc71447876003275791993739773875077255` pelo endereço do USDC na rede que você está usando.

5.  **Atualizar o `CartDrawer.tsx` com o endereço do contrato real:**
    No arquivo `src/components/CartDrawer.tsx`, substitua o `paymentReceiverAddress` pelo endereço do contrato `PaymentReceiver` implantado na rede real.

6.  **Construir o aplicativo para produção:**
    ```bash
    npm run build
    ```
    Isso criará uma pasta `dist` com os arquivos estáticos do seu site.

7.  **Hospedar o aplicativo:**
    Você pode hospedar a pasta `dist` em serviços como Netlify, Vercel, GitHub Pages, ou um servidor web tradicional. Para o Lovable, você precisaria seguir as instruções específicas deles para upload de arquivos estáticos.

