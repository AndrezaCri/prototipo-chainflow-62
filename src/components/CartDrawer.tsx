import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, Wallet, CreditCard } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConfig } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  unit: string;
  quantity: number;
  total: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
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

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'traditional' | 'usdc'>('traditional');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const { address, isConnected } = useAccount();
  const config = useConfig();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const totalValue = items.reduce((sum, item) => sum + item.total, 0);
  
  // Taxa de câmbio BRL/USDC (em produção, isso viria de uma API de oráculo)
  const BRL_TO_USDC_RATE = 0.18; // 1 BRL = 0.18 USDC (aproximadamente)
  const usdcAmount = totalValue * BRL_TO_USDC_RATE;

  const handleUSDCPayment = async () => {
    if (!isConnected || !address) {
      alert('Por favor, conecte sua carteira primeiro');
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      // Converter o valor para unidades USDC (6 decimais)
      const amountInWei = parseUnits(usdcAmount.toFixed(6), 6);
      
      await writeContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [PAYMENT_RECEIVER_ADDRESS, amountInWei],
        account: address,
        chain: config.chains[0],
      });
      
    } catch (error) {
      console.error('Erro no pagamento USDC:', error);
      alert('Erro ao processar pagamento. Verifique se você tem USDC suficiente.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleTraditionalPayment = () => {
    alert('Redirecionando para pagamento tradicional...');
    // Aqui você implementaria a integração com gateway de pagamento tradicional
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Carrinho de Compras</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto py-4">
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Seu carrinho está vazio
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        R$ {item.price.toFixed(2)}/{item.unit}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium px-2">
                          {item.quantity} {item.unit}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="ml-auto"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-sm font-semibold">
                        Total: R$ {item.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {items.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Geral:</span>
                <div className="text-right">
                  <div>R$ {totalValue.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    ≈ {usdcAmount.toFixed(6)} USDC
                  </div>
                </div>
              </div>
              
              {/* Seleção do método de pagamento */}
              <div className="space-y-3">
                <h4 className="font-medium">Método de Pagamento:</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={paymentMethod === 'traditional' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPaymentMethod('traditional')}
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Tradicional
                  </Button>
                  
                  <Button
                    variant={paymentMethod === 'usdc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPaymentMethod('usdc')}
                    className="flex items-center gap-2"
                  >
                    <Wallet className="h-4 w-4" />
                    USDC (Base)
                  </Button>
                </div>
              </div>
              
              {/* Botões de pagamento */}
              <div className="space-y-2">
                {paymentMethod === 'usdc' ? (
                  <>
                    {!isConnected ? (
                      <div className="text-sm text-muted-foreground text-center p-2 bg-muted rounded">
                        Conecte sua carteira para pagar com USDC
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleUSDCPayment}
                        disabled={isProcessingPayment || isPending || isConfirming}
                      >
                        {isProcessingPayment || isPending ? (
                          'Processando...'
                        ) : isConfirming ? (
                          'Confirmando...'
                        ) : isConfirmed ? (
                          'Pagamento Confirmado!'
                        ) : (
                          `Pagar ${usdcAmount.toFixed(6)} USDC`
                        )}
                      </Button>
                    )}
                    
                    {error && (
                      <div className="text-sm text-red-600 text-center p-2 bg-red-50 rounded">
                        Erro: {error.message}
                      </div>
                    )}
                    
                    {isConfirmed && (
                      <div className="text-sm text-green-600 text-center p-2 bg-green-50 rounded">
                        Pagamento realizado com sucesso!
                      </div>
                    )}
                  </>
                ) : (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleTraditionalPayment}
                  >
                    Finalizar Pedido
                  </Button>
                )}
                
                <Button variant="outline" className="w-full" onClick={onClose}>
                  Continuar Comprando
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};