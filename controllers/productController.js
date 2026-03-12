import { sql } from "../config/db.js";

// Catégorie order + emojis pour l'affichage
const CATEGORY_ORDER = [
  "Viandes", 
  "Protéines", 
  "Sandwichs", 
  "Accompagnements", 
  "Desserts",
  "Boissons", 
  "McCafé",
  "Pains Cuisine",
  "Garnitures",
  "Sauces Cuisine",
  "Cuisine Autre",
  "Campagnes",
  "Ingrédients Boissons"
];

const CATEGORY_ICONS = {
  "Viandes": "🥩",
  "Protéines": "/proteins.png",
  "Sandwichs": "/bigmac.png",
  "Accompagnements": "/frites.png",
  "Desserts": "/desserts.png",
  "Boissons": "/boisson.png",
  "McCafé": "/mccafe.png",
  "Pains Cuisine": "🍞",
  "Garnitures": "🥗",
  "Sauces Cuisine": "/sauce.png",
  "Cuisine Autre": "🍳",
  "Campagnes": "✨",
  "Ingrédients Boissons": "📦",
};

// Récupère tous les produits depuis la base, groupés par catégorie avec sous-catégories
export const getProducts = async (req, res) => {
  const { type } = req.query; // 'vide' ou 'complet'
  
  try {
    let products;
    if (type) {
      products = await sql`
        SELECT * FROM products 
        WHERE loss_type = ${type}
        ORDER BY category, subcategory, name
      `;
    } else {
      products = await sql`
        SELECT * FROM products 
        ORDER BY category, subcategory, name
      `;
    }

    // On regroupe par catégorie avec sous-catégories pour le frontend
    const grouped = {};
    for (const product of products) {
      if (!grouped[product.category]) {
        grouped[product.category] = {
          label: product.category,
          icon: CATEGORY_ICONS[product.category] || null,
          subcategories: [],
          products: [],
        };
      }

      const group = grouped[product.category];
      const productData = {
        name: product.name,
        sizes: product.sizes || null,
        subcategory: product.subcategory || null,
        unit_type: product.unit_type || 'unit',
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
