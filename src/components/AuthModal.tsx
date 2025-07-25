import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { User, Mail, Wallet, Shield, TrendingUp, RefreshCw, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { googleAuthService, GoogleUser } from '@/services/googleAuth';
import { SwapModal } from './SwapModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [authMethod, setAuthMethod] = useState<'select' | 'google' | 'web3' | 'email'>('select');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);

  // Verificar se usuário já está logado com Google
  useEffect(() => {
    const user = googleAuthService.getCurrentUser();
    if (user) {
      setGoogleUser(user);
    }
  }, []);

  // Processar callback do Google OAuth se presente na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state && isOpen) {
      handleGoogleCallback(code, state);
    }
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthMethod('google');
    
    try {
      // Verificar se há client ID configurado
      const hasClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID && 
                          import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your-google-client-id';
      
      if (hasClientId) {
        // Login real com Google OAuth
        googleAuthService.initiateGoogleLogin();
      } else {
        // Simulação para desenvolvimento
        const authResponse = await googleAuthService.simulateGoogleLogin();
        setGoogleUser(authResponse.user);
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${authResponse.user.name}!`,
        });
        
        setAuthMethod('select');
      }
    } catch (error) {
      console.error('Erro no login Google:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao fazer login com Google. Tente novamente.",
        variant: "destructive"
      });
      setAuthMethod('select');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCallback = async (code: string, state: string) => {
    setLoading(true);
    
    try {
      const authResponse = await googleAuthService.handleGoogleCallback(code, state);
      setGoogleUser(authResponse.user);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${authResponse.user.name}!`,
      });
      
      // Limpar parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      setAuthMethod('select');
    } catch (error) {
      console.error('Erro no callback Google:', error);
      toast({
        title: "Erro na autenticação",
        description: "Ocorreu um erro durante a autenticação. Tente novamente.",
        variant: "destructive"
      });
      setAuthMethod('select');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simular envio de link por email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Link enviado!",
        description: `Um link de acesso foi enviado para ${email}`,
      });
      
      setAuthMethod('select');
      setEmail('');
    } catch (error) {
      toast({
        title: "Erro no envio",
        description: "Não foi possível enviar o link. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    googleAuthService.logout();
    setGoogleUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const resetModal = () => {
    setAuthMethod('select');
    setEmail('');
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const openSwapModal = () => {
    setShowSwapModal(true);
  };

  // Se usuário já está logado, mostrar perfil
  if (googleUser && authMethod === 'select') {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#c1e428]" />
                Perfil do Usuário
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <img 
                  src={googleUser.picture} 
                  alt={googleUser.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{googleUser.name}</h3>
                  <p className="text-sm text-gray-600">{googleUser.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Verificado</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Funcionalidades disponíveis:</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={openSwapModal}
                    className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg"
                    variant="ghost"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium text-sm">SWAP USDC ⇄ BRZ</div>
                      <div className="text-xs text-blue-600">Troque tokens na Base Sepolia</div>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Benefícios da sua conta:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-[#c1e428]" />
                    Acesso ao crédito ChainFlow
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-[#c1e428]" />
                    Compras B2B facilitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <Wallet className="h-3 w-3 text-[#c1e428]" />
                    Transações seguras
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="flex-1"
                >
                  Sair
                </Button>
                <Button 
                  onClick={handleClose}
                  className="flex-1 bg-[#c1e428] hover:bg-[#a8c424] text-black"
                >
                  Continuar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <SwapModal 
          isOpen={showSwapModal} 
          onClose={() => setShowSwapModal(false)} 
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#c1e428]" />
              Entrar no ChainFlow
            </DialogTitle>
          </DialogHeader>

          {authMethod === 'select' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Escolha como deseja acessar o ChainFlow
              </p>

              <div className="space-y-3">
                {/* Login com Google */}
                <Button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center gap-3 p-4 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 font-medium rounded-lg transition-colors"
                  variant="ghost"
                >
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Continuar com Google</div>
                    <div className="text-xs text-blue-600">Acesso rápido e seguro</div>
                  </div>
                </Button>

                <div className="text-center text-sm text-gray-500">ou</div>

                {/* Conectar Carteira Web3 */}
                <div className="border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 rounded-lg p-4 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-orange-800">Conectar Carteira Web3</div>
                      <div className="text-xs text-orange-600">MetaMask, Coinbase, Rainbow...</div>
                    </div>
                  </div>
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <Button
                        onClick={openConnectModal}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Conectar Carteira
                      </Button>
                    )}
                  </ConnectButton.Custom>
                </div>

                {/* Login com Email */}
                <Button
                  onClick={() => setAuthMethod('email')}
                  className="w-full flex items-center gap-3 p-4 border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 font-medium rounded-lg transition-colors"
                  variant="ghost"
                >
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Login com Email</div>
                    <div className="text-xs text-purple-600">Receba um link de acesso</div>
                  </div>
                </Button>
              </div>

              {/* Funcionalidades disponíveis */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-[#c1e428]" />
                  Funcionalidades disponíveis:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <ArrowUpDown className="h-3 w-3 text-[#c1e428]" />
                    SWAP USDC ⇄ BRZ na Base Sepolia
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-[#c1e428]" />
                    Acesso ao crédito ChainFlow
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-[#c1e428]" />
                    Compras B2B facilitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <Wallet className="h-3 w-3 text-[#c1e428]" />
                    Transações seguras
                  </li>
                </ul>
              </div>
            </div>
          )}

          {authMethod === 'google' && loading && (
            <div className="space-y-4">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-[#c1e428] mx-auto mb-4" />
                <h3 className="font-medium">Conectando com Google...</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Você será redirecionado para fazer login
                </p>
              </div>
            </div>
          )}

          {authMethod === 'email' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setAuthMethod('select')}
                  variant="outline"
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleEmailLogin}
                  disabled={loading}
                  className="flex-1 bg-[#c1e428] hover:bg-[#a8c424] text-black"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Link'
                  )}
                </Button>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Como funciona:</strong> Enviaremos um link seguro para seu email. 
                  Clique no link para acessar sua conta ChainFlow.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SwapModal 
        isOpen={showSwapModal} 
        onClose={() => setShowSwapModal(false)} 
      />
    </>
  );
};

