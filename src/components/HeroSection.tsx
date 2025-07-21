import React from 'react';

export const HeroSection: React.FC = () => {
  const handleShopNow = () => {
    console.log('Shop Now clicked');
  };

  return (
    <section className="flex items-center bg-[#f2f0f1] relative pt-[103px] pb-[116px] px-[100px] max-md:flex-col max-md:text-center max-md:px-10 max-md:py-[60px] max-sm:px-5 max-sm:py-10">
      <div className="flex-1 max-w-[577px] max-md:max-w-full">
        <div className="mb-12">
          <h1 className="text-[64px] font-bold leading-[64px] text-black mb-8 max-md:text-5xl max-md:leading-[52px] max-sm:text-4xl max-sm:leading-10 max-sm:mb-5">
            FIND CLOTHES THAT MATCHES YOUR STYLE
          </h1>
          <p className="text-base font-normal leading-[22px] text-[#666666] mb-8 max-sm:text-sm max-sm:leading-5 max-sm:mb-6">
            Browse through our diverse range of meticulously crafted
            garments, designed to bring out your individuality and cater to
            your sense of style.
          </p>
          <button 
            onClick={handleShopNow}
            className="bg-black text-white text-base font-medium cursor-pointer transition-all duration-300 ease-in-out px-[54px] py-4 rounded-[62px] max-sm:text-sm max-sm:px-10 max-sm:py-3 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black/50"
          >
            Shop Now
          </button>
        </div>
        
        <div className="flex gap-8 max-md:justify-center max-md:flex-wrap max-md:gap-6 max-sm:flex-col max-sm:gap-4 max-sm:text-center">
          <div className="text-left max-sm:text-center">
            <div className="text-[40px] font-bold text-black leading-[54px] max-sm:text-[32px]">
              200+
            </div>
            <div className="text-base font-normal text-[#666666] leading-[22px] max-sm:text-sm">
              International Brands
            </div>
          </div>
          <div className="text-left max-sm:text-center">
            <div className="text-[40px] font-bold text-black leading-[54px] max-sm:text-[32px]">
              2,000+
            </div>
            <div className="text-base font-normal text-[#666666] leading-[22px] max-sm:text-sm">
              High-Quality Products
            </div>
          </div>
          <div className="text-left max-sm:text-center">
            <div className="text-[40px] font-bold text-black leading-[54px] max-sm:text-[32px]">
              30,000+
            </div>
            <div className="text-base font-normal text-[#666666] leading-[22px] max-sm:text-sm">
              Happy Customers
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative flex-1 flex justify-center items-center max-md:mt-10">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/61a64dbfb6af0037f0e948e7540a24639f0362ab?width=1728"
          alt="Fashion models wearing stylish clothing"
          className="w-full max-w-[390px] h-auto object-cover"
        />
        <div className="absolute text-[104px] text-black right-[10%] top-[20%] max-sm:text-6xl pointer-events-none">
          ✦
        </div>
        <div className="absolute text-[104px] text-black left-[10%] bottom-[20%] max-sm:text-6xl pointer-events-none">
          ✦
        </div>
      </div>
    </section>
  );
};
