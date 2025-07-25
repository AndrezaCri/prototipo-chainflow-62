import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
          <Link to="/defi-investor" className="text-base font-normal text-black cursor-pointer hover:opacity-70 transition-opacity">
            DeFi Investors
          </Link>
          
        </nav>
      
        <form onSubmit={handleSearch} className="relative hidden w-96 sm:block lg:w-[500px]" role="search">
          <input type="search" placeholder="Buscar produtos..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full rounded-full bg-muted py-3 px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Buscar produtos" />
        </form>
      
        <div className="flex items-center gap-4">
          {/* Botão de Conectar Carteira */}
          <div className="hidden sm:block">
            <ConnectButton />
          </div>
        </div>
      
        <button className="rounded-full p-2 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Abrir menu móvel" aria-expanded={isMobileMenuOpen}>
          <Menu className="h-5 w-5" />
        </button>
      
        {isMobileMenuOpen && <div className="absolute top-full left-0 right-0 bg-white border-t border-[#f0f0f0] p-4 md:hidden z-50">
            <nav className="flex flex-col gap-4">
              <Link to="/defi-investor" className="text-base font-normal text-black">DeFi Investors</Link>
              <Link to="/credit-hub" className="text-base font-normal text-black">Credit Hub</Link>
            
              {/* Botão de Conectar Carteira no menu móvel */}
              <div className="mt-4">
                <ConnectButton />
              </div>
            </nav>
          </div>}
      </header>
    </>;
};