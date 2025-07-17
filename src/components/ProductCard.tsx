
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBuyNow }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(product.minOrder);

  const handleOpenDialog = () => {
    setQuantity(product.minOrder);
    setIsDialogOpen(true);
  };

  const handleAddToCart = () => {
    toast({
      title: "Produto adicionado ao carrinho",
      description: `${quantity} ${product.unit} de ${product.name} adicionado ao carrinho.`,
    });
    setIsDialogOpen(false);
  };

  const totalPrice = (product.paymentTerms.cash * quantity).toFixed(2);

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
            <div className="text-lg font-bold text-green-600">
              À vista: R$ {product.paymentTerms.cash.toFixed(2)}/{product.unit}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>30 dias: R$ {product.paymentTerms.days30.toFixed(2)}/{product.unit}</div>
              <div>60 dias: R$ {product.paymentTerms.days60.toFixed(2)}/{product.unit}</div>
              <div>90 dias: R$ {product.paymentTerms.days90.toFixed(2)}/{product.unit}</div>
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              size="sm" 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleOpenDialog}
            >
              Comprar
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar ao Carrinho</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div>
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-muted-foreground">R$ {product.paymentTerms.cash.toFixed(2)}/{product.unit}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min={product.minOrder}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(product.minOrder, parseInt(e.target.value) || product.minOrder))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo: {product.minOrder} {product.unit}
              </p>
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">R$ {totalPrice}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddToCart}>
              Adicionar ao Carrinho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

