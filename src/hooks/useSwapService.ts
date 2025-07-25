import { useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { usdcBrzSwapService } from '@/services/usdcBrzSwap';

export const useSwapService = () => {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const initializeService = async () => {
      if (isConnected && walletClient && window.ethereum) {
        try {
          // Criar provider ethers a partir do walletClient
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await usdcBrzSwapService.initialize(provider);
          console.log('Swap service initialized successfully');
        } catch (error) {
          console.error('Failed to initialize swap service:', error);
        }
      }
    };

    initializeService();
  }, [isConnected, walletClient]);

  return {
    isInitialized: isConnected && !!walletClient
  };
};