import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUpDown, RefreshCw, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usdcBrzSwapService, SwapQuote, SwapTransaction } from '@/services/usdcBrzSwap';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [tokenIn, setTokenIn] = useState<'USDC' | 'BRZ'>('USDC');
  const [tokenOut, setTokenOut] = useState<'USDC' | 'BRZ'>('BRZ');
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [balanceIn, setBalanceIn] = useState('');
  const [balanceOut, setBalanceOut] = useState('');
  const [exchangeRate, setExchangeRate] = useState(5.5);
  const [slippage, setSlippage] = useState(0.5);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [showTestFaucet, setShowTestFaucet] = useState(false);

  // Inicializar serviço quando carteira conectar
  useEffect(() => {
    const initializeService = async () => {
      if (isConnected && walletClient) {
        try {
          console.log('🔄 Conectando serviço de swap à carteira...');
          
          // Criar provider ethers compatível com wagmi v2
          const { ethers } = await import('ethers');
          
          // wagmi v2 usa uma estrutura diferente para o transport
          const provider = new ethers.providers.Web3Provider(
            walletClient as any, 
            'any'
          );
          
          await usdcBrzSwapService.initialize(provider);
          
        } catch (error) {
          console.error('❌ Erro ao inicializar serviço de swap:', error);
          toast({
            title: "Erro de Conexão",
            description: "Falha ao conectar com a carteira. Tente novamente.",
            variant: "destructive"
          });
        }
      }
    };

    initializeService();
  }, [isConnected, walletClient, toast]);

  // Carregar dados quando conectar carteira ou abrir modal
  useEffect(() => {
    if (isOpen) {
      loadBalances();
      loadExchangeRate();
    }
  }, [isOpen, isConnected, tokenIn, tokenOut]);

  // Obter cotação quando amount muda
  useEffect(() => {
    if (amountIn && parseFloat(amountIn) > 0) {
      getQuote();
    } else {
      setAmountOut('');
      setQuote(null);
    }
  }, [amountIn, tokenIn, tokenOut]);

  const loadBalances = async () => {
    if (!isConnected) {
      setBalanceIn('');
      setBalanceOut('');
      return;
    }

    setBalanceLoading(true);
    try {
      const [usdcBalance, brzBalance] = await Promise.all([
        usdcBrzSwapService.getTokenBalance('USDC'),
        usdcBrzSwapService.getTokenBalance('BRZ')
      ]);
      
      if (tokenIn === 'USDC') {
        setBalanceIn(usdcBalance);
        setBalanceOut(brzBalance);
      } else {
        setBalanceIn(brzBalance);
        setBalanceOut(usdcBalance);
      }

      // Mostrar faucet se ambos saldos forem 0
      const hasNoTokens = parseFloat(usdcBalance) === 0 && parseFloat(brzBalance) === 0;
      setShowTestFaucet(hasNoTokens);
      
    } catch (error) {
      console.error('Erro ao carregar saldos:', error);
      setBalanceIn('0');
      setBalanceOut('0');
      setShowTestFaucet(true);
    } finally {
      setBalanceLoading(false);
    }
  };

  const loadExchangeRate = async () => {
    try {
      const rate = await usdcBrzSwapService.getCurrentExchangeRate();
      setExchangeRate(rate);
    } catch (error) {
      console.error('Erro ao carregar taxa de câmbio:', error);
    }
  };

  const getQuote = async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) return;
    if (!isConnected) return; // Não tentar obter cotação se não estiver conectado
    
    setLoading(true);
    try {
      // Para desenvolvimento, usar cotação simulada
      if (import.meta.env.DEV) {
        const simulatedQuote = simulateQuote(amountIn, tokenIn, tokenOut);
        setQuote(simulatedQuote);
        setAmountOut(simulatedQuote.amountOut);
      } else {
        const swapQuote = await usdcBrzSwapService.getSwapQuote(amountIn, tokenIn, tokenOut);
        setQuote(swapQuote);
        setAmountOut(swapQuote.amountOut);
      }
    } catch (error) {
      console.error('Erro ao obter cotação:', error);
      toast({
        title: "Erro na cotação",
        description: "Não foi possível obter a cotação atual. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para simular cotação com dados reais do mercado
  const simulateQuote = (amountIn: string, tokenIn: 'USDC' | 'BRZ', tokenOut: 'USDC' | 'BRZ') => {
    const usdcToBrzRate = 5.5; // Taxa real do Aerodrome
    const brzToUsdcRate = 1 / usdcToBrzRate;
    
    let amountOut: number;
    let exchangeRate: number;
    
    if (tokenIn === 'USDC' && tokenOut === 'BRZ') {
      amountOut = parseFloat(amountIn) * usdcToBrzRate;
      exchangeRate = usdcToBrzRate;
    } else if (tokenIn === 'BRZ' && tokenOut === 'USDC') {
      amountOut = parseFloat(amountIn) * brzToUsdcRate;
      exchangeRate = brzToUsdcRate;
    } else {
      throw new Error('Par de tokens inválido');
    }

    // Calcular impacto no preço baseado na liquidez real (~$21k)
    const poolLiquidity = 21000;
    const tradeSize = tokenIn === 'USDC' ? parseFloat(amountIn) : parseFloat(amountIn) / 5.5;
    const priceImpact = Math.min((tradeSize / poolLiquidity) * 100, 15);

    // Aplicar fee real do Aerodrome de 0.05%
    const feeAmount = amountOut * 0.0005;
    amountOut = amountOut - feeAmount;

    return {
      amountIn,
      amountOut: amountOut.toFixed(tokenOut === 'USDC' ? 6 : 2),
      tokenIn,
      tokenOut,
      priceImpact: parseFloat(priceImpact.toFixed(2)),
      exchangeRate,
      fee: '0.05%'
    };
  };

  const handleSwapTokens = () => {
    const newTokenIn = tokenOut;
    const newTokenOut = tokenIn;
    
    setTokenIn(newTokenIn);
    setTokenOut(newTokenOut);
    setAmountIn(amountOut);
    setAmountOut('');
    
    // Trocar saldos
    const tempBalance = balanceIn;
    setBalanceIn(balanceOut);
    setBalanceOut(tempBalance);
  };

  const handleMaxAmount = () => {
    if (balanceIn && parseFloat(balanceIn) > 0) {
      setAmountIn(balanceIn);
    }
  };

  const handleGetTestTokens = async () => {
    setBalanceLoading(true);
    try {
      // Adicionar tokens de teste
      usdcBrzSwapService.addTestTokens('1000.00', '5500.00');
      
      // Recarregar saldos
      await loadBalances();
      
      toast({
        title: "Tokens de teste adicionados!",
        description: "1.000 USDC e 5.500 BRZ foram adicionados à sua carteira de teste.",
      });
      
      setShowTestFaucet(false);
    } catch (error) {
      console.error('Erro ao adicionar tokens de teste:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar os tokens de teste.",
        variant: "destructive"
      });
    } finally {
      setBalanceLoading(false);
    }
  };

  const executeSwap = async () => {
    if (!isConnected) {
      toast({
        title: "Carteira não conectada",
        description: "Conecte sua carteira para realizar o swap.",
        variant: "destructive"
      });
      return;
    }

    if (!quote || !amountIn) {
      toast({
        title: "Dados inválidos",
        description: "Insira um valor válido para o swap.",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(amountIn) > parseFloat(balanceIn)) {
      toast({
        title: "Saldo insuficiente",
        description: `Você não possui ${tokenIn} suficiente para este swap.`,
        variant: "destructive"
      });
      return;
    }

    setSwapping(true);
    try {
      // Sempre usar transações reais via carteira
      const transaction = await usdcBrzSwapService.executeSwap(
        amountIn,
        tokenIn,
        tokenOut,
        slippage
      );

      // Salvar transação no histórico
      usdcBrzSwapService.saveSwapTransaction(transaction);

      toast({
        title: "Swap realizado com sucesso!",
        description: `Hash: ${transaction.hash.slice(0, 10)}... - ${amountIn} ${tokenIn} por ${quote.amountOut} ${tokenOut}`,
      });

      // Atualizar saldos reais
      await loadBalances();
      
      // Limpar formulário
      setAmountIn('');
      setAmountOut('');
      setQuote(null);
      
    } catch (error) {
      console.error('Erro no swap:', error);
      toast({
        title: "Erro no swap",
        description: "Ocorreu um erro ao executar o swap. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSwapping(false);
    }
  };

  // Simula execução de swap em desenvolvimento
  const simulateSwapExecution = async (amountIn: string, tokenIn: 'USDC' | 'BRZ', tokenOut: 'USDC' | 'BRZ') => {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({
          hash: '0x' + Math.random().toString(16).substr(2, 64),
          amountIn,
          amountOut: quote?.amountOut || '0',
          tokenIn,
          tokenOut,
          timestamp: Date.now(),
          status: 'confirmed'
        });
      }, 2000);
    });
  };

  // Atualiza saldos de teste localmente
  const updateTestBalances = (amountIn: string, amountOut: string, tokenIn: 'USDC' | 'BRZ', tokenOut: 'USDC' | 'BRZ') => {
    const currentBalanceIn = parseFloat(balanceIn);
    const currentBalanceOut = parseFloat(balanceOut);
    
    const newBalanceIn = currentBalanceIn - parseFloat(amountIn);
    const newBalanceOut = currentBalanceOut + parseFloat(amountOut);
    
    localStorage.setItem(`testnet_${tokenIn.toLowerCase()}_balance`, newBalanceIn.toFixed(6));
    localStorage.setItem(`testnet_${tokenOut.toLowerCase()}_balance`, newBalanceOut.toFixed(6));
  };

  const formatCurrency = (value: string, currency: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    
    if (currency === 'BRZ') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(num);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(num);
    }
  };

  const getBalanceDisplay = (balance: string, token: string) => {
    if (!isConnected) return 'Carteira não conectada';
    if (balanceLoading) return 'Carregando...';
    if (!balance) return '0.00';
    return `${parseFloat(balance).toFixed(token === 'USDC' ? 2 : 2)} ${token}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#c1e428]" />
            Swap USDC ⇄ BRZ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status da conexão e faucet de teste */}
          {!isConnected && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Conecte sua carteira para começar</span>
              </div>
            </div>
          )}

          {isConnected && showTestFaucet && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Sem tokens para teste</span>
              </div>
              <p className="text-sm text-blue-700">
                Adicione tokens de teste para experimentar o swap USDC/BRZ.
              </p>
              <Button
                onClick={handleGetTestTokens}
                disabled={balanceLoading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {balanceLoading ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  'Adicionar Tokens de Teste'
                )}
              </Button>
            </div>
          )}

          {/* Taxa de câmbio atual */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Taxa atual:</span>
              <span className="font-medium">1 USDC = {exchangeRate.toFixed(2)} BRZ</span>
            </div>
          </div>

          {/* Token de entrada */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>De</Label>
              <span className="text-sm text-gray-600">
                Saldo: {getBalanceDisplay(balanceIn, tokenIn)}
              </span>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amountIn}
                  onChange={(e) => setAmountIn(e.target.value)}
                  className="pr-16"
                />
                <button
                  onClick={handleMaxAmount}
                  disabled={!isConnected || !balanceIn || parseFloat(balanceIn) === 0}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#c1e428] hover:text-[#a8c424] font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  MAX
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md min-w-[80px]">
                <span className="font-medium">{tokenIn}</span>
              </div>
            </div>
          </div>

          {/* Botão de troca */}
          <div className="flex justify-center">
            <button
              onClick={handleSwapTokens}
              className="p-2 rounded-full border-2 border-gray-200 hover:border-[#c1e428] transition-colors"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          {/* Token de saída */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Para</Label>
              <span className="text-sm text-gray-600">
                Saldo: {getBalanceDisplay(balanceOut, tokenOut)}
              </span>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amountOut}
                  readOnly
                  className="bg-gray-50"
                />
                {loading && (
                  <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md min-w-[80px]">
                <span className="font-medium">{tokenOut}</span>
              </div>
            </div>
          </div>

          {/* Detalhes da cotação */}
          {quote && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa de câmbio:</span>
                <span className="font-medium">1 {tokenIn} = {quote.exchangeRate.toFixed(4)} {tokenOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa Aerodrome:</span>
                <span className="font-medium text-green-600">{quote.fee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Liquidez pool:</span>
                <span className="font-medium text-blue-600">~$21k</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Impacto no preço:</span>
                <span className={`font-medium ${quote.priceImpact > 5 ? 'text-red-600' : 'text-orange-600'}`}>
                  {quote.priceImpact}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Slippage máximo:</span>
                <span className="font-medium">{slippage}%</span>
              </div>
            </div>
          )}

          {/* Configuração de slippage */}
          <div className="space-y-2">
            <Label className="text-sm">Tolerância ao slippage (%)</Label>
            <div className="flex gap-2">
              {[0.1, 0.5, 1.0].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-3 py-1 text-sm rounded ${
                    slippage === value
                      ? 'bg-[#c1e428] text-black'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {value}%
                </button>
              ))}
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                className="w-20 text-sm"
              />
            </div>
          </div>

          {/* Botão de swap */}
          <Button
            onClick={executeSwap}
            disabled={!isConnected || !quote || swapping || parseFloat(amountIn || '0') <= 0 || showTestFaucet}
            className="w-full bg-[#c1e428] hover:bg-[#a8c424] text-black font-medium"
          >
            {!isConnected ? (
              'Conecte sua carteira'
            ) : showTestFaucet ? (
              'Adicione tokens de teste primeiro'
            ) : swapping ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Executando swap...
              </>
            ) : (
              `Trocar ${tokenIn} por ${tokenOut}`
            )}
          </Button>

          {/* Aviso sobre liquidez */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Pool USDC/BRZ Aerodrome na Base</p>
                <p>Liquidez limitada (~$21k). Para valores grandes, considere dividir a operação para reduzir o impacto no preço.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

