import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { 
  realChainFlowCreditService,
  CreditApplication,
  CreditApplicationForm,
  SupplierPayment,
  PoolInfo,
  CreditStatus
} from '@/services/realChainFlowCredit';

export interface UseRealChainFlowCreditReturn {
  // Estado
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
  
  // Dados
  userApplications: CreditApplication[];
  poolInfo: PoolInfo | null;
  usdcBalance: string;
  supplierBalance: string;
  
  // Funções
  createApplication: (form: CreditApplicationForm) => Promise<{ success: boolean; applicationId?: string; error?: string }>;
  processPayment: (payment: SupplierPayment) => Promise<{ success: boolean; paymentId?: string; error?: string }>;
  repayCredit: (applicationId: string) => Promise<{ success: boolean; error?: string }>;
  supplyLiquidity: (amount: string) => Promise<{ success: boolean; error?: string }>;
  withdrawLiquidity: (amount: string) => Promise<{ success: boolean; error?: string }>;
  approveUSDC: (amount: string) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
  getApplication: (applicationId: string) => Promise<CreditApplication | null>;
}

export const useRealChainFlowCredit = (): UseRealChainFlowCreditReturn => {
  // Estados
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userApplications, setUserApplications] = useState<CreditApplication[]>([]);
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [supplierBalance, setSupplierBalance] = useState('0');

  // Hooks do Wagmi
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  /**
   * Inicializar serviço quando carteira conectar
   */
  useEffect(() => {
    const initializeService = async () => {
      if (isConnected && walletClient && publicClient && address) {
        setLoading(true);
        setError(null);
        
        try {
          const success = await realChainFlowCreditService.initialize(walletClient, publicClient);
          setIsInitialized(success);
          
          if (success) {
            await refreshData();
          } else {
            setError('Falha ao inicializar serviço de crédito');
          }
        } catch (err: any) {
          console.error('Erro ao inicializar:', err);
          setError(err.message || 'Erro desconhecido');
          setIsInitialized(false);
        } finally {
          setLoading(false);
        }
      } else {
        setIsInitialized(false);
        setUserApplications([]);
        setPoolInfo(null);
        setUsdcBalance('0');
        setSupplierBalance('0');
      }
    };

    initializeService();
  }, [isConnected, walletClient, publicClient, address]);

  /**
   * Atualizar dados do usuário
   */
  const refreshData = useCallback(async () => {
    if (!isInitialized || !address) return;

    try {
      setLoading(true);
      
      // Buscar dados em paralelo
      const [applications, pool, balance, supplierBal] = await Promise.all([
        realChainFlowCreditService.getUserApplications(address),
        realChainFlowCreditService.getPoolInfo(),
        realChainFlowCreditService.getUSDCBalance(address),
        realChainFlowCreditService.getSupplierBalance(address)
      ]);

      setUserApplications(applications);
      setPoolInfo(pool);
      setUsdcBalance(balance);
      setSupplierBalance(supplierBal);
      
    } catch (err: any) {
      console.error('Erro ao atualizar dados:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [isInitialized, address]);

  /**
   * Criar nova aplicação de crédito
   */
  const createApplication = useCallback(async (form: CreditApplicationForm) => {
    if (!isInitialized) {
      return { success: false, error: 'Serviço não inicializado' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await realChainFlowCreditService.createCreditApplication(form);
      
      if (result.success) {
        // Atualizar lista de aplicações
        await refreshData();
      } else {
        setError(result.error || 'Erro ao criar aplicação');
      }

      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro desconhecido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [isInitialized, refreshData]);

  /**
   * Processar pagamento ao fornecedor
   */
  const processPayment = useCallback(async (payment: SupplierPayment) => {
    if (!isInitialized) {
      return { success: false, error: 'Serviço não inicializado' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await realChainFlowCreditService.processSupplierPayment(payment);
      
      if (result.success) {
        // Atualizar dados
        await refreshData();
      } else {
        setError(result.error || 'Erro ao processar pagamento');
      }

      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro desconhecido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [isInitialized, refreshData]);

  /**
   * Pagar crédito
   */
  const repayCredit = useCallback(async (applicationId: string) => {
    if (!isInitialized) {
      return { success: false, error: 'Serviço não inicializado' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await realChainFlowCreditService.repayCredit(applicationId);
      
      if (result.success) {
        // Atualizar dados
        await refreshData();
      } else {
        setError(result.error || 'Erro ao pagar crédito');
      }

      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro desconhecido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [isInitialized, refreshData]);

  /**
   * Fornecer liquidez
   */
  const supplyLiquidity = useCallback(async (amount: string) => {
    if (!isInitialized) {
      return { success: false, error: 'Serviço não inicializado' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await realChainFlowCreditService.supplyLiquidity(amount);
      
      if (result.success) {
        // Atualizar dados
        await refreshData();
      } else {
        setError(result.error || 'Erro ao fornecer liquidez');
      }

      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro desconhecido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [isInitialized, refreshData]);

  /**
   * Retirar liquidez
   */
  const withdrawLiquidity = useCallback(async (amount: string) => {
    if (!isInitialized) {
      return { success: false, error: 'Serviço não inicializado' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await realChainFlowCreditService.withdrawLiquidity(amount);
      
      if (result.success) {
        // Atualizar dados
        await refreshData();
      } else {
        setError(result.error || 'Erro ao retirar liquidez');
      }

      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro desconhecido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [isInitialized, refreshData]);

  /**
   * Aprovar tokens USDC
   */
  const approveUSDC = useCallback(async (amount: string) => {
    if (!isInitialized) {
      return { success: false, error: 'Serviço não inicializado' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await realChainFlowCreditService.approveUSDC(amount);
      
      if (result.success) {
        // Atualizar saldo
        if (address) {
          const balance = await realChainFlowCreditService.getUSDCBalance(address);
          setUsdcBalance(balance);
        }
      } else {
        setError(result.error || 'Erro ao aprovar tokens');
      }

      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro desconhecido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [isInitialized, address]);

  /**
   * Buscar aplicação específica
   */
  const getApplication = useCallback(async (applicationId: string): Promise<CreditApplication | null> => {
    if (!isInitialized) return null;

    try {
      return await realChainFlowCreditService.getCreditApplication(applicationId);
    } catch (err: any) {
      console.error('Erro ao buscar aplicação:', err);
      return null;
    }
  }, [isInitialized]);

  /**
   * Atualizar dados periodicamente
   */
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      refreshData();
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, [isInitialized, refreshData]);

  return {
    // Estado
    isInitialized,
    loading,
    error,
    
    // Dados
    userApplications,
    poolInfo,
    usdcBalance,
    supplierBalance,
    
    // Funções
    createApplication,
    processPayment,
    repayCredit,
    supplyLiquidity,
    withdrawLiquidity,
    approveUSDC,
    refreshData,
    getApplication
  };
};

// Hook para estatísticas do usuário
export const useUserCreditStats = () => {
  const { userApplications, poolInfo, supplierBalance } = useRealChainFlowCredit();

  const stats = {
    totalApplications: userApplications.length,
    approvedApplications: userApplications.filter(app => app.status === CreditStatus.Approved).length,
    activeCredits: userApplications.filter(app => app.status === CreditStatus.Active).length,
    paidCredits: userApplications.filter(app => app.status === CreditStatus.Paid).length,
    totalBorrowed: userApplications
      .filter(app => app.status === CreditStatus.Active || app.status === CreditStatus.Paid)
      .reduce((sum, app) => sum + parseFloat(app.approvedAmount), 0),
    suppliedLiquidity: parseFloat(supplierBalance),
    poolUtilization: poolInfo?.utilizationRate || 0
  };

  return stats;
};

