import { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "@neondatabase/serverless";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const { id } = req.query;

    // ✅ Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Product ID is required",
      });
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const result = await pool.query(
      `SELECT 
        id, 
        name, 
        description, 
        price::float as price, 
        image_url as "imageUrl" 
       FROM products 
       WHERE id = $1`,
      [id]
    );

    // ✅ Always return JSON (important)
    return res.status(200).json({
      success: true,
      data: result.rows[0] || null,
    });

  } catch (err: any) {
    console.error("❌ API ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Internal Server Error",
    });
  }
}
