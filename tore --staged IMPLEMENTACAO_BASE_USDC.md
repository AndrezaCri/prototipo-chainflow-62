[1mdiff --git a/IMPLEMENTACAO_BASE_USDC.md b/IMPLEMENTACAO_BASE_USDC.md[m
[1mdeleted file mode 100644[m
[1mindex 103cd25..0000000[m
[1m--- a/IMPLEMENTACAO_BASE_USDC.md[m
[1m+++ /dev/null[m
[36m@@ -1,380 +0,0 @@[m
[31m-# Implementação de Pagamentos On-Chain com Base Pay (USDC) no ChainFlow[m
[31m-[m
[31m-## Resumo Executivo[m
[31m-[m
[31m-Este documento detalha a implementação bem-sucedida de pagamentos on-chain usando USDC na rede Base para o projeto ChainFlow. A implementação inclui a integração de carteiras Web3, desenvolvimento de contratos inteligentes e interface de usuário para pagamentos descentralizados.[m
[31m-[m
[31m-## Objetivos Alcançados[m
[31m-[m
[31m-✅ **Configuração do ambiente de desenvolvimento**[m
[31m-- Instalação e configuração do Hardhat para desenvolvimento de contratos inteligentes[m
[31m-- Integração do Wagmi e RainbowKit para conectividade de carteiras[m
[31m-- Configuração do projeto ID do WalletConnect[m
[31m-[m
[31m-✅ **Desenvolvimento do contrato inteligente**[m
[31m-- Criação do contrato `PaymentReceiver.sol` para receber pagamentos USDC[m
[31m-- Compilação e implantação local do contrato para testes[m
[31m-- Configuração para redes Base Sepolia e Base Mainnet[m
[31m-[m
[31m-✅ **Integração da interface de usuário**[m
[31m-- Adição do botão "Connect Wallet" no header[m
[31m-- Implementação da lógica de pagamento USDC no carrinho de compras[m
[31m-- Conversão automática de BRL para USDC[m
[31m-[m
[31m-## Arquitetura da Solução[m
[31m-[m
[31m-### Componentes Principais[m
[31m-[m
[31m-1. **Contrato Inteligente PaymentReceiver**[m
[31m-   - Localização: `/contracts/PaymentReceiver.sol`[m
[31m-   - Função: Receber e gerenciar pagamentos USDC[m
[31m-   - Endereço implantado (local): `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`[m
[31m-[m
[31m-2. **Interface de Carteira**[m
[31m-   - Componente: `Header.tsx` com RainbowKit ConnectButton[m
[31m-   - Funcionalidade: Conexão e desconexão de carteiras Web3[m
[31m-[m
[31m-3. **Sistema de Pagamento**[m
[31m-   - Componente: `CartDrawer.tsx`[m
[31m-   - Funcionalidade: Processamento de pagamentos USDC[m
[31m-   - Taxa de câmbio: 1 USDC = 5 BRL (configurável)[m
[31m-[m
[31m-### Fluxo de Pagamento[m
[31m-[m
[31m-1. **Conexão da Carteira**[m
[31m-   - Usuário clica em "Connect Wallet" no header[m
[31m-   - RainbowKit apresenta opções de carteiras disponíveis[m
[31m-   - Usuário conecta sua carteira preferida[m
[31m-[m
[31m-2. **Seleção de Produtos**[m
[31m-   - Usuário navega pelo marketplace B2B[m
[31m-   - Adiciona produtos ao carrinho[m
[31m-   - Visualiza total em BRL e USDC[m
[31m-[m
[31m-3. **Processamento do Pagamento**[m
[31m-   - Usuário clica em "Pagar com USDC (Base)"[m
[31m-   - Sistema calcula valor em USDC baseado na taxa de câmbio[m
[31m-   - Transação é enviada para o contrato PaymentReceiver[m
[31m-[m
[31m-## Configurações Técnicas[m
[31m-[m
[31m-### Project ID do WalletConnect[m
[31m-```[m
[31m-Project ID: 81f33bfdc2779abb1b9295edb1c591e3[m
[31m-```[m
[31m-[m
[31m-### Endereços de Contratos[m
[31m-[m
[31m-**USDC na Base Sepolia (Testnet):**[m
[31m-```[m
[31m-0x036Fc71447876003275791993739773875077255[m
[31m-```[m
[31m-[m
[31m-**PaymentReceiver (Local/Testnet):**[m
[31m-```[m
[31m-0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512[m
[31m-```[m
[31m-[m
[31m-### Configuração de Redes[m
[31m-[m
[31m-**Base Sepolia:**[m
[31m-- RPC URL: `https://sepolia.base.org`[m
[31m-- Chain ID: 84532[m
[31m-- Explorer: `https://sepolia.basescan.org`[m
[31m-[m
[31m-**Base Mainnet:**[m
[31m-- RPC URL: `https://mainnet.base.org`[m
[31m-- Chain ID: 8453[m
[31m-- Explorer: `https://basescan.org`[m
[31m-[m
[31m-[m
[31m-[m
[31m-[m
[31m-## Implementação Técnica[m
[31m-[m
[31m-### 1. Contrato Inteligente PaymentReceiver[m
[31m-[m
[31m-O contrato foi desenvolvido usando Solidity 0.8.20 e OpenZeppelin para segurança:[m
[31m-[m
[31m-```solidity[m
[31m-// SPDX-License-Identifier: MIT[m
[31m-pragma solidity ^0.8.20;[m
[31m-[m
[31m-import "@openzeppelin/contracts/token/ERC20/IERC20.sol";[m
[31m-import "@openzeppelin/contracts/access/Ownable.sol";[m
[31m-[m
[31m-contract PaymentReceiver is Ownable {[m
[31m-    event UsdcReceived(address indexed from, uint256 amount);[m
[31m-    event UsdcWithdrawn(address indexed to, uint256 amount);[m
[31m-[m
[31m-    IERC20 public usdcToken;[m
[31m-[m
[31m-    constructor(address _usdcTokenAddress) Ownable(msg.sender) {[m
[31m-        usdcToken = IERC20(_usdcTokenAddress);[m
[31m-    }[m
[31m-[m
[31m-    function receiveUsdc(uint256 _amount) public {[m
[31m-        require(_amount > 0, "Amount must be greater than zero");[m
[31m-        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "USDC transfer failed");[m
[31m-        emit UsdcReceived(msg.sender, _amount);[m
[31m-    }[m
[31m-[m
[31m-    function withdrawUsdc(uint256 _amount) public onlyOwner {[m
[31m-        require(_amount > 0, "Amount must be greater than zero");[m
[31m-        require(usdcToken.transfer(owner(), _amount), "USDC withdrawal failed");[m
[31m-        emit UsdcWithdrawn(owner(), _amount);[m
[31m-    }[m
[31m-[m
[31m-    function withdrawEther() public onlyOwner {[m
[31m-        (bool success, ) = owner().call{value: address(this).balance}("");[m
[31m-        require(success, "Ether withdrawal failed");[m
[31m-    }[m
[31m-[m
[31m-    receive() external payable {}[m
[31m-    fallback() external payable {}[m
[31m-}[m
[31m-```[m
[31m-[m
[31m-### 2. Configuração do Hardhat[m
[31m-[m
[31m-Arquivo `hardhat.config.cjs`:[m
[31m-[m
[31m-```javascript[m
[31m-require("@nomicfoundation/hardhat-toolbox");[m
[31m-require("dotenv").config();[m
[31m-[m
[31m-module.exports = {[m
[31m-  solidity: "0.8.20",[m
[31m-  networks: {[m
[31m-    hardhat: {[m
[31m-      // Configuração padrão para a rede Hardhat local[m
[31m-    },[m
[31m-    baseMainnet: {[m
[31m-      url: "https://mainnet.base.org",[m
[31m-      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [][m
[31m-    },[m
[31m-    baseSepolia: {[m
[31m-      url: "https://sepolia.base.org",[m
[31m-      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [][m
[31m-    }[m
[31m-  },[m
[31m-  etherscan: {[m
[31m-    apiKey: {[m
[31m-      baseMainnet: "VZFDUWB3YGQ1YCDKTCU1D6DDSS",[m
[31m-      baseSepolia: "VZFDUWB3YGQ1YCDKTCU1D6DDSS"[m
[31m-    },[m
[31m-    customChains: [[m
[31m-      {[m
[31m-        network: "baseMainnet",[m
[31m-        chainId: 8453,[m
[31m-        urls: {[m
[31m-          apiURL: "https://api.basescan.org/api",[m
[31m-          browserURL: "https://basescan.org"[m
[31m-        }[m
[31m-      },[m
[31m-      {[m
[31m-        network: "baseSepolia",[m
[31m-        chainId: 84532,[m
[31m-        urls: {[m
[31m-          apiURL: "https://api-sepolia.basescan.org/api",[m
[31m-          browserURL: "https://sepolia.basescan.org"[m
[31m-        }[m
[31m-      }[m
[31m-    ][m
[31m-  }[m
[31m-};[m
[31m-```[m
[31m-[m
[31m-### 3. Script de Implantação[m
[31m-[m
[31m-Arquivo `scripts/deploy.cjs`:[m
[31m-[m
[31m-```javascript[m
[31m-const hre = require("hardhat");[m
[31m-[m
[31m-async function main() {[m
[31m-  const usdcTokenAddress = "0x036Fc71447876003275791993739773875077255"; [m
[31m-  [m
[31m-  const PaymentReceiver = await hre.ethers.getContractFactory("PaymentReceiver");[m
[31m-  const paymentReceiver = await PaymentReceiver.deploy(usdcTokenAddress);[m
[31m-[m
[31m-  console.log("PaymentReceiver implantado em:", paymentReceiver.target);[m
[31m-}[m
[31m-[m
[31m-main().catch((error) => {[m
[31m-  console.error(error);[m
[31m-  process.exitCode = 1;[m
[31m-});[m
[31m-```[m
[31m-[m
[31m-### 4. Configuração do Wagmi e RainbowKit[m
[31m-[m
[31m-Arquivo `src/main.tsx`:[m
[31m-[m
[31m-```typescript[m
[31m-import React from 'react';[m
[31m-import ReactDOM from 'react-dom/client';[m
[31m-import App from './App.tsx';[m
[31m-import './index.css';[m
[31m-import '@rainbow-me/rainbowkit/styles.css';[m
[31m-[m
[31m-import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';[m
[31m-import { WagmiProvider } from 'wagmi';[m
[31m-import { base, baseSepolia } from 'wagmi/chains';[m
[31m-import { QueryClientProvider, QueryClient } from '@tanstack/react-query';[m
[31m-[m
[31m-const config = getDefaultConfig({[m
[31m-  appName: 'ChainFlow',[m
[31m-  projectId: '81f33bfdc2779abb1b9295edb1c591e3',[m
[31m-  chains: [base, baseSepolia],[m
[31m-  ssr: false,[m
[31m-});[m
[31m-[m
[31m-const queryClient = new QueryClient();[m
[31m-[m
[31m-ReactDOM.createRoot(document.getElementById('root')!).render([m
[31m-  <React.StrictMode>[m
[31m-    <WagmiProvider config={config}>[m
[31m-      <QueryClientProvider client={queryClient}>[m
[31m-        <RainbowKitProvider>[m
[31m-          <App />[m
[31m-        </RainbowKitProvider>[m
[31m-      </QueryClientProvider>[m
[31m-    </WagmiProvider>[m
[31m-  </React.StrictMode>,[m
[31m-);[m
[31m-```[m
[31m-[m
[31m-### 5. Integração no Header[m
[31m-[m
[31m-Arquivo `src/components/Header.tsx`:[m
[31m-[m
[31m-```typescript[m
[31m-import { ConnectButton } from '@rainbow-me/rainbowkit';[m
[31m-[m
[31m-// Adicionado no componente Header:[m
[31m-<ConnectButton />[m
[31m-```[m
[31m-[m
[31m-### 6. Lógica de Pagamento no Carrinho[m
[31m-[m
[31m-Arquivo `src/components/CartDrawer.tsx` (trecho principal):[m
[31m-[m
[31m-```typescript[m
[31m-import { usePrepareContractWrite, useContractWrite } from 'wagmi';[m
[31m-import { parseUnits } from 'ethers';[m
[31m-[m
[31m-const ERC20_ABI = [[m
[31m-  "function transfer(address to, uint256 amount) returns (bool)"[m
[31m-];[m
[31m-[m
[31m-// Configuração do pagamento USDC[m
[31m-const paymentReceiverAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';[m
[31m-const usdcContractAddress = '0x036Fc71447876003275791993739773875077255';[m
[31m-const USDC_EXCHANGE_RATE = 5.0; // 1 USDC = 5 BRL[m
[31m-[m
[31m-const { config: usdcTransferConfig } = usePrepareContractWrite({[m
[31m-  address: usdcContractAddress,[m
[31m-  abi: ERC20_ABI,[m
[31m-  functionName: 'transfer',[m
[31m-  args: [paymentReceiverAddress, parseUnits(totalValueUSDC.toFixed(6), 6)],[m
[31m-  enabled: isConnected && totalValueUSDC > 0,[m
[31m-});[m
[31m-[m
[31m-const { write: transferUSDC } = useContractWrite(usdcTransferConfig);[m
[31m-[m
[31m-const handleCheckoutWithUSDC = () => {[m
[31m-  if (!isConnected) {[m
[31m-    alert('Por favor, conecte sua carteira para pagar com USDC.');[m
[31m-    return;[m
[31m-  }[m
[31m-  transferUSDC?.();[m
[31m-};[m
[31m-```[m
[31m-[m
[31m-[m
[31m-[m
[31m-## Instruções de Uso e Teste[m
[31m-[m
[31m-Para testar a implementação localmente, siga os passos abaixo:[m
[31m-[m
[31m-1.  **Inicie o nó local do Hardhat:**[m
[31m-    Abra um terminal na raiz do projeto (`/home/ubuntu/prototipo-chainflow-62`) e execute:[m
[31m-    ```bash[m
[31m-    npx hardhat node[m
[31m-    ```[m
[31m-    Este comando iniciará uma blockchain local e exibirá uma lista de contas de teste com 10000 ETH cada. Mantenha este terminal aberto.[m
[31m-[m
[31m-2.  **Implante o contrato `PaymentReceiver` na rede local:**[m
[31m-    Abra **outro** terminal na raiz do projeto e execute:[m
[31m-    ```bash[m
[31m-    npx hardhat run scripts/deploy.cjs --network localhost[m
[31m-    ```[m
[31m-    Você verá o endereço do contrato implantado no console (ex: `PaymentReceiver implantado em: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`). Este endereço já está configurado no `CartDrawer.tsx`.[m
[31m-[m
[31m-3.  **Inicie o servidor de desenvolvimento do ChainFlow:**[m
[31m-    Abra um **terceiro** terminal na raiz do projeto e execute:[m
[31m-    ```bash[m
[31m-    npm run dev[m
[31m-    ```[m
[31m-    O projeto estará acessível em `http://localhost:8080/` (ou o endereço fornecido pelo Vite).[m
[31m-[m
[31m-4.  **Conecte sua carteira (MetaMask ou similar) à rede local do Hardhat:**[m
[31m-    - Abra sua carteira (ex: MetaMask).[m
[31m-    - Clique no seletor de rede e selecione "Adicionar rede".[m
[31m-    - Selecione "Adicionar uma rede manualmente" e insira os seguintes dados:[m
[31m-        - **Nome da Rede:** Hardhat Local[m
[31m-        - **Nova URL RPC:** `http://localhost:8545`[m
[31m-        - **ID da Cadeia:** `31337`[m
[31m-        - **Símbolo da Moeda:** `ETH`[m
[31m-        - **URL do Explorador de Blocos:** (Opcional, deixe em branco)[m
[31m-    - Importe uma das chaves privadas fornecidas pelo `npx hardhat node` (ex: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`) para sua carteira. Isso lhe dará ETH de teste para transações.[m
[31m-[m
[31m-5.  **Teste o fluxo de pagamento:**[m
[31m-    - No navegador, acesse o ChainFlow (`http://localhost:8080/`).[m
[31m-    - Clique em "Connect Wallet" no canto superior direito e conecte sua carteira à rede "Hardhat Local".[m
[31m-    - Adicione itens ao carrinho.[m
[31m-    - Clique em "Pagar com USDC (Base)".[m
[31m-    - A carteira solicitará a aprovação da transação. Confirme.[m
[31m-[m
[31m-## Próximos Passos para Implantação em Rede Real[m
[31m-[m
[31m-Para implantar o contrato e o aplicativo em uma rede pública (Base Sepolia ou Base Mainnet), você precisará:[m
[31m-[m
[31m-1.  **Obter ETH real (para Mainnet) ou de teste (para Sepolia):**[m
[31m-    - Para Base Sepolia: Use um faucet como [Base Sepolia Faucet](https://www.base.org/faucet).[m
[31m-    - Para Base Mainnet: Adquira ETH em uma exchange e envie para o endereço da sua carteira.[m
[31m-[m
[31m-2.  **Configurar `PRIVATE_KEY` e `BASESCAN_API_KEY`:**[m
[31m-    - Crie um arquivo `.env` na raiz do projeto (se ainda não o fez) e adicione:[m
[31m-        ```[m
[31m-        PRIVATE_KEY=SUA_CHAVE_PRIVADA_AQUI[m
[31m-        BASESCAN_API_KEY=SUA_CHAVE_DE_API_DO_BASESCAN_AQUI[m
[31m-        ```[m
[31m-    - **NUNCA comite este arquivo para o controle de versão (Git)!**[m
[31m-[m
[31m-3.  **Implantar o contrato na rede desejada:**[m
[31m-    ```bash[m
[31m-    npx hardhat run scripts/deploy.cjs --network baseSepolia # ou baseMainnet[m
[31m-    ```[m
[31m-    Anote o endereço do contrato implantado.[m
[31m-[m
[31m-4.  **Verificar o contrato no Basescan (opcional, mas recomendado):**[m
[31m-    Após a implantação, você pode verificar o código-fonte do contrato no Basescan para torná-lo público e legível. Use o comando:[m
[31m-    ```bash[m
[31m-    npx hardhat verify --network baseSepolia SEU_ENDERECO_DO_CONTRATO "0x036Fc71447876003275791993739773875077255"[m
[31m-    ```[m
[31m-    Substitua `SEU_ENDERECO_DO_CONTRATO` pelo endereço real do contrato implantado e `0x036Fc71447876003275791993739773875077255` pelo endereço do USDC na rede que você está usando.[m
[31m-[m
[31m-5.  **Atualizar o `CartDrawer.tsx` com o endereço do contrato real:**[m
[31m-    No arquivo `src/components/CartDrawer.tsx`, substitua o `paymentReceiverAddress` pelo endereço do contrato `PaymentReceiver` implantado na rede real.[m
[31m-[m
[31m-6.  **Construir o aplicativo para produção:**[m
[31m-    ```bash[m
[31m-    npm run build[m
[31m-    ```[m
[31m-    Isso criará uma pasta `dist` com os arquivos estáticos do seu site.[m
[31m-[m
[31m-7.  **Hospedar o aplicativo:**[m
[31m-    Você pode hospedar a pasta `dist` em serviços como Netlify, Vercel, GitHub Pages, ou um servidor web tradicional. Para o Lovable, você precisaria seguir as instruções específicas deles para upload de arquivos estáticos.[m
[31m-[m
[1mdiff --git a/INSTRUCOES_GIT.md b/INSTRUCOES_GIT.md[m
[1mdeleted file mode 100644[m
[1mindex b55721e..0000000[m
[1m--- a/INSTRUCOES_GIT.md[m
[1m+++ /dev/null[m
[36m@@ -1,172 +0,0 @@[m
[31m-# Instruções para Atualizar o Repositório Git na Sua Máquina Local[m
[31m-[m
[31m-## Passo a Passo[m
[31m-[m
[31m-### 1. Baixar as Alterações do Sandbox[m
[31m-[m
[31m-Primeiro, você precisa baixar os arquivos modificados do sandbox para sua máquina local. Você pode fazer isso de algumas formas:[m
[31m-[m
[31m-**Opção A: Baixar arquivos específicos**[m
[31m-- Baixe os arquivos que foram modificados/criados:[m
[31m-  - `src/main.tsx`[m
[31m-  - `src/components/Header.tsx`[m
[31m-  - `src/components/CartDrawer.tsx`[m
[31m-  - `contracts/PaymentReceiver.sol`[m
[31m-  - `scripts/deploy.cjs`[m
[31m-  - `hardhat.config.cjs`[m
[31m-  - `IMPLEMENTACAO_BASE_USDC.md`[m
[31m-  - `package.json` (com as novas dependências)[m
[31m-[m
[31m-**Opção B: Baixar o projeto completo**[m
[31m-- Baixe todo o diretório `/home/ubuntu/prototipo-chainflow-62` como um arquivo ZIP[m
[31m-[m
[31m-### 2. Navegar para o Diretório do Projeto[m
[31m-[m
[31m-Abra o terminal (ou prompt de comando) na sua máquina e navegue até o diretório do seu projeto:[m
[31m-[m
[31m-```bash[m
[31m-cd caminho/para/seu/prototipo-chainflow-62[m
[31m-```[m
[31m-[m
[31m-### 3. Verificar o Status do Git[m
[31m-[m
[31m-Primeiro, verifique se você está em um repositório Git:[m
[31m-[m
[31m-```bash[m
[31m-git status[m
[31m-```[m
[31m-[m
[31m-Se não for um repositório Git, inicialize um:[m
[31m-[m
[31m-```bash[m
[31m-git init[m
[31m-git remote add origin https://github.com/AndrezaCri/prototipo-chainflow-62.git[m
[31m-```[m
[31m-[m
[31m-### 4. Configurar suas Credenciais Git (se necessário)[m
[31m-[m
[31m-Se ainda não configurou suas credenciais Git globalmente:[m
[31m-[m
[31m-```bash[m
[31m-git config --global user.name "Seu Nome"[m
[31m-git config --global user.email "seu.email@exemplo.com"[m
[31m-```[m
[31m-[m
[31m-### 5. Adicionar os Arquivos Modificados[m
[31m-[m
[31m-Adicione todos os arquivos modificados ao staging:[m
[31m-[m
[31m-```bash[m
[31m-git add .[m
[31m-```[m
[31m-[m
[31m-Ou adicione arquivos específicos:[m
[31m-[m
[31m-```bash[m
[31m-git add src/main.tsx[m
[31m-git add src/components/Header.tsx[m
[31m-git add src/components/CartDrawer.tsx[m
[31m-git add contracts/PaymentReceiver.sol[m
[31m-git add scripts/deploy.cjs[m
[31m-git add hardhat.config.cjs[m
[31m-git add IMPLEMENTACAO_BASE_USDC.md[m
[31m-git add package.json[m
[31m-```[m
[31m-[m
[31m-### 6. Fazer o Commit das Alterações[m
[31m-[m
[31m-Crie um commit com uma mensagem descritiva:[m
[31m-[m
[31m-```bash[m
[31m-git commit -m "feat: Implementar pagamentos USDC com Base Pay[m
[31m-[m
[31m-- Adicionar integração com RainbowKit e Wagmi[m
[31m-- Criar contrato inteligente PaymentReceiver[m
[31m-- Implementar lógica de pagamento USDC no carrinho[m
[31m-- Configurar redes Base Mainnet e Sepolia[m
[31m-- Adicionar documentação da implementação"[m
[31m-```[m
[31m-[m
[31m-### 7. Enviar as Alterações para o GitHub[m
[31m-[m
[31m-Envie as alterações para o repositório remoto:[m
[31m-[m
[31m-```bash[m
[31m-git push origin main[m
[31m-```[m
[31m-[m
[31m-Se for o primeiro push ou se a branch não existir:[m
[31m-[m
[31m-```bash[m
[31m-git push -u origin main[m
[31m-```[m
[31m-[m
[31m-## Comandos Resumidos[m
[31m-[m
[31m-```bash[m
[31m-# Navegar para o diretório[m
[31m-cd caminho/para/seu/prototipo-chainflow-62[m
[31m-[m
[31m-# Verificar status[m
[31m-git status[m
[31m-[m
[31m-# Adicionar arquivos[m
[31m-git add .[m
[31m-[m
[31m-# Fazer commit[m
[31m-git commit -m "feat: Implementar pagamentos USDC com Base Pay"[m
[31m-[m
[31m-# Enviar para GitHub[m
[31m-git push origin main[m
[31m-```[m
[31m-[m
[31m-## Possíveis Problemas e Soluções[m
[31m-[m
[31m-### Problema: "Authentication failed"[m
[31m-[m
[31m-**Solução:** Se você estiver usando autenticação de dois fatores (2FA) no GitHub, você precisará usar um Personal Access Token (PAT) em vez da 