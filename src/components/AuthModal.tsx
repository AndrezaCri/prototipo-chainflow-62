import React, { useState } from 'react';
import { X, Wallet, Mail, Shield, Zap, Globe } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [authMethod, setAuthMethod] = useState<'wallet' | 'email' | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Simular login com Google
      console.log('Iniciando login com Google...');
      
      // Em produção, aqui seria a integração real com Google OAuth
      // window.location.href = '/auth/google';
      
      // Simulação de sucesso
      setTimeout(() => {
        alert('✅ Login com Google realizado com sucesso!\n\nBem-vindo ao ChainFlow!');
        setIsLoading(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Erro no login:', error);
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simular login com email
      console.log('Login com email:', email);
      
      setTimeout(() => {
        alert('✅ Link de acesso enviado para seu email!\n\nVerifique sua caixa de entrada.');
        setIsLoading(false);
        setEmail('');
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Erro no login:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {authMethod === 'wallet' ? 'Conectar Carteira' : 
             authMethod === 'email' ? 'Login com Email' : 
             'Entrar no ChainFlow'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {!authMethod ? (
            // Seleção do método de autenticação
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm">
                  Escolha como deseja acessar o ChainFlow
                </p>
              </div>

              {/* Login com Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group disabled:opacity-50"
              >
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center">
                  <Mail className="h-3 w-3 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Continuar com Google</div>
                  <div className="text-sm text-gray-500">Acesso rápido e seguro</div>
                </div>
              </button>

              {/* Separador */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500">ou</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Conectar Carteira Web3 */}
              <button
                onClick={() => setAuthMethod('wallet')}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all group"
              >
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Wallet className="h-3 w-3 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Conectar Carteira Web3</div>
                  <div className="text-sm text-gray-500">MetaMask, Coinbase, Rainbow...</div>
                </div>
              </button>

              {/* Login com Email */}
              <button
                onClick={() => setAuthMethod('email')}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all group"
              >
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Mail className="h-3 w-3 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Login com Email</div>
                  <div className="text-sm text-gray-500">Receba um link de acesso</div>
                </div>
              </button>

              {/* Benefícios */}
              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Por que criar uma conta?
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-blue-500" />
                    <span>Acesso ao crédito ChainFlow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 text-green-500" />
                    <span>Compras B2B facilitadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-purple-500" />
                    <span>Transações seguras</span>
                  </div>
                </div>
              </div>
            </div>
          ) : authMethod === 'wallet' ? (
            // Interface de carteira Web3
            <div className="space-y-4">
              <button
                onClick={() => setAuthMethod(null)}
                className="text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                ← Voltar
              </button>
              
              <div className="text-center mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Conectar uma Carteira</h3>
                <p className="text-sm text-gray-600">
                  Conecte sua carteira Web3 para acessar todas as funcionalidades DeFi
                </p>
              </div>

              {/* RainbowKit Connect Button */}
              <div className="flex justify-center">
                <ConnectButton />
              </div>

              {/* Informações sobre carteiras */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-medium text-blue-900 mb-2">O que é uma Carteira?</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>• Um lar para seus ativos digitais</p>
                  <p>• Carteiras são usadas para enviar, receber e armazenar criptomoedas</p>
                  <p>• Uma nova maneira de fazer login sem senhas</p>
                </div>
              </div>
            </div>
          ) : (
            // Interface de login com email
            <div className="space-y-4">
              <button
                onClick={() => setAuthMethod(null)}
                className="text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                ← Voltar
              </button>
              
              <div className="text-center mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Login com Email</h3>
                <p className="text-sm text-gray-600">
                  Digite seu email e receba um link seguro de acesso
                </p>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Enviando...' : 'Enviar Link de Acesso'}
                </button>
              </form>

              <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Verifique sua caixa de entrada e spam. 
                  O link de acesso expira em 15 minutos.
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center">
              <div className="bg-white p-6 rounded-xl flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700">Processando...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

