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
  return <>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <header className="bg-background px-4 py-6 border-b border-border lg:px-24 md:px-10" role="banner">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:gap-6">
            <div className="flex items-center justify-between md:justify-start">
              <div className="text-2xl font-bold lg:text-3xl md:order-1" style={{
              color: 'hsl(var(--logo-color))'
            }}>
                ChainFlow
              </div>
              <div className="scale-90 md:scale-100 md:order-2">
                <ConnectButton />
              </div>
            </div>
            <nav className="mt-2 md:mt-0">
              <Link to="/defi-investor" className="text-base font-normal text-foreground cursor-pointer hover:text-primary transition-colors">
                DeFi Investors
              </Link>
            </nav>
          </div>
          
          
        </div>
      </header>
    </>;
};