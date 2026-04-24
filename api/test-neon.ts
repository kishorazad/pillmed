
import { Pool } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const result = await pool.query("SELECT NOW()");
    
    res.status(200).json({
      success: true,
      message: "Neon Connected ✅",
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Neon Connection Failed ❌",
      error: err.message,
    });
  }
}
