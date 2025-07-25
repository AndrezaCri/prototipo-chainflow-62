import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { BaseEcosystemService, getBaseEcosystemService } from '../services/baseEcosystemIntegration';

export const useBaseEcosystem = () => {
  const [service, setService] = useState<BaseEcosystemService | null>(null);
  const [ecosystemMetrics, setEcosystemMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar serviço
  useEffect(() => {
    const initializeService = async () => {
      try {
        // Usar provider padrão (em produção, seria conectado à carteira)
        const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
        const serviceInstance = getBaseEcosystemService(provider);
        setService(serviceInstance);
      } catch (err) {
        setError('Erro ao inicializar serviço Base');
        console.error('Error initializing Base service:', err);
      }
    };

    initializeService();
  }, []);

  // Carregar métricas do ecossistema
  const loadEcosystemMetrics = useCallback(async () => {
    if (!service) return;

    setLoading(true);
    setError(null);

    try {
      const metrics = await service.getEcosystemMetrics();
      setEcosystemMetrics(metrics);
    } catch (err) {
      setError('Erro ao carregar métricas do ecossistema');
      console.error('Error loading ecosystem metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Carregar métricas na inicialização
  useEffect(() => {
    if (service) {
      loadEcosystemMetrics();
    }
  }, [service, loadEcosystemMetrics]);

  // SeamlessFi operations
  const seamlessFiOperations = {
    supply: useCallback(async (asset: string, amount: string) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.seamlessFi.supply(asset, amount);
        await loadEcosystemMetrics(); // Refresh metrics
        return result;
      } catch (err) {
        setError('Erro ao fornecer liquidez no SeamlessFi');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    borrow: useCallback(async (asset: string, amount: string) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.seamlessFi.borrow(asset, amount);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao tomar empréstimo no SeamlessFi');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    repay: useCallback(async (asset: string, amount: string) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.seamlessFi.repay(asset, amount);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao quitar empréstimo no SeamlessFi');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    getAPYs: useCallback(async (asset: string) => {
      if (!service) throw new Error('Service not initialized');

      try {
        const [supplyAPY, borrowAPY] = await Promise.all([
          service.seamlessFi.getSupplyAPY(asset),
          service.seamlessFi.getBorrowAPY(asset)
        ]);
        return { supplyAPY, borrowAPY };
      } catch (err) {
        setError('Erro ao obter APYs do SeamlessFi');
        throw err;
      }
    }, [service]),

    getUserData: useCallback(async (userAddress: string) => {
      if (!service) throw new Error('Service not initialized');

      try {
        return await service.seamlessFi.getUserAccountData(userAddress);
      } catch (err) {
        setError('Erro ao obter dados do usuário no SeamlessFi');
        throw err;
      }
    }, [service])
  };

  // Aerodrome operations
  const aerodromeOperations = {
    addLiquidity: useCallback(async (tokenA: string, tokenB: string, amountA: string, amountB: string) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.aerodrome.addLiquidity(tokenA, tokenB, amountA, amountB);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao adicionar liquidez no Aerodrome');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    removeLiquidity: useCallback(async (tokenA: string, tokenB: string, liquidity: string) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.aerodrome.removeLiquidity(tokenA, tokenB, liquidity);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao remover liquidez do Aerodrome');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    swap: useCallback(async (amountIn: string, path: string[]) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.aerodrome.swapExactTokensForTokens(amountIn, path);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao fazer swap no Aerodrome');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    getSwapQuote: useCallback(async (amountIn: string, path: string[]) => {
      if (!service) throw new Error('Service not initialized');

      try {
        return await service.aerodrome.getAmountsOut(amountIn, path);
      } catch (err) {
        setError('Erro ao obter cotação do Aerodrome');
        throw err;
      }
    }, [service]),

    stakeLPTokens: useCallback(async (pairAddress: string, amount: string) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.aerodrome.stakeLPTokens(pairAddress, amount);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao fazer stake de LP tokens');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    claimRewards: useCallback(async (pairAddress: string) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.aerodrome.claimRewards(pairAddress);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao reivindicar recompensas');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics])
  };

  // Cygnus operations
  const cygnusOperations = {
    mint: useCallback(async (amount: string) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.cygnus.mint(amount);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao mint cgUSD no Cygnus');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    redeem: useCallback(async (amount: string) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.cygnus.redeem(amount);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao resgatar cgUSD no Cygnus');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    getYieldData: useCallback(async () => {
      if (!service) throw new Error('Service not initialized');

      try {
        const [apy, exchangeRate, totalSupply] = await Promise.all([
          service.cygnus.getAPY(),
          service.cygnus.getExchangeRate(),
          service.cygnus.getTotalSupply()
        ]);
        return { apy, exchangeRate, totalSupply };
      } catch (err) {
        setError('Erro ao obter dados de rendimento do Cygnus');
        throw err;
      }
    }, [service]),

    getRebaseHistory: useCallback(async (days: number = 30) => {
      if (!service) throw new Error('Service not initialized');

      try {
        return await service.cygnus.getRebaseHistory(days);
      } catch (err) {
        setError('Erro ao obter histórico de rebase');
        throw err;
      }
    }, [service])
  };

  // Spectral operations
  const spectralOperations = {
    submitProposal: useCallback(async (title: string, description: string, calldata: string) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.spectral.submitProposal(title, description, calldata);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao submeter proposta no Spectral');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    vote: useCallback(async (proposalId: string, support: boolean) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.spectral.vote(proposalId, support);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao votar no Spectral');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    getProposal: useCallback(async (proposalId: string) => {
      if (!service) throw new Error('Service not initialized');

      try {
        return await service.spectral.getProposal(proposalId);
      } catch (err) {
        setError('Erro ao obter proposta do Spectral');
        throw err;
      }
    }, [service]),

    getUserVotingPower: useCallback(async (userAddress: string) => {
      if (!service) throw new Error('Service not initialized');

      try {
        return await service.spectral.getUserVotingPower(userAddress);
      } catch (err) {
        setError('Erro ao obter poder de voto');
        throw err;
      }
    }, [service])
  };

  // Advanced operations
  const advancedOperations = {
    optimizeYield: useCallback(async (amount: string) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.optimizeYieldWithSeamlessFi(amount);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao otimizar rendimento');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    manageBRZUSDCLiquidity: useCallback(async (
      action: 'add' | 'remove',
      usdcAmount?: string,
      brzAmount?: string,
      lpAmount?: string
    ) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.manageBRZUSDCLiquidity(action, usdcAmount, brzAmount, lpAmount);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao gerenciar liquidez BRZ/USDC');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    implementCygnusStrategy: useCallback(async (amount: string) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.implementCygnusYieldStrategy(amount);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao implementar estratégia Cygnus');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    participateInGovernance: useCallback(async (
      action: 'propose' | 'vote',
      proposalData?: { title: string; description: string; calldata: string },
      voteData?: { proposalId: string; support: boolean }
    ) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.participateInGovernance(action, proposalData, voteData);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao participar da governança');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics]),

    executeOptimizationStrategy: useCallback(async (
      totalAmount: string,
      strategy: {
        seamlessFiAllocation: number;
        aerodromeAllocation: number;
        cygnusAllocation: number;
      }
    ) => {
      if (!service) throw new Error('Service not initialized');
      setLoading(true);
      setError(null);

      try {
        const result = await service.executeOptimizationStrategy(totalAmount, strategy);
        await loadEcosystemMetrics();
        return result;
      } catch (err) {
        setError('Erro ao executar estratégia de otimização');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [service, loadEcosystemMetrics])
  };

  // Utility functions
  const formatAPY = useCallback((apy: number): string => {
    return `${apy.toFixed(2)}%`;
  }, []);

  const formatAmount = useCallback((amount: string, decimals: number = 6): string => {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }, []);

  const calculateProjectedReturns = useCallback((
    principal: string,
    apy: number,
    days: number
  ): string => {
    const principalValue = parseFloat(principal);
    const dailyRate = apy / 365 / 100;
    const returns = principalValue * dailyRate * days;
    return returns.toString();
  }, []);

  const getOptimalAllocation = useCallback((
    totalAmount: string,
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  ) => {
    const allocations = {
      conservative: {
        seamlessFiAllocation: 60,
        aerodromeAllocation: 20,
        cygnusAllocation: 20
      },
      moderate: {
        seamlessFiAllocation: 40,
        aerodromeAllocation: 35,
        cygnusAllocation: 25
      },
      aggressive: {
        seamlessFiAllocation: 25,
        aerodromeAllocation: 50,
        cygnusAllocation: 25
      }
    };

    return allocations[riskTolerance];
  }, []);

  return {
    // Estados
    service,
    ecosystemMetrics,
    loading,
    error,

    // Operações por protocolo
    seamlessFi: seamlessFiOperations,
    aerodrome: aerodromeOperations,
    cygnus: cygnusOperations,
    spectral: spectralOperations,

    // Operações avançadas
    advanced: advancedOperations,

    // Utilitários
    formatAPY,
    formatAmount,
    calculateProjectedReturns,
    getOptimalAllocation,

    // Recarregar dados
    loadEcosystemMetrics,

    // Limpar erro
    clearError: () => setError(null)
  };
};

