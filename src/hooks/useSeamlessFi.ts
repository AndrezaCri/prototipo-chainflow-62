import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

// ABI simplificado do contrato SeamlessFi
const SEAMLESSFI_ABI = [
  {
    "inputs": [
      {"name": "_poolId", "type": "uint256"},
      {"name": "_amount", "type": "uint256"}
    ],
    "name": "investInPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_poolId", "type": "uint256"},
      {"name": "_amount", "type": "uint256"},
      {"name": "_businessScore", "type": "uint256"},
      {"name": "_companyName", "type": "string"},
      {"name": "_cnpj", "type": "string"}
    ],
    "name": "requestLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_poolId", "type": "uint256"}],
    "name": "getPoolInfo",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "name", "type": "string"},
          {"name": "term", "type": "uint256"},
          {"name": "apy", "type": "uint256"},
          {"name": "totalSupplied", "type": "uint256"},
          {"name": "availableCapacity", "type": "uint256"},
          {"name": "maxCapacity", "type": "uint256"},
          {"name": "minInvestment", "type": "uint256"},
          {"name": "riskLevel", "type": "uint8"},
          {"name": "active", "type": "bool"},
          {"name": "createdAt", "type": "uint256"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_user", "type": "address"}],
    "name": "getUserInvestments",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_user", "type": "address"}],
    "name": "getUserLoans",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Endereço do contrato (será atualizado após deploy)
const SEAMLESSFI_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890' as const;

interface PoolInfo {
  id: bigint;
  name: string;
  term: bigint;
  apy: bigint;
  totalSupplied: bigint;
  availableCapacity: bigint;
  maxCapacity: bigint;
  minInvestment: bigint;
  riskLevel: number;
  active: boolean;
  createdAt: bigint;
}

interface LoanRequest {
  poolId: number;
  amount: number;
  businessScore: number;
  companyName: string;
  cnpj: string;
}

export const useSeamlessFi = () => {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Ler informações do pool
  const usePoolInfo = (poolId: number) => {
    return useReadContract({
      address: SEAMLESSFI_CONTRACT_ADDRESS,
      abi: SEAMLESSFI_ABI,
      functionName: 'getPoolInfo',
      args: [BigInt(poolId)],
      query: {
        enabled: poolId > 0,
      },
    });
  };

  // Ler investimentos do usuário
  const useUserInvestments = () => {
    return useReadContract({
      address: SEAMLESSFI_CONTRACT_ADDRESS,
      abi: SEAMLESSFI_ABI,
      functionName: 'getUserInvestments',
      args: address ? [address] : undefined,
      query: {
        enabled: !!address && isConnected,
      },
    });
  };

  // Ler empréstimos do usuário
  const useUserLoans = () => {
    return useReadContract({
      address: SEAMLESSFI_CONTRACT_ADDRESS,
      abi: SEAMLESSFI_ABI,
      functionName: 'getUserLoans',
      args: address ? [address] : undefined,
      query: {
        enabled: !!address && isConnected,
      },
    });
  };

  // Investir em pool
  const investInPool = async (poolId: number, amount: number) => {
    if (!isConnected) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const amountInWei = parseUnits(amount.toString(), 6); // USDC tem 6 decimais

      writeContract({
        address: SEAMLESSFI_CONTRACT_ADDRESS,
        abi: SEAMLESSFI_ABI,
        functionName: 'investInPool',
        args: [BigInt(poolId), amountInWei],
      });

      return true;
    } catch (err: any) {
      setError(err.message || 'Investment failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Solicitar empréstimo
  const requestLoan = async (loanData: LoanRequest) => {
    if (!isConnected) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const amountInWei = parseUnits(loanData.amount.toString(), 6);
      const businessScoreScaled = BigInt(Math.round(loanData.businessScore * 100)); // Score * 100 para precisão

      writeContract({
        address: SEAMLESSFI_CONTRACT_ADDRESS,
        abi: SEAMLESSFI_ABI,
        functionName: 'requestLoan',
        args: [
          BigInt(loanData.poolId),
          amountInWei,
          businessScoreScaled,
          loanData.companyName,
          loanData.cnpj,
        ],
      });

      return true;
    } catch (err: any) {
      setError(err.message || 'Loan request failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular APY real baseado no business score
  const calculateRealAPY = (baseAPY: number, businessScore: number, riskLevel: number): number => {
    let adjustment = 0;

    // Ajuste baseado no risco
    if (riskLevel === 1) { // Medium
      adjustment += 1;
    } else if (riskLevel === 2) { // High
      adjustment += 2;
    }

    // Ajuste baseado no business score
    if (businessScore < 8.5) {
      adjustment += 2;
    } else if (businessScore < 9.0) {
      adjustment += 1;
    }

    return baseAPY + adjustment;
  };

  // Formatar valores USDC
  const formatUSDC = (value: bigint): string => {
    return formatUnits(value, 6);
  };

  // Converter APY de basis points para porcentagem
  const formatAPY = (apy: bigint): number => {
    return Number(apy) / 100; // basis points para porcentagem
  };

  // Obter dados simulados dos pools (para desenvolvimento)
  const getPoolsData = () => {
    return [
      {
        id: 1,
        name: 'Credit Pool 30D',
        term: 30,
        apy: 9.2,
        totalSupplied: 250000,
        availableCapacity: 150000,
        maxCapacity: 400000,
        minInvestment: 1000,
        riskLevel: 0, // Low
        active: true,
        activeLoans: 12,
        defaultRate: 0.8,
        businessScore: 8.5,
      },
      {
        id: 2,
        name: 'Credit Pool 60D',
        term: 60,
        apy: 10.5,
        totalSupplied: 380000,
        availableCapacity: 220000,
        maxCapacity: 600000,
        minInvestment: 1000,
        riskLevel: 0, // Low
        active: true,
        activeLoans: 18,
        defaultRate: 1.2,
        businessScore: 9.1,
      },
      {
        id: 3,
        name: 'Credit Pool 90D',
        term: 90,
        apy: 8.7,
        totalSupplied: 520000,
        availableCapacity: 180000,
        maxCapacity: 700000,
        minInvestment: 1000,
        riskLevel: 1, // Medium
        active: true,
        activeLoans: 25,
        defaultRate: 2.1,
        businessScore: 7.8,
      },
    ];
  };

  // Simular análise de crédito
  const analyzeCreditRequest = (
    amount: number,
    monthlyRevenue: number,
    term: number
  ): Promise<{
    approved: boolean;
    businessScore: number;
    interestRate: number;
    riskLevel: 'Low' | 'Medium' | 'High';
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Lógica simplificada de análise
        const revenueRatio = amount / monthlyRevenue;
        let score = 10 - (revenueRatio * 2); // Score baseado na proporção
        score = Math.max(6, Math.min(10, score)); // Entre 6 e 10

        const baseRate = term === 30 ? 9.2 : term === 60 ? 10.5 : 8.7;
        const riskAdjustment = score < 8 ? 2 : score < 9 ? 1 : 0;
        const finalRate = baseRate + riskAdjustment;

        const riskLevel = score >= 9 ? 'Low' : score >= 8 ? 'Medium' : 'High';
        const approved = score >= 7.5;

        resolve({
          approved,
          businessScore: Number(score.toFixed(1)),
          interestRate: Number(finalRate.toFixed(1)),
          riskLevel,
        });
      }, 2000); // Simular delay de análise
    });
  };

  return {
    // Estado
    isLoading: isLoading || isPending || isConfirming,
    error,
    isConnected,
    isConfirmed,
    
    // Hooks de leitura
    usePoolInfo,
    useUserInvestments,
    useUserLoans,
    
    // Funções de escrita
    investInPool,
    requestLoan,
    
    // Utilitários
    calculateRealAPY,
    formatUSDC,
    formatAPY,
    getPoolsData,
    analyzeCreditRequest,
    
    // Reset error
    clearError: () => setError(null),
  };
};

