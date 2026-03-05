import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Missing required environment variable: DATABASE_URL. " +
      "Set it to your Supabase PostgreSQL connection string."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // Keep max low for Vercel serverless — each function instance creates its own pool.
  // Supabase free tier allows 60 total connections.
  max: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export default pool;
