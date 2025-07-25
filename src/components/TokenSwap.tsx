import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usdcBrzSwapService } from '@/services/usdcBrzSwap';
import { useSwapService } from '@/hooks/useSwapService';

interface TokenSwapProps {
  onSwap: (amount: number, from: string, to: string) => void;
}

export const TokenSwap: React.FC<TokenSwapProps> = ({ onSwap }) => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { isInitialized } = useSwapService();
  
  const [amount, setAmount] = useState('');
  const [fromToken, setFromToken] = useState<'USDC' | 'BRZ'>('USDC');
  const [toToken, setToToken] = useState<'USDC' | 'BRZ'>('BRZ');
  const [estimatedOutput, setEstimatedOutput] = useState('0.0');
  const [isLoading, setIsLoading] = useState(false);
  const [balanceFrom, setBalanceFrom] = useState('0');
  const [balanceTo, setBalanceTo] = useState('0');

  // Atualizar saldos quando conectar e serviço estiver inicializado
  useEffect(() => {
    if (isConnected && isInitialized) {
      loadBalances();
    }
  }, [isConnected, isInitialized, fromToken, toToken]);

  // Obter cotação quando amount muda
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      getQuote();
    } else {
      setEstimatedOutput('0.0');
    }
  }, [amount, fromToken, toToken]);

  const loadBalances = async () => {
    try {
      const [fromBalance, toBalance] = await Promise.all([
        usdcBrzSwapService.getTokenBalance(fromToken),
        usdcBrzSwapService.getTokenBalance(toToken)
      ]);
      setBalanceFrom(fromBalance);
      setBalanceTo(toBalance);
    } catch (error) {
      console.error('Erro ao carregar saldos:', error);
    }
  };

  const getQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsLoading(true);
    try {
      const quote = await usdcBrzSwapService.getSwapQuote(amount, fromToken, toToken);
      setEstimatedOutput(quote.amountOut);
    } catch (error) {
      console.error('Erro ao obter cotação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitch = () => {
    const newFromToken = fromToken === 'USDC' ? 'BRZ' : 'USDC';
    const newToToken = toToken === 'BRZ' ? 'USDC' : 'BRZ';
    
    setFromToken(newFromToken);
    setToToken(newToToken);
    setAmount(estimatedOutput);
    setEstimatedOutput('');
    
    // Trocar saldos
    const tempBalance = balanceFrom;
    setBalanceFrom(balanceTo);
    setBalanceTo(tempBalance);
  };

  const handleSwap = async () => {
    if (!isConnected) {
      toast({
        title: "Carteira não conectada",
        description: "Conecte sua carteira para realizar o swap.",
        variant: "destructive"
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Insira um valor válido para o swap.",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(amount) > parseFloat(balanceFrom)) {
      toast({
        title: "Saldo insuficiente",
        description: `Você não possui ${fromToken} suficiente para este swap.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const transaction = await usdcBrzSwapService.executeSwap(
        amount,
        fromToken,
        toToken,
        0.5 // 0.5% slippage
      );

      toast({
        title: "Swap realizado com sucesso!",
        description: `Trocou ${amount} ${fromToken} por ${estimatedOutput} ${toToken}`,
      });

      // Chamar callback original para compatibilidade
      onSwap(Number(amount), fromToken.toLowerCase(), toToken.toLowerCase());

      // Atualizar saldos e limpar form
      await loadBalances();
      setAmount('');
      setEstimatedOutput('0.0');

    } catch (error) {
      console.error('Erro no swap:', error);
      toast({
        title: "Erro no swap",
        description: "Ocorreu um erro ao executar o swap. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-card border rounded-lg p-6 max-w-md mx-auto">
      <div className="space-y-4">
        {/* Header com saldos */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Swap Tokens</h3>
          {isConnected && (
            <div className="text-xs text-muted-foreground">
              Saldos: {parseFloat(balanceFrom).toFixed(2)} {fromToken} | {parseFloat(balanceTo).toFixed(2)} {toToken}
            </div>
          )}
        </div>

        {/* Token de entrada */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">De</span>
            <span className="text-xs text-muted-foreground">
              Saldo: {parseFloat(balanceFrom).toFixed(2)}
            </span>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="text-xl h-12 bg-background"
                disabled={isLoading}
              />
            </div>
            <div className="bg-primary/10 text-primary px-3 py-2 rounded-md font-medium min-w-[70px] text-center">
              {fromToken}
            </div>
          </div>
        </div>

        {/* Botão de troca */}
        <div className="flex justify-center py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwitch}
            disabled={isLoading}
            className="rounded-full p-2 hover:bg-accent"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Token de saída */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Para</span>
            <span className="text-xs text-muted-foreground">
              Saldo: {parseFloat(balanceTo).toFixed(2)}
            </span>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Input
                type="text"
                value={isLoading ? 'Calculando...' : estimatedOutput}
                readOnly
                placeholder="0.0"
                className="text-xl h-12 bg-muted"
              />
            </div>
            <div className="bg-primary/10 text-primary px-3 py-2 rounded-md font-medium min-w-[70px] text-center">
              {toToken}
            </div>
          </div>
        </div>

        {/* Taxa de câmbio */}
        {estimatedOutput !== '0.0' && !isLoading && (
          <div className="text-center text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            1 {fromToken} ≈ {(parseFloat(estimatedOutput) / parseFloat(amount || '1')).toFixed(4)} {toToken}
          </div>
        )}

        {/* Botão de swap */}
        <Button
          onClick={handleSwap}
          disabled={!isConnected || !amount || parseFloat(amount) <= 0 || isLoading}
          className="w-full h-12 text-lg font-semibold"
          size="lg"
        >
          {!isConnected ? (
            'Conecte sua carteira'
          ) : isLoading ? (
            'Processando...'
          ) : (
            `Trocar ${fromToken} por ${toToken}`
          )}
        </Button>

        {/* Aviso sobre testnet */}
        {isConnected && (
          <div className="text-xs text-center text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
            ⚠️ Testnet Base Sepolia - Use apenas tokens de teste
          </div>
        )}
      </div>
    </div>
  );
};