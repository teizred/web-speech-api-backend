import { sql } from "../config/db.js";

// Catégorie order + emojis pour l'affichage
const CATEGORY_ORDER = ["Viandes", "Protéines", "Sandwichs", "Accompagnements", "Boissons", "McCafé"];
const CATEGORY_EMOJIS = {
  "Viandes": "🥩",
  "Protéines": "🍗",
  "Sandwichs": "🥪",
  "Accompagnements": "🍟",
  "Boissons": "🥤",
  "McCafé": "☕",
};

// Récupère tous les produits depuis la base, groupés par catégorie
export const getProducts = async (req, res) => {
  try {
    const products = await sql`
      SELECT * FROM products 
      ORDER BY category, name
    `;

    // On regroupe par catégorie avec emoji pour le frontend
    const grouped = {};
    for (const product of products) {
      if (!grouped[product.category]) {
        const emoji = CATEGORY_EMOJIS[product.category] || "";
        grouped[product.category] = {
          label: `${emoji} ${product.category}`,
          products: [],
        };
      }
      grouped[product.category].products.push({
        name: product.name,
        sizes: product.sizes || null,
      });
    }

    // On trie les catégories dans l'ordre voulu
    const result = CATEGORY_ORDER
      .filter((cat) => grouped[cat])
      .map((cat) => grouped[cat]);

    res.json(result);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
