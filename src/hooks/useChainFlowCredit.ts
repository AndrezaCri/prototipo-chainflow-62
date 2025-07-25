import { useState, useEffect, useCallback } from 'react';
import { 
  ChainFlowCreditService, 
  CreditApplication, 
  CreditPool, 
  InvestorPosition,
  PaymentOrder 
} from '../services/chainflowCredit';
import { isDemoMode, simulateTransactionDelay, DEMO_CONFIG } from '../config/demoMode';

export interface CreditAnalysisResult {
  approved: boolean;
  businessScore: number;
  interestRate: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  maxAmount?: number;
}

export const useChainFlowCredit = () => {
  const [creditPools, setCreditPools] = useState<CreditPool[]>([]);
  const [applications, setApplications] = useState<CreditApplication[]>([]);
  const [investorPositions, setInvestorPositions] = useState<InvestorPosition[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadCreditPools();
    loadSystemMetrics();
  }, []);

  const loadCreditPools = useCallback(() => {
    try {
      const pools = ChainFlowCreditService.getCreditPools();
      setCreditPools(pools);
    } catch (err) {
      setError('Erro ao carregar pools de crédito');
      console.error('Error loading credit pools:', err);
    }
  }, []);

  const loadApplications = useCallback((filters?: { status?: CreditApplication['status']; companyName?: string }) => {
    try {
      const apps = ChainFlowCreditService.getCreditApplications(filters);
      setApplications(apps);
    } catch (err) {
      setError('Erro ao carregar aplicações');
      console.error('Error loading applications:', err);
    }
  }, []);

  const loadInvestorPositions = useCallback((investorAddress?: string) => {
    try {
      const positions = ChainFlowCreditService.getInvestorPositions(investorAddress);
      setInvestorPositions(positions);
    } catch (err) {
      setError('Erro ao carregar posições de investidor');
      console.error('Error loading investor positions:', err);
    }
  }, []);

  const loadSystemMetrics = useCallback(() => {
    try {
      const metrics = ChainFlowCreditService.getSystemMetrics();
      setSystemMetrics(metrics);
    } catch (err) {
      setError('Erro ao carregar métricas do sistema');
      console.error('Error loading system metrics:', err);
    }
  }, []);

  // Analisar solicitação de crédito
  const analyzeCreditRequest = useCallback(async (
    companyName: string,
    cnpj: string,
    monthlyRevenue: number,
    requestedAmount: number,
    term: 30 | 60 | 90,
    purpose: string
  ): Promise<CreditAnalysisResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ChainFlowCreditService.analyzeCreditRequest(
        companyName, cnpj, monthlyRevenue, requestedAmount, term, purpose
      );
      return result;
    } catch (err) {
      setError('Erro na análise de crédito');
      console.error('Error analyzing credit request:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar aplicação de crédito
  const createCreditApplication = useCallback(async (
    companyName: string,
    cnpj: string,
    monthlyRevenue: number,
    requestedAmount: number,
    term: 30 | 60 | 90,
    purpose: string
  ): Promise<CreditApplication | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const application = await ChainFlowCreditService.createCreditApplication(
        companyName, cnpj, monthlyRevenue, requestedAmount, term, purpose
      );
      
      // Recarregar dados
      loadApplications();
      loadSystemMetrics();
      loadCreditPools();
      
      return application;
    } catch (err) {
      setError('Erro ao criar aplicação de crédito');
      console.error('Error creating credit application:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadApplications, loadSystemMetrics, loadCreditPools]);

  // Processar pagamento para fornecedor
  const processSupplierPayment = useCallback(async (
    applicationId: string,
    supplierId: string,
    amount: number
  ): Promise<PaymentOrder | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const paymentOrder = await ChainFlowCreditService.processSupplierPayment(
        applicationId, supplierId, amount
      );
      
      // Recarregar dados
      loadApplications();
      loadSystemMetrics();
      loadCreditPools();
      
      return paymentOrder;
    } catch (err) {
      setError('Erro ao processar pagamento do fornecedor');
      console.error('Error processing supplier payment:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadApplications, loadSystemMetrics, loadCreditPools]);

  // Gerar cobrança PIX para comprador
  const generateBuyerPixCharge = useCallback((applicationId: string) => {
    try {
      return ChainFlowCreditService.generateBuyerPixCharge(applicationId);
    } catch (err) {
      setError('Erro ao gerar cobrança PIX');
      console.error('Error generating PIX charge:', err);
      return null;
    }
  }, []);

  // Processar pagamento do comprador
  const processBuyerPayment = useCallback(async (
    applicationId: string,
    paidAmount: number
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await ChainFlowCreditService.processBuyerPayment(applicationId, paidAmount);
      
      // Recarregar dados
      loadApplications();
      loadSystemMetrics();
      loadCreditPools();
      loadInvestorPositions();
      
      return true;
    } catch (err) {
      setError('Erro ao processar pagamento do comprador');
      console.error('Error processing buyer payment:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadApplications, loadSystemMetrics, loadCreditPools, loadInvestorPositions]);

  // Investir em pool de crédito
  const investInCreditPool = useCallback(async (
    investorAddress: string,
    poolId: string,
    amount: number
  ): Promise<InvestorPosition | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const position = await ChainFlowCreditService.investInCreditPool(
        investorAddress, poolId, amount
      );
      
      // Recarregar dados
      loadInvestorPositions(investorAddress);
      loadSystemMetrics();
      loadCreditPools();
      
      return position;
    } catch (err) {
      setError('Erro ao investir no pool de crédito');
      console.error('Error investing in credit pool:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadInvestorPositions, loadSystemMetrics, loadCreditPools]);

  // Calcular valor total com juros
  const calculateTotalWithInterest = useCallback((
    principal: number,
    interestRate: number,
    termDays: number
  ): number => {
    const interest = (principal * interestRate * termDays) / (365 * 100);
    return principal + interest;
  }, []);

  // Calcular desconto à vista
  const calculateCashDiscount = useCallback((amount: number, discountPercent: number = 5): number => {
    return amount * (discountPercent / 100);
  }, []);

  // Verificar elegibilidade para crédito
  const checkCreditEligibility = useCallback((
    monthlyRevenue: number,
    requestedAmount: number
  ): {
    eligible: boolean;
    reason?: string;
    maxRecommended?: number;
  } => {
    // Verificações básicas de elegibilidade
    if (monthlyRevenue < 5000) {
      return {
        eligible: false,
        reason: 'Faturamento mensal muito baixo (mínimo R$ 5.000)'
      };
    }
    
    const revenueRatio = requestedAmount / monthlyRevenue;
    
    if (revenueRatio > 0.8) {
      return {
        eligible: false,
        reason: 'Valor solicitado muito alto em relação ao faturamento',
        maxRecommended: Math.floor(monthlyRevenue * 0.5)
      };
    }
    
    // Valor mínimo baseado no faturamento (0.5% do faturamento mensal, mínimo R$ 100)
    const minAmount = Math.max(100, Math.floor(monthlyRevenue * 0.005));
    if (requestedAmount < minAmount) {
      return {
        eligible: false,
        reason: `Valor muito baixo para análise de crédito (mínimo R$ ${minAmount.toFixed(2)})`
      };
    }
    
    if (requestedAmount > 500000) {
      return {
        eligible: false,
        reason: 'Valor máximo para crédito é R$ 500.000'
      };
    }
    
    return { eligible: true };
  }, []);

  // Obter taxa de juros estimada
  const getEstimatedInterestRate = useCallback((
    monthlyRevenue: number,
    requestedAmount: number,
    term: 30 | 60 | 90
  ): number => {
    const baseRate = term === 30 ? 2.65 : term === 60 ? 4.2 : 6.8;
    const revenueRatio = requestedAmount / monthlyRevenue;
    
    let riskAdjustment = 0;
    if (revenueRatio > 0.4) riskAdjustment += 2;
    else if (revenueRatio > 0.3) riskAdjustment += 1.5;
    else if (revenueRatio > 0.2) riskAdjustment += 1;
    
    if (monthlyRevenue < 20000) riskAdjustment += 1;
    if (requestedAmount > 100000) riskAdjustment += 0.5;
    
    return Number((baseRate + riskAdjustment).toFixed(1));
  }, []);

  return {
    // Estados
    creditPools,
    applications,
    investorPositions,
    systemMetrics,
    loading,
    error,
    
    // Ações
    analyzeCreditRequest,
    createCreditApplication,
    processSupplierPayment,
    generateBuyerPixCharge,
    processBuyerPayment,
    investInCreditPool,
    
    // Utilitários
    calculateTotalWithInterest,
    calculateCashDiscount,
    checkCreditEligibility,
    getEstimatedInterestRate,
    
    // Recarregar dados
    loadCreditPools,
    loadApplications,
    loadInvestorPositions,
    loadSystemMetrics,
    
    // Limpar erro
    clearError: () => setError(null)
  };
};

