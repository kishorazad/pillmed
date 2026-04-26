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

    // ✅ Return array (IMPORTANT)
    res.status(200).json(result.rows);

  } catch (err) {
    console.error("❌ Categories error:", err);

    // fallback (prevents crash)
    res.status(200).json([
      { id: 1, name: "Medicines" },
      { id: 2, name: "Healthcare" }
    ]);
  }
}
