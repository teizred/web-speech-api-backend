import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

// On crée la connexion à la base de données (PostgreSQL sur Neon)
export const sql = neon(process.env.DATABASE_URL);

// Cette fonction s'occupe de créer la table si elle n'existe pas encore
export const initDb = async () => {
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

