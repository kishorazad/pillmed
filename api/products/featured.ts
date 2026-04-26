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
        image_url as "imageUrl"
      FROM products
      LIMIT 10
    `);

    res.status(200).json(result.rows);

  } catch (err) {
    console.error(err);

    // ✅ fallback to prevent crash
    res.status(200).json([]);
  }
}
