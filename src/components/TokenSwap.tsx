import React from 'react';
import { useAccount } from 'wagmi';
interface TokenSwapProps {
  onSwap: (amount: number, from: string, to: string) => void;
}
export const TokenSwap: React.FC<TokenSwapProps> = ({
  onSwap
}) => {
  const [amount, setAmount] = React.useState('');
  const [fromToken, setFromToken] = React.useState('brz');
  const [toToken, setToToken] = React.useState('usdc');
  const {
    isConnected
  } = useAccount();
  const handleSwitch = () => {
    console.log('Switch clicado - antes:', {
      fromToken,
      toToken
    });
    const newFromToken = fromToken === 'brz' ? 'usdc' : 'brz';
    const newToToken = toToken === 'usdc' ? 'brz' : 'usdc';
    setFromToken(newFromToken);
    setToToken(newToToken);
    console.log('Switch clicado - depois:', {
      fromToken: newFromToken,
      toToken: newToToken
    });
  };
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
    <div className="bg-card border rounded-lg p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">De</span>
          <button
            onClick={handleSwitch}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
          </button>
        </div>
        
        <div className="space-y-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full text-2xl bg-transparent border-none outline-none"
          />
          <div className="text-right text-sm text-muted-foreground">
            {fromToken.toUpperCase()}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-sm text-muted-foreground mb-2">Para</div>
          <div className="text-2xl">
            {amount ? (Number(amount) * 1).toFixed(2) : '0,0'}
          </div>
          <div className="text-right text-sm text-muted-foreground">
            {toToken.toUpperCase()}
          </div>
        </div>

        <button
          onClick={handleSwap}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-3 font-medium transition-colors"
        >
          Swap
        </button>
      </div>
    </div>
  );
};