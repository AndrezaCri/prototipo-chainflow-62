<<<<<<< HEAD
import React from 'react';

export const BrandLogos: React.FC = () => {
  const brands = [
    'VERSACE',
    'ZARA',
    'GUCCI',
    'PRADA',
    'Calvin Klein'
  ];

  return (
    <section className="bg-black flex items-center justify-between flex-wrap px-[100px] py-11 max-md:gap-6 max-md:px-10 max-md:py-8 max-sm:flex-col max-sm:gap-4 max-sm:px-5 max-sm:py-6">
      {brands.map((brand, index) => (
        <div 
          key={index}
          className="text-white text-[33px] font-bold max-sm:text-2xl hover:opacity-70 transition-opacity cursor-pointer"
        >
          {brand}
        </div>
      ))}
    </section>
  );
};
=======
import React from 'react';

export const BrandLogos: React.FC = () => {
  const brands = [
    'VERSACE',
    'ZARA',
    'GUCCI',
    'PRADA',
    'Calvin Klein'
  ];

  return (
    <section className="bg-black flex items-center justify-between flex-wrap px-[100px] py-11 max-md:gap-6 max-md:px-10 max-md:py-8 max-sm:flex-col max-sm:gap-4 max-sm:px-5 max-sm:py-6">
      {brands.map((brand, index) => (
        <div 
          key={index}
          className="text-white text-[33px] font-bold max-sm:text-2xl hover:opacity-70 transition-opacity cursor-pointer"
        >
          {brand}
        </div>
      ))}
    </section>
  );
};
>>>>>>> origin/test
