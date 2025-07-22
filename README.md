# ChainFlow - DeFi Investment Platform

Uma plataforma moderna de investimentos DeFi que permite aos usuários gerenciar portfolios, participar de pools de liquidez e realizar transações de tokens de forma segura e intuitiva.

## 🚀 Funcionalidades

- **Portfolio Dashboard**: Visualize e gerencie seus investimentos DeFi
- **Pools de Liquidez**: Participe de pools de liquidez com diferentes APYs
- **Token Swap**: Troque tokens de forma segura
- **Conexão de Carteira**: Integração com carteiras Web3 via RainbowKit
- **Marketplace B2B**: Plataforma para transações comerciais
- **Design Responsivo**: Interface otimizada para dispositivos móveis e desktop

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

## 🌐 Funcionalidades Web3

- **Conexão de Carteira**: Suporte para MetaMask, WalletConnect e outras carteiras
- **Multi-chain**: Preparado para múltiplas redes blockchain
- **Token Swaps**: Interface intuitiva para troca de tokens
- **Pools de Liquidez**: Visualização e participação em pools DeFi

## 📱 Responsividade

A aplicação foi desenvolvida com foco em experiência móvel:
- Layout adaptativo para diferentes tamanhos de tela
- Navegação otimizada para dispositivos móveis
- Componentes touch-friendly

## 🎨 Design System

O projeto utiliza um sistema de design consistente baseado em:
- Tokens de cor semânticos definidos em CSS variables
- Componentes Shadcn/ui customizados
- Animações e transições suaves
- Modo escuro/claro

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