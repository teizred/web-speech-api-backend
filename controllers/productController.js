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

// ─── GET /api/products ──────────────────────────────────────────────────────
// Récupère tous les produits groupés par catégorie (pour la grille principale)
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

      if (product.subcategory) {
        let subcat = group.subcategories.find(s => s.name === product.subcategory);
        if (!subcat) {
          subcat = { name: product.subcategory, products: [] };
          group.subcategories.push(subcat);
        }
        subcat.products.push(productData);
      } else {
        group.products.push(productData);
      }
    }

    const result = CATEGORY_ORDER
      .filter((cat) => grouped[cat])
      .map((cat) => grouped[cat]);

    // Append any categories not in CATEGORY_ORDER (custom ones added by users)
    const knownCats = new Set(CATEGORY_ORDER);
    for (const [cat, data] of Object.entries(grouped)) {
      if (!knownCats.has(cat)) result.push(data);
    }

    res.json(result);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── GET /api/products/inventory ───────────────────────────────────────────
// Tous les produits + total des pertes du mois (joint depuis losses)
// Query: ?month=2026-06  (défaut = mois courant)
export const getInventory = async (req, res) => {
  const { month } = req.query;
  // Default to current month in Europe/Paris timezone
  const targetMonth = month || new Date().toLocaleDateString('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit'
  }).split('/').reverse().join('-'); // → YYYY-MM

  try {
    // Aggregate losses per product+size for the given month
    const rows = await sql`
      SELECT 
        p.id,
        p.name,
        p.category,
        p.subcategory,
        p.sizes,
        p.unit_type,
        p.loss_type,
        COALESCE(SUM(l.quantity), 0) AS monthly_total,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('size', l.size, 'quantity', l.quantity)
            ORDER BY l.size NULLS FIRST
          ) FILTER (WHERE l.id IS NOT NULL AND l.quantity > 0),
          '[]'::json
        ) AS size_breakdown
      FROM products p
      LEFT JOIN losses l
        ON l.product = p.name
        AND TO_CHAR(l.created_at AT TIME ZONE 'Europe/Paris', 'YYYY-MM') = ${targetMonth}
      GROUP BY p.id, p.name, p.category, p.subcategory, p.sizes, p.unit_type, p.loss_type
      ORDER BY p.category, p.subcategory NULLS LAST, p.name
    `;

    res.json({ month: targetMonth, products: rows });
  } catch (error) {
    console.error("getInventory error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── POST /api/products ─────────────────────────────────────────────────────
export const createProduct = async (req, res) => {
  const { name, category, subcategory, sizes, unit_type, loss_type } = req.body;

  if (!name?.trim() || !category?.trim() || !unit_type || !loss_type) {
    return res.status(400).json({ error: "name, category, unit_type et loss_type sont requis" });
  }

  const cleanSizes = Array.isArray(sizes) && sizes.length > 0 ? sizes : null;

  try {
    const result = await sql`
      INSERT INTO products (name, category, subcategory, sizes, unit_type, loss_type)
      VALUES (
        ${name.trim()},
        ${category.trim()},
        ${subcategory?.trim() || null},
        ${cleanSizes},
        ${unit_type},
        ${loss_type}
      )
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      return res.status(409).json({ error: "Un produit avec ce nom existe déjà" });
    }
    console.error("createProduct error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── PATCH /api/products/:id ────────────────────────────────────────────────
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, subcategory, sizes, unit_type, loss_type } = req.body;

  if (!name?.trim() || !category?.trim() || !unit_type || !loss_type) {
    return res.status(400).json({ error: "name, category, unit_type et loss_type sont requis" });
  }

  const cleanSizes = Array.isArray(sizes) && sizes.length > 0 ? sizes : null;

  try {
    const result = await sql`
      UPDATE products
      SET
        name       = ${name.trim()},
        category   = ${category.trim()},
        subcategory = ${subcategory?.trim() || null},
        sizes      = ${cleanSizes},
        unit_type  = ${unit_type},
        loss_type  = ${loss_type}
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) return res.status(404).json({ error: "Produit non trouvé" });
    res.json(result[0]);
  } catch (error) {
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      return res.status(409).json({ error: "Un produit avec ce nom existe déjà" });
    }
    console.error("updateProduct error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── DELETE /api/products/:id ───────────────────────────────────────────────
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql`DELETE FROM products WHERE id = ${id} RETURNING id`;
    if (result.length === 0) return res.status(404).json({ error: "Produit non trouvé" });
    res.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error("deleteProduct error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
