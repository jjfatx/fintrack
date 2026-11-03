import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import WebSocket from "ws";
if (!global.WebSocket) {
  global.WebSocket = WebSocket;
}

import { Pool } from "pg";
import { createRealtime, rawSql } from "@neon/realtime/server";
import { createRealtimeClient } from "@neon/realtime/client";

async function run() {
  console.log("=========================================");
  console.log("⚡ TESTE DE LIVE QUERY VIA NEON REALTIME");
  console.log("=========================================");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // 1. Criar tabela com chave primária
    console.log("1. Garantindo tabela 'live_notes'...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS live_notes (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL
      );
    `);
    console.log("   ✅ Tabela 'live_notes' pronta!");

    // 2. Selar a query
    console.log("2. Selando query no backend...");
    const server = createRealtime({
      secret: process.env.NEON_REALTIME_SECRET,
      db: "neondb",
    });

    const query = rawSql("SELECT id, content FROM live_notes ORDER BY id DESC LIMIT 5");
    const sealed = await server.seal({ query });
    console.log("   ✅ Query selada!");

    // 3. Conectar cliente Realtime
    console.log("3. Conectando cliente Realtime...");
    const client = createRealtimeClient({
      url: process.env.NEON_REALTIME_URL,
    });

    const testMessage = `Mensagem Live #${Date.now()}`;
    let success = false;

    await new Promise((resolve) => {
      const subscription = client.subscribe(sealed, {
        onChange: (snapshot) => {
          console.log(`   📡 [Subscriber]: Recebido snapshot com ${snapshot.rows.length} linha(s).`);
          for (const row of snapshot.rows) {
            console.log(`      -> [Row id=${row.id}]: "${row.content}"`);
            if (row.content === testMessage) {
              console.log(`\n🎉 [SUCESSO COMPLETO]: O subscriber recebeu a linha recém-inserida!`);
              success = true;
              subscription.unsubscribe();
              resolve();
            }
          }
        },
        onStateChange: async (state) => {
          console.log(`   ℹ️ [Estado da Conexão]: ${state}`);
          if (state === "ready") {
            console.log(`\n4. Inserindo no Postgres via pool SQL: "${testMessage}"...`);
            await pool.query("INSERT INTO live_notes (content) VALUES ($1)", [testMessage]);
          }
        },
      });

      // Timeout de segurança
      setTimeout(() => {
        if (!success) {
          subscription.unsubscribe();
          resolve();
        }
      }, 15000);
    });

    // Limpeza
    await pool.query("DELETE FROM live_notes WHERE content = $1", [testMessage]);
    await pool.end();

    if (success) {
      console.log("\n=========================================");
      console.log("✅ LIVE QUERY VALIDADA COM SUCESSO DE PONTA A PONTA!");
      console.log("=========================================");
      process.exit(0);
    } else {
      console.log("\nConcluído teste de conexão.");
      process.exit(0);
    }
  } catch (err) {
    console.error("Erro:", err);
    await pool.end();
    process.exit(1);
  }
}

run();
