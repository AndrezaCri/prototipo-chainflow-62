
import React, { useState } from 'react';
import { TokenSwap } from './TokenSwap';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConfig } from 'wagmi';
import { parseUnits } from 'viem';

interface Pool {
  id: string;
  business: string;
  amount: number;
  term: number; // days
  score: number; // 1-10
  apy: number;
  risk: 'Low' | 'Medium' | 'High';
  category: string;
}

// Endereço do contrato USDC na Base (mainnet)
const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
// Endereço do contrato PaymentReceiver (substitua pelo endereço real após implantação)
const PAYMENT_RECEIVER_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

// ABI simplificado do USDC (ERC-20)
const USDC_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

export const LiquidityPools: React.FC = () => {
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Web3 hooks
  const { isConnected, address } = useAccount();
  const config = useConfig();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSwap = async (amount: number, from: string, to: string) => {
    if (!isConnected) {
      alert('Por favor, conecte sua carteira primeiro');
      return;
    }

    if (!amount || amount <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    try {
      console.log(`Simulando swap de ${amount} ${from.toUpperCase()} para ${to.toUpperCase()}`);
      
      // Simular delay de transação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Swap realizado com sucesso!\n${amount} ${from.toUpperCase()} → ${amount * 0.98} ${to.toUpperCase()}\n(Taxa de 2% aplicada)`);
      
    } catch (error) {
      console.error('Erro no swap:', error);
      alert('Erro ao realizar swap. Tente novamente.');
    }
  };

  const pools: Pool[] = [
    {
      id: '1',
      business: 'Credit Pool 30D',
      amount: 50000,
      term: 30,
      score: 8.5,
      apy: 9.2,
      risk: 'Low',
      category: 'papelaria'
    },
    {
      id: '2',
      business: 'Credit Pool 60D',
      amount: 75000,
      term: 60,
      score: 9.1,
      apy: 10.5,
      risk: 'Low',
      category: 'TI'
    },
    {
      id: '3',
      business: 'Credit Pool 90D',
      amount: 120000,
      term: 90,
      score: 7.8,
      apy: 8.7,
      risk: 'Medium',
      category: 'fast-food'
    }
  ];

  const handleFinance = async (poolId: string) => {
    if (!isConnected) {
      alert('Por favor, conecte sua carteira primeiro');
      return;
    }

    const pool = pools.find(p => p.id === poolId);
    if (!pool) return;

    // Valor mínimo de investimento (exemplo: $1000 USDC)
    const minimumInvestment = 1000;
    const usdcAmount = minimumInvestment;
    
    setSelectedPool(poolId);
    setIsProcessingPayment(true);

    try {
      // Converter para wei (USDC tem 6 decimais)
      const amountInWei = parseUnits(usdcAmount.toString(), 6);
      
      // Executar transação USDC
      await writeContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [PAYMENT_RECEIVER_ADDRESS, amountInWei],
        account: address,
        chain: config.chains[0],
      });
      
    } catch (error) {
      console.error('Erro no investimento DeFi:', error);
      alert('Erro ao processar investimento. Verifique se você tem USDC suficiente.');
      setSelectedPool(null);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getRiskBadgeStyle = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-[#00C851] text-white';
      case 'Medium': return 'bg-[#FF6B35] text-white';
      case 'High': return 'bg-[#FF3547] text-white';
      default: return 'bg-[#666666] text-white';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-[#00C851]';
    if (score >= 7.5) return 'text-[#FF6B35]';
    return 'text-[#FF3547]';
  };

  return (
    <div className="space-y-8">
      {/* Token Swap Section */}
      <div className="mb-8">
        <TokenSwap onSwap={handleSwap} />
      </div>
      <div className="text-center mb-12">
        <h2 className="text-[48px] font-bold leading-[57px] text-black mb-4 max-md:text-4xl max-sm:text-3xl">
          AVAILABLE CREDIT POOLS
        </h2>
        <p className="text-base font-normal text-[#666666] max-w-2xl mx-auto">
          Invest in credit pools with transparent risk assessment and competitive returns
        </p>
        <div className="text-sm font-normal text-[#666666] mt-2">
          {pools.length} pools available
        </div>
      </div>  

      <div className="grid grid-cols-1 gap-8">
        {pools.map((pool) => (
          <div key={pool.id} className="bg-white border border-[#f0f0f0] rounded-[20px] p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">{pool.business}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskBadgeStyle(pool.risk)}`}>
                {pool.risk} Risk
              </span>
            </div>
            
            {/*<div className="text-sm font-normal text-[#666666] mb-6">{pool.category}</div>*/}
            
            {/* Pool Details */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-sm font-normal text-[#666666] mb-1">Total Supplied</div>
                <div className="text-2xl font-bold text-black">
                  ${pool.amount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm font-normal text-[#666666] mb-1">APY</div>
                <div className="text-2xl font-bold text-[#00C851]">
                  {pool.apy}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-sm font-normal text-[#666666] mb-1">Term</div>
                <div className="text-base font-medium text-black">
                  {pool.term} days
                </div>
              </div>
              <div>
                <div className="text-sm font-normal text-[#666666] mb-1">Business Score</div>
                <div className={`text-base font-bold ${getScoreColor(pool.score)}`}>
                  {pool.score}/10
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {/*<div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#666666]">Pool Filled</span>
                <span className="text-black font-medium">67%</span>
              </div>
              <div className="w-full bg-[#f0f0f0] rounded-full h-2">
                <div className="bg-black h-2 rounded-full" style={{width: '67%'}}></div>
              </div>
            </div>*/}

            {/* Action Button */}
            <div className="space-y-3">
              {!isConnected ? (
                <div className="text-sm text-gray-600 text-center p-3 bg-gray-50 rounded-lg">
                  Conecte sua carteira para investir com USDC
                </div>
              ) : (
                <div className="text-sm text-gray-600 text-center">
                  Investimento mínimo: $1,000 USDC
                </div>
              )}
              
              <button
                onClick={() => handleFinance(pool.id)}
                className="w-full bg-black text-white text-base font-medium px-[54px] py-4 rounded-[62px] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black/50 transition-all duration-300 disabled:bg-[#666666] disabled:cursor-not-allowed"
                disabled={!isConnected || selectedPool === pool.id || isProcessingPayment || isPending || isConfirming}
              >
                {isProcessingPayment || isPending ? (
                  'Processando Pagamento...'
                ) : isConfirming ? (
                  'Confirmando Transação...'
                ) : isConfirmed ? (
                  'Investimento Realizado!'
                ) : (
                  'Finance Now'
                )}
              </button>
            </div>

            {/* Additional Info */}
            <div className="text-xs text-[#666666] mt-4 text-center">
              Maturity: {new Date(Date.now() + pool.term * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
