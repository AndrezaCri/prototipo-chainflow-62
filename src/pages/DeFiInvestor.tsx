
import React, { useState } from 'react';
import { PortfolioDashboard } from '@/components/PortfolioDashboard';
import { LiquidityPools } from '@/components/LiquidityPools';
import { WalletDetection } from '@/components/WalletDetection';
import { SwapModal } from '@/components/SwapModal';
import { CreditPools } from '@/components/CreditPools';

import { PaymentDashboard } from '@/components/PaymentDashboard';
import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, CreditCard, Shield } from 'lucide-react';

const DeFiInvestor = () => {
  const [activeTab, setActiveTab] = useState('pools');
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div className="max-w-[1440px] w-full bg-white mx-auto my-0 max-md:max-w-[991px] max-sm:max-w-screen-sm font-['Inter']">
        {/* Header matching main page */}
        <header className="flex items-center justify-between bg-white px-[100px] py-6 border-b-[#f0f0f0] border-b border-solid max-md:px-10 max-md:py-5 max-sm:px-5 max-sm:py-4">
          <Link to="/" className="text-[32px] font-bold max-sm:text-2xl hover:opacity-70 transition-opacity" style={{ color: 'hsl(var(--logo-color))' }}>
            ChainFlow <span className="opacity-60">DeFi</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
          </nav>

          <ConnectButton />
        </header>

        {/* Hero Section */}
        <section className="bg-[#f2f0f1] pt-[103px] pb-[116px] px-[100px] max-md:px-10 max-md:py-[60px] max-sm:px-5 max-sm:py-10">
          <div className="max-w-[800px]">
            <h1 className="text-[64px] font-bold leading-[64px] text-black mb-8 max-md:text-5xl max-md:leading-[52px] max-sm:text-4xl max-sm:leading-10 max-sm:mb-5">
              FINANCE B2B BUSINESS
            </h1>
            <p className="text-base font-normal leading-[22px] text-[#666666] mb-8 max-sm:text-sm max-sm:leading-5 max-sm:mb-6">
              Plataforma DeFi integrada com SWAP USDC ⇄ BRZ, crédito ChainFlow, compras B2B e transações seguras.
            </p>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <ArrowLeftRight className="w-6 h-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">SWAP USDC/BRZ</h3>
                <p className="text-xs text-muted-foreground">Base Sepolia</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <CreditCard className="w-6 h-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Crédito ChainFlow</h3>
                <p className="text-xs text-muted-foreground">Acesso facilitado</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <Shield className="w-6 h-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Transações</h3>
                <p className="text-xs text-muted-foreground">Seguras</p>
              </div>
            </div>
            
            <div className="flex gap-8 max-md:justify-center max-md:flex-wrap max-md:gap-6 max-sm:flex-col max-sm:gap-4">
              <div className="text-left max-sm:text-center">
                <div className="text-[40px] font-bold text-black leading-[54px] max-sm:text-[32px]">
                  $2.5M+
                </div>
                <div className="text-base font-normal text-[#666666] leading-[22px] max-sm:text-sm">
                  Total Value Locked
                </div>
              </div>
              <div className="text-left max-sm:text-center">
                <div className="text-[40px] font-bold text-black leading-[54px] max-sm:text-[32px]">
                  8.5%
                </div>
                <div className="text-base font-normal text-[#666666] leading-[22px] max-sm:text-sm">
                  Average APY
                </div>
              </div>
              <div className="text-left max-sm:text-center">
                <div className="text-[40px] font-bold text-black leading-[54px] max-sm:text-[32px]">
                  150+
                </div>
                <div className="text-base font-normal text-[#666666] leading-[22px] max-sm:text-sm">
                  Active Investors
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Section adapted for partners */}
        {/*<section className="bg-black flex items-center justify-between flex-wrap px-[100px] py-11 max-md:gap-6 max-md:px-10 max-md:py-8 max-sm:flex-col max-sm:gap-4 max-sm:px-5 max-sm:py-6">
          {['ETHEREUM', 'POLYGON', 'CHAINLINK', 'UNISWAP', 'COMPOUND'].map((partner, index) => (
            <div 
              key={index}
              className="text-white text-[33px] font-bold max-sm:text-2xl hover:opacity-70 transition-opacity cursor-pointer"
            >
              {partner}
            </div>
          ))}
        </section>*/}

        {/* Main Content */}
        <main className="px-[100px] py-12 max-md:px-10 max-sm:px-5">
          <WalletDetection>
            {/* Portfolio Section - Always visible */}
            <div className="mb-16" id="portfolio">
              <PortfolioDashboard />
            </div>


            {/* Main Content */}
            <div id="pools">
              <LiquidityPools />
            </div>
          </WalletDetection>

          {/* Swap Modal */}
          <SwapModal 
            isOpen={isSwapModalOpen} 
            onClose={() => setIsSwapModalOpen(false)} 
          />
        </main>
      </div>
    </>
  );
};

export default DeFiInvestor;
