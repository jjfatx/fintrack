import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: ".env.local" });

const app = express();
app.use(cors());
app.use(express.json());

// 1. Configuração do Banco de Dados PostgreSQL (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// 2. Middleware de Autenticação via Neon Auth (JWKS)
let client = null;
if (process.env.NEON_AUTH_JWKS_URL) {
  client = jwksClient({
    jwksUri: process.env.NEON_AUTH_JWKS_URL,
  });
}

function getKey(header, callback) {
  if (!client) return callback(new Error("JWKS Client não configurado"));
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Middleware opcional para verificar token quando enviado
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Permite uso anônimo/demo se não enviado token, ou retorna 401
    return res.status(401).json({ error: "Token de autenticação não fornecido" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, getKey, {}, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido ou expirado" });
    }
    req.user = decoded;
    next();
  });
};

// 3. Inicialização e Migração do Banco de Dados
export async function initDb() {
  const client = await pool.connect();
  try {
    // Tabela de Categorias
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        type VARCHAR(10) NOT NULL, -- 'income' ou 'expense'
        color VARCHAR(20) DEFAULT '#4F46E5',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Transações Financeiras
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        type VARCHAR(10) NOT NULL, -- 'income' ou 'expense'
        date DATE NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        user_id VARCHAR(100) DEFAULT 'guest',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Inserir categorias padrão apenas se não existirem (evita duplicatas)
    await client.query(`
      DELETE FROM categories a USING categories b
      WHERE a.id > b.id AND a.name = b.name AND a.type = b.type;
    `);

    const defaultCategories = [
      ['Salário', 'income', '#10B981'],
      ['Investimentos', 'income', '#3B82F6'],
      ['Freelance', 'income', '#6366F1'],
      ['Alimentação', 'expense', '#EF4444'],
      ['Moradia', 'expense', '#F59E0B'],
      ['Transporte', 'expense', '#8B5CF6'],
      ['Lazer', 'expense', '#EC4899']
    ];

    for (const [name, type, color] of defaultCategories) {
      await client.query(`
        INSERT INTO categories (name, type, color)
        VALUES ($1, $2, $3)
        ON CONFLICT (name, type) DO NOTHING;
      `, [name, type, color]);
    }
  } finally {
    client.release();
  }
}

// 4. Rotas da API

// Health Check & Status dos Serviços
app.get("/api/health", async (req, res) => {
  try {
    const dbResult = await pool.query("SELECT NOW() as current_time, current_database() as database");
    res.json({
      status: "online",
      database: "connected",
      postgresTime: dbResult.rows[0].current_time,
      dbName: dbResult.rows[0].database,
      neonAuth: {
        baseUrl: process.env.NEON_AUTH_BASE_URL || "configured",
        jwksConfigured: !!process.env.NEON_AUTH_JWKS_URL,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// Listar Categorias
app.get("/api/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar Transações com resumo/estatísticas
app.get("/api/transactions", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.id, t.title, t.amount, t.type, t.date, t.created_at,
             c.name as category_name, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.date DESC, t.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resumo Financeiro (Saldo, Receitas, Despesas)
app.get("/api/summary", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS balance
      FROM transactions
    `);
    res.json({
      total_income: parseFloat(result.rows[0].total_income),
      total_expense: parseFloat(result.rows[0].total_expense),
      balance: parseFloat(result.rows[0].balance),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar nova transação
app.post("/api/transactions", async (req, res) => {
  try {
    const { title, amount, type, date, category_id } = req.body;
    if (!title || !amount || !type || !date) {
      return res.status(400).json({ error: "Campos obrigatórios: title, amount, type, date" });
    }

    const result = await pool.query(
      `INSERT INTO transactions (title, amount, type, date, category_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, amount, type, date, category_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Excluir transação
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM transactions WHERE id = $1", [id]);
    res.json({ message: "Transação excluída com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { app, pool };

// Iniciar servidor se executado diretamente
const isMain = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("src/server.js");
if (isMain) {
  const PORT = process.env.PORT || 3001;
  initDb()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`FinTrack Server rodando em http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Erro ao inicializar banco de dados:", err);
    });
}
