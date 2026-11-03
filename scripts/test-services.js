import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { app, pool, initDb } from "../src/server.js";

async function runTests() {
  console.log("=========================================");
  console.log("🔍 INICIANDO TESTE END-TO-END DOS SERVIÇOS NEON");
  console.log("=========================================");

  try {
    // 1. Teste de Conexão com o Postgres (Neon)
    console.log("\n1. Testando conexão com PostgreSQL (Neon)...");
    const client = await pool.connect();
    const res = await client.query("SELECT NOW() as current_time, current_database() as db_name, version();");
    console.log("   ✅ Conectado com sucesso!");
    console.log(`   - Banco de Dados: ${res.rows[0].db_name}`);
    console.log(`   - Data/Hora do Servidor Postgres: ${res.rows[0].current_time}`);
    console.log(`   - Versão: ${res.rows[0].version.split(" on ")[0]}`);
    client.release();

    // 2. Teste de Migração / Tabelas
    console.log("\n2. Executando inicialização do schema de dados...");
    await initDb();
    console.log("   ✅ Tabelas 'categories' e 'transactions' prontas!");

    // 3. Teste de Criação de Transação (Escrita)
    console.log("\n3. Testando gravação de dados (INSERT)...");
    const insertRes = await pool.query(`
      INSERT INTO transactions (title, amount, type, date)
      VALUES ('Salário Mensal Teste', 3500.00, 'income', CURRENT_DATE)
      RETURNING *;
    `);
    const transactionId = insertRes.rows[0].id;
    console.log(`   ✅ Transação #${transactionId} criada com sucesso:`, insertRes.rows[0].title);

    // 4. Teste de Cálculo / Agregação (Summary)
    console.log("\n4. Testando query de agregação de Saldo e Totais...");
    const summaryRes = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS balance
      FROM transactions
    `);
    console.log("   ✅ Resumo Financeiro calculado:", summaryRes.rows[0]);

    // 5. Teste de Limpeza da Transação de Teste (DELETE)
    console.log("\n5. Limpando transação de teste...");
    await pool.query("DELETE FROM transactions WHERE id = $1", [transactionId]);
    console.log("   ✅ Transação temporária removida.");

    // 6. Teste das Variáveis de Autenticação (Neon Auth)
    console.log("\n6. Verificando configuração do Neon Auth...");
    if (process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_JWKS_URL) {
      console.log("   ✅ Neon Auth configurado!");
      console.log(`   - Base URL: ${process.env.NEON_AUTH_BASE_URL}`);
      console.log(`   - JWKS URL: ${process.env.NEON_AUTH_JWKS_URL}`);
    } else {
      console.log("   ⚠️ Variáveis de Auth parciais ou em configuração.");
    }

    console.log("\n=========================================");
    console.log("🎉 TODOS OS TESTES PASSARAM COM SUCESSO!");
    console.log("=========================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ ERRO DURANTE OS TESTES:", error);
    process.exit(1);
  }
}

runTests();
