# ChainFlow - DeFi Investment Platform

Uma plataforma moderna de investimentos DeFi que permite aos usuários gerenciar portfolios, participar de pools de liquidez e realizar transações de tokens de forma segura e intuitiva.

## 🚀 Funcionalidades Principais

### 💼 Portfolio Dashboard
- **Visualização Completa**: Acompanhe todos os seus investimentos DeFi em um só lugar
- **Métricas em Tempo Real**: Valores atualizados de tokens, rendimentos e performance
- **Gráficos Interativos**: Visualize o histórico de performance dos seus investimentos
- **Análise de Diversificação**: Entenda a distribuição dos seus ativos

### 🏊 Pools de Liquidez
- **Participação em Pools**: Forneça liquidez e ganhe recompensas
- **APY Dinâmico**: Visualize rendimentos estimados e APYs em tempo real
- **Staking/Unstaking**: Interface simples para adicionar/remover liquidez
- **Histórico de Recompensas**: Acompanhe seus ganhos ao longo do tempo

### 🔄 Token Swap
- **Troca Instantânea**: Realize swaps de tokens de forma segura
- **Melhores Taxas**: Integração com múltiplas DEXs para melhor preço
- **Slippage Control**: Configure tolerância de slippage personalizada
- **Transações Seguras**: Validação de contratos e verificação de tokens

### 🔌 Conexão de Carteira
- **Multi-Wallet**: Suporte para MetaMask, WalletConnect, Coinbase Wallet
- **Multi-Chain**: Compatível com Ethereum, Polygon, BSC e outras redes
- **Sessão Persistente**: Mantenha-se conectado entre sessões
- **Transações Seguras**: Assinatura de transações com sua carteira

### 🏢 Marketplace B2B
- **Transações Comerciais**: Plataforma para negócios B2B em blockchain
- **Contratos Inteligentes**: Execução automática de acordos comerciais
- **Escrow Descentralizado**: Proteção para ambas as partes na transação
- **KYC/AML**: Verificação de identidade para transações comerciais

### 📊 Analytics e Relatórios
- **Dashboard Detalhado**: Métricas completas de performance
- **Exportação de Dados**: Relatórios para declaração de imposto de renda
- **Alertas Personalizados**: Notificações sobre oportunidades de investimento
- **Análise de Risco**: Avaliação automática do risco do seu portfolio

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Blockchain**: Wagmi + Viem para interação Web3
- **Carteiras**: RainbowKit para conexão de carteiras
- **Roteamento**: React Router DOM
- **Gráficos**: Recharts para visualização de dados
- **Build Tool**: Vite
- **Componentes**: Radix UI primitives

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse a aplicação em `http://localhost:5173`

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run preview` - Visualiza a build de produção localmente
- `npm run lint` - Executa o linter

## 🎯 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de UI (Shadcn)
│   ├── Header.tsx      # Cabeçalho da aplicação
│   ├── HeroSection.tsx # Seção hero
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── Index.tsx       # Página inicial
│   ├── DeFiInvestor.tsx# Página do investidor DeFi
│   └── Cart.tsx        # Página do carrinho
├── hooks/              # Hooks customizados
├── lib/                # Utilitários e configurações
└── main.tsx           # Ponto de entrada da aplicação
```

## 🌐 Como Utilizar a Plataforma

### 🔗 Primeira Conexão
1. **Conecte sua Carteira**: Clique em "Connect Wallet" no canto superior direito
2. **Selecione sua Carteira**: Escolha entre MetaMask, WalletConnect ou outras opções
3. **Autorize a Conexão**: Aprove a conexão em sua carteira
4. **Verifique a Rede**: Certifique-se de estar na rede correta (Ethereum, Polygon, etc.)

### 💰 Gerenciando seu Portfolio
1. **Acesse o Dashboard**: Navegue até a seção "DeFi Investors"
2. **Visualize seus Ativos**: Veja todos os tokens e posições em um só lugar
3. **Analise Performance**: Use os gráficos para acompanhar rendimentos
4. **Configure Alertas**: Defina notificações para oportunidades

