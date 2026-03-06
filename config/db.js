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
      sizes TEXT[],
      unit_type TEXT DEFAULT 'unit'
    )
  `;

  // Migrations pour les colonnes manquantes
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'unit'`;

  await sql`
    CREATE TABLE IF NOT EXISTS losses (
      id SERIAL PRIMARY KEY,
      product TEXT NOT NULL,
      quantity FLOAT NOT NULL,
      size TEXT,
      unit TEXT DEFAULT 'unit',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Migration pour la colonne unit dans losses et changement de type pour quantity (INTEGER -> FLOAT)
  await sql`ALTER TABLE losses ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'unit'`;
  await sql`ALTER TABLE losses ALTER COLUMN quantity TYPE FLOAT`;
};

