import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { ChevronLeft, Plus, Minus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  unit: string;
  quantity: number;
  total: number;
}

export default function Cart() {
  // Dados de exemplo do carrinho
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Fertilizante NPK Premium',
      image: '/placeholder.svg',
      price: 89.90,
      unit: 'kg',
      quantity: 2,
      total: 179.80
    },
    {
      id: '2', 
      name: 'Sementes de Milho Híbrido',
      image: '/placeholder.svg',
      price: 156.00,
      unit: 'kg',
      quantity: 1,
      total: 156.00
    }
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    setCartItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const totalValue = cartItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Cabeçalho da página */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-5 w-5" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold">Carrinho de Compras</h1>
        </div>

        {cartItems.length === 0 ? (
          /* Carrinho vazio */
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-xl font-semibold mb-2">Seu carrinho está vazio</h2>
              <p className="text-muted-foreground mb-6">Adicione produtos para começar a comprar</p>
              <Link to="/">
                <Button>Continuar Comprando</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Carrinho com itens */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de itens */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg bg-muted"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-muted-foreground">R$ {item.price.toFixed(2)} por {item.unit}</p>
                      </div>

                      {/* Controles de quantidade */}
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Preço total e remover */}
                      <div className="text-right">
                        <p className="font-semibold text-lg">R$ {item.total.toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Resumo do pedido */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Resumo do Pedido</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'})</span>
                      <span>R$ {totalValue.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Frete</span>
                      <span className="text-green-600">Grátis</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>R$ {totalValue.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button className="w-full" size="lg">
                      Finalizar Compra
                    </Button>
                    
                    <Link to="/" className="block">
                      <Button variant="outline" className="w-full">
                        Continuar Comprando
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}