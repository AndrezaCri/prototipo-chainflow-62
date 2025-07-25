import { ethers } from 'ethers';

// Interfaces
export interface CreditApplication {
  id: string;
  companyName: string;
  cnpj: string;
  monthlyRevenue: number;
  requestedAmount: number;
  term: 30 | 60 | 90;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
  businessScore?: number;
  interestRate?: number;
  approvedAmount?: number;
  createdAt: Date;
  approvedAt?: Date;
  dueDate?: Date;
}

export interface CreditPool {
  id: string;
  name: string;
  term: number;
  apy: number;
  totalSupplied: number;
  availableCapacity: number;
  maxCapacity: number;
  minInvestment: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  activeLoans: number;
  defaultRate: number;
  businessScore: number;
}

export interface PaymentOrder {
  id: string;
  applicationId: string;
  supplierId: string;
  amount: number;
  pixCode: string;
  status: 'pending' | 'paid' | 'failed';
  createdAt: Date;
  paidAt?: Date;
}

export interface InvestorPosition {
  id: string;
  investorAddress: string;
  poolId: string;
  amount: number;
  expectedReturn: number;
  investedAt: Date;
  maturityDate: Date;
  withdrawn: boolean;
}

// Configurações dos pools de crédito
const CREDIT_POOLS: CreditPool[] = [
  {
    id: 'pool-30d',
    name: 'Credit Pool 30D',
    term: 30,
    apy: 9.2,
    totalSupplied: 250000,
    availableCapacity: 150000,
    maxCapacity: 400000,
    minInvestment: 1000,
    riskLevel: 'Low',
    activeLoans: 12,
    defaultRate: 0.8,
    businessScore: 8.5,
  },
  {
    id: 'pool-60d',
    name: 'Credit Pool 60D',
    term: 60,
    apy: 10.5,
    totalSupplied: 380000,
    availableCapacity: 220000,
    maxCapacity: 600000,
    minInvestment: 1000,
    riskLevel: 'Low',
    activeLoans: 18,
    defaultRate: 1.2,
    businessScore: 9.1,
  },
  {
    id: 'pool-90d',
    name: 'Credit Pool 90D',
    term: 90,
    apy: 8.7,
    totalSupplied: 520000,
    availableCapacity: 180000,
    maxCapacity: 700000,
    minInvestment: 1000,
    riskLevel: 'Medium',
    activeLoans: 25,
    defaultRate: 2.1,
    businessScore: 7.8,
  },
];

// Simulação de base de dados em memória
let creditApplications: CreditApplication[] = [];
let paymentOrders: PaymentOrder[] = [];
let investorPositions: InvestorPosition[] = [];

export class ChainFlowCreditService {
  
