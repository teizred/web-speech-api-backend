import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// On crée la connexion à la base de données (PostgreSQL sur Neon)
export const sql = neon(process.env.DATABASE_URL);

// Cette fonction s'occupe de créer les tables si elles n'existent pas encore
export const initDb = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      subcategory TEXT,
      sizes TEXT[]
    )
  `;

  // Ajoute la colonne subcategory si elle n'existe pas (pour les DB existantes)
  await sql`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT
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

