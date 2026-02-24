import mysql from "mysql2/promise";

// Validate required environment variables at startup
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_NAME"] as const;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(
      `Missing required environment variable: ${envVar}. ` +
        "Copy .env.example to .env.local and fill in your database credentials."
    );
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
