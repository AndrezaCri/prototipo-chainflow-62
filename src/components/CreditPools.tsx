import React, { useState } from 'react';
import { TrendingUp, Shield, Clock, DollarSign, Users, BarChart3, AlertTriangle } from 'lucide-react';
import { useSeamlessFi } from '@/hooks/useSeamlessFi';

interface CreditPoolsProps {
  onInvest?: (poolId: string, amount: number) => void;
}

export const CreditPools: React.FC<CreditPoolsProps> = ({ onInvest }) => {
  const { getPoolsData, investInPool, isLoading, error, isConnected } = useSeamlessFi();
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [isInvesting, setIsInvesting] = useState(false);

  const creditPools = getPoolsData();

  const handleInvest = async (poolId: string) => {
    const pool = creditPools.find(p => p.id.toString() === poolId);
    if (!pool || investmentAmount < pool.minInvestment) {
      alert('Valor mínimo de investimento não atingido');
      return;
    }

    if (!isConnected) {
      alert('Conecte sua carteira para investir');
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
        alert('Investimento realizado com sucesso!');
      }
    } catch (err) {
      console.error('Investment failed:', err);
      alert('Falha no investimento. Tente novamente.');
    } finally {
      setIsInvesting(false);
    }
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

      {/* Modal de Investimento */}
      {selectedPool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Invest in {creditPools.find(p => p.id.toString() === selectedPool)?.name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount (USDC)
              </label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c1e428] focus:border-transparent"
                placeholder={`Min: ${creditPools.find(p => p.id.toString() === selectedPool)?.minInvestment} USDC`}
              />
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Investment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>{formatUSDC(investmentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>APY:</span>
                  <span>{creditPools.find(p => p.id.toString() === selectedPool)?.apy}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Term:</span>
                  <span>{creditPools.find(p => p.id.toString() === selectedPool)?.term} days</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Expected Return:</span>
                  <span>
                    {formatUSDC(
                      investmentAmount * (1 + (creditPools.find(p => p.id.toString() === selectedPool)?.apy || 0) / 100)
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPool(null)}
                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleInvest(selectedPool)}
                disabled={isInvesting || investmentAmount < (creditPools.find(p => p.id.toString() === selectedPool)?.minInvestment || 0)}
                className="flex-1 bg-[#c1e428] text-black font-semibold py-3 px-4 rounded-lg hover:bg-[#a8c523] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isInvesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Investing...
                  </>
                ) : (
                  'Confirm Investment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

