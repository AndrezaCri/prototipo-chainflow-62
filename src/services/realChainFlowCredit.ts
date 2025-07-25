import { ethers } from 'ethers';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

// ABI do contrato ChainFlowCredit (principais funções)
const CHAINFLOW_CREDIT_ABI = [
  // Funções de leitura
  "function getCreditApplication(uint256 applicationId) view returns (tuple(uint256 id, address borrower, string companyName, string cnpj, uint256 monthlyRevenue, uint256 requestedAmount, uint256 termDays, string description, uint8 status, uint256 approvedAmount, uint256 interestRate, uint256 createdAt, uint256 dueDate, bool isPaid, uint8 businessScore, uint8 riskLevel))",
  "function getUserApplications(address user) view returns (uint256[])",
  "function getPoolInfo() view returns (uint256 totalSupplied, uint256 totalBorrowed, uint256 availableLiquidity, uint256 utilizationRate)",
  "function getSupplierBalance(address supplier) view returns (uint256)",
  "function nextApplicationId() view returns (uint256)",
  
  // Funções de escrita
  "function createCreditApplication(string companyName, string cnpj, uint256 monthlyRevenue, uint256 requestedAmount, uint256 termDays, string description) returns (uint256)",
  "function processSupplierPayment(uint256 applicationId, address supplier, uint256 amount) returns (uint256)",
  "function repayCredit(uint256 applicationId)",
  "function supplyLiquidity(uint256 amount)",
  "function withdrawLiquidity(uint256 amount)",
  
  // Eventos
  "event CreditApplicationCreated(uint256 indexed applicationId, address indexed borrower, uint256 requestedAmount, uint256 termDays)",
  "event CreditApproved(uint256 indexed applicationId, uint256 approvedAmount, uint256 interestRate, uint256 dueDate)",
  "event CreditRejected(uint256 indexed applicationId, string reason)",
  "event SupplierPaymentProcessed(uint256 indexed paymentId, uint256 indexed applicationId, address indexed supplier, uint256 amount)",
  "event CreditRepaid(uint256 indexed applicationId, address indexed borrower, uint256 amount)",
  "event LiquiditySupplied(address indexed supplier, address indexed token, uint256 amount)",
  "event LiquidityWithdrawn(address indexed supplier, address indexed token, uint256 amount)"
];

// ABI do token USDC
const USDC_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

// Endereços na Base Sepolia
const CONTRACTS = {
  CHAINFLOW_CREDIT: '0x1234567890123456789012345678901234567890', // Será atualizado após deploy
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  BRZ: '0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2'
};

// Tipos TypeScript
export interface CreditApplication {
  id: string;
  borrower: string;
  companyName: string;
  cnpj: string;
  monthlyRevenue: string;
  requestedAmount: string;
  termDays: number;
  description: string;
  status: CreditStatus;
  approvedAmount: string;
  interestRate: number;
  createdAt: number;
  dueDate: number;
  isPaid: boolean;
  businessScore: number;
  riskLevel: RiskLevel;
}

export enum CreditStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Active = 3,
  Paid = 4,
  Defaulted = 5
}

export enum RiskLevel {
  Low = 0,
  Medium = 1,
  High = 2
}

export interface PoolInfo {
  totalSupplied: string;
  totalBorrowed: string;
  availableLiquidity: string;
  utilizationRate: number;
}

export interface CreditApplicationForm {
  companyName: string;
  cnpj: string;
  monthlyRevenue: string;
  requestedAmount: string;
  termDays: number;
  description: string;
}

export interface SupplierPayment {
  applicationId: string;
  supplier: string;
  amount: string;
}

class RealChainFlowCreditService {
  private contract: ethers.Contract | null = null;
  private usdcContract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;
  private provider: ethers.providers.Provider | null = null;

  /**
   * Inicializar serviço com provider e signer
   */
  async initialize(walletClient: any, publicClient: any) {
    try {
      // Configurar provider
      this.provider = new ethers.providers.Web3Provider(walletClient);
      this.signer = this.provider.getSigner();

      // Inicializar contratos
      this.contract = new ethers.Contract(
        CONTRACTS.CHAINFLOW_CREDIT,
        CHAINFLOW_CREDIT_ABI,
        this.signer
      );

      this.usdcContract = new ethers.Contract(
        CONTRACTS.USDC,
        USDC_ABI,
        this.signer
      );

      console.log('✅ RealChainFlowCreditService inicializado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar RealChainFlowCreditService:', error);
      return false;
    }
  }

