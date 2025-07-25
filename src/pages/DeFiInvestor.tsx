
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

            {/* SWAP Interface */}
            <div className="mb-8 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">SWAP USDC ⇄ BRZ</h2>
                  <p className="text-sm text-gray-600 mt-1">Base Sepolia Network</p>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  Live
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Token De */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500 mb-2">De</div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">0.0</div>
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-semibold">BRZ</span>
                    </div>
                  </div>
                </div>
                
                {/* Switch Button */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-lg"></div>
                    <Button 
                      onClick={() => setIsSwapModalOpen(true)}
                      size="lg"
                      className="relative bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <ArrowLeftRight className="w-5 h-5 mr-2" />
                      Swap
                    </Button>
                  </div>
                </div>
                
                {/* Token Para */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow lg:order-last">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500 mb-2">Para</div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">0,0</div>
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-semibold">USDC</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-100">
                  <div className="text-xs text-gray-500">Taxa</div>
                  <div className="font-semibold text-gray-900">1 USDC = 5.2 BRZ</div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-100">
                  <div className="text-xs text-gray-500">Fee</div>
                  <div className="font-semibold text-gray-900">0.3%</div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-100">
                  <div className="text-xs text-gray-500">Slippage</div>
                  <div className="font-semibold text-gray-900">0.5%</div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-100">
                  <div className="text-xs text-gray-500">Liquidez</div>
                  <div className="font-semibold text-green-600">Alta</div>
                </div>
              </div>
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
