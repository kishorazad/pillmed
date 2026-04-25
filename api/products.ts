import { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "@neondatabase/serverless";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // LINE 10 → CHECK ENV VARIABLE
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL missing");
    }

    // LINE 15 → CREATE CONNECTION
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // LINE 20 → FETCH PRODUCTS
    const result = await pool.query("SELECT * FROM products");

    // LINE 23 → RESPONSE
    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (err: any) {
    // LINE 30 → ERROR HANDLING
    console.error("ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
