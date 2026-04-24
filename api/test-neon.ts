import { Pool } from "@neondatabase/serverless";

export default async function handler(req, res) {
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

  } catch (err) {
    console.error("❌ ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
