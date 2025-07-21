
import React, { useState } from 'react';

export const WalletConnection: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    // Simulate wallet connection
    const mockAddress = '0x1234...5678';
    setWalletAddress(mockAddress);
    setIsConnected(true);
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setIsConnected(false);
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <div className="bg-[#00C851] text-white px-4 py-2 rounded-[62px] flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Connected</span>
        </div>
        <button
          onClick={disconnectWallet}
          className="bg-[#f0f0f0] text-black text-sm font-medium px-4 py-2 rounded-[62px] hover:bg-gray-200 transition-all"
        >
          {walletAddress}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="bg-black text-white text-base font-medium px-[54px] py-4 rounded-[62px] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black/50 transition-all duration-300"
    >
      Connect Wallet
    </button>
  );
};
