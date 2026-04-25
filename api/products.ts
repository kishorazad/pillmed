import { Pool } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const result = await pool.query("SELECT * FROM products");

    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (err) {
    console.error("ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
