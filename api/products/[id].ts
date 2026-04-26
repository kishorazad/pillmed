import { Pool } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const { id } = req.query;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const result = await pool.query(
    "SELECT id, name, description, price::float as price, image_url as \"imageUrl\" FROM products WHERE id = $1",
    [id]
  );

  res.status(200).json(result.rows[0] || {});
}
