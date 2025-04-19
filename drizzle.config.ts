import { defineConfig } from "drizzle-kit";

// Only check for DATABASE_URL if not using MongoDB
if (!process.env.MONGODB_URI && !process.env.DATABASE_URL) {
  throw new Error("Either MONGODB_URI or DATABASE_URL must be set");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
