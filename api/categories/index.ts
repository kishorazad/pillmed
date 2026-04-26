import { Pool } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const result = await pool.query(`
      SELECT 
        id,
        name
      FROM categories
    `);

    // ✅ IMPORTANT: return ARRAY (not {success, data})
    res.status(200).json(result.rows);

  } catch (err) {
    console.error("❌ Categories error:", err);
    res.status(500).json([]);
  }
}
