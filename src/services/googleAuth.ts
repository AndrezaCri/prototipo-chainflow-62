// Google OAuth Configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '281508231912-sk4kenoled17i1udfr44pf1rsipa8c53.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'https://311193ea-13fe-497c-abe1-e419b92bc1af.lovableproject.com/auth/google/callback';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export interface GoogleAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user: GoogleUser;
}

class GoogleAuthService {
  private clientId: string;
  private redirectUri: string;

  constructor() {
    this.clientId = GOOGLE_CLIENT_ID;
    this.redirectUri = GOOGLE_REDIRECT_URI;
  }

  /**
   * Inicia o fluxo de autenticação OAuth do Google
   */
  initiateGoogleLogin(): void {
    const scope = 'openid email profile';
    const responseType = 'code';
    const state = this.generateState();
    
    // Salvar state no localStorage para verificação posterior
    localStorage.setItem('google_oauth_state', state);
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', this.clientId);
    authUrl.searchParams.set('redirect_uri', this.redirectUri);
    authUrl.searchParams.set('response_type', responseType);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    // Redirecionar para Google OAuth
    window.location.href = authUrl.toString();
  }

  /**
   * Processa o callback do Google OAuth
   */
  async handleGoogleCallback(code: string, state: string): Promise<GoogleAuthResponse> {
    // Verificar state para prevenir CSRF
    const savedState = localStorage.getItem('google_oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid state parameter');
    }

    try {
      // Trocar código por token de acesso
      const tokenResponse = await this.exchangeCodeForToken(code);
      
      // Obter informações do usuário
      const userInfo = await this.getUserInfo(tokenResponse.access_token);
      
      // Limpar state do localStorage
      localStorage.removeItem('google_oauth_state');
      
      return {
        ...tokenResponse,
        user: userInfo
      };
    } catch (error) {
      console.error('Erro no callback do Google:', error);
      throw error;
    }
  }

  /**
   * Troca o código de autorização por token de acesso
   */
  private async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
  }> {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Obtém informações do usuário usando o token de acesso
   */
  private async getUserInfo(accessToken: string): Promise<GoogleUser> {
    const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    
    const response = await fetch(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Gera um state aleatório para CSRF protection
   */
  private generateState(): string {
    const array = new Uint32Array(4);
    crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  }

  /**
   * Verifica se o usuário está logado
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('google_access_token');
    const expiry = localStorage.getItem('google_token_expiry');
    
    if (!token || !expiry) {
      return false;
    }
    
    return Date.now() < parseInt(expiry);
  }

  /**
   * Salva os dados de autenticação no localStorage
   */
  saveAuthData(authResponse: GoogleAuthResponse): void {
    const expiryTime = Date.now() + (authResponse.expires_in * 1000);
    
    localStorage.setItem('google_access_token', authResponse.access_token);
    localStorage.setItem('google_token_expiry', expiryTime.toString());
    localStorage.setItem('google_user', JSON.stringify(authResponse.user));
  }

  /**
   * Obtém os dados do usuário logado
   */
  getCurrentUser(): GoogleUser | null {
    if (!this.isLoggedIn()) {
      return null;
    }
    
    const userData = localStorage.getItem('google_user');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Faz logout do usuário
   */
  logout(): void {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    localStorage.removeItem('google_user');
    localStorage.removeItem('google_oauth_state');
  }

  /**
   * Simula login para desenvolvimento (quando não há client_id configurado)
   */
  simulateGoogleLogin(): Promise<GoogleAuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: GoogleUser = {
          id: '123456789',
          email: 'usuario@chainflow.com',
          name: 'Usuário ChainFlow',
          picture: 'https://via.placeholder.com/150',
          verified_email: true
        };

        const mockResponse: GoogleAuthResponse = {
          access_token: 'mock_access_token_' + Date.now(),
          token_type: 'Bearer',
          expires_in: 3600,
          scope: 'openid email profile',
          user: mockUser
        };

        this.saveAuthData(mockResponse);
        resolve(mockResponse);
      }, 1500);
    });
  }
}

export const googleAuthService = new GoogleAuthService();

