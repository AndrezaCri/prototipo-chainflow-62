import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'

import { 
  getDefaultConfig, 
  RainbowKitProvider,
  connectorsForWallets 
} from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  coinbaseWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { WagmiProvider } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

// Configuração personalizada de carteiras para melhor detecção
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        rainbowWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: 'ChainFlow',
    projectId: '81f33bfdc2779abb1b9295edb1c591e3',
  }
)

const config = getDefaultConfig({
  appName: 'ChainFlow',
  projectId: '81f33bfdc2779abb1b9295edb1c591e3',
  chains: [base, baseSepolia],
  connectors,
  ssr: false,
})

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <App />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
