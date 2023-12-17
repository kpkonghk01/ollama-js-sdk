import pg from "pg";

export const db = new pg.Pool({
  host: "localhost",
  user: "ollama",
  password: "",
  database: "ollama",
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
