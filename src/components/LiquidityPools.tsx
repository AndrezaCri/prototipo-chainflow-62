
import React, { useState } from 'react';

interface Pool {
  id: string;
  restaurant: string;
  amount: number;
  term: number; // days
  score: number; // 1-10
  apy: number;
  risk: 'Low' | 'Medium' | 'High';
  category: string;
}

export const LiquidityPools: React.FC = () => {
  const [selectedPool, setSelectedPool] = useState<string | null>(null);

  const pools: Pool[] = [
    {
      id: '1',
      restaurant: 'Bella Italia Restaurant',
      amount: 50000,
      term: 30,
      score: 8.5,
      apy: 9.2,
      risk: 'Low',
      category: 'Italian Cuisine'
    },
    {
      id: '2',
      restaurant: 'Sushi Master Tokyo',
      amount: 75000,
      term: 60,
      score: 9.1,
      apy: 10.5,
      risk: 'Low',
      category: 'Japanese Cuisine'
    },
    {
      id: '3',
      restaurant: 'Burger Palace Chain',
      amount: 120000,
      term: 90,
      score: 7.8,
      apy: 8.7,
      risk: 'Medium',
      category: 'Fast Food'
    },
    {
      id: '4',
      restaurant: 'Green Leaf Organic',
      amount: 35000,
      term: 45,
      score: 8.9,
      apy: 11.2,
      risk: 'Low',
      category: 'Organic Food'
    },
    {
      id: '5',
      restaurant: 'Taco Fiesta Express',
      amount: 28000,
      term: 30,
      score: 7.2,
      apy: 12.8,
      risk: 'High',
      category: 'Mexican Cuisine'
    },
    {
      id: '6',
      restaurant: 'Coffee Culture Hub',
      amount: 42000,
      term: 60,
      score: 8.3,
      apy: 9.8,
      risk: 'Medium',
      category: 'Coffee & Beverages'
    }
  ];

  const handleFinance = (poolId: string) => {
    setSelectedPool(poolId);
    console.log('Financing pool:', poolId);
    // Reset after 2 seconds to simulate transaction
    setTimeout(() => setSelectedPool(null), 2000);
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
      <div className="text-center mb-12">
        <h2 className="text-[48px] font-bold leading-[57px] text-black mb-4 max-md:text-4xl max-sm:text-3xl">
          AVAILABLE LIQUIDITY POOLS
        </h2>
        <p className="text-base font-normal text-[#666666] max-w-2xl mx-auto">
          Invest in tokenized restaurant receivables with transparent risk assessment and competitive returns
        </p>
        <div className="text-sm font-normal text-[#666666] mt-2">
          {pools.length} pools available
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {pools.map((pool) => (
          <div key={pool.id} className="bg-white border border-[#f0f0f0] rounded-[20px] p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">{pool.restaurant}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskBadgeStyle(pool.risk)}`}>
                {pool.risk} Risk
              </span>
            </div>
            
            <div className="text-sm font-normal text-[#666666] mb-6">{pool.category}</div>
            
            {/* Pool Details */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-sm font-normal text-[#666666] mb-1">Pool Size</div>
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
                <div className="text-sm font-normal text-[#666666] mb-1">Restaurant Score</div>
                <div className={`text-base font-bold ${getScoreColor(pool.score)}`}>
                  {pool.score}/10
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#666666]">Pool Filled</span>
                <span className="text-black font-medium">67%</span>
              </div>
              <div className="w-full bg-[#f0f0f0] rounded-full h-2">
                <div className="bg-black h-2 rounded-full" style={{width: '67%'}}></div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleFinance(pool.id)}
              className="w-full bg-black text-white text-base font-medium px-[54px] py-4 rounded-[62px] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black/50 transition-all duration-300 disabled:bg-[#666666] disabled:cursor-not-allowed"
              disabled={selectedPool === pool.id}
            >
              {selectedPool === pool.id ? 'Processing...' : 'Finance Now'}
            </button>

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