  /**
   * Analisar solicitação de crédito
   */
  static async analyzeCreditRequest(
    companyName: string,
    cnpj: string,
    monthlyRevenue: number,
    requestedAmount: number,
    term: 30 | 60 | 90,
    purpose: string
  ): Promise<{
    approved: boolean;
    businessScore: number;
    interestRate: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    maxAmount?: number;
  }> {
    
    // Simular delay de análise
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Critérios básicos de elegibilidade
    const MIN_MONTHLY_REVENUE = 5000; // R$ 5.000 mínimo de faturamento
    const MIN_REQUESTED_AMOUNT = 100; // R$ 100 mínimo de pedido
    const MAX_REQUESTED_AMOUNT = 500000; // R$ 500.000 máximo
    
    // Verificar critérios básicos
    if (monthlyRevenue < MIN_MONTHLY_REVENUE) {
      return {
        approved: false,
        businessScore: 0,
        interestRate: 0,
        riskLevel: 'High',
        maxAmount: 0
      };
    }
    
    if (requestedAmount < MIN_REQUESTED_AMOUNT || requestedAmount > MAX_REQUESTED_AMOUNT) {
      return {
        approved: false,
        businessScore: 0,
        interestRate: 0,
        riskLevel: 'High',
        maxAmount: 0
      };
    }
    
    // Lógica de scoring baseada em múltiplos fatores
    let score = 8.0; // Score base mais alto
    
    // Fator 1: Proporção do pedido vs faturamento mensal
    const revenueRatio = requestedAmount / monthlyRevenue;
    if (revenueRatio <= 0.1) score += 1.0; // Muito conservador
    else if (revenueRatio <= 0.2) score += 0.5; // Conservador
    else if (revenueRatio <= 0.3) score += 0; // Neutro
    else if (revenueRatio <= 0.5) score -= 0.5; // Arriscado
    else score -= 1.5; // Muito arriscado
    
    // Fator 2: Faturamento mensal (capacidade de pagamento)
    if (monthlyRevenue >= 100000) score += 1.0; // Empresa grande
    else if (monthlyRevenue >= 50000) score += 0.5; // Empresa média
    else if (monthlyRevenue >= 20000) score += 0; // Empresa pequena
    else if (monthlyRevenue >= 10000) score -= 0.5; // Micro empresa
    else score -= 1.0; // Muito pequena
    
    // Fator 3: Valor absoluto do pedido (risco operacional)
    if (requestedAmount <= 5000) score += 0.5; // Baixo risco
    else if (requestedAmount <= 20000) score += 0; // Risco médio
    else if (requestedAmount <= 100000) score -= 0.5; // Alto risco
    else score -= 1.0; // Muito alto risco
    
    // Fator 4: Prazo (risco temporal)
    if (term === 30) score += 0.5; // Menor risco
    else if (term === 60) score += 0; // Risco médio
    else score -= 0.5; // Maior risco (90 dias)
    
    // Fator 5: Análise do nome da empresa (simulação de outros fatores)
    if (companyName.toLowerCase().includes('ltda') || companyName.toLowerCase().includes('sa')) {
      score += 0.3; // Empresa formalizada
    }
    if (companyName.toLowerCase().includes('me') || companyName.toLowerCase().includes('mei')) {
      score += 0.1; // Micro empresa formalizada
    }
    
    // Normalizar score entre 6 e 10
    score = Math.max(6.0, Math.min(10.0, score));
    
    // Determinar aprovação (critério mais flexível)
    const approved = score >= 7.0; // Reduzido de 7.5 para 7.0
    
    // Calcular taxa de juros baseada no score
    const baseRate = term === 30 ? 2.65 : term === 60 ? 5.2 : 8.5;
    let riskAdjustment = 0;
    
    if (score < 7.5) riskAdjustment += 2.0;
    else if (score < 8.5) riskAdjustment += 1.0;
    else if (score < 9.5) riskAdjustment += 0.5;
    
    const finalRate = baseRate + riskAdjustment;
    
    // Determinar nível de risco
    let riskLevel: 'Low' | 'Medium' | 'High';
    if (score >= 9.0) riskLevel = 'Low';
    else if (score >= 7.5) riskLevel = 'Medium';
    else riskLevel = 'High';
    
    // Valor máximo aprovado baseado no score
    let maxAmount = 0;
    if (approved) {
      if (score >= 9.0) {
        maxAmount = requestedAmount; // 100% do solicitado
      } else if (score >= 8.0) {
        maxAmount = Math.floor(requestedAmount * 0.9); // 90% do solicitado
      } else {
        maxAmount = Math.floor(requestedAmount * 0.7); // 70% do solicitado
      }
      
      // Garantir que não exceda a capacidade de pagamento (20% do faturamento mensal)
      const maxByRevenue = Math.floor(monthlyRevenue * 0.2);
      maxAmount = Math.min(maxAmount, maxByRevenue);
    }
    
    return {
      approved,
      businessScore: Number(score.toFixed(1)),
      interestRate: Number(finalRate.toFixed(1)),
      riskLevel,
      maxAmount
    };
  }
  
  /**
   * Criar solicitação de crédito
   */
  static async createCreditApplication(
    companyName: string,
    cnpj: string,
    monthlyRevenue: number,
    requestedAmount: number,
    term: 30 | 60 | 90,
    purpose: string
  ): Promise<CreditApplication> {
    
    const analysis = await this.analyzeCreditRequest(
      companyName, cnpj, monthlyRevenue, requestedAmount, term, purpose
    );
    
    const application: CreditApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyName,
      cnpj,
      monthlyRevenue,
      requestedAmount,
      term,
      purpose,
      status: analysis.approved ? 'approved' : 'rejected',
      businessScore: analysis.businessScore,
      interestRate: analysis.interestRate,
      approvedAmount: analysis.maxAmount,
      createdAt: new Date(),
      approvedAt: analysis.approved ? new Date() : undefined,
      dueDate: analysis.approved ? 
        new Date(Date.now() + term * 24 * 60 * 60 * 1000) : 
        undefined
    };
    
