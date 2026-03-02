import { z } from "zod";

// Schéma pour un item de perte (utilisé par le batch et le manual)
export const lossItemSchema = z.object({
  product: z.string().min(1, "Le nom du produit est requis"),
  quantity: z.number().int().min(1, "La quantité doit être >= 1"),
  size: z.enum(["Petit", "Moyen", "Grand"]).nullable(),
});

// POST /api/losses (voix) et POST /api/losses/parse
export const transcriptSchema = z.object({
  transcript: z.string().min(1, "Le transcript est vide"),
});

// POST /api/losses/batch
export const batchSchema = z.object({
  items: z.array(lossItemSchema).min(1, "Au moins 1 produit requis"),
});

// POST /api/losses/manual
export const manualLossSchema = z.object({
  product: z.string().min(1),
  quantity: z.number().int().min(1),
  size: z.enum(["Petit", "Moyen", "Grand"]).nullable(),
});

// PATCH /api/losses/:id
export const updateLossSchema = z.object({
  quantity: z.number().int().min(0, "La quantité ne peut pas être négative"),
});

// POST /api/export/email
export const emailSchema = z.object({
  email: z.string().email("Email invalide"),
});
