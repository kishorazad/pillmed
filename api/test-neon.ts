import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log("🚀 API CALLED");

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL missing ❌");
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    console.log("🔌 Connecting to Neon...");

    const result = await pool.query("SELECT NOW()");

    console.log("✅ Query success");

    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (err: any) {
    console.error("❌ ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message || "Unknown error",
    });
  }
}
