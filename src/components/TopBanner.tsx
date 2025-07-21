import React, { useState } from 'react';

export const TopBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-black text-white text-center relative text-sm font-normal px-0 py-3 max-sm:text-xs max-sm:px-4 max-sm:py-2">
      <div className="flex items-center justify-center">
        <span className="mr-2">
          Sign up and get 20% off to your first order.
        </span>
        <button className="underline cursor-pointer ml-2 hover:no-underline transition-all">
          Sign Up Now
        </button>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute -translate-y-2/4 cursor-pointer text-base right-6 top-2/4 max-sm:right-4 hover:opacity-70 transition-opacity"
        aria-label="Close banner"
      >
        ✕
      </button>
    </div>
  );
};
