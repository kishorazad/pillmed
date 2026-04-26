import { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "@neondatabase/serverless";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const { id } = req.query;

    // 👉 GET SINGLE PRODUCT
    if (id) {
      const result = await pool.query(
        "SELECT id, name, description, price::float as price, image_url as \"imageUrl\" FROM products WHERE id = $1",
        [id]
      );

      return res.status(200).json(result.rows[0] || {});
    }

    // 👉 GET ALL PRODUCTS
    const result = await pool.query(`
      SELECT 
        id,
        name,
        description,
        price::float as price,
        image_url as "imageUrl"
      FROM products
    `);

    res.status(200).json(result.rows);

  } catch (err: any) {
    console.error("ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
