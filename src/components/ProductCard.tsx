
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ChainFlowPayment } from './ChainFlowPayment';
import { usePixPayments } from '@/hooks/usePixPayments';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  minOrder: number;
  image: string;
  paymentTerms: {
    cash: number;
    days30: number;
    days60: number;
    days90: number;
  };
}

interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBuyNow, onAddToCart }) => {
  const { toast } = useToast();
  const { generateSupplierPayment, generateBuyerCharge } = usePixPayments();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [quantity, setQuantity] = useState(product.minOrder);

  const handleOpenPayment = () => {
    setQuantity(product.minOrder);
    setIsPaymentOpen(true);
  };

  const handlePaymentComplete = async (paymentData: any) => {
    console.log('Payment completed:', paymentData);
    
    if (paymentData.paymentMethod === 'cash') {
      // Pagamento convencional - apenas confirmar sem processar PIX
      toast({
        title: "Pagamento convencional confirmado",
        description: `Pedido confirmado para finalização.`,
      });
      
      // Adicionar ao carrinho sem processar pagamentos PIX
      onAddToCart(product, quantity);
    } else {
      // Pagamento a prazo - ChainFlow Credit
      if (paymentData.creditApproved && paymentData.applicationId) {
        try {
          // 1. Processar pagamento para o fornecedor
          const supplierPayment = await generateSupplierPayment({
            supplierId: `supplier_${product.id}`,
            supplierName: `Fornecedor ${product.category}`,
            supplierCnpj: '12.345.678/0001-90',
            supplierPixKey: 'fornecedor@email.com',
            amount: paymentData.totalAmount,
            applicationId: paymentData.applicationId,
            productDescription: `${product.name} - ${quantity} ${product.unit}`
          });

          if (supplierPayment) {
            // 2. Gerar cobrança para o comprador (na data de vencimento)
            const dueDate = new Date(paymentData.dueDate);
            const buyerCharge = await generateBuyerCharge(
              paymentData.applicationId,
              '98.765.432/0001-10', // CNPJ do comprador (seria obtido do formulário)
              paymentData.totalAmount,
              dueDate
            );

            if (buyerCharge) {
              toast({
                title: "Crédito ChainFlow aprovado!",
                description: `O fornecedor receberá à vista. Você receberá a cobrança em ${dueDate.toLocaleDateString('pt-BR')}.`,
              });
            }
          }
        } catch (error) {
          toast({
            title: "Erro no processamento",
            description: "Ocorreu um erro ao processar os pagamentos.",
            variant: "destructive"
          });
        }
      }
      
      // Adicionar ao carrinho
      onAddToCart(product, quantity);
    }
  };

  // Preços corretos: compradores pagam preço cheio, fornecedores dão 5% para ChainFlow
  const fullPrice = product.price; // Preço que o comprador paga
  const supplierReceives = fullPrice * 0.95; // Fornecedor recebe 95% (ChainFlow fica com 5%)

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-3">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</span>
            <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-600">Pedido mín: {product.minOrder} {product.unit}</p>
          </div>
          
          <div className="space-y-2">
            <div className="text-lg font-bold text-blue-600">
              À vista: R$ {product.paymentTerms.cash.toFixed(2)}/{product.unit}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>30 dias:</span>
                <span className="font-medium">R$ {product.paymentTerms.days30.toFixed(2)}/{product.unit}</span>
              </div>
              <div className="flex justify-between">
                <span>60 dias:</span>
                <span className="font-medium">R$ {product.paymentTerms.days60.toFixed(2)}/{product.unit}</span>
              </div>
              <div className="flex justify-between">
                <span>90 dias:</span>
                <span className="font-medium">R$ {product.paymentTerms.days90.toFixed(2)}/{product.unit}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2 space-y-2">
            <Button 
              size="sm" 
              className="w-full bg-[#c1e428] hover:bg-[#a8c523] text-black font-semibold"
              onClick={handleOpenPayment}
            >
              Comprar
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Pagamento à vista ou financiado pela ChainFlow
            </p>
          </div>
        </div>
      </div>

      <ChainFlowPayment
        product={product}
        quantity={quantity}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
};

