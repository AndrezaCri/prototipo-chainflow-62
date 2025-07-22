import React, { useEffect, useState } from 'react';

interface WalletDetectionProps {
  children: React.ReactNode;
}

export const WalletDetection: React.FC<WalletDetectionProps> = ({ children }) => {
  const [walletStatus, setWalletStatus] = useState({
    hasMetaMask: false,
    hasCoinbase: false,
    hasAnyWallet: false,
    isChecking: true
  });

  useEffect(() => {
    const checkWallets = () => {
      const hasMetaMask = typeof window.ethereum !== 'undefined' && 
                          (window.ethereum.isMetaMask || window.ethereum.providers?.some((p: any) => p.isMetaMask));
      
      const hasCoinbase = typeof window.ethereum !== 'undefined' && 
                          (window.ethereum.isCoinbaseWallet || window.ethereum.providers?.some((p: any) => p.isCoinbaseWallet));
      
      const hasAnyWallet = typeof window.ethereum !== 'undefined';

      setWalletStatus({
        hasMetaMask,
        hasCoinbase,
        hasAnyWallet,
        isChecking: false
      });

      // Log para debug
      console.log('🔍 Detecção de Carteiras:', {
        hasMetaMask,
        hasCoinbase,
        hasAnyWallet,
        ethereum: window.ethereum,
        providers: window.ethereum?.providers
      });
    };

    // Verificar imediatamente
    checkWallets();

    // Verificar novamente após um delay (para extensões que carregam depois)
    const timer = setTimeout(checkWallets, 1000);

    // Escutar eventos de carregamento de extensões
    window.addEventListener('ethereum#initialized', checkWallets);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('ethereum#initialized', checkWallets);
    };
  }, []);

  if (walletStatus.isChecking) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-600">Verificando carteiras instaladas...</div>
      </div>
    );
  }

  if (!walletStatus.hasAnyWallet) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <div className="text-yellow-600">⚠️</div>
          <div>
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Nenhuma carteira detectada
            </h3>
            <p className="text-sm text-yellow-700 mb-3">
              Para usar as funcionalidades DeFi, você precisa instalar uma carteira Web3:
            </p>
            <div className="space-y-2">
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                📦 Instalar MetaMask
              </a>
              <br />
              <a 
                href="https://www.coinbase.com/wallet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                📦 Instalar Coinbase Wallet
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {walletStatus.hasAnyWallet && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="text-green-600">✅</div>
            <div className="text-sm text-green-800">
              Carteira detectada! Você pode conectar e usar as funcionalidades DeFi.
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

