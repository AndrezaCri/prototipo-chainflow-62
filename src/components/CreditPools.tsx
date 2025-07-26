import React, { useState, useEffect } from 'react';
import { TrendingUp, Shield, Clock, DollarSign, Users, BarChart3, AlertTriangle } from 'lucide-react';
import { useSeamlessFi } from '@/hooks/useSeamlessFi';
import { useBalance } from 'wagmi';
import { useAccount } from 'wagmi';

interface CreditPoolsProps {
  onInvest?: (poolId: string, amount: number) => void;
}

export const CreditPools: React.FC<CreditPoolsProps> = ({ onInvest }) => {
  const { getPoolsData, investInPool, isLoading, error, isConnected } = useSeamlessFi();
  const { address } = useAccount();
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [selectedTerm, setSelectedTerm] = useState<number>(30);
  const [isInvesting, setIsInvesting] = useState(false);
  
  // BRZ token address (Base network)
  const BRZ_TOKEN_ADDRESS = '0x420000000000000000000000000000000000000A';
  
  const { data: brzBalance } = useBalance({
    address: address as `0x${string}`,
    token: BRZ_TOKEN_ADDRESS as `0x${string}`,
  });

  const creditPools = getPoolsData();

  const handleInvest = async (poolId: string) => {
    const pool = creditPools.find(p => p.id.toString() === poolId);
    if (!pool || investmentAmount < 100) {
      alert('Valor mínimo de investimento é R$ 100');
      return;
    }

    if (!isConnected) {
      alert('Conecte sua carteira para investir');
      return;
    }

    // Para investir, precisa ter 10% do valor em BRZ
    const requiredBrz = investmentAmount * 0.1;
    const brzBalanceValue = brzBalance ? Number(brzBalance.formatted) : 0;
    
    if (brzBalanceValue < requiredBrz) {
      alert(`Saldo insuficiente. Para investir ${formatCurrency(investmentAmount)}, você precisa de ${requiredBrz.toFixed(2)} BRZ. Saldo atual: ${brzBalanceValue.toFixed(2)} BRZ`);
      return;
    }

    setIsInvesting(true);
    
    try {
      const success = await investInPool(pool.id, investmentAmount);
      
      if (success) {
        if (onInvest) {
          onInvest(poolId, investmentAmount);
        }
        setSelectedPool(null);
        setInvestmentAmount(0);
        setSelectedTerm(30);
        alert('Investimento realizado com sucesso!');
      }
    } catch (err) {
      console.error('Investment failed:', err);
      alert('Falha no investimento. Tente novamente.');
    } finally {
      setIsInvesting(false);
    }
  };

  const getMaxInvestmentForTerm = (term: number): number => {
    const brzBalanceValue = brzBalance ? Number(brzBalance.formatted) : 0;
    const maxByBalance = brzBalanceValue * 10; // 1 BRZ = R$ 10 de investimento
    
    // Definir limites baseados no prazo
    if (term === 30) return Math.min(maxByBalance, 10000); // Máximo R$ 10.000 para 30 dias
    if (term === 60) return Math.min(maxByBalance, 50000); // Máximo R$ 50.000 para 60 dias
    if (term === 90) return Math.min(maxByBalance, 100000); // Máximo R$ 100.000 para 90 dias
    
    return maxByBalance;
  };

  const getAvailableTerms = (): number[] => {
    const brzBalanceValue = brzBalance ? Number(brzBalance.formatted) : 0;
    const terms: number[] = [];
    
    // Para investir R$ 100, precisa ter 10 BRZ
    if (brzBalanceValue >= 10) terms.push(30); // Mínimo 10 BRZ para 30 dias
    if (brzBalanceValue >= 50) terms.push(60); // Mínimo 50 BRZ para 60 dias  
    if (brzBalanceValue >= 100) terms.push(90); // Mínimo 100 BRZ para 90 dias
    
    return terms;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatUSDC = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + ' USDC';
  };

  const getRiskLevel = (riskLevel: number) => {
    switch (riskLevel) {
      case 0: return 'text-green-600 bg-green-100';
      case 1: return 'text-yellow-600 bg-yellow-100';
      case 2: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelText = (riskLevel: number) => {
    switch (riskLevel) {
      case 0: return 'Low';
      case 1: return 'Medium';
      case 2: return 'High';
      default: return 'Unknown';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-[#c1e428]" />
          Credit Pools - SeamlessFi Integration
        </h2>
        <p className="text-gray-600">
          Invista em pools de crédito B2B e ganhe rendimentos competitivos financiando PMEs brasileiras
        </p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value Locked</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatUSDC(creditPools.reduce((acc, pool) => acc + pool.totalSupplied, 0))}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-[#c1e428]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average APY</p>
              <p className="text-2xl font-bold text-gray-900">
                {(creditPools.reduce((acc, pool) => acc + pool.apy, 0) / creditPools.length).toFixed(1)}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900">
                {creditPools.reduce((acc, pool) => acc + pool.activeLoans, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Default Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {(creditPools.reduce((acc, pool) => acc + pool.defaultRate, 0) / creditPools.length).toFixed(1)}%
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Credit Pools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {creditPools.map((pool) => (
          <div key={pool.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              {/* Header do Pool */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{pool.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevel(pool.riskLevel)}`}>
                  {getRiskLevelText(pool.riskLevel)} Risk
                </span>
              </div>

              {/* Métricas Principais */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#c1e428]">{pool.apy}%</div>
                  <div className="text-sm text-gray-600">APY</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{pool.term}d</div>
                  <div className="text-sm text-gray-600">Term</div>
                </div>
              </div>

              {/* Informações Detalhadas */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Supplied</span>
                  <span className="font-semibold">{formatUSDC(pool.totalSupplied)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available Capacity</span>
                  <span className="font-semibold">{formatUSDC(pool.availableCapacity)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Business Score</span>
                  <span className="font-semibold">{pool.businessScore}/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Loans</span>
                  <span className="font-semibold">{pool.activeLoans}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Default Rate</span>
                  <span className="font-semibold">{pool.defaultRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Next Maturity</span>
                  <span className="font-semibold">
                    {new Date(Date.now() + pool.term * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Pool Utilization</span>
                  <span>{Math.round((pool.totalSupplied / (pool.totalSupplied + pool.availableCapacity)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#c1e428] h-2 rounded-full" 
                    style={{ 
                      width: `${(pool.totalSupplied / (pool.totalSupplied + pool.availableCapacity)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Botão de Investimento */}
              <button
                onClick={() => setSelectedPool(pool.id.toString())}
                disabled={!isConnected}
                className="w-full bg-[#c1e428] text-black font-semibold py-3 px-4 rounded-lg hover:bg-[#a8c523] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnected ? 'Invest Now' : 'Connect Wallet to Invest'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Investimento Unificado */}
      {selectedPool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Investimento em Credit Pool
            </h3>
            
            {/* Pool selecionado */}
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Pool selecionado:</span>
                <span className="font-bold text-green-700">
                  {creditPools.find(p => p.id.toString() === selectedPool)?.name}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                APY: {creditPools.find(p => p.id.toString() === selectedPool)?.apy}%
              </div>
            </div>

            {/* Seleção de Prazo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prazo do Investimento
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[30, 60, 90].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSelectedTerm(term);
                      setInvestmentAmount(0);
                    }}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedTerm === term 
                        ? 'border-[#c1e428] bg-[#c1e428] text-black' 
                        : 'border-gray-300 hover:border-[#c1e428] bg-white'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-lg">{term}</div>
                      <div className="text-xs">dias</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Valor do Investimento */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Investimento (Reais)
              </label>
              <input
                type="number"
                value={investmentAmount || ''}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                min="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c1e428] focus:border-transparent text-lg"
                placeholder="Digite o valor em R$"
              />
              
              {/* Regra de Proporcionalidade */}
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full flex-shrink-0 mt-0.5"></div>
                  <div className="text-sm">
                    <div className="font-medium text-yellow-800 mb-1">Regra de Proporcionalidade:</div>
                    <div className="text-yellow-700">
                      Para investir <strong>R$ {investmentAmount || 'X'}</strong>, é necessário ter pelo menos{' '}
                      <strong>10% desse valor</strong> disponível em BRZ na carteira.
                    </div>
                    <div className="text-yellow-600 text-xs mt-1">
                      Exemplo: Investimento de R$ 500 requer R$ 50 em BRZ
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de valores rápidos */}
              <div className="mt-3 flex gap-2 flex-wrap">
                {[500, 1000, 5000, 10000].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setInvestmentAmount(value)}
                    className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    R$ {value.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Verificação de Saldo BRZ */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Verificar Saldo BRZ
                </label>
                <button
                  type="button"
                  onClick={() => {
                    // Simulação de abertura da carteira
                    alert('Abrindo carteira para verificar saldo BRZ...');
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Abrir Carteira
                </button>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Saldo atual:</span>
                  <span className="font-bold text-blue-600">
                    {brzBalance ? `${Number(brzBalance.formatted).toFixed(2)} BRZ` : 'Conecte a carteira'}
                  </span>
                </div>
                {investmentAmount > 0 && (
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">BRZ necessário:</span>
                      <span className="font-medium">
                        {(investmentAmount * 0.1).toFixed(2)} BRZ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        brzBalance && Number(brzBalance.formatted) >= (investmentAmount * 0.1)
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {brzBalance && Number(brzBalance.formatted) >= (investmentAmount * 0.1)
                          ? '✓ Saldo suficiente' 
                          : '✗ Saldo insuficiente'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Simulação de Retorno */}
            {investmentAmount > 0 && selectedTerm > 0 && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Simulação de Retorno
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Valor investido:</span>
                    <span className="font-semibold">{formatCurrency(investmentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Prazo:</span>
                    <span className="font-semibold">{selectedTerm} dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">APY:</span>
                    <span className="font-semibold">
                      {creditPools.find(p => p.id.toString() === selectedPool)?.apy}%
                    </span>
                  </div>
                  <div className="border-t border-green-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Juros estimado:</span>
                      <span className="font-semibold text-green-700">
                        {formatCurrency(
                          investmentAmount * ((creditPools.find(p => p.id.toString() === selectedPool)?.apy || 0) / 100 * (selectedTerm / 365))
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">Valor total ao final:</span>
                      <span className="font-bold text-green-800 text-lg">
                        {formatCurrency(
                          investmentAmount * (1 + (creditPools.find(p => p.id.toString() === selectedPool)?.apy || 0) / 100 * (selectedTerm / 365))
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedPool(null);
                  setInvestmentAmount(0);
                  setSelectedTerm(30);
                }}
                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleInvest(selectedPool)}
                disabled={
                  isInvesting || 
                  investmentAmount < 100 || 
                  selectedTerm === 0 ||
                  (brzBalance && Number(brzBalance.formatted) < (investmentAmount * 0.1))
                }
                className="flex-1 bg-[#c1e428] text-black font-semibold py-3 px-4 rounded-lg hover:bg-[#a8c523] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isInvesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Investindo...
                  </>
                ) : (
                  'Confirmar Investimento'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

