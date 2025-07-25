import { ethers } from 'ethers';

// Endereços dos contratos na Base Sepolia
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // USDC na Base Sepolia
const BRZ_ADDRESS = '0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2'; // BRZ simulado na Base Sepolia
const UNISWAP_V3_ROUTER = '0x2626664c2603336E57B271c5C0b26F421741e481'; // Uniswap V3 Router na Base Sepolia

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

  /**
   * Inicializa o serviço com o provider Web3
   */
  async initialize(provider: ethers.providers.Web3Provider): Promise<void> {
    this.provider = provider;
    this.signer = provider.getSigner();
  }

  /**
   * Verifica se o serviço está inicializado
   */
  private ensureInitialized(): void {
    if (!this.provider || !this.signer) {
      throw new Error('Serviço não inicializado. Conecte uma carteira primeiro.');
    }
  }

  /**
   * Obtém cotação para swap USDC -> BRZ
   */
  async getSwapQuote(amountIn: string, tokenIn: 'USDC' | 'BRZ', tokenOut: 'USDC' | 'BRZ'): Promise<SwapQuote> {
    this.ensureInitialized();

    const tokenInAddress = tokenIn === 'USDC' ? USDC_ADDRESS : BRZ_ADDRESS;
    const tokenOutAddress = tokenOut === 'USDC' ? USDC_ADDRESS : BRZ_ADDRESS;
    
    // Para desenvolvimento, simular cotação
    if (process.env.NODE_ENV === 'development') {
      return this.simulateSwapQuote(amountIn, tokenIn, tokenOut);
    }

    try {
      const routerContract = new ethers.Contract(UNISWAP_V3_ROUTER, UNISWAP_V3_ROUTER_ABI, this.provider!);
      
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
   * Simula cotação para desenvolvimento
   */
  private simulateSwapQuote(amountIn: string, tokenIn: 'USDC' | 'BRZ', tokenOut: 'USDC' | 'BRZ'): SwapQuote {
    // Taxa de câmbio simulada: 1 USDC = 5.2 BRZ
    const usdcToBrzRate = 5.2;
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

    // Aplicar fee de 0.3%
    const feeAmount = amountOut * 0.003;
    amountOut = amountOut - feeAmount;

    return {
      amountIn,
      amountOut: amountOut.toFixed(tokenOut === 'USDC' ? 6 : 2),
      tokenIn,
      tokenOut,
      priceImpact: 0.1,
      exchangeRate,
      fee: '0.3%'
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
    this.ensureInitialized();

    const tokenInAddress = tokenIn === 'USDC' ? USDC_ADDRESS : BRZ_ADDRESS;
    const tokenOutAddress = tokenOut === 'USDC' ? USDC_ADDRESS : BRZ_ADDRESS;
    
    // Para desenvolvimento, simular transação
    if (process.env.NODE_ENV === 'development') {
      return this.simulateSwapTransaction(amountIn, tokenIn, tokenOut);
    }

    try {
      // 1. Obter cotação atual
      const quote = await this.getSwapQuote(amountIn, tokenIn, tokenOut);
      
      // 2. Calcular amount out mínimo com slippage
      const amountOutMin = (parseFloat(quote.amountOut) * (1 - slippageTolerance / 100)).toString();
      
      // 3. Aprovar tokens se necessário
      await this.approveTokenIfNeeded(tokenInAddress, amountIn, tokenIn);
      
      // 4. Executar swap
      const routerContract = new ethers.Contract(UNISWAP_V3_ROUTER, UNISWAP_V3_ROUTER_ABI, this.signer!);
      
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
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer!);
    const userAddress = await this.signer!.getAddress();
    
    const amountWei = ethers.utils.parseUnits(amount, tokenSymbol === 'USDC' ? 6 : 18);
    const allowance = await tokenContract.allowance(userAddress, UNISWAP_V3_ROUTER);
    
    if (allowance.lt(amountWei)) {
      const approveTx = await tokenContract.approve(UNISWAP_V3_ROUTER, ethers.constants.MaxUint256);
      await approveTx.wait();
    }
  }

  /**
   * Obtém saldo de token
   */
  async getTokenBalance(tokenSymbol: 'USDC' | 'BRZ'): Promise<string> {
    this.ensureInitialized();
    
    const tokenAddress = tokenSymbol === 'USDC' ? USDC_ADDRESS : BRZ_ADDRESS;
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider!);
    const userAddress = await this.signer!.getAddress();
    
    try {
      const balance = await tokenContract.balanceOf(userAddress);
      return ethers.utils.formatUnits(balance, tokenSymbol === 'USDC' ? 6 : 18);
    } catch (error) {
      console.error(`Erro ao obter saldo de ${tokenSymbol}:`, error);
      // Retornar saldo simulado para desenvolvimento
      return tokenSymbol === 'USDC' ? '1000.00' : '5200.00';
    }
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
   * Obtém taxa de câmbio atual USDC/BRZ
   */
  async getCurrentExchangeRate(): Promise<number> {
    try {
      const quote = await this.getSwapQuote('1', 'USDC', 'BRZ');
      return quote.exchangeRate;
    } catch (error) {
      console.error('Erro ao obter taxa de câmbio:', error);
      return 5.2; // Taxa simulada
    }
  }
}

export const usdcBrzSwapService = new UsdcBrzSwapService();

