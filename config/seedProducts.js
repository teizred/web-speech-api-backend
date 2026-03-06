import { sql, initDb } from "./db.js";

/**
 * Script de seed pour insérer tous les produits McDo dans la table products.
 * Idempotent : utilise ON CONFLICT DO UPDATE pour mettre à jour les sous-catégories.
 *
 * Usage : node server/config/seedProducts.js
 */

const PRODUCTS = [
  // Viandes (pas de sous-catégorie)
  { name: "10:1", category: "Viandes", subcategory: null, sizes: null },
  { name: "4:1", category: "Viandes", subcategory: null, sizes: null },
  { name: "3:1", category: "Viandes", subcategory: null, sizes: null },

  // Protéines — Poulet
  { name: "Poulet wrap", category: "Protéines", subcategory: "Poulet", sizes: null },
  { name: "Poulet CBO", category: "Protéines", subcategory: "Poulet", sizes: null },
  { name: "Poulet McChicken", category: "Protéines", subcategory: "Poulet", sizes: null },
  { name: "Poulet BM", category: "Protéines", subcategory: "Poulet", sizes: null },
  { name: "Nuggets", category: "Protéines", subcategory: "Poulet", sizes: null },

  // Protéines — Poisson
  { name: "Filet", category: "Protéines", subcategory: "Poisson", sizes: null },

  // Protéines — Veggie
  { name: "Palet Veggie", category: "Protéines", subcategory: "Veggie", sizes: null },
  { name: "Nuggets Veggie", category: "Protéines", subcategory: "Veggie", sizes: null },

  // Protéines — Desserts frits
  { name: "Apple Pie", category: "Protéines", subcategory: "Desserts frits", sizes: null },

  // Sandwichs — Bœuf
  { name: "Big Mac", category: "Sandwichs", subcategory: "Bœuf", sizes: null },
  { name: "Big Mac Bacon", category: "Sandwichs", subcategory: "Bœuf", sizes: null },
  { name: "Big Tasty 1 steak", category: "Sandwichs", subcategory: "Bœuf", sizes: null },
  { name: "Big Tasty 2 steaks", category: "Sandwichs", subcategory: "Bœuf", sizes: null },
  { name: "280 Original", category: "Sandwichs", subcategory: "Bœuf", sizes: null },
  { name: "Royal Cheese", category: "Sandwichs", subcategory: "Bœuf", sizes: null },
  { name: "Royal Deluxe", category: "Sandwichs", subcategory: "Bœuf", sizes: null },
  { name: "Royal Bacon", category: "Sandwichs", subcategory: "Bœuf", sizes: null },
  { name: "Big Arch", category: "Sandwichs", subcategory: "Bœuf", sizes: null },
  { name: "Cheeseburger", category: "Sandwichs", subcategory: "Bœuf", sizes: null },
  { name: "Double Cheeseburger", category: "Sandwichs", subcategory: "Bœuf", sizes: null },
  { name: "Double Cheese Bacon", category: "Sandwichs", subcategory: "Bœuf", sizes: null },
  { name: "Hamburger", category: "Sandwichs", subcategory: "Bœuf", sizes: null },

  // Sandwichs — Poulet
  { name: "CBO", category: "Sandwichs", subcategory: "Poulet", sizes: null },
  { name: "CBO Smoky Ranch", category: "Sandwichs", subcategory: "Poulet", sizes: null },
  { name: "McCrispy", category: "Sandwichs", subcategory: "Poulet", sizes: null },
  { name: "McCrispy Bacon", category: "Sandwichs", subcategory: "Poulet", sizes: null },
  { name: "McCrispy Smoky Ranch Bacon", category: "Sandwichs", subcategory: "Poulet", sizes: null },
  { name: "McChicken", category: "Sandwichs", subcategory: "Poulet", sizes: null },
  { name: "P'tit Chicken", category: "Sandwichs", subcategory: "Poulet", sizes: null },
  { name: "P'tit Wrap Ranch", category: "Sandwichs", subcategory: "Poulet", sizes: null },
  { name: "Boite de Nuggets", category: "Sandwichs", subcategory: "Poulet", sizes: ["x4", "x6", "x9", "x20"] },

  // Sandwichs — Poisson
  { name: "Filet-O-Fish", category: "Sandwichs", subcategory: "Poisson", sizes: null },
  { name: "McFish", category: "Sandwichs", subcategory: "Poisson", sizes: null },
  { name: "McFish Mayo", category: "Sandwichs", subcategory: "Poisson", sizes: null },
  { name: "Fish New York", category: "Sandwichs", subcategory: "Poisson", sizes: null },
  { name: "Double Fish New York", category: "Sandwichs", subcategory: "Poisson", sizes: null },

  // Sandwichs — Wraps
  { name: "McWrap Smoky Ranch", category: "Sandwichs", subcategory: "Wraps", sizes: null },
  { name: "McWrap New York", category: "Sandwichs", subcategory: "Wraps", sizes: null },

  // Sandwichs — Veggie
  { name: "McVeggie", category: "Sandwichs", subcategory: "Veggie", sizes: null },
  { name: "McWrap Veggie", category: "Sandwichs", subcategory: "Veggie", sizes: null },
  { name: "Boite de Nuggets Veggie", category: "Sandwichs", subcategory: "Veggie", sizes: ["x4", "x6", "x9", "x20"] },

  // Sandwichs — Petit-déj
  { name: "Egg & Cheese McMuffin", category: "Sandwichs", subcategory: "Petit-déj", sizes: null },
  { name: "Egg & Cheese", category: "Sandwichs", subcategory: "Petit-déj", sizes: null },
  { name: "Egg & Bacon", category: "Sandwichs", subcategory: "Petit-déj", sizes: null },
  { name: "Bacon & Beef McMuffin", category: "Sandwichs", subcategory: "Petit-déj", sizes: null },
  { name: "Croque McDo", category: "Sandwichs", subcategory: "Petit-déj", sizes: null },

  // Accompagnements — Frites
  { name: "Frites", category: "Accompagnements", subcategory: "Frites", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Frites Cheddar", category: "Accompagnements", subcategory: "Frites", sizes: null },
  { name: "Frites Bacon", category: "Accompagnements", subcategory: "Frites", sizes: null },
  { name: "Wavy Fries", category: "Accompagnements", subcategory: "Frites", sizes: ["Moyen", "Grand"] },

  // Accompagnements — Potatoes
  { name: "Potatoes", category: "Accompagnements", subcategory: "Potatoes", sizes: ["Moyen", "Grand"] },
  { name: "Potatoes Cheddar", category: "Accompagnements", subcategory: "Potatoes", sizes: null },
  { name: "Potatoes Bacon", category: "Accompagnements", subcategory: "Potatoes", sizes: null },

  // Boissons — Sodas
  { name: "Coca-Cola", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Coca-Cola Sans-Sucres", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Coca-Cola Cherry Zéro", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Fanta Sans-Sucres", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Sprite Sans-Sucres", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Green Apple Sprite", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"] },

  // Boissons — Thés & Jus
  { name: "Lipton Ice Tea", category: "Boissons", subcategory: "Thés & Jus", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Oasis Tropical", category: "Boissons", subcategory: "Thés & Jus", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Minute Maid Orange", category: "Boissons", subcategory: "Thés & Jus", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "P'tit Nectar Pomme", category: "Boissons", subcategory: "Thés & Jus", sizes: null },
  { name: "Capri-Sun Tropical", category: "Boissons", subcategory: "Thés & Jus", sizes: null },

  // Boissons — Eaux
  { name: "Eau Plate", category: "Boissons", subcategory: "Eaux", sizes: ["Moyen", "Grand"] },
  { name: "Eau Pétillante", category: "Boissons", subcategory: "Eaux", sizes: ["Moyen", "Grand"] },

  // McCafé (pas de sous-catégorie)
  { name: "Ristretto", category: "McCafé", subcategory: null, sizes: null },
  { name: "Espresso", category: "McCafé", subcategory: null, sizes: null },
  { name: "Double Espresso", category: "McCafé", subcategory: null, sizes: null },
  { name: "Espresso Décaféiné", category: "McCafé", subcategory: null, sizes: null },
  { name: "Thé Glacé Pêche", category: "McCafé", subcategory: null, sizes: null },
  { name: "Délifrapp Cookie", category: "McCafé", subcategory: null, sizes: null },
  { name: "Délifrapp Vanille", category: "McCafé", subcategory: null, sizes: null },
  { name: "Smoothie Mangue Papaye", category: "McCafé", subcategory: null, sizes: null },
  { name: "Smoothie Banane Fraise", category: "McCafé", subcategory: null, sizes: null },
  { name: "Café Allongé", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"] },
  { name: "Café Allongé Décaféiné", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"] },
  { name: "Thé Earl Grey", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"] },
  { name: "Thé Vert Menthe", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"] },
  { name: "Thé Citron Gingembre", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"] },
  { name: "Café Latté", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"] },
  { name: "Cappuccino", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"] },
  { name: "Café Latte Gourmand", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"] },
  { name: "Café Latte Glacé", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"] },
  { name: "Café Latte Glacé Gourmand", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"] },
  { name: "Americano Glacé", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"] },
  { name: "Chocolat Chaud", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"] },
  { name: "Chocolat Chaud Gourmand", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"] },
];

const seed = async () => {
  console.log("Début du seed des produits");

  // On crée la table si elle n'existe pas encore
  await initDb();
  let inserted = 0;
  for (const product of PRODUCTS) {
    try {
      await sql`
        INSERT INTO products (name, category, subcategory, sizes)
        VALUES (${product.name}, ${product.category}, ${product.subcategory}, ${product.sizes})
        ON CONFLICT (name) DO UPDATE SET
          category = ${product.category},
          subcategory = ${product.subcategory},
          sizes = ${product.sizes}
      `;
      inserted++;
    } catch (err) {
      console.error(`Erreur pour "${product.name}":`, err.message);
    }
  }

  console.log(`Seed terminé ! ${inserted} produits traités.`);
  process.exit(0);
};

seed();
