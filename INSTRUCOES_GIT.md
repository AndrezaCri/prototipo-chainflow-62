# Instruções para Atualizar o Repositório Git na Sua Máquina Local

## Passo a Passo

### 1. Baixar as Alterações do Sandbox

Primeiro, você precisa baixar os arquivos modificados do sandbox para sua máquina local. Você pode fazer isso de algumas formas:

**Opção A: Baixar arquivos específicos**
- Baixe os arquivos que foram modificados/criados:
  - `src/main.tsx`
  - `src/components/Header.tsx`
  - `src/components/CartDrawer.tsx`
  - `contracts/PaymentReceiver.sol`
  - `scripts/deploy.cjs`
  - `hardhat.config.cjs`
  - `IMPLEMENTACAO_BASE_USDC.md`
  - `package.json` (com as novas dependências)

**Opção B: Baixar o projeto completo**
- Baixe todo o diretório `/home/ubuntu/prototipo-chainflow-62` como um arquivo ZIP

### 2. Navegar para o Diretório do Projeto

Abra o terminal (ou prompt de comando) na sua máquina e navegue até o diretório do seu projeto:

```bash
cd caminho/para/seu/prototipo-chainflow-62
```

### 3. Verificar o Status do Git

Primeiro, verifique se você está em um repositório Git:

```bash
git status
```

Se não for um repositório Git, inicialize um:

```bash
git init
git remote add origin https://github.com/AndrezaCri/prototipo-chainflow-62.git
```

### 4. Configurar suas Credenciais Git (se necessário)

Se ainda não configurou suas credenciais Git globalmente:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### 5. Adicionar os Arquivos Modificados

Adicione todos os arquivos modificados ao staging:

```bash
git add .
```

Ou adicione arquivos específicos:

```bash
git add src/main.tsx
git add src/components/Header.tsx
git add src/components/CartDrawer.tsx
git add contracts/PaymentReceiver.sol
git add scripts/deploy.cjs
git add hardhat.config.cjs
git add IMPLEMENTACAO_BASE_USDC.md
git add package.json
```

### 6. Fazer o Commit das Alterações

Crie um commit com uma mensagem descritiva:

```bash
git commit -m "feat: Implementar pagamentos USDC com Base Pay

- Adicionar integração com RainbowKit e Wagmi
- Criar contrato inteligente PaymentReceiver
- Implementar lógica de pagamento USDC no carrinho
- Configurar redes Base Mainnet e Sepolia
- Adicionar documentação da implementação"
```

### 7. Enviar as Alterações para o GitHub

Envie as alterações para o repositório remoto:

```bash
git push origin main
```

Se for o primeiro push ou se a branch não existir:

```bash
git push -u origin main
```

## Comandos Resumidos

```bash
# Navegar para o diretório
cd caminho/para/seu/prototipo-chainflow-62

# Verificar status
git status

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "feat: Implementar pagamentos USDC com Base Pay"

# Enviar para GitHub
git push origin main
```

## Possíveis Problemas e Soluções

### Problema: "Authentication failed"

**Solução:** Se você estiver usando autenticação de dois fatores (2FA) no GitHub, você precisará usar um Personal Access Token (PAT) em vez da sua senha:

1. Vá para GitHub → Settings → Developer settings → Personal access tokens
2. Gere um novo token com permissões de `repo`
3. Use o token como senha quando solicitado

### Problema: "Updates were rejected"

**Solução:** Isso acontece quando há conflitos. Primeiro, puxe as alterações do remoto:

```bash
git pull origin main
```

Resolva os conflitos se houver, depois faça o push novamente.

### Problema: "Repository not found"

**Solução:** Verifique se o URL do repositório está correto:

```bash
git remote -v
```

Se estiver incorreto, atualize:

```bash
git remote set-url origin https://github.com/AndrezaCri/prototipo-chainflow-62.git
```

## Verificar se Deu Certo

Após o push, você pode verificar se as alterações foram enviadas:

1. Acesse https://github.com/AndrezaCri/prototipo-chainflow-62
2. Verifique se os arquivos modificados estão lá
3. Verifique se o commit aparece no histórico

## Próximos Passos

Após atualizar o repositório, você pode:

1. Clonar o repositório em outra máquina
2. Instalar as dependências: `npm install`
3. Seguir as instruções do arquivo `IMPLEMENTACAO_BASE_USDC.md` para testar a implementação

