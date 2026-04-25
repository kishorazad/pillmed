import { Pool } from "@neondatabase/serverless";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const neonStorage = {

  // ✅ TEST CONNECTION
  async checkConnection() {
    const res = await pool.query("SELECT NOW()");
    return res.rows[0];
  },

  // ✅ GET ALL PRODUCTS
  async getProducts() {
    const res = await pool.query("SELECT * FROM products ORDER BY id DESC");
    return res.rows;
  },

  // ✅ GET PRODUCT BY ID
  async getProductById(id: number) {
    const res = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );
    return res.rows[0];
  },

  // ✅ CREATE PRODUCT
  async createProduct(product: any) {
    const res = await pool.query(
      `INSERT INTO products (name, price, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [product.name, product.price, product.description]
    );
    return res.rows[0];
  },

};
