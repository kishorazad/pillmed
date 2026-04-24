
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const neonStorage = {
  
  async getProducts() {
    const { rows } = await pool.query("SELECT * FROM products");
    return rows;
  },

  async getProductById(id: number) {
    const { rows } = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );
    return rows[0];
  }

};
