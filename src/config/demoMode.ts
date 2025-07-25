// Configuração do Modo Demo ChainFlow
// Este arquivo controla se o sistema opera em modo demonstração ou produção

export const DEMO_CONFIG = {
  // Ativar modo demo (true = simulação, false = blockchain real)
  DEMO_MODE: true,
  
  // Configurações de simulação
  SIMULATION: {
    // Delay para simular transações blockchain (ms)
    TRANSACTION_DELAY: 2000,
    
    // Probabilidade de sucesso das transações (0-1)
    SUCCESS_RATE: 0.95,
    
    // Valores iniciais para demonstração
    INITIAL_BALANCES: {
      ETH: 1.5,
      USDC: 10000,
      BRZ: 50000
    },
    
    // Dados de pools de crédito simulados
    CREDIT_POOLS: {
      pool30d: {
        tvl: 1250000,
        apy: 8.5,
        defaultRate: 2.1,
        activeLoans: 156
      },
      pool60d: {
        tvl: 850000,
        apy: 10.2,
        defaultRate: 3.2,
        activeLoans: 89
      },
      pool90d: {
        tvl: 650000,
        apy: 12.8,
        defaultRate: 4.5,
        activeLoans: 67
      }
    },
    
    // Dados de empresas para análise de crédito
    SAMPLE_COMPANIES: [
      {
        cnpj: "12.345.678/0001-90",
        name: "Tech Solutions Ltda",
        monthlyRevenue: 150000,
        creditScore: 8.5,
        riskLevel: "Low"
      },
      {
        cnpj: "98.765.432/0001-10",
        name: "Distribuidora ABC",
        monthlyRevenue: 85000,
        creditScore: 7.2,
        riskLevel: "Medium"
      }
    ]
  },
  
  // URLs e endpoints para modo demo
  DEMO_ENDPOINTS: {
    BLOCKCHAIN_RPC: "demo://localhost",
    CREDIT_API: "demo://credit-service",
    PIX_API: "demo://pix-service"
  },
  
  // Mensagens para modo demo
  DEMO_MESSAGES: {
    TRANSACTION_SUCCESS: "✅ Transação simulada com sucesso!",
    CREDIT_APPROVED: "🎉 Crédito aprovado em modo demonstração!",
    PAYMENT_PROCESSED: "💳 Pagamento processado (simulação)"
  }
};

// Função para verificar se está em modo demo
export const isDemoMode = (): boolean => {
  return DEMO_CONFIG.DEMO_MODE;
};

// Função para simular delay de transação
export const simulateTransactionDelay = (): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, DEMO_CONFIG.SIMULATION.TRANSACTION_DELAY);
  });
};

// Função para simular sucesso/falha de transação
export const simulateTransactionResult = (): boolean => {
  return Math.random() < DEMO_CONFIG.SIMULATION.SUCCESS_RATE;
};

// Função para gerar hash de transação simulado
export const generateMockTxHash = (): string => {
  return `0x${Math.random().toString(16).substr(2, 64)}`;
};

// Função para gerar endereço simulado
export const generateMockAddress = (): string => {
  return `0x${Math.random().toString(16).substr(2, 40)}`;
};