  /**
   * Verificar se o serviço está inicializado
   */
  isInitialized(): boolean {
    return this.contract !== null && this.signer !== null;
  }

  /**
   * Criar nova aplicação de crédito
   */
  async createCreditApplication(form: CreditApplicationForm): Promise<{
    success: boolean;
    applicationId?: string;
    txHash?: string;
    error?: string;
  }> {
    if (!this.isInitialized()) {
      return { success: false, error: 'Serviço não inicializado' };
    }

    try {
      // Converter valores para wei (USDC tem 6 decimais)
      const monthlyRevenue = ethers.utils.parseUnits(form.monthlyRevenue, 6);
      const requestedAmount = ethers.utils.parseUnits(form.requestedAmount, 6);

      // Estimar gas
      const gasEstimate = await this.contract!.estimateGas.createCreditApplication(
        form.companyName,
        form.cnpj,
        monthlyRevenue,
        requestedAmount,
        form.termDays,
        form.description
      );

      // Executar transação
      const tx = await this.contract!.createCreditApplication(
        form.companyName,
        form.cnpj,
        monthlyRevenue,
        requestedAmount,
        form.termDays,
        form.description,
        {
          gasLimit: gasEstimate.mul(120).div(100) // 20% buffer
        }
      );

      console.log('📝 Transação enviada:', tx.hash);

      // Aguardar confirmação
      const receipt = await tx.wait();
      console.log('✅ Transação confirmada:', receipt.transactionHash);

      // Extrair applicationId do evento
      const event = receipt.events?.find((e: any) => e.event === 'CreditApplicationCreated');
      const applicationId = event?.args?.applicationId?.toString();

      return {
        success: true,
        applicationId,
        txHash: receipt.transactionHash
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar aplicação:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * Buscar aplicação de crédito por ID
   */
  async getCreditApplication(applicationId: string): Promise<CreditApplication | null> {
    if (!this.isInitialized()) return null;

    try {
      const result = await this.contract!.getCreditApplication(applicationId);
      
      return {
        id: result.id.toString(),
        borrower: result.borrower,
        companyName: result.companyName,
        cnpj: result.cnpj,
        monthlyRevenue: ethers.utils.formatUnits(result.monthlyRevenue, 6),
        requestedAmount: ethers.utils.formatUnits(result.requestedAmount, 6),
        termDays: result.termDays,
        description: result.description,
        status: result.status,
        approvedAmount: ethers.utils.formatUnits(result.approvedAmount, 6),
        interestRate: result.interestRate / 100, // Converter de basis points
        createdAt: result.createdAt.toNumber(),
        dueDate: result.dueDate.toNumber(),
        isPaid: result.isPaid,
        businessScore: result.businessScore,
        riskLevel: result.riskLevel
      };
    } catch (error) {
      console.error('❌ Erro ao buscar aplicação:', error);
      return null;
    }
  }

  /**
   * Buscar aplicações do usuário
   */
  async getUserApplications(userAddress: string): Promise<CreditApplication[]> {
    if (!this.isInitialized()) return [];

    try {
      const applicationIds = await this.contract!.getUserApplications(userAddress);
      const applications: CreditApplication[] = [];

      for (const id of applicationIds) {
        const app = await this.getCreditApplication(id.toString());
        if (app) applications.push(app);
      }

      return applications;
    } catch (error) {
      console.error('❌ Erro ao buscar aplicações do usuário:', error);
      return [];
    }
  }

  /**
   * Processar pagamento ao fornecedor
   */
  async processSupplierPayment(payment: SupplierPayment): Promise<{
    success: boolean;
    paymentId?: string;
    txHash?: string;
    error?: string;
  }> {
    if (!this.isInitialized()) {
      return { success: false, error: 'Serviço não inicializado' };
    }

    try {
      const amount = ethers.utils.parseUnits(payment.amount, 6);

      // Estimar gas
      const gasEstimate = await this.contract!.estimateGas.processSupplierPayment(
        payment.applicationId,
        payment.supplier,
        amount
      );

      // Executar transação
      const tx = await this.contract!.processSupplierPayment(
        payment.applicationId,
        payment.supplier,
        amount,
        {
          gasLimit: gasEstimate.mul(120).div(100)
        }
      );

      console.log('💰 Pagamento enviado:', tx.hash);

      // Aguardar confirmação
      const receipt = await tx.wait();
      console.log('✅ Pagamento confirmado:', receipt.transactionHash);

      // Extrair paymentId do evento
      const event = receipt.events?.find((e: any) => e.event === 'SupplierPaymentProcessed');
      const paymentId = event?.args?.paymentId?.toString();

      return {
        success: true,
        paymentId,
        txHash: receipt.transactionHash
      };

    } catch (error: any) {
      console.error('❌ Erro ao processar pagamento:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * Pagar crédito (com juros)
   */
  async repayCredit(applicationId: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    if (!this.isInitialized()) {
      return { success: false, error: 'Serviço não inicializado' };
    }

    try {
      // Buscar informações da aplicação
      const app = await this.getCreditApplication(applicationId);
      if (!app) {
        return { success: false, error: 'Aplicação não encontrada' };
      }

      // Calcular valor total com juros
      const principal = ethers.utils.parseUnits(app.approvedAmount, 6);
      const interest = principal.mul(app.interestRate).mul(app.termDays).div(10000).div(365);
      const totalAmount = principal.add(interest);

      // Verificar allowance
      const currentAllowance = await this.usdcContract!.allowance(
        await this.signer!.getAddress(),
        CONTRACTS.CHAINFLOW_CREDIT
      );

      if (currentAllowance.lt(totalAmount)) {
        // Aprovar tokens
        const approveTx = await this.usdcContract!.approve(
          CONTRACTS.CHAINFLOW_CREDIT,
          totalAmount
        );
        await approveTx.wait();
        console.log('✅ Tokens aprovados');
      }

      // Executar pagamento
      const tx = await this.contract!.repayCredit(applicationId);
      console.log('💳 Pagamento enviado:', tx.hash);

      const receipt = await tx.wait();
      console.log('✅ Crédito pago:', receipt.transactionHash);

      return {
        success: true,
        txHash: receipt.transactionHash
      };

    } catch (error: any) {
      console.error('❌ Erro ao pagar crédito:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * Fornecer liquidez ao pool
   */
  async supplyLiquidity(amount: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    if (!this.isInitialized()) {
      return { success: false, error: 'Serviço não inicializado' };
    }

    try {
      const amountWei = ethers.utils.parseUnits(amount, 6);

      // Verificar allowance
      const currentAllowance = await this.usdcContract!.allowance(
        await this.signer!.getAddress(),
        CONTRACTS.CHAINFLOW_CREDIT
      );

      if (currentAllowance.lt(amountWei)) {
        // Aprovar tokens
        const approveTx = await this.usdcContract!.approve(
          CONTRACTS.CHAINFLOW_CREDIT,
          amountWei
        );
        await approveTx.wait();
        console.log('✅ Tokens aprovados');
      }

      // Fornecer liquidez
      const tx = await this.contract!.supplyLiquidity(amountWei);
      console.log('🏦 Liquidez fornecida:', tx.hash);

      const receipt = await tx.wait();
      console.log('✅ Liquidez confirmada:', receipt.transactionHash);

      return {
        success: true,
        txHash: receipt.transactionHash
      };

    } catch (error: any) {
      console.error('❌ Erro ao fornecer liquidez:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * Retirar liquidez do pool
   */
  async withdrawLiquidity(amount: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    if (!this.isInitialized()) {
      return { success: false, error: 'Serviço não inicializado' };
    }

    try {
      const amountWei = ethers.utils.parseUnits(amount, 6);

      const tx = await this.contract!.withdrawLiquidity(amountWei);
      console.log('🏧 Liquidez retirada:', tx.hash);

      const receipt = await tx.wait();
      console.log('✅ Retirada confirmada:', receipt.transactionHash);

      return {
        success: true,
        txHash: receipt.transactionHash
      };

    } catch (error: any) {
      console.error('❌ Erro ao retirar liquidez:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * Buscar informações do pool
   */
  async getPoolInfo(): Promise<PoolInfo | null> {
    if (!this.isInitialized()) return null;

    try {
      const result = await this.contract!.getPoolInfo();
      
      return {
        totalSupplied: ethers.utils.formatUnits(result.totalSupplied, 6),
        totalBorrowed: ethers.utils.formatUnits(result.totalBorrowed, 6),
        availableLiquidity: ethers.utils.formatUnits(result.availableLiquidity, 6),
        utilizationRate: result.utilizationRate.toNumber() / 100 // Converter de basis points
      };
    } catch (error) {
      console.error('❌ Erro ao buscar info do pool:', error);
      return null;
    }
  }

  /**
   * Buscar saldo do fornecedor
   */
  async getSupplierBalance(supplierAddress: string): Promise<string> {
    if (!this.isInitialized()) return '0';

    try {
      const balance = await this.contract!.getSupplierBalance(supplierAddress);
      return ethers.utils.formatUnits(balance, 6);
    } catch (error) {
      console.error('❌ Erro ao buscar saldo do fornecedor:', error);
      return '0';
    }
  }

  /**
   * Buscar saldo USDC do usuário
   */
  async getUSDCBalance(userAddress: string): Promise<string> {
    if (!this.isInitialized()) return '0';

    try {
      const balance = await this.usdcContract!.balanceOf(userAddress);
      return ethers.utils.formatUnits(balance, 6);
    } catch (error) {
      console.error('❌ Erro ao buscar saldo USDC:', error);
      return '0';
    }
  }

  /**
   * Buscar allowance USDC
   */
  async getUSDCAllowance(userAddress: string): Promise<string> {
    if (!this.isInitialized()) return '0';

    try {
      const allowance = await this.usdcContract!.allowance(
        userAddress,
        CONTRACTS.CHAINFLOW_CREDIT
      );
      return ethers.utils.formatUnits(allowance, 6);
    } catch (error) {
      console.error('❌ Erro ao buscar allowance USDC:', error);
      return '0';
    }
  }

  /**
   * Aprovar tokens USDC
   */
  async approveUSDC(amount: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    if (!this.isInitialized()) {
      return { success: false, error: 'Serviço não inicializado' };
    }

    try {
      const amountWei = ethers.utils.parseUnits(amount, 6);
      
      const tx = await this.usdcContract!.approve(
        CONTRACTS.CHAINFLOW_CREDIT,
        amountWei
      );

      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error: any) {
      console.error('❌ Erro ao aprovar USDC:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }
}

// Instância singleton
export const realChainFlowCreditService = new RealChainFlowCreditService();

// Utilitários
export const formatCurrency = (amount: string, currency = 'USDC'): string => {
  const num = parseFloat(amount);
  return `${num.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })} ${currency}`;
};

export const formatInterestRate = (rate: number): string => {
  return `${rate.toFixed(2)}%`;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
};

export const getCreditStatusText = (status: CreditStatus): string => {
  const statusMap = {
    [CreditStatus.Pending]: 'Pendente',
    [CreditStatus.Approved]: 'Aprovado',
    [CreditStatus.Rejected]: 'Rejeitado',
    [CreditStatus.Active]: 'Ativo',
    [CreditStatus.Paid]: 'Pago',
    [CreditStatus.Defaulted]: 'Inadimplente'
  };
  return statusMap[status] || 'Desconhecido';
};

export const getRiskLevelText = (risk: RiskLevel): string => {
  const riskMap = {
    [RiskLevel.Low]: 'Baixo',
    [RiskLevel.Medium]: 'Médio',
    [RiskLevel.High]: 'Alto'
  };
  return riskMap[risk] || 'Desconhecido';
};

export const getRiskLevelColor = (risk: RiskLevel): string => {
  const colorMap = {
    [RiskLevel.Low]: 'text-green-600',
    [RiskLevel.Medium]: 'text-yellow-600',
    [RiskLevel.High]: 'text-red-600'
  };
  return colorMap[risk] || 'text-gray-600';
};

