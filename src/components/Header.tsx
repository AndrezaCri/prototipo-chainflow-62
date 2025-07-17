
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="flex items-center justify-between bg-white px-[100px] py-6 border-b-[#f0f0f0] border-b border-solid max-md:px-10 max-md:py-5 max-sm:px-5 max-sm:py-4">
      <div className="text-[32px] font-bold text-black max-sm:text-2xl">
        ChainFlow
      </div>
      
      <nav className="flex items-center gap-6 max-md:hidden">
       {/*div className="flex items-center cursor-pointer hover:opacity-70 transition-opacity">
          <span className="text-base font-normal text-black">Shop</span>
          <span className="text-sm text-black ml-1">▼</span>
        </div>
       <a href="#" className="text-base font-normal text-black cursor-pointer hover:opacity-70 transition-opacity">
          On Sale
        </a>
        <a href="#" className="text-base font-normal text-black cursor-pointer hover:opacity-70 transition-opacity">
          New Arrivals
        </a>
        <a href="#" className="text-base font-normal text-black cursor-pointer hover:opacity-70 transition-opacity">
          Brands
        </a>*/}
        <Link to="/defi-investor" className="text-base font-normal text-black cursor-pointer hover:opacity-70 transition-opacity">
          DeFi Investors
        </Link>
      </nav>
      
      <form onSubmit={handleSearch} className="relative w-[577px] max-md:w-[300px] max-sm:hidden">
        <span className="absolute -translate-y-2/4 text-xl text-[#666666] left-4 top-2/4">🔍</span>
        <input
          type="search"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#f0f0f0] text-base font-normal text-black pl-12 pr-4 py-3 rounded-[62px] border-none focus:outline-none focus:ring-2 focus:ring-black/20"
          aria-label="Search for products"
        />
      </form>
      
      <div className="flex items-center gap-3.5">
        <button className="text-2xl text-black cursor-pointer hover:opacity-70 transition-opacity" aria-label="Shopping cart">
          🛒
        </button>
        <button className="text-2xl text-black cursor-pointer hover:opacity-70 transition-opacity" aria-label="User account">
          👤
        </button>
      </div>
      
      <button 
        className="hidden text-2xl text-black cursor-pointer max-md:block hover:opacity-70 transition-opacity"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle mobile menu"
      >
        ☰
      </button>
      
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-[#f0f0f0] p-4 md:hidden z-50">
          <nav className="flex flex-col gap-4">
            <a href="#" className="text-base font-normal text-black">Shop</a>
            <a href="#" className="text-base font-normal text-black">On Sale</a>
            <a href="#" className="text-base font-normal text-black">New Arrivals</a>
            <a href="#" className="text-base font-normal text-black">Brands</a>
            <Link to="/defi-investor" className="text-base font-normal text-black">DeFi Investor</Link>
            <form onSubmit={handleSearch} className="relative mt-4">
              <span className="absolute -translate-y-2/4 text-xl text-[#666666] left-4 top-2/4">🔍</span>
              <input
                type="search"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f0f0f0] text-base font-normal text-black pl-12 pr-4 py-3 rounded-[62px] border-none focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </form>
          </nav>
        </div>
      )}
    </header>
  );
};
