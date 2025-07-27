
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AuthModal } from './AuthModal';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return <>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <header className="flex items-center justify-between bg-background px-4 py-6 border-b border-border lg:px-24 md:px-10" role="banner">
        <div className="text-2xl font-bold lg:text-3xl" style={{
        color: '#c1e428'
      }}>
          ChainFlow
        </div>
      
      <nav className="flex items-center gap-6 max-md:hidden">
        <Link to="/defi-investor" className="text-base font-normal text-black cursor-pointer hover:opacity-70 transition-opacity">DeFi Investors</Link>
      </nav>
      
      <form onSubmit={handleSearch} className="relative hidden w-96 sm:block lg:w-[500px]" role="search">
        
        
      </form>
      
      <div className="flex items-center gap-4">
        {/* Botão de Login/Conectar */}
        <div className="hidden sm:block">
          <button onClick={() => setIsAuthModalOpen(true)} className="bg-[#c1e428] text-black px-6 py-2 rounded-full font-medium hover:bg-[#a8c424] transition-colors">
            Entrar
          </button>
        </div>
        
        <button className="rounded-full p-2 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Carrinho de compras">
          
        </button>
        <button className="rounded-full p-2 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Conta do usuário">
          
        </button>
      </div>
      
      {/* Substituir ícone de hambúrguer por DeFi Investors em mobile */}
      <Link 
        to="/defi-investor" 
        className="text-base font-normal text-black cursor-pointer hover:opacity-70 transition-opacity md:hidden"
        aria-label="Ir para DeFi Investors"
      >
        DeFi Investors
      </Link>
      
      {/* Menu móvel agora sempre visível */}
      <div className="absolute top-full left-0 right-0 bg-white border-t border-[#f0f0f0] p-4 md:hidden z-50">
        <nav className="flex flex-col gap-4">
          <a href="#" className="text-base font-normal text-black">Shop</a>
          <a href="#" className="text-base font-normal text-black">On Sale</a>
          <a href="#" className="text-base font-normal text-black">New Arrivals</a>
          <a href="#" className="text-base font-normal text-black">Brands</a>
          <Link to="/defi-investor" className="text-base font-normal text-black">DeFi Investor</Link>
          <Link to="/credit-hub" className="text-base font-normal text-black">Credit Hub</Link>
          
          {/* Botão de Login no menu móvel */}
          <div className="mt-4">
            <button onClick={() => setIsAuthModalOpen(true)} className="w-full bg-[#c1e428] text-black px-6 py-2 rounded-full font-medium hover:bg-[#a8c424] transition-colors">
              Entrar
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="relative mt-4">
            <span className="absolute -translate-y-2/4 text-xl text-[#666666] left-4 top-2/4">🔍</span>
            <input type="search" placeholder="Search for products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#f0f0f0] text-base font-normal text-black pl-12 pr-4 py-3 rounded-[62px] border-none focus:outline-none focus:ring-2 focus:ring-black/20" />
          </form>
        </nav>
      </div>
      
      {/* Modal de Autenticação */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
    </>;
};
