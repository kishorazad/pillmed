import { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "@neondatabase/serverless";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const result = await pool.query(`
      SELECT 
        id,
        name,
        image_url as "imageUrl"
      FROM categories
      ORDER BY id DESC
    `);

    return res.status(200).json({
      success: true,
      data: result.rows || [],
    });

  } catch (err: any) {
    console.error("❌ CATEGORIES API ERROR:", err);

    return res.status(500).json({
      success: false,
      data: [],
      error: err.message || "Internal Server Error",
    });
  }
}
