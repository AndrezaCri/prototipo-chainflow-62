
import React from 'react';
import { Button } from '@/components/ui/button';

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
  return (
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
            onClick={() => onBuyNow(product)}
          >
            Comprar
          </Button>
        </div>
      </div>
    </div>
  );
};

