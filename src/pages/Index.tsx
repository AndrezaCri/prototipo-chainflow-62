
import React from 'react';
import { TopBanner } from '@/components/TopBanner';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { BrandLogos } from '@/components/BrandLogos';
import { B2BMarketplace } from '@/components/B2BMarketplace';

const Index = () => {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div className="max-w-[1440px] w-full bg-white mx-auto my-0 max-md:max-w-[991px] max-sm:max-w-screen-sm font-['Inter']">
       {/*<TopBanner />*/}
       <Header />
        <main>
          {/*<HeroSection />
          <BrandLogos />*/}
          <B2BMarketplace />
        </main>
      </div>
    </>
  );
};

export default Index;
