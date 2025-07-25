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
  return;
};