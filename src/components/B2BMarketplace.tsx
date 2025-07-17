
import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { CategoryFilter } from './CategoryFilter';

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
    name: 'Embalagem Plástica Transparente 500ml - Pacote 100un',
    category: 'Embalagens',
    price: 32.90,
    unit: 'pct',
    minOrder: 10,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    paymentTerms: {
      cash: 32.90,
      days30: 34.20,
      days60: 35.50,
      days90: 36.80
    }
  },
  {
    id: '4',
    name: 'Farinha de Trigo Especial - Saco 25kg',
    category: 'Alimentos',
    price: 45.80,
    unit: 'sc',
    minOrder: 3,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
    paymentTerms: {
      cash: 45.80,
      days30: 47.60,
      days60: 49.40,
      days90: 51.20
    }
  },
  {
    id: '5',
    name: 'Suco Natural Laranja 1L - Caixa 12un',
    category: 'Bebidas',
    price: 65.90,
    unit: 'cx',
    minOrder: 2,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop',
    paymentTerms: {
      cash: 65.90,
      days30: 68.50,
      days60: 71.10,
      days90: 73.70
    }
  },
  {
    id: '6',
    name: 'Caixas de Papelão 30x30x20cm - Pacote 50un',
    category: 'Embalagens',
    price: 85.00,
    unit: 'pct',
    minOrder: 5,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=400&fit=crop',
    paymentTerms: {
      cash: 85.00,
      days30: 88.40,
      days60: 91.80,
      days90: 95.20
    }
  }
];

const categories = ['Alimentos', 'Bebidas', 'Embalagens'];

export const B2BMarketplace: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<Product[]>([]);

  const filteredProducts = selectedCategory === 'all' 
    ? mockProducts 
    : mockProducts.filter(product => product.category === selectedCategory);

  const handleAddToOrder = (product: Product) => {
    console.log('Adicionado ao pedido:', product.name);
    setCart(prev => [...prev, product]);
    // Aqui você implementaria a lógica para adicionar ao carrinho/pedido
  };

  const handleBuyNow = (product: Product) => {
    console.log('Comprar agora:', product.name);
    // Aqui você implementaria a lógica para compra imediata
  };

  return (
    <main id="main-content" className="bg-muted/30 py-12 px-4 lg:px-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-foreground">Marketplace B2B</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Encontre os melhores produtos para o seu negócio com condições especiais de pagamento
          </p>
        </header>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <section aria-label="Lista de produtos">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToOrder={handleAddToOrder}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        </section>

        {cart.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg">
            Itens no pedido: {cart.length}
          </div>
        )}
      </div>
    </main>
  );
};

