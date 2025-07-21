import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { CategoryFilter } from './CategoryFilter';
import { CartDrawer } from './CartDrawer';

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

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Óleo de Soja Refinado - Galão 20L',
    category: 'Alimentos',
    price: 85.90,
    unit: 'un',
    minOrder: 5,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
    paymentTerms: {
      cash: 85.90,
      days30: 89.20,
      days60: 92.50,
      days90: 95.80
    }
  },
  {
    id: '2',
    name: 'Refrigerante Cola 2L - Caixa 12un',
    category: 'Bebidas',
    price: 48.50,
    unit: 'cx',
    minOrder: 2,
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=400&fit=crop',
    paymentTerms: {
      cash: 48.50,
      days30: 50.45,
      days60: 52.40,
      days90: 54.35
    }
  },
  {
    id: '3',
    name: 'Papel Higiênico 30m - Fardo 64 rolos',
    category: 'Higiene',
    price: 127.80,
    unit: 'fd',
    minOrder: 1,
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
    paymentTerms: {
      cash: 127.80,
      days30: 132.90,
      days60: 138.00,
      days90: 143.10
    }
  },
  {
    id: '4',
    name: 'Arroz Longo 5kg - Saco',
    category: 'Alimentos',
    price: 24.90,
    unit: 'sc',
    minOrder: 10,
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=400&fit=crop',
    paymentTerms: {
      cash: 24.90,
      days30: 25.90,
      days60: 26.90,
      days90: 27.90
    }
  },
  {
    id: '5',
    name: 'Sabão em Pó 2kg - Caixa 12un',
    category: 'Limpeza',
    price: 89.70,
    unit: 'cx',
    minOrder: 3,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
    paymentTerms: {
      cash: 89.70,
      days30: 93.20,
      days60: 96.70,
      days90: 100.20
    }
  },
  {
    id: '6',
    name: 'Água Mineral 500ml - Caixa 24un',
    category: 'Bebidas',
    price: 18.90,
    unit: 'cx',
    minOrder: 5,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
    paymentTerms: {
      cash: 18.90,
      days30: 19.65,
      days60: 20.40,
      days90: 21.15
    }
  }
];

interface CartItem extends Product {
  quantity: number;
}

export const B2BMarketplace: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categories = Array.from(new Set(mockProducts.map(product => product.category)));

  const filteredProducts = selectedCategory === 'all' 
    ? mockProducts 
    : mockProducts.filter(product => product.category === selectedCategory);

  const handleBuyNow = (product: Product) => {
    console.log('Buy now:', product);
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace B2B</h1>
            <p className="text-gray-600">Produtos em atacado para seu negócio</p>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Carrinho ({cartItemCount})
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onBuyNow={handleBuyNow}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          total={cartTotal}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />
      </div>
    </main>
  );
};
