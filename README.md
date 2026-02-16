# CRM KLP - Sistema de Gestão Comercial

Este é um sistema de CRM desenvolvido para gestão de clientes e vendas, integrado com Supabase.

## 🚀 Como fazer o Deploy

Este projeto está separado em duas partes lógicas: Frontend (React) e Backend (Node.js).

### 1. Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Supabase](https://supabase.com) (Banco de Dados configurado)
- Conta no [Netlify](https://netlify.com) (Frontend)
- Conta no [Render](https://render.com) (Backend)

### 2. Configuração do Backend (Render)

O backend (`backend/server.js`) é responsável pela lógica de negócios e conexão segura com o Supabase.

1. Crie um novo **Web Service** no Render.
2. Conecte seu repositório GitHub.
3. **Root Directory:** `.` (raiz)
4. **Build Command:** `npm install`
5. **Start Command:** `node backend/server.js`
6. **Variáveis de Ambiente (Opcional):** Adicione as variáveis do Supabase se necessário.

### 3. Configuração do Frontend (Netlify)

O frontend é a interface React.

1. Crie um novo **Site from Git** no Netlify.
2. Conecte seu repositório.
3. **Build Command:** `npm run build`
4. **Publish Directory:** `dist`
5. **Variáveis de Ambiente:** É importante configurar a URL do backend.
    - No código, atualize `src/services/api.ts` para apontar para a URL do Render (ex: `https://seu-backend.onrender.com/api`).

### 4. Importante

- O arquivo `netlify.toml` já está configurado para lidar com rotas do React Router.
- O `.gitignore` evita que arquivos locais (como planilhas Excel usadas em desenvolvimento) subam para o repositório.

## 🛠 Comandos Úteis

### Instalação

```bash
npm install
```

### Rodar Localmente

```bash
npm run start:all
```

Isso inicia tanto o backend quanto o frontend simultaneamente.

### Build de Produção

```bash
npm run build
```

## 📦 Estrutura do Projeto

- `/src`: Código fonte do Frontend (React)
- `/backend`: Código do servidor Node.js e serviços
- `/public`: Arquivos estáticos
