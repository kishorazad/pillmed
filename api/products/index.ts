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
        description,
        price::float as price,
        image_url as "imageUrl",
        brand,
        quantity
      FROM products
      ORDER BY id DESC
      LIMIT 20
    `);

    // ✅ Always return safe JSON
    return res.status(200).json({
      success: true,
      data: result.rows || [],
    });

  } catch (err: any) {
    console.error("❌ PRODUCTS API ERROR:", err);

    return res.status(500).json({
      success: false,
      data: [],
      error: err.message || "Internal Server Error",
    });
  }
}
