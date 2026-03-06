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

// Récupère tous les produits depuis la base, groupés par catégorie avec sous-catégories
export const getProducts = async (req, res) => {
  try {
    const products = await sql`
      SELECT * FROM products 
      ORDER BY category, subcategory, name
    `;

    // On regroupe par catégorie avec sous-catégories pour le frontend
    const grouped = {};
    for (const product of products) {
      if (!grouped[product.category]) {
        const emoji = CATEGORY_EMOJIS[product.category] || "";
        grouped[product.category] = {
          label: `${emoji} ${product.category}`,
          subcategories: [],
          products: [],
        };
      }

      const group = grouped[product.category];
      const productData = {
        name: product.name,
        sizes: product.sizes || null,
        subcategory: product.subcategory || null,
      };

      // On ajoute le produit à la bonne sous-catégorie
      if (product.subcategory) {
        let subcat = group.subcategories.find(s => s.name === product.subcategory);
        if (!subcat) {
          subcat = { name: product.subcategory, products: [] };
          group.subcategories.push(subcat);
        }
        subcat.products.push(productData);
      } else {
        // Pas de sous-catégorie → produit directement dans la catégorie
        group.products.push(productData);
      }
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