    creditApplications.push(application);
    
    return application;
  }
  
  /**
   * Processar pagamento para fornecedor
   */
  static async processSupplierPayment(
    applicationId: string,
    supplierId: string,
    amount: number
  ): Promise<PaymentOrder> {
    
    const application = creditApplications.find(app => app.id === applicationId);
    if (!application || application.status !== 'approved') {
      throw new Error('Application not found or not approved');
    }
    
    // Verificar liquidez disponível nos pools
    const requiredPool = CREDIT_POOLS.find(pool => pool.term === application.term);
    if (!requiredPool || requiredPool.availableCapacity < amount) {
      throw new Error('Insufficient liquidity in credit pools');
    }
    
    // Gerar código PIX para o fornecedor
    const pixCode = this.generatePixCode(amount, supplierId);
    
    const paymentOrder: PaymentOrder = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      applicationId,
      supplierId,
      amount,
      pixCode,
      status: 'pending',
      createdAt: new Date()
    };
    
    paymentOrders.push(paymentOrder);
    
    // Simular processamento do pagamento PIX
    setTimeout(() => {
      this.completeSupplierPayment(paymentOrder.id);
    }, 5000);
    
    return paymentOrder;
  }
  
  /**
   * Completar pagamento do fornecedor
   */
  static completeSupplierPayment(paymentOrderId: string): void {
    const paymentOrder = paymentOrders.find(order => order.id === paymentOrderId);
    if (paymentOrder) {
      paymentOrder.status = 'paid';
      paymentOrder.paidAt = new Date();
      
      // Atualizar status da aplicação para ativo
      const application = creditApplications.find(app => app.id === paymentOrder.applicationId);
      if (application) {
        application.status = 'active';
      }
      
      // Reduzir liquidez disponível no pool
      const pool = CREDIT_POOLS.find(p => {
        const app = creditApplications.find(a => a.id === paymentOrder.applicationId);
        return app && p.term === app.term;
      });
      
      if (pool) {
        pool.availableCapacity -= paymentOrder.amount;
        pool.totalSupplied += paymentOrder.amount;
        pool.activeLoans += 1;
      }
    }
  }
  
  /**
   * Gerar cobrança PIX para comprador
   */
  static generateBuyerPixCharge(applicationId: string): {
    pixCode: string;
    amount: number;
    dueDate: Date;
  } {
    const application = creditApplications.find(app => app.id === applicationId);
    if (!application || !application.approvedAmount || !application.interestRate || !application.dueDate) {
      throw new Error('Application not found or incomplete');
    }
    
    // Calcular valor total com juros
    const principal = application.approvedAmount;
    const interest = (principal * application.interestRate * application.term) / (365 * 100);
    const totalAmount = principal + interest;
    
    const pixCode = this.generatePixCode(totalAmount, application.cnpj);
    
    return {
      pixCode,
      amount: totalAmount,
      dueDate: application.dueDate
    };
  }
  
  /**
   * Processar pagamento do comprador
   */
  static async processBuyerPayment(applicationId: string, paidAmount: number): Promise<void> {
    const application = creditApplications.find(app => app.id === applicationId);
    if (!application) {
      throw new Error('Application not found');
    }
    
    // Verificar se o valor está correto
    const expectedCharge = this.generateBuyerPixCharge(applicationId);
    if (Math.abs(paidAmount - expectedCharge.amount) > 0.01) {
      throw new Error('Payment amount mismatch');
    }
    
    // Marcar como completado
    application.status = 'completed';
    
    // Distribuir rendimentos para investidores
    await this.distributeReturnsToInvestors(application);
    
    // Retornar liquidez ao pool
    const pool = CREDIT_POOLS.find(p => p.term === application.term);
    if (pool) {
      pool.availableCapacity += paidAmount;
      pool.activeLoans -= 1;
    }
  }
  
  /**
   * Investir em pool de crédito
   */
  static async investInCreditPool(
    investorAddress: string,
    poolId: string,
    amount: number
  ): Promise<InvestorPosition> {
    
    const pool = CREDIT_POOLS.find(p => p.id === poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }
    
    if (amount < pool.minInvestment) {
      throw new Error('Amount below minimum investment');
    }
    
    if (amount > pool.availableCapacity) {
      throw new Error('Amount exceeds available capacity');
    }
    
    // Calcular retorno esperado
    const expectedReturn = amount * (1 + (pool.apy * pool.term) / (365 * 100));
    const maturityDate = new Date(Date.now() + pool.term * 24 * 60 * 60 * 1000);
    
    const position: InvestorPosition = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      investorAddress,
      poolId,
      amount,
      expectedReturn,
      investedAt: new Date(),
      maturityDate,
      withdrawn: false
    };
    
    investorPositions.push(position);
    
    // Atualizar pool
    pool.totalSupplied += amount;
    pool.availableCapacity -= amount;
    
    return position;
  }
  
  /**
   * Distribuir rendimentos para investidores
   */
  private static async distributeReturnsToInvestors(application: CreditApplication): Promise<void> {
    const pool = CREDIT_POOLS.find(p => p.term === application.term);
    if (!pool) return;
    
    // Encontrar investidores do pool
    const poolInvestors = investorPositions.filter(pos => 
      pos.poolId === pool.id && !pos.withdrawn
    );
    
    // Calcular rendimentos proporcionais
    const totalPoolInvestment = poolInvestors.reduce((sum, pos) => sum + pos.amount, 0);
    
    if (totalPoolInvestment === 0) return;
    
    const totalInterest = application.approvedAmount! * (application.interestRate! / 100) * (application.term / 365);
    
    poolInvestors.forEach(position => {
      const share = position.amount / totalPoolInvestment;
      const investorReturn = totalInterest * share;
      position.expectedReturn += investorReturn;
    });
  }
  
  /**
   * Gerar código PIX
   */
  private static generatePixCode(amount: number, identifier: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `PIX${timestamp}${amount.toFixed(2).replace('.', '')}${identifier.substr(-4)}${random}`.toUpperCase();
  }
  
  /**
   * Obter pools de crédito
   */
  static getCreditPools(): CreditPool[] {
    return [...CREDIT_POOLS];
  }
  
  /**
   * Obter aplicações de crédito
   */
  static getCreditApplications(filters?: {
    status?: CreditApplication['status'];
    companyName?: string;
  }): CreditApplication[] {
    let applications = [...creditApplications];
    
    if (filters?.status) {
      applications = applications.filter(app => app.status === filters.status);
    }
    
    if (filters?.companyName) {
      applications = applications.filter(app => 
        app.companyName.toLowerCase().includes(filters.companyName!.toLowerCase())
      );
    }
    
    return applications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  /**
   * Obter posições de investidor
   */
  static getInvestorPositions(investorAddress?: string): InvestorPosition[] {
    let positions = [...investorPositions];
    
    if (investorAddress) {
      positions = positions.filter(pos => pos.investorAddress === investorAddress);
    }
    
    return positions.sort((a, b) => b.investedAt.getTime() - a.investedAt.getTime());
  }
  
  /**
   * Obter métricas do sistema
   */
  static getSystemMetrics(): {
    totalLoaned: number;
    totalRepaid: number;
    activeLoans: number;
    defaultRate: number;
    averageAPY: number;
    totalInvestors: number;
    totalTVL: number;
  } {
    const totalLoaned = creditApplications
      .filter(app => app.status !== 'rejected')
      .reduce((sum, app) => sum + (app.approvedAmount || 0), 0);
    
    const totalRepaid = creditApplications
      .filter(app => app.status === 'completed')
      .reduce((sum, app) => sum + (app.approvedAmount || 0), 0);
    
    const activeLoans = creditApplications
      .filter(app => app.status === 'active').length;
    
    const defaultedLoans = creditApplications
      .filter(app => app.status === 'defaulted').length;
    
    const totalLoans = creditApplications
      .filter(app => app.status !== 'rejected').length;
    
    const defaultRate = totalLoans > 0 ? (defaultedLoans / totalLoans) * 100 : 0;
    
    const averageAPY = CREDIT_POOLS.reduce((sum, pool) => sum + pool.apy, 0) / CREDIT_POOLS.length;
    
    const totalInvestors = new Set(investorPositions.map(pos => pos.investorAddress)).size;
    
    const totalTVL = CREDIT_POOLS.reduce((sum, pool) => sum + pool.totalSupplied, 0);
    
    return {
      totalLoaned,
      totalRepaid,
      activeLoans,
      defaultRate,
      averageAPY,
      totalInvestors,
      totalTVL
    };
  }
}

