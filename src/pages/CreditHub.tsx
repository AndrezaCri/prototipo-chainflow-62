import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CreditRequest } from '@/components/CreditRequest';
import { CreditPools } from '@/components/CreditPools';
import { CreditDashboard } from '@/components/CreditDashboard';
import { WalletDetection } from '@/components/WalletDetection';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Shield, 
  DollarSign, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

type TabType = 'request' | 'pools' | 'dashboard';

const CreditHub = () => {
  const [activeTab, setActiveTab] = useState<TabType>('request');

  const stats = [
    {
      label: 'Total Financiado',
      value: 'R$ 2.5M+',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      label: 'PMEs Atendidas',
      value: '150+',
      icon: Building2,
      color: 'text-blue-500'
    },
    {
      label: 'Taxa de Sucesso',
      value: '98.6%',
      icon: CheckCircle,
      color: 'text-purple-500'
    },
    {
      label: 'Investidores Ativos',
      value: '127',
      icon: Users,
      color: 'text-orange-500'
    }
  ];

  const features = [
    {
      title: 'Crédito Rápido',
      description: 'Análise automatizada em minutos com IA e blockchain',
      icon: TrendingUp
    },
    {
      title: 'Baixo Risco',
      description: 'Pools diversificados com scoring avançado de empresas',
      icon: Shield
    },
    {
      title: 'Transparência Total',
      description: 'Todas as transações registradas on-chain na Base',
      icon: BarChart3
    }
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen bg-gray-50 font-['Inter']">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link to="/" className="text-2xl font-bold" style={{ color: '#c1e428' }}>
                  ChainFlow <span className="text-gray-600">Credit</span>
                </Link>
                
                <nav className="hidden md:flex items-center gap-6">
                  <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Marketplace
                  </Link>
                  <Link to="/defi-investor" className="text-gray-600 hover:text-gray-900 transition-colors">
                    DeFi
                  </Link>
                  <span className="text-gray-900 font-medium">Credit Hub</span>
                </nav>
              </div>

              <ConnectButton />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Credit Hub
                <span className="block text-[#c1e428]">SeamlessFi Integration</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Conecte PMEs brasileiras a investidores globais através de pools de crédito 
                tokenizados na rede Base, com análise de risco automatizada e transparência total.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setActiveTab('request')}
                  className="bg-[#c1e428] text-black font-semibold px-8 py-4 rounded-lg hover:bg-[#a8c523] transition-colors flex items-center justify-center gap-2"
                >
                  Solicitar Crédito
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setActiveTab('pools')}
                  className="border border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-gray-900 transition-colors"
                >
                  Investir em Pools
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Por que escolher o ChainFlow Credit?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tecnologia blockchain, inteligência artificial e pools de liquidez 
                para revolucionar o crédito B2B no Brasil
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-8 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-center mb-4">
                    <feature.icon className="h-12 w-12 text-[#c1e428]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Wallet Detection */}
        <WalletDetection>
          <div></div>
        </WalletDetection>

        {/* Main Content Tabs */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="border-b border-gray-200 bg-white rounded-lg shadow-sm">
                <nav className="flex">
                  {[
                    { id: 'request', label: 'Solicitar Crédito', icon: Building2 },
                    { id: 'pools', label: 'Pools de Investimento', icon: TrendingUp },
                    { id: 'dashboard', label: 'Analytics Dashboard', icon: BarChart3 }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`flex items-center gap-3 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-[#c1e428] text-[#c1e428] bg-green-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm">
              {activeTab === 'request' && (
                <div className="p-8">
                  <CreditRequest />
                </div>
              )}
              
              {activeTab === 'pools' && (
                <div className="p-8">
                  <CreditPools />
                </div>
              )}
              
              {activeTab === 'dashboard' && (
                <div className="p-8">
                  <CreditDashboard />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#c1e428] to-[#a8c523]">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-black mb-6">
              Pronto para revolucionar seu negócio?
            </h2>
            <p className="text-xl text-gray-800 mb-8">
              Junte-se a centenas de PMEs que já utilizam nossa plataforma 
              para obter crédito rápido e seguro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActiveTab('request')}
                className="bg-black text-white font-semibold px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Começar Agora
              </button>
              <Link
                to="/defi-investor"
                className="border-2 border-black text-black font-semibold px-8 py-4 rounded-lg hover:bg-black hover:text-white transition-colors inline-flex items-center justify-center"
              >
                Explorar DeFi
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="text-2xl font-bold mb-4" style={{ color: '#c1e428' }}>
                  ChainFlow
                </div>
                <p className="text-gray-400">
                  Plataforma DeFi B2B para PMEs brasileiras
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Produtos</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/" className="hover:text-white transition-colors">Marketplace</Link></li>
                  <li><Link to="/defi-investor" className="hover:text-white transition-colors">DeFi Platform</Link></li>
                  <li><span className="hover:text-white transition-colors">Credit Hub</span></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Tecnologia</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Base Network</li>
                  <li>SeamlessFi</li>
                  <li>USDC/BRZ</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Suporte</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Documentação</li>
                  <li>FAQ</li>
                  <li>Contato</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 ChainFlow. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default CreditHub;

