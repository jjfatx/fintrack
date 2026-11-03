# Planejamento do Projeto: FinTrack (Gestão Financeira Pessoal)

Sistema completo de controle e gestão financeira pessoal com arquitetura cliente-servidor (Full-Stack).

---

## 🎯 Objetivo Profissional
* Demonstrar domínio prático em:
  * **Front-end:** React.js (Vite), TailwindCSS, gráficos dinâmicos (Lucide Icons + Recharts/Chart.js).
  * **Back-end:** Node.js, Express, arquitetura em camadas (Controllers, Services/Repositories, Routes).
  * **Banco de Dados:** PostgreSQL (modelagem relacional com chaves estrangeiras, constraints e agregações de soma/saldo).
  * **Boas Práticas:** Controle de versão Git com commits semânticos, documentação completa (`README.md`), variáveis de ambiente (`.env`).

---

## 🏗️ Escopo das Funcionalidades (MVP - Produto Mínimo Viável)

### 1. Dashboard Principal (Visão Geral)
- [ ] Card de **Saldo Atual** (Receitas - Despesas).
- [ ] Card de **Total de Receitas** (Entradas do mês).
- [ ] Card de **Total de Despesas** (Saídas do mês).
- [ ] Gráfico de pizza/rosca com **gastos por categoria** (ex: Alimentação, Transporte, Lazer).
- [ ] Tabela com as **últimas transações**.

### 2. Gestão de Transações
- [ ] Criar nova transação (Título, Valor, Tipo: Receita ou Despesa, Data, Categoria).
- [ ] Listar transações com filtro por mês/ano e tipo.
- [ ] Excluir transação.

### 3. Categorias
- [ ] Categorias padrão pré-cadastradas (Alimentação, Moradia, Salário, Investimentos, Lazer, etc.).

---

## 🗄️ Modelagem de Dados Inicial (PostgreSQL)

### Tabela: `categories`
* `id` (SERIAL PRIMARY KEY)
* `name` (VARCHAR 50 NOT NULL)
* `type` (VARCHAR 10 NOT NULL) -- 'income' ou 'expense'
* `color` (VARCHAR 20)

### Tabela: `transactions`
* `id` (SERIAL PRIMARY KEY)
* `title` (VARCHAR 150 NOT NULL)
* `amount` (NUMERIC(10, 2) NOT NULL)
* `type` (VARCHAR 10 NOT NULL) -- 'income' ou 'expense'
* `date` (DATE NOT NULL)
* `category_id` (INTEGER REFERENCES categories(id) ON DELETE SET NULL)
* `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

---

## 📁 Estrutura de Pastas do Repositório

```text
Evolucao/
├── Curriculo_Adriel_Dias_Severino.md
├── ADRIEL CV.pdf
└── fintrack/
    ├── server/           # API REST em Node.js / Express
    │   ├── src/
    │   │   ├── config/   # Conexão com o banco (pg / pool)
    │   │   ├── routes/   # Rotas de transações e categorias
    │   │   ├── controllers/
    │   │   └── server.js
    │   └── package.json
    │
    └── client/           # Front-end React com Vite & Tailwind
        ├── src/
        │   ├── components/
        │   ├── pages/
        │   └── App.jsx
        └── package.json
```
