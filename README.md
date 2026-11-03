# 🚀 FinTrack - Sistema de Gestão Financeira Pessoal

Sistema moderno e completo de controle financeiro pessoal construído com **React, Node.js, Express e PostgreSQL**, utilizando os recursos de nuvem do **Neon** (Database, Neon Auth e Neon Realtime).

![Status do Projeto](https://img.shields.io/badge/Status-Em_Construção-success?style=for-the-badge)
![Tecnologias](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20PostgreSQL%20%7C%20TailwindCSS-blue?style=for-the-badge)

---

## 📸 Funcionalidades

- 💰 **Dashboard de Finanças:** Visualização instantânea do **Saldo Atual**, **Total de Receitas** e **Total de Despesas**.
- ➕ **Lançamento Rápido:** Cadastro de novas despesas e receitas categorizadas com cálculo em tempo real.
- 🗂️ **Categorias Relacionais:** Organização por Alimentação, Moradia, Transporte, Salário, Investimentos, etc.
- 🗑️ **Gestão de Extrato:** Exclusão e listagem de transações com badge visual de categoria e data formatada.
- ⚡ **Banco na Nuvem:** Conexão nativa com PostgreSQL gerenciado na nuvem pelo **Neon**.
- 🔒 **Arquitetura Pronta para Auth & Realtime:** Suporte a Neon Auth (Better Auth) e Live Queries via WebSocket.

---

## 🛠️ Tecnologias Utilizadas

### Front-end:
* **React.js** com **Vite**
* **TailwindCSS** (Design moderno, responsivo e Dark Mode)
* **Lucide React** (Ícones modernos e leves)

### Back-end & Banco de Dados:
* **Node.js** com **Express**
* **PostgreSQL** hospedado no **Neon.tech**
* **Driver `pg`** com Pool de conexões seguras (SSL)
* **Neon Realtime SDK** (`@neon/realtime`)
* **Neon Auth** (Configuração com JWKS e Better Auth)

---

## 📂 Estrutura do Projeto

```text
Evolucao/
├── client/                     # Front-end React (Vite)
│   ├── src/
│   │   ├── App.jsx             # Componente principal do Dashboard
│   │   ├── index.css           # Configuração de estilo TailwindCSS
│   │   └── main.jsx
│   └── package.json
│
├── src/                        # Back-end API (Node.js)
│   └── server.js               # Rotas REST e conexão com PostgreSQL
│
├── scripts/
│   ├── test-services.js        # Teste automatizado de banco e Auth
│   └── test-realtime.js        # Teste de Live Queries via WebSocket
│
├── neon.ts                     # Configuração de infraestrutura como código (IaC)
└── package.json
```

---

## 🚀 Como Executar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/jjfatx/fintrack.git
cd fintrack
```

### 2. Configurar as Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz com suas credenciais do Neon:
```env
DATABASE_URL=seu_link_de_conexao_postgresql
NEON_REALTIME_URL=sua_url_realtime
NEON_REALTIME_SECRET=seu_segredo_realtime
```

### 3. Rodar o Back-end
```bash
npm install
npm start
```
*O servidor iniciará em `http://localhost:3001`.*

### 4. Rodar o Front-end
Em outro terminal:
```bash
cd client
npm install
npm run dev
```
*Abra `http://localhost:5173` no navegador.*

---

## 👨‍💻 Autor

Desenvolvido por **[Adriel Dias Severino](https://www.linkedin.com/in/adriel-d-654285287/)**  
*Estudante de Análise e Desenvolvimento de Sistemas (FATEC).*
