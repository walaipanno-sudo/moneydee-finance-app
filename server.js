import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const dbPath = process.env.DB_PATH || path.join(__dirname, "moneydee.sqlite");
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(type.startsWith("application/json") ? JSON.stringify(body) : body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
      if (data.length > 2_000_000) reject(new Error("Request too large"));
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      return send(res, 200, { ok: true, database: "sqlite", updatedAt: new Date().toISOString() });
    }
    if (req.method === "GET" && url.pathname === "/api/state") {
      const row = db.prepare("SELECT state_json, updated_at FROM app_state WHERE id = 1").get();
      return send(res, 200, row ? { state: JSON.parse(row.state_json), updatedAt: row.updated_at } : { state: null });
    }
    if (req.method === "PUT" && url.pathname === "/api/state") {
      const payload = JSON.parse(await readBody(req));
      if (!payload || typeof payload.state !== "object") return send(res, 400, { error: "state is required" });
      const updatedAt = new Date().toISOString();
      db.prepare(`
        INSERT INTO app_state (id, state_json, updated_at) VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET state_json=excluded.state_json, updated_at=excluded.updated_at
      `).run(JSON.stringify(payload.state), updatedAt);
      return send(res, 200, { ok: true, updatedAt });
    }
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
      return send(res, 200, html, "text/html; charset=utf-8");
    }
    return send(res, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    return send(res, 500, { error: "Internal server error" });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Moneydee running at http://localhost:${port}`);
});
