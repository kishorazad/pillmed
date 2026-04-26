import { Pool } from "@neondatabase/serverless";

export default async function handler(req: any, res: any) {
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
    `);

    return res.status(200).json({
      success: true,
      data: result.rows || [],
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      data: [],
      error: err.message,
    });
  }
}
