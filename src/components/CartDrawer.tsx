import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useSendTransaction, usePrepareSendTransaction, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { parseUnits } from 'ethers';
import { useAccount } from 'wagmi';

// ABI mínima do contrato ERC-20 para a função transfer
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)"
];

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

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem
}) => {
  const { address, isConnected } = useAccount();
  const totalValueBRL = items.reduce((sum, item) => sum + item.total, 0);
  // Taxa de câmbio simulada: 1 USDC = 5 BRL. Em um projeto real, isso viria de uma API.
  const USDC_EXCHANGE_RATE = 5.0;
  const totalValueUSDC = totalValueBRL / USDC_EXCHANGE_RATE;

  // Endereço do contrato inteligente PaymentReceiver implantado localmente
  const paymentReceiverAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  // Endereço do contrato USDC na Base Sepolia (para teste, pode variar)
  // Em um ambiente de produção, você usaria o endereço oficial do USDC na Base Mainnet.
  const usdcContractAddress = '0x036Fc7144787600327579199373875077255'; // Exemplo de USDC na Base Sepolia

  // Prepara a transação para transferir USDC para o contrato PaymentReceiver
  const { config: usdcTransferConfig } = usePrepareContractWrite({
    address: usdcContractAddress,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [paymentReceiverAddress, parseUnits(totalValueUSDC.toFixed(6), 6)], // USDC tem 6 decimais
    enabled: isConnected && totalValueUSDC > 0 && paymentReceiverAddress !== '' && usdcContractAddress !== '',
  });
  const { write: transferUSDC } = useContractWrite(usdcTransferConfig);

  const handleCheckoutWithUSDC = () => {
    if (!isConnected) {
      alert('Por favor, conecte sua carteira para pagar com USDC.');
      return;
    }
    if (totalValueUSDC <= 0) {
      alert('Seu carrinho está vazio ou o valor é zero.');
      return;
    }
    if (paymentReceiverAddress === '' || usdcContractAddress === '') {
      alert('Endereço do contrato do recebedor ou do USDC não configurado.');
      return;
    }

    // Antes de chamar transfer, o usuário deve ter aprovado o contrato PaymentReceiver
    // para gastar seus USDC. Isso geralmente é feito em uma etapa separada ou
    // através de uma interface de usuário que solicita a aprovação.
    // Por simplicidade, estamos chamando diretamente a transferência aqui.
    // Em um cenário real, você precisaria de uma função `approve` e `transferFrom`.
    transferUSDC?.();
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
                <span>R$ {totalValueBRL.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total em USDC (aprox.):</span>
                <span>USDC {totalValueUSDC.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <Button className="w-full" size="lg" onClick={handleCheckoutWithUSDC}>
                  Pagar com USDC (Base)
                </Button>
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

