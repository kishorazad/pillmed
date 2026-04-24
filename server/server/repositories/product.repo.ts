
import { pool } from "../db/neon";
import { DB_PROVIDER } from "../db";

// your existing Mongo storage (you already have mongodb-storage.ts)
import { storage } from "../mongodb-storage";

export const ProductRepo = {

  async getAll() {
    if (DB_PROVIDER === "neon") {
      const { rows } = await pool.query(
        "SELECT * FROM products ORDER BY id DESC"
      );
      return rows;
    } else {
      return await storage.getAllProducts(); // your Mongo function
    }
  },

  async create(data: any) {
    if (DB_PROVIDER === "neon") {
      const { rows } = await pool.query(
        "INSERT INTO products (name, price, description) VALUES ($1,$2,$3) RETURNING *",
        [data.name, data.price, data.description]
      );
      return rows[0];
    } else {
      return await storage.createProduct(data);
    }
  }

};
