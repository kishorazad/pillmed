import { Pool } from "@neondatabase/serverless";

export default async function handler(req, res) {
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
      LIMIT 10
    `);

    // ✅ RETURN ARRAY ONLY (IMPORTANT)
    res.status(200).json(result.rows);

  } catch (err) {
    console.error("❌ FEATURED ERROR:", err);

    res.status(500).json([]);
  }
}
