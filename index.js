import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const sql = neon(process.env.DATABASE_URL);
const openaiClient = createOpenAI({
  compatibility: "strict",
});

app.use(cors());
app.use(express.json());

await sql`
  CREATE TABLE IF NOT EXISTS losses (
    id SERIAL PRIMARY KEY,
    product TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    size TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )
`;

// GET - pertes du jour uniquement
app.get("/api/losses", async (req, res) => {
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
});

// POST - parser le transcript vocal avec AI puis sauvegarder
app.post("/api/losses", async (req, res) => {
  try {
    const { transcript } = req.body;

    const { text } = await generateText({
      model: openaiClient("gpt-4o-mini"),
      prompt: `Tu es un assistant pour McDonald's qui enregistre des pertes de produits.
      L'utilisateur va dicter une ou plusieurs pertes oralement en français.
      Tu dois extraire les produits, quantités et tailles.

      LISTE OFFICIELLE DES PRODUITS:

      VIANDES (pas de taille): 10:1, 4:1, 3:1

      PROTEINES (pas de taille): Poulet wrap, Poulet CBO, Poulet McChicken, Poulet BM, Filet, Nuggets, Nuggets Veggie, Palet Veggie, Apple Pie

      SANDWICHS (pas de taille): CBO Smoky Ranch, McCrispy Smoky Ranch Bacon, McWrap Smoky Ranch, Big Mac Bacon, Big Mac, McVeggie, McWrap Veggie, Filet-O-Fish, McFish Mayo, McFish, Fish New York, Double Fish New York, P'tit Chicken, Croque McDo, McChicken, Cheeseburger, Egg & Cheese McMuffin, CBO, Hamburger, McWrap New York & Poulet Bacon, Royal Cheese, P'tit Wrap Ranch, Egg & Bacon McMuffin, Double Cheeseburger, Royal Deluxe, Royal Bacon, Big Tasty 1 steak, Big Tasty 2 steaks, 280 Original, Double Cheese Bacon, Big Arch, McCrispy Bacon, McCrispy, Bacon & Beef McMuffin

      ACCOMPAGNEMENTS:
      Avec taille (Petit, Moyen, Grand — défaut Grand si non précisé):
      - Frites → Petit, Moyen, Grand
      Avec taille (Moyen, Grand — défaut Grand si non précisé):
      - Potatoes
      - Wavy Fries
      Sans taille (produit fixe):
      - Frites Cheddar (si l'utilisateur dit "frites cheddar" OU "frites double cheddar" → toujours "Frites Cheddar")
      - Frites Bacon
      - Potatoes Cheddar (si l'utilisateur dit "potatoes cheddar" OU "potatoes double cheddar" → toujours "Potatoes Cheddar")
      - Potatoes Bacon

      BOISSONS FROIDES (taille: Petit, Moyen, Grand — défaut: Grand si non précisé):
      Eau Plate, Eau Pétillante, Oasis Tropical, Green Apple Sprite, Coca-Cola Sans-Sucres, Coca-Cola, Coca-Cola Cherry Zéro, Sprite Sans-Sucres, Fanta Sans-Sucres, Minute Maid Orange, Lipton Ice Tea, P'tit Nectar Pomme, Capri-Sun Tropical, Americano Glacé, Café Latte Glacé, Café Latte Glacé Gourmand, Thé Glacé Pêche, Délifrapp Cookie, Délifrapp Vanille, Smoothie Mangue Papaye, Smoothie Banane Fraise, Jus d'Orange, Jus de Pomme

      MCCAFE:
      - Espresso, Ristretto, Double Espresso → toujours size: null
      - Reste des McCafé (taille: Moyen, Grand — défaut: Grand si non précisé): Espresso Décaféiné, Café Allongé, Café Allongé Décaféiné, Thé, Café Latté, Cappuccino, Café Latte Gourmand, Chocolat Chaud, Chocolat Chaud Gourmand

      RÈGLES DE MAPPING VIANDES — TRÈS IMPORTANT:
      Le mot "viande" suivi du ratio est la formulation orale standard.
      - "viande dix un", "viande 10 1", "viande 10 100", "viande dix-un", "dix un", "10 100", "10 1" → "10:1"
      - "viande quatre un", "viande 4 1", "viande 4 100", "viande quatre-un", "quatre un", "4 100", "4 1" → "4:1"
      - "viande trois un", "viande 3 1", "viande 3 100", "viande trois-un", "trois un", "3 100", "3 1" → "3:1"

      PATTERN NUMÉRIQUE VIANDES:
      Le Speech API peut coller la quantité et le ratio en un seul nombre.
      Les ratios sont UNIQUEMENT: 31, 41, 101
      - Se termine par "101" → product: "10:1", quantity: chiffres avant "101"
        ex: "10101" → quantity: 10, product: "10:1"
        ex: "5101" → quantity: 5, product: "10:1"
      - Se termine par "41" mais PAS "101" → product: "4:1", quantity: chiffres avant "41"
        ex: "541" → quantity: 5, product: "4:1"
        ex: "1041" → quantity: 10, product: "4:1"
      - Se termine par "31" mais PAS "101" ni "41" → product: "3:1", quantity: chiffres avant "31"
        ex: "531" → quantity: 5, product: "3:1"
        ex: "1031" → quantity: 10, product: "3:1"

      CORRECTIONS PHONÉTIQUES SANDWICHS NUMÉROTÉS — PRIORITÉ ABSOLUE:
      Ces sandwichs ont des noms numériques. L'IA DOIT les reconnaître AVANT d'appliquer le pattern numérique viandes.
      - "deux cent quatre-vingt", "deux cent quatre vingt", "280", "deux cent 80", "280 original", "deux cent quatre vingt orig" → "280 Original"
      - "big arch" → "Big Arch"
      - Ces produits sont des SANDWICHS (size: null).

      RÈGLE DE PRIORITÉ: Si le transcript contient "cent quatre vingt", "280", ou "orig", c'est "280 Original", PAS une viande.

      CORRECTIONS PHONÉTIQUES:
      - "Apple Pay", "Apple Paie", "Apple Paille" → "Apple Pie"
      - "vegi", "végie", "végi", "veggy", "vegy" → "Veggie"
      - "palet vegi", "palais veggie", "palette veggie" → "Palet Veggie"
      - "mc vegi", "mac vegi", "mc veggie" → "McVeggie"
      - "nuggets vegi", "nuggets veggie" → "Nuggets Veggie"
      - "wavy", "wévy", "wavi" → "Wavy Fries"
      - "pota", "potat", "potato" → "Potatoes"

      AUTRES RÈGLES:
      - "petit wrap", "p'tit wrap", "tit wrap", "ptit wrap" → "P'tit Wrap Ranch" (sandwich, size: null) — NE PAS confondre avec "Poulet wrap"
      - "grand zéro", "grand zero", "zéro" seul → "Coca-Cola Cherry Zéro", size: "Grand"
      - "cbo" seul → "Poulet CBO"
      - "big mac" → "Big Mac"
      - "nuggets" seul → "Nuggets"
      - "cappuccino" → "Cappuccino"
      - "frites cheddar" ou "frites double cheddar" → "Frites Cheddar" sans taille
      - "potatoes cheddar" ou "potatoes double cheddar" → "Potatoes Cheddar" sans taille
      - Si taille non précisée pour boisson/frites/potatoes/wavy → size: "Grand"
      - Si taille non précisée pour viande/protéine/sandwich/accompagnement fixe → size: null
      - Tu peux recevoir PLUSIEURS produits dans une seule phrase
      - Ignore les mots comme "pertes", "en perte", "et", "aussi", "viande"

      Réponds UNIQUEMENT avec un tableau JSON, sans markdown, sans explication.
      Format: [{ "product": "nom exact", "quantity": nombre, "size": "Grand"|"Moyen"|"Petit"|null }]

      Transcript: "${transcript}"`,
    });

    const cleaned = text.replace(/```json|```/g, "").trim();
    const items = JSON.parse(cleaned);

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
});

// POST MANUAL - ajouter une perte manuellement sans AI
app.post("/api/losses/manual", async (req, res) => {
  try {
    const { product, quantity, size } = req.body;

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
});

// PATCH - mettre à jour la quantité d'une perte existante
app.patch("/api/losses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

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
});

// GET - Télécharger PDF
app.get("/api/export/pdf", async (req, res) => {
  try {
    const losses = await sql`
      SELECT * FROM losses 
      WHERE created_at::date = CURRENT_DATE
      ORDER BY product, size
    `;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=pertes-mcdo-${new Date().toISOString().split('T')[0]}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text("PERTES McDONALD'S", { align: "center" });
    doc.fontSize(12).text(new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }), { align: "center" });
    doc.moveDown(2);

    doc.fontSize(10);
    const startY = doc.y;
    const colWidths = [250, 80, 80, 80];
    const headers = ["Produit", "Taille", "Quantité", "Heure"];
    
    // Headers
    let x = 50;
    headers.forEach((header, i) => {
      doc.text(header, x, startY, { width: colWidths[i], continued: false });
      x += colWidths[i];
    });
    doc.moveDown();

    // Lignes
    losses.forEach((loss) => {
      const currentY = doc.y;
      
      doc.text(loss.product, 50, currentY, { width: colWidths[0], continued: false });
      doc.text(loss.size || "—", 50 + colWidths[0], currentY, { width: colWidths[1], continued: false });
      doc.text(loss.quantity.toString(), 50 + colWidths[0] + colWidths[1], currentY, { width: colWidths[2], continued: false });
      doc.text(
        new Date(loss.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), 
        50 + colWidths[0] + colWidths[1] + colWidths[2], 
        currentY, 
        { width: colWidths[3], continued: false }
      );
      
      doc.moveDown(0.8);
    });

    const total = losses.reduce((sum, l) => sum + l.quantity, 0);
    doc.moveDown();
    doc.fontSize(12).text(`Total des pertes : ${total}`, { align: "right" });

    doc.end();
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Envoyer par email
app.post("/api/export/email", async (req, res) => {
  try {
    const { email } = req.body;

    const losses = await sql`
      SELECT * FROM losses 
      WHERE created_at::date = CURRENT_DATE
      ORDER BY product, size
    `;

    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Pertes McDonald's - ${new Date().toLocaleDateString("fr-FR")}`,
        text: `Bonjour,\n\nVeuillez trouver ci-joint le rapport des pertes du ${new Date().toLocaleDateString("fr-FR")}.\n\nTotal : ${losses.reduce((sum, l) => sum + l.quantity, 0)} articles.\n\nCordialement.`,
        attachments: [
          {
            filename: `pertes-mcdo-${new Date().toISOString().split('T')[0]}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      res.json({ message: "Email envoyé avec succès" });
    });

    doc.fontSize(20).text("PERTES McDONALD'S", { align: "center" });
    doc.fontSize(12).text(new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }), { align: "center" });
    doc.moveDown(2);

    doc.fontSize(10);
    const startY = doc.y;
    const colWidths = [250, 80, 80, 80];
    const headers = ["Produit", "Taille", "Quantité", "Heure"];
    
    let x = 50;
    headers.forEach((header, i) => {
      doc.text(header, x, startY, { width: colWidths[i], continued: false });
      x += colWidths[i];
    });
    doc.moveDown();

    losses.forEach((loss) => {
      const currentY = doc.y;
      
      doc.text(loss.product, 50, currentY, { width: colWidths[0], continued: false });
      doc.text(loss.size || "—", 50 + colWidths[0], currentY, { width: colWidths[1], continued: false });
      doc.text(loss.quantity.toString(), 50 + colWidths[0] + colWidths[1], currentY, { width: colWidths[2], continued: false });
      doc.text(
        new Date(loss.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), 
        50 + colWidths[0] + colWidths[1] + colWidths[2], 
        currentY, 
        { width: colWidths[3], continued: false }
      );
      
      doc.moveDown(0.8);
    });

    const total = losses.reduce((sum, l) => sum + l.quantity, 0);
    doc.moveDown();
    doc.fontSize(12).text(`Total des pertes : ${total}`, { align: "right" });

    doc.end();
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - reset toutes les pertes du jour
app.delete("/api/losses", async (req, res) => {
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
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});