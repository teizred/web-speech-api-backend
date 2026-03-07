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
      unit_type TEXT DEFAULT 'unit',
      loss_type TEXT DEFAULT 'complet'
    )
  `;

  // Migrations pour les colonnes manquantes
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'unit'`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS loss_type TEXT DEFAULT 'complet'`;

  await sql`
    CREATE TABLE IF NOT EXISTS losses (
      id SERIAL PRIMARY KEY,
      product TEXT NOT NULL,
      quantity FLOAT NOT NULL,
      size TEXT,
      unit TEXT DEFAULT 'unit',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Migration pour la colonne unit dans losses et changement de type pour quantity (INTEGER -> FLOAT)
  await sql`ALTER TABLE losses ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'unit'`;
  await sql`ALTER TABLE losses ALTER COLUMN quantity TYPE FLOAT`;
  
  // On force le fuseau horaire Europe/Paris pour la session
  try {
    await sql.query("SET timezone TO 'Europe/Paris'");
  } catch (e) {
    console.error("⚠️ Impossible de forcer le fuseau horaire :", e.message);
  }

  // Finalisation du type et de la valeur par défaut pour created_at
  await sql`ALTER TABLE losses ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'`;
  await sql`ALTER TABLE losses ALTER COLUMN created_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Paris')`;

  // Index unique pour éviter les doublons (même produit, même taille, même jour sur Paris)
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_losses_unique_daily 
    ON losses (product, (COALESCE(size, '')), (CAST(created_at AT TIME ZONE 'Europe/Paris' AS date)))
  `;
};

