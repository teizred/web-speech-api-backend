import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

// On crée la connexion à la base de données (PostgreSQL sur Neon)
export const sql = neon(process.env.DATABASE_URL);

// Cette fonction s'occupe de créer les tables si elles n'existent pas encore
export const initDb = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      sizes TEXT[]
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS losses (
      id SERIAL PRIMARY KEY,
      product TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      size TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
};

