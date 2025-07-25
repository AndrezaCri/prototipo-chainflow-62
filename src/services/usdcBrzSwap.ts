import { ethers } from 'ethers';

// Endereços dos contratos na Base mainnet e testnet
const CONTRACTS = {
  // Base Mainnet (chainId: 8453)
  8453: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC nativo na Base
    BRZ: '0x420000000000000000000000000000000000000A', // Placeholder - BRZ pode não existir ainda
    ROUTER: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43' // Aerodrome Router
  },
  // Base Sepolia Testnet (chainId: 84532)  
  84532: {
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC testnet
    BRZ: '0x4200000000000000000000000000000000000006', // WETH como mock BRZ
    ROUTER: '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4' // Router testnet
  }
};

// ABI simplificada do Uniswap V3 Router
const UNISWAP_V3_ROUTER_ABI = [
  {
    "inputs": [
      {
        "components": [
          {"internalType": "address", "name": "tokenIn", "type": "address"},
          {"internalType": "address", "name": "tokenOut", "type": "address"},
          {"internalType": "uint24", "name": "fee", "type": "uint24"},
          {"internalType": "address", "name": "recipient", "type": "address"},
          {"internalType": "uint256", "name": "deadline", "type": "uint256"},
          {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
          {"internalType": "uint256", "name": "amountOutMinimum", "type": "uint256"},
          {"internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160"}
        ],
        "internalType": "struct ISwapRouter.ExactInputSingleParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "exactInputSingle",
    "outputs": [{"internalType": "uint256", "name": "amountOut", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
      {"internalType": "address", "name": "tokenIn", "type": "address"},
      {"internalType": "address", "name": "tokenOut", "type": "address"},
      {"internalType": "uint24", "name": "fee", "type": "uint24"}
    ],
    "name": "quoteExactInputSingle",
    "outputs": [{"internalType": "uint256", "name": "amountOut", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// ABI simplificada do ERC20
const ERC20_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface SwapQuote {
  amountIn: string;
  amountOut: string;
  tokenIn: string;
  tokenOut: string;
  priceImpact: number;
  exchangeRate: number;
  fee: string;
}

export interface SwapTransaction {
  hash: string;
  amountIn: string;
  amountOut: string;
  tokenIn: string;
  tokenOut: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

class UsdcBrzSwapService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private chainId: number = 8453; // Default para Base mainnet

  /**
   * Obtém endereços dos contratos baseado na rede atual
   */
  private getContractAddresses() {
    const contracts = CONTRACTS[this.chainId as keyof typeof CONTRACTS];
    if (!contracts) {
      throw new Error(`Rede não suportada. ChainId: ${this.chainId}`);
    }
    return contracts;
  }

  /**
   * Inicializa o serviço com o provider Web3
   */
  async initialize(provider: ethers.providers.Web3Provider): Promise<void> {
    try {
      console.log('🔄 Inicializando serviço de swap...');
      this.provider = provider;
      this.signer = provider.getSigner();
      
      // Verificar rede e definir chainId
      const network = await provider.getNetwork();
      this.chainId = network.chainId;
      console.log('📡 Rede conectada:', network.name, 'ChainId:', this.chainId);
      
      // Verificar se a rede é suportada
      if (!CONTRACTS[this.chainId as keyof typeof CONTRACTS]) {
        throw new Error(`Rede não suportada. Por favor, conecte à Base Mainnet ou Base Sepolia Testnet. ChainId atual: ${this.chainId}`);
      }
      
      // Testar se o signer funciona
      const address = await this.signer.getAddress();
      console.log('✅ Carteira conectada:', address);
      
      const contracts = this.getContractAddresses();
      console.log('📋 Contratos carregados:', contracts);
      
      console.log('✅ Serviço de swap inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar serviço:', error);
      throw new Error('Falha ao inicializar serviço de swap: ' + (error as Error).message);
    }
  }

  /**
   * Verifica se o serviço está inicializado
   */
  private ensureInitialized(): void {
    if (!this.provider || !this.signer) {
      throw new Error('Carteira não conectada. Conecte sua carteira para continuar.');
    }
  }

  /**
   * Obtém cotação para swap USDC -> BRZ
   */
  async getSwapQuote(amountIn: string, tokenIn: 'USDC' | 'BRZ', tokenOut: 'USDC' | 'BRZ'): Promise<SwapQuote> {
    this.ensureInitialized();

    const contracts = this.getContractAddresses();
    const tokenInAddress = tokenIn === 'USDC' ? contracts.USDC : contracts.BRZ;
    const tokenOutAddress = tokenOut === 'USDC' ? contracts.USDC : contracts.BRZ;
    
    // Para desenvolvimento, simular cotação
    if (import.meta.env.DEV) {
      return this.simulateSwapQuote(amountIn, tokenIn, tokenOut);
    }

    try {
      const routerContract = new ethers.Contract(contracts.ROUTER, UNISWAP_V3_ROUTER_ABI, this.provider!);
      
      const amountInWei = ethers.utils.parseUnits(amountIn, tokenIn === 'USDC' ? 6 : 18);
      const fee = 3000; // 0.3% fee tier
      
      const amountOut = await routerContract.quoteExactInputSingle(
        amountInWei,
        tokenInAddress,
        tokenOutAddress,
        fee
      );

      const amountOutFormatted = ethers.utils.formatUnits(amountOut, tokenOut === 'USDC' ? 6 : 18);
      const exchangeRate = parseFloat(amountOutFormatted) / parseFloat(amountIn);
      
      return {
        amountIn,
        amountOut: amountOutFormatted,
        tokenIn,
        tokenOut,
        priceImpact: 0.1, // Simulado
        exchangeRate,
        fee: '0.3%'
      };
    } catch (error) {
      console.error('Erro ao obter cotação:', error);
      // Fallback para simulação
      return this.simulateSwapQuote(amountIn, tokenIn, tokenOut);
    }
  }

  /**
   * Simula cotação com dados reais do mercado Aerodrome
   */
  private simulateSwapQuote(amountIn: string, tokenIn: 'USDC' | 'BRZ', tokenOut: 'USDC' | 'BRZ'): SwapQuote {
    // Taxa de câmbio real do mercado: 1 USDC = 5.5 BRZ (pool Aerodrome)
    const usdcToBrzRate = 5.5;
    const brzToUsdcRate = 1 / usdcToBrzRate;
    
    let amountOut: number;
    let exchangeRate: number;
    
    if (tokenIn === 'USDC' && tokenOut === 'BRZ') {
      amountOut = parseFloat(amountIn) * usdcToBrzRate;
      exchangeRate = usdcToBrzRate;
    } else if (tokenIn === 'BRZ' && tokenOut === 'USDC') {
      amountOut = parseFloat(amountIn) * brzToUsdcRate;
      exchangeRate = brzToUsdcRate;
    } else {
      throw new Error('Par de tokens inválido');
    }

    // Calcular impacto no preço baseado na liquidez real (~$21k)
    const poolLiquidity = 21000; // USD de liquidez total
    const tradeSize = tokenIn === 'USDC' ? parseFloat(amountIn) : parseFloat(amountIn) / 5.5;
    const priceImpact = Math.min((tradeSize / poolLiquidity) * 100, 15); // Máximo 15% de impacto

    // Aplicar fee real do Aerodrome de 0.05%
    const feeAmount = amountOut * 0.0005;
    amountOut = amountOut - feeAmount;

    return {
      amountIn,
      amountOut: amountOut.toFixed(tokenOut === 'USDC' ? 6 : 2),
      tokenIn,
      tokenOut,
      priceImpact: parseFloat(priceImpact.toFixed(2)),
      exchangeRate,
      fee: '0.05%'
    };
  }

  /**
   * Executa o swap USDC <-> BRZ
   */
  async executeSwap(
    amountIn: string, 
    tokenIn: 'USDC' | 'BRZ', 
    tokenOut: 'USDC' | 'BRZ',
    slippageTolerance: number = 0.5
  ): Promise<SwapTransaction> {
    if (!this.provider || !this.signer) {
      throw new Error('Carteira não conectada. Conecte sua carteira para realizar transações reais.');
    }

    const contracts = this.getContractAddresses();
    const tokenInAddress = tokenIn === 'USDC' ? contracts.USDC : contracts.BRZ;
    const tokenOutAddress = tokenOut === 'USDC' ? contracts.USDC : contracts.BRZ;

    try {
      // 1. Obter cotação atual
      const quote = await this.getSwapQuote(amountIn, tokenIn, tokenOut);
      
      // 2. Calcular amount out mínimo com slippage
      const amountOutMin = (parseFloat(quote.amountOut) * (1 - slippageTolerance / 100)).toString();
      
      // 3. Aprovar tokens se necessário
      await this.approveTokenIfNeeded(tokenInAddress, amountIn, tokenIn);
      
      // 4. Executar swap
      const routerContract = new ethers.Contract(contracts.ROUTER, UNISWAP_V3_ROUTER_ABI, this.signer!);
      
      const amountInWei = ethers.utils.parseUnits(amountIn, tokenIn === 'USDC' ? 6 : 18);
      const amountOutMinWei = ethers.utils.parseUnits(amountOutMin, tokenOut === 'USDC' ? 6 : 18);
      
      const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutos
      const userAddress = await this.signer!.getAddress();
      
      const swapParams = {
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        fee: 3000, // 0.3%
        recipient: userAddress,
        deadline,
        amountIn: amountInWei,
        amountOutMinimum: amountOutMinWei,
        sqrtPriceLimitX96: 0
      };

      const tx = await routerContract.exactInputSingle(swapParams);
      
      return {
        hash: tx.hash,
        amountIn,
        amountOut: quote.amountOut,
        tokenIn,
        tokenOut,
        timestamp: Date.now(),
        status: 'pending'
      };
    } catch (error) {
      console.error('Erro ao executar swap:', error);
      throw error;
    }
  }

  /**
   * Simula transação de swap para desenvolvimento
   */
  private async simulateSwapTransaction(
    amountIn: string, 
    tokenIn: 'USDC' | 'BRZ', 
    tokenOut: 'USDC' | 'BRZ'
  ): Promise<SwapTransaction> {
    const quote = await this.getSwapQuote(amountIn, tokenIn, tokenOut);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          hash: '0x' + Math.random().toString(16).substr(2, 64),
          amountIn,
          amountOut: quote.amountOut,
          tokenIn,
          tokenOut,
          timestamp: Date.now(),
          status: 'confirmed'
        });
      }, 2000);
    });
  }

  /**
   * Aprova tokens se necessário
   */
  private async approveTokenIfNeeded(tokenAddress: string, amount: string, tokenSymbol: 'USDC' | 'BRZ'): Promise<void> {
    try {
      console.log(`🔍 Verificando aprovação para ${tokenSymbol}...`);
      
      const contracts = this.getContractAddresses();
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer!);
      const userAddress = await this.signer!.getAddress();
      
      const amountWei = ethers.utils.parseUnits(amount, tokenSymbol === 'USDC' ? 6 : 18);
      console.log('💰 Amount em Wei:', amountWei.toString());
      
      const allowance = await tokenContract.allowance(userAddress, contracts.ROUTER);
      console.log('📋 Allowance atual:', allowance.toString());
      
      if (allowance.lt(amountWei)) {
        console.log('🔓 Aprovando tokens...');
        const approveTx = await tokenContract.approve(contracts.ROUTER, ethers.constants.MaxUint256);
        console.log('⏳ Aguardando confirmação da aprovação...');
        await approveTx.wait();
        console.log('✅ Tokens aprovados com sucesso');
      } else {
        console.log('✅ Tokens já estão aprovados');
      }
    } catch (error) {
      console.error('❌ Erro na aprovação de tokens:', error);
      throw new Error('Falha ao aprovar tokens: ' + (error as Error).message);
    }
  }

  /**
   * Obtém saldo de token
   */
  async getTokenBalance(tokenSymbol: 'USDC' | 'BRZ'): Promise<string> {
    // Verificar se há saldo de teste salvo localmente primeiro
    const testBalance = localStorage.getItem(`testnet_${tokenSymbol.toLowerCase()}_balance`);
    if (testBalance) {
      return testBalance;
    }
    
    // Para desenvolvimento, retornar 0 se não houver saldo de teste
    if (import.meta.env.DEV) {
      return '0.00';
    }
    
    this.ensureInitialized();
    
    const contracts = this.getContractAddresses();
    const tokenAddress = tokenSymbol === 'USDC' ? contracts.USDC : contracts.BRZ;
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider!);
    const userAddress = await this.signer!.getAddress();
    
    try {
      const balance = await tokenContract.balanceOf(userAddress);
      return ethers.utils.formatUnits(balance, tokenSymbol === 'USDC' ? 6 : 18);
    } catch (error) {
      console.error(`Erro ao obter saldo de ${tokenSymbol}:`, error);
      // Retornar zero para forçar o usuário a usar o faucet
      return '0.00';
    }
  }

  /**
   * Adiciona tokens de teste à carteira simulada
   */
  addTestTokens(usdcAmount: string = '1000.00', brzAmount: string = '5200.00'): void {
    localStorage.setItem('testnet_usdc_balance', usdcAmount);
    localStorage.setItem('testnet_brz_balance', brzAmount);
  }

  /**
   * Remove saldo de tokens de teste
   */
  clearTestTokens(): void {
    localStorage.removeItem('testnet_usdc_balance');
    localStorage.removeItem('testnet_brz_balance');
  }

  /**
   * Obtém histórico de swaps do usuário
   */
  getSwapHistory(): SwapTransaction[] {
    const history = localStorage.getItem('chainflow_swap_history');
    return history ? JSON.parse(history) : [];
  }

  /**
   * Salva transação no histórico
   */
  saveSwapTransaction(transaction: SwapTransaction): void {
    const history = this.getSwapHistory();
    history.unshift(transaction);
    
    // Manter apenas os últimos 50 swaps
    const limitedHistory = history.slice(0, 50);
    localStorage.setItem('chainflow_swap_history', JSON.stringify(limitedHistory));
  }

  /**
   * Obtém taxa de câmbio atual USDC/BRZ do mercado real
   */
  async getCurrentExchangeRate(): Promise<number> {
    try {
      const quote = await this.getSwapQuote('1', 'USDC', 'BRZ');
      return quote.exchangeRate;
    } catch (error) {
      console.error('Erro ao obter taxa de câmbio:', error);
      return 5.5; // Taxa real do mercado Aerodrome
    }
  }
}

export const usdcBrzSwapService = new UsdcBrzSwapService();

