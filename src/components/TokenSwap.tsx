import React from 'react';
import { useAccount } from 'wagmi';

interface TokenSwapProps {
  onSwap: (amount: number, from: string, to: string) => void;
}

export const TokenSwap: React.FC<TokenSwapProps> = ({ onSwap }) => {
  const [amount, setAmount] = React.useState('');
  const [fromToken, setFromToken] = React.useState('brz');
  const [toToken, setToToken] = React.useState('usdc');
  const { isConnected } = useAccount();

  const handleSwap = () => {
    if (!isConnected) {
      alert('Por favor, conecte sua carteira primeiro');
      return;
    }
    
    if (amount && !isNaN(Number(amount))) {
      onSwap(Number(amount), fromToken, toToken);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[20px] border border-[#f0f0f0]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-black">SWAP USDC/BRZ </h3>
        <button 
          onClick={() => {
            setFromToken(fromToken === 'brz' ? 'usdc' : 'brz');
            setToToken(toToken === 'usdc' ? 'brz' : 'usdc');
          }}
          className="text-[#00C851] hover:text-[#00A841] transition-colors"
        >
          Switch
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#f0f0f0] focus:outline-none focus:ring-2 focus:ring-[#00C851]"
              placeholder="0.0"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666]">
              {fromToken.toUpperCase()}
            </div>
          </div>
        </div>
        
        <div>
          <div className="relative">
            <input
              type="number"
              disabled
              value="0.0"
              className="w-full px-4 py-3 rounded-[10px] border border-[#f0f0f0] focus:outline-none focus:ring-2 focus:ring-[#00C851] bg-[#f8f8f8]"
              placeholder="0.0"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666]">
              {toToken.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {!isConnected && (
          <div className="text-sm text-gray-600 text-center p-3 bg-gray-50 rounded-lg">
            Conecte sua carteira para fazer swap
          </div>
        )}
        
        <button
          onClick={handleSwap}
          className="w-full py-3 bg-[#00C851] text-white rounded-[10px] hover:bg-[#00A841] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!isConnected || !amount || isNaN(Number(amount))}
        >
          Swap
        </button>
      </div>
    </div>
  );
};