### 🏊‍♂️ Participando de Pools de Liquidez
1. **Explore Pools Disponíveis**: Veja APYs e requisitos de cada pool
2. **Selecione um Pool**: Escolha baseado no risco e retorno desejado
3. **Forneça Liquidez**: Deposite tokens seguindo as proporções necessárias
4. **Monitore Recompensas**: Acompanhe ganhos em tempo real

### 🔄 Realizando Token Swaps
1. **Acesse a Seção Swap**: Use a interface de troca de tokens
2. **Selecione Tokens**: Escolha o token de origem e destino
3. **Configure Slippage**: Ajuste tolerância para variação de preço
4. **Execute a Transação**: Confirme na sua carteira e aguarde confirmação

### 🏢 Utilizando o Marketplace B2B
1. **Verificação KYC**: Complete o processo de verificação de identidade
2. **Navegue Ofertas**: Explore oportunidades comerciais disponíveis
3. **Negocie Termos**: Use contratos inteligentes para acordos seguros
4. **Execute Transações**: Finalize negócios com escrow automático

## 🛠️ Funcionalidades Web3 Avançadas

- **Multi-Signature**: Suporte para carteiras multi-assinatura
- **Gas Optimization**: Estimativas precisas e otimização de taxas
- **Cross-Chain**: Bridges automáticas entre diferentes blockchains
- **Smart Contract Interaction**: Interface direta com contratos DeFi
- **MEV Protection**: Proteção contra ataques de valor extraível maximal

## 📱 Experiência Móvel Otimizada

A aplicação foi desenvolvida com mobile-first:
- **Touch Navigation**: Gestos intuitivos para navegação
- **Responsive Charts**: Gráficos adaptados para telas pequenas
- **Quick Actions**: Acesso rápido às funções principais
- **Offline Mode**: Visualização de dados em cache quando offline

## 🚀 Deploy

### Via Lovable
Simplesmente abra [Lovable](https://lovable.dev/projects/f151160a-400c-4b27-b47d-850bb1b421ac) e clique em Share -> Publish.

### Deploy Manual
A aplicação pode ser facilmente deployed em plataformas como:
- Vercel
- Netlify
- GitHub Pages

Para fazer o deploy:
```bash
npm run build
```

## 🔗 Domínio Customizado

Sim, você pode conectar um domínio customizado!

Para conectar um domínio, navegue até Project > Settings > Domains e clique em Connect Domain.

Leia mais aqui: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 💻 Como Editar o Código

### Use Lovable
Simplesmente visite o [Lovable Project](https://lovable.dev/projects/f151160a-400c-4b27-b47d-850bb1b421ac) e comece a fazer prompts.

Mudanças feitas via Lovable serão commitadas automaticamente neste repo.

### Use seu IDE preferido
Se você quer trabalhar localmente usando seu próprio IDE, pode clonar este repo e fazer push das mudanças. Mudanças enviadas também serão refletidas no Lovable.

O único requisito é ter Node.js & npm instalados - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Siga estes passos:

```sh
# Passo 1: Clone o repositório usando a URL Git do projeto.
git clone <YOUR_GIT_URL>

# Passo 2: Navegue para o diretório do projeto.
cd <YOUR_PROJECT_NAME>

# Passo 3: Instale as dependências necessárias.
npm i

# Passo 4: Inicie o servidor de desenvolvimento com auto-reload e preview instantâneo.
npm run dev
```

### Edite um arquivo diretamente no GitHub
- Navegue para o arquivo desejado.
- Clique no botão "Edit" (ícone de lápis) no topo direito da visualização do arquivo.
- Faça suas mudanças e commite as mudanças.

### Use GitHub Codespaces
- Navegue para a página principal do seu repositório.
- Clique no botão "Code" (botão verde) próximo ao topo direito.
- Selecione a aba "Codespaces".
- Clique em "New codespace" para lançar um novo ambiente Codespace.
- Edite arquivos diretamente dentro do Codespace e commite e faça push das suas mudanças quando terminar.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**URL do Projeto**: https://lovable.dev/projects/f151160a-400c-4b27-b47d-850bb1b421ac

Desenvolvido com ❤️ usando Lovable