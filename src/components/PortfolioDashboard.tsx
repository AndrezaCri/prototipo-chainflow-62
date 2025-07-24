
import React from 'react';

interface PortfolioStats {
  totalAllocated: number;
  estimatedYield: number;
  activePositions: number;
  nextMaturity: string;
}

export const PortfolioDashboard: React.FC = () => {
  const stats: PortfolioStats = {
    totalAllocated: 125000,
    estimatedYield: 8.5,
    activePositions: 12,
    nextMaturity: '2024-02-15'
  };

  const positions = [
    { pool: 'Credit Pool 30D', amount: 25000, maturity: '2024-02-15', yield: 9.2 },
    { pool: 'Credit Pool 60D', amount: 18000, maturity: '2024-02-28', yield: 8.7 },
    { pool: 'Credit Pool 90D', amount: 32000, maturity: '2024-03-10', yield: 7.8 },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-[48px] font-bold leading-[57px] text-black mb-4 max-md:text-4xl max-sm:text-3xl">
          PORTFOLIO OVERVIEW
        </h2>
        <p className="text-base font-normal text-[#666666] max-w-2xl mx-auto">
          Track your investments and performance across all DeFi pools
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#f0f0f0] p-6 rounded-[20px] text-center">
          <div className="text-[32px] font-bold text-black leading-[43px] mb-2">
            ${stats.totalAllocated.toLocaleString()}
          </div>
          <div className="text-base font-normal text-[#666666]">
            Total Allocated
          </div>
        </div>

        <div className="bg-[#f0f0f0] p-6 rounded-[20px] text-center">
          <div className="text-[32px] font-bold text-[#00C851] leading-[43px] mb-2">
            {stats.estimatedYield}%
          </div>
          <div className="text-base font-normal text-[#666666]">
            Est. Yield
          </div>
        </div>

        <div className="bg-[#f0f0f0] p-6 rounded-[20px] text-center">
          <div className="text-[32px] font-bold text-black leading-[43px] mb-2">
            {stats.activePositions}
          </div>
          <div className="text-base font-normal text-[#666666]">
            Active Positions
          </div>
        </div>

        <div className="bg-[#f0f0f0] p-6 rounded-[20px] text-center">
          <div className="text-[32px] font-bold text-[#FF6B35] leading-[43px] mb-2">
            {new Date(stats.nextMaturity).toLocaleDateString()}
          </div>
          <div className="text-base font-normal text-[#666666]">
            Next Maturity
          </div>
        </div>
      </div>

      {/* Active Positions */}
      <div className="bg-white border border-[#f0f0f0] rounded-[20px] p-8">
        <h3 className="text-[32px] font-bold text-black mb-6 max-sm:text-2xl">Active Positions</h3>
        <div className="space-y-4">
          {positions.map((position, index) => (
            <div key={index} className="flex items-center justify-between py-4 px-6 bg-[#f0f0f0] rounded-[20px]">
              <div>
                <div className="text-base font-bold text-black">{position.pool}</div>
                <div className="text-sm font-normal text-[#666666]">
                  Maturity: {new Date(position.maturity).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-black">${position.amount.toLocaleString()}</div>
                <div className="text-sm font-normal text-[#00C851]">{position.yield}% APY</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
