import { sql } from "../config/db.js";
import { parseTranscript } from "../services/aiService.js";
import { transcriptSchema, manualLossSchema, updateLossSchema, batchSchema } from "../config/schemas.js";

// Ici on récupère toutes les pertes enregistrées aujourd'hui
export const getLosses = async (req, res) => {
  try {
    const losses = await sql`
      SELECT * FROM losses 
      WHERE created_at::date = CURRENT_DATE
      ORDER BY created_at DESC
    `;
    res.json(losses);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Ça c'est quand on utilise la voix : l'IA traduit et on enregistre tout d'un coup
export const createLossAI = async (req, res) => {
  const parsed = transcriptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  try {
    const items = await parseTranscript(parsed.data.transcript);

    const savedLosses = [];
    for (const item of items) {
      const [loss] = await sql`
        INSERT INTO losses (product, quantity, size)
        VALUES (${item.product}, ${item.quantity}, ${item.size})
        RETURNING *
      `;
      savedLosses.push(loss);
    }
    res.json(savedLosses);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Ici c'est pour l'ajout manuel avec les boutons + et -
export const createLossManual = async (req, res) => {
  const parsed = manualLossSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  try {
    const { product, quantity, size } = parsed.data;

    // On vérifie d'abord si le produit existe déjà pour aujourd'hui
    const existing = await sql`
      SELECT * FROM losses 
      WHERE product = ${product} 
      AND ${size === null ? sql`size IS NULL` : sql`size = ${size}`}
      AND created_at::date = CURRENT_DATE
      LIMIT 1
    `;

    if (existing.length > 0) {
      const newQuantity = existing[0].quantity + quantity;
      const [loss] = await sql`
        UPDATE losses 
        SET quantity = ${newQuantity}
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
      res.json(loss);
    } else {
      const [loss] = await sql`
        INSERT INTO losses (product, quantity, size)
        VALUES (${product}, ${quantity}, ${size})
        RETURNING *
      `;
      res.json(loss);
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Pour mettre à jour une quantité précise (quand tu tapes le chiffre)
export const updateLoss = async (req, res) => {
  const parsed = updateLossSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  try {
    const { id } = req.params;
    const { quantity } = parsed.data;

    // Si on met à 0, on supprime la ligne
    if (quantity === 0) {
      await sql`DELETE FROM losses WHERE id = ${id}`;
      res.json({ message: "Perte supprimée" });
    } else {
      const [loss] = await sql`
        UPDATE losses 
        SET quantity = ${quantity}
        WHERE id = ${id}
        RETURNING *
      `;
      res.json(loss);
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Parse le transcript avec l'IA mais N'ENREGISTRE PAS en base
export const parseLossAI = async (req, res) => {
  const parsed = transcriptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  try {
    const items = await parseTranscript(parsed.data.transcript);
    res.json(items);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Enregistre un batch d'items déjà validés par l'utilisateur
export const createLossBatch = async (req, res) => {
  const parsed = batchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  try {
    const { items } = parsed.data;
    const savedLosses = [];
    for (const item of items) {
      const existing = await sql`
        SELECT * FROM losses 
        WHERE product = ${item.product} 
        AND ${item.size === null ? sql`size IS NULL` : sql`size = ${item.size}`}
        AND created_at::date = CURRENT_DATE
        LIMIT 1
      `;

      if (existing.length > 0) {
        const newQuantity = existing[0].quantity + item.quantity;
        const [loss] = await sql`
          UPDATE losses 
          SET quantity = ${newQuantity}
          WHERE id = ${existing[0].id}
          RETURNING *
        `;
        savedLosses.push(loss);
      } else {
        const [loss] = await sql`
          INSERT INTO losses (product, quantity, size)
          VALUES (${item.product}, ${item.quantity}, ${item.size})
          RETURNING *
        `;
        savedLosses.push(loss);
      }
    }
    res.json(savedLosses);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Pour tout vider et repartir à zéro (bouton reset)
export const resetLosses = async (req, res) => {
  try {
    await sql`
      DELETE FROM losses 
      WHERE created_at::date = CURRENT_DATE
    `;
    res.json({ message: "Pertes du jour supprimées" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
