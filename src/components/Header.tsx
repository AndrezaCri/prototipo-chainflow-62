import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <header className="flex items-center justify-between bg-background px-4 py-6 border-b border-border lg:px-24 md:px-10" role="banner">
        <div className="text-2xl font-bold lg:text-3xl" style={{ color: 'hsl(var(--logo-color))' }}>
          ChainFlow
        </div>
      
        <nav className="flex items-center gap-6">
          <Link to="/defi-investor" className="text-base font-normal text-foreground cursor-pointer hover:text-primary transition-colors">
            DeFi Investors
          </Link>
        </nav>
        
        <form onSubmit={handleSearch} className="relative hidden w-96 sm:block lg:w-[500px]" role="search">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full bg-muted py-3 pl-12 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Buscar produtos"
          />
        </form>
        
        <div className="flex items-center gap-4">
          {/* Botão de Conectar Carteira */}
          <ConnectButton />
        </div>
      </header>
    </>
  );
};