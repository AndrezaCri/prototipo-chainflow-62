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

## Configurações Técnicas

### Project ID do WalletConnect
```
Project ID: 81f33bfdc2779abb1b9295edb1c591e3
```

### Endereços de Contratos

**USDC na Base Mainnet:**
```
0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

**USDC na Base Sepolia (Testnet):**
```
0x036Fc71447876003275791993739773875077255
```

**PaymentReceiver (será definido após deploy):**
```
0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 (placeholder local)
```

## Instruções de Uso e Teste

### Teste Local com Hardhat

1. **Inicie o nó local do Hardhat:**
   ```bash
   npx hardhat node
   ```
   Este comando iniciará uma blockchain local com contas de teste.

2. **Implante o contrato localmente:**
   ```bash
   npx hardhat run scripts/deploy.cjs --network localhost
   ```
   Anote o endereço do contrato implantado.

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Configure sua carteira para rede local:**
   - Nome da Rede: Hardhat Local
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Símbolo: `ETH`

### Deploy em Rede Real (Base Sepolia/Mainnet)

1. **Configure variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite .env com sua chave privada
   ```

2. **Deploy para Base Sepolia (testnet):**
   ```bash
   npx hardhat run scripts/deploy.cjs --network baseSepolia
   ```

3. **Deploy para Base Mainnet:**
   ```bash
   npx hardhat run scripts/deploy.cjs --network baseMainnet
   ```

4. **Verifique o contrato (opcional):**
   ```bash
   npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> "0x036Fc71447876003275791993739773875077255"
   ```

## Arquitetura da Solução

### Componentes Principais

1. **Contrato PaymentReceiver.sol**
   - Recebe pagamentos USDC
   - Função `receiveUsdc()` para processar pagamentos
   - Função `withdrawUsdc()` para sacar fundos (apenas owner)

2. **Interface Frontend (CartDrawer.tsx)**
   - Seleção de método de pagamento
   - Conversão BRL → USDC
   - Integração com wagmi para transações

3. **Configuração Web3 (main.tsx)**
   - RainbowKit para conexão de carteiras
   - Configuração das redes Base

### Fluxo de Pagamento

1. Usuário conecta carteira
2. Adiciona produtos ao carrinho
3. Seleciona "Pagar com USDC"
4. Sistema calcula valor em USDC
5. Transação é enviada para o contrato
6. Pagamento é processado on-chain

## Segurança e Considerações

- Contrato usa OpenZeppelin para segurança
- Função `onlyOwner` para saques
- Validações de valor mínimo
- Eventos para tracking de transações

## Próximos Passos

1. **Teste em Base Sepolia** - Deploy e teste com USDC testnet
2. **Auditoria de Segurança** - Revisão do contrato antes de mainnet
3. **Deploy Mainnet** - Implantação em produção
4. **Monitoramento** - Setup de alertas e dashboards

## Arquivos Criados

- `contracts/PaymentReceiver.sol` - Contrato inteligente
- `scripts/deploy.cjs` - Script de implantação  
- `hardhat.config.cjs` - Configuração do Hardhat
- `.env.example` - Exemplo de variáveis de ambiente
- `src/components/CartDrawer.tsx` - Interface de pagamento (já existia)
- `src/main.tsx` - Configuração Web3 (já existia)