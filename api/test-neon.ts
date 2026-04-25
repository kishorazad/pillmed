import { Pool } from "@neondatabase/serverless";

export default async function handler(req: any, res: any) {
  console.log("🚀 API CALLED");

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL missing ❌");
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
