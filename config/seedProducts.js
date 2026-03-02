import { sql, initDb } from "./db.js";

/**
 * Script de seed pour insérer tous les produits McDo dans la table products.
 * Idempotent : utilise ON CONFLICT DO NOTHING, donc on peut le relancer sans risque.
 *
 * Usage : node server/config/seedProducts.js
 */

const PRODUCTS = [
  // Viandes
  { name: "10:1", category: "Viandes", sizes: null },
  { name: "4:1", category: "Viandes", sizes: null },
  { name: "3:1", category: "Viandes", sizes: null },

  // Protéines
  { name: "Poulet wrap", category: "Protéines", sizes: null },
  { name: "Poulet CBO", category: "Protéines", sizes: null },
  { name: "Poulet McChicken", category: "Protéines", sizes: null },
  { name: "Poulet BM", category: "Protéines", sizes: null },
  { name: "Filet", category: "Protéines", sizes: null },
  { name: "Nuggets", category: "Protéines", sizes: null },
  { name: "Nuggets Veggie", category: "Protéines", sizes: null },
  { name: "Palet Veggie", category: "Protéines", sizes: null },
  { name: "Apple Pie", category: "Protéines", sizes: null },

  // Sandwichs
  { name: "CBO Smoky Ranch", category: "Sandwichs", sizes: null },
  { name: "McCrispy Smoky Ranch Bacon", category: "Sandwichs", sizes: null },
  { name: "McWrap Smoky Ranch", category: "Sandwichs", sizes: null },
  { name: "Big Mac Bacon", category: "Sandwichs", sizes: null },
  { name: "Big Mac", category: "Sandwichs", sizes: null },
  { name: "McVeggie", category: "Sandwichs", sizes: null },
  { name: "McWrap Veggie", category: "Sandwichs", sizes: null },
  { name: "Filet-O-Fish", category: "Sandwichs", sizes: null },
  { name: "McFish Mayo", category: "Sandwichs", sizes: null },
  { name: "McFish", category: "Sandwichs", sizes: null },
  { name: "Fish New York", category: "Sandwichs", sizes: null },
  { name: "Double Fish New York", category: "Sandwichs", sizes: null },
  { name: "P'tit Chicken", category: "Sandwichs", sizes: null },
  { name: "Croque McDo", category: "Sandwichs", sizes: null },
  { name: "McChicken", category: "Sandwichs", sizes: null },
  { name: "Cheeseburger", category: "Sandwichs", sizes: null },
  { name: "Egg & Cheese McMuffin", category: "Sandwichs", sizes: null },
  { name: "CBO", category: "Sandwichs", sizes: null },
  { name: "Hamburger", category: "Sandwichs", sizes: null },
  { name: "McWrap New York", category: "Sandwichs", sizes: null },
  { name: "Royal Cheese", category: "Sandwichs", sizes: null },
  { name: "P'tit Wrap Ranch", category: "Sandwichs", sizes: null },
  { name: "Egg & Cheese", category: "Sandwichs", sizes: null },
  { name: "Egg & Bacon", category: "Sandwichs", sizes: null },
  { name: "Double Cheeseburger", category: "Sandwichs", sizes: null },
  { name: "Royal Deluxe", category: "Sandwichs", sizes: null },
  { name: "Royal Bacon", category: "Sandwichs", sizes: null },
  { name: "Big Tasty 1 steak", category: "Sandwichs", sizes: null },
  { name: "Big Tasty 2 steaks", category: "Sandwichs", sizes: null },
  { name: "280 Original", category: "Sandwichs", sizes: null },
  { name: "Double Cheese Bacon", category: "Sandwichs", sizes: null },
  { name: "Big Arch", category: "Sandwichs", sizes: null },
  { name: "McCrispy Bacon", category: "Sandwichs", sizes: null },
  { name: "McCrispy", category: "Sandwichs", sizes: null },
  { name: "Bacon & Beef McMuffin", category: "Sandwichs", sizes: null },

  // Accompagnements
  { name: "Frites", category: "Accompagnements", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Potatoes", category: "Accompagnements", sizes: ["Moyen", "Grand"] },
  { name: "Wavy Fries", category: "Accompagnements", sizes: ["Moyen", "Grand"] },
  { name: "Frites Cheddar", category: "Accompagnements", sizes: null },
  { name: "Frites Bacon", category: "Accompagnements", sizes: null },
  { name: "Potatoes Cheddar", category: "Accompagnements", sizes: null },
  { name: "Potatoes Bacon", category: "Accompagnements", sizes: null },

  // Boissons
  { name: "Coca-Cola", category: "Boissons", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Coca-Cola Sans-Sucres", category: "Boissons", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Coca-Cola Cherry Zéro", category: "Boissons", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Fanta Sans-Sucres", category: "Boissons", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Lipton Ice Tea", category: "Boissons", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Sprite Sans-Sucres", category: "Boissons", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Oasis Tropical", category: "Boissons", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Green Apple Sprite", category: "Boissons", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "Eau Plate", category: "Boissons", sizes: ["Moyen", "Grand"] },
  { name: "Eau Pétillante", category: "Boissons", sizes: ["Moyen", "Grand"] },
  { name: "Minute Maid Orange", category: "Boissons", sizes: ["Petit", "Moyen", "Grand"] },
  { name: "P'tit Nectar Pomme", category: "Boissons", sizes: null },
  { name: "Capri-Sun Tropical", category: "Boissons", sizes: null },

  // McCafé
  { name: "Ristretto", category: "McCafé", sizes: null },
  { name: "Espresso", category: "McCafé", sizes: null },
  { name: "Double Espresso", category: "McCafé", sizes: null },
  { name: "Espresso Décaféiné", category: "McCafé", sizes: null },
  { name: "Thé Glacé Pêche", category: "McCafé", sizes: null },
  { name: "Délifrapp Cookie", category: "McCafé", sizes: null },
  { name: "Délifrapp Vanille", category: "McCafé", sizes: null },
  { name: "Smoothie Mangue Papaye", category: "McCafé", sizes: null },
  { name: "Smoothie Banane Fraise", category: "McCafé", sizes: null },
  { name: "Café Allongé", category: "McCafé", sizes: ["Moyen", "Grand"] },
  { name: "Café Allongé Décaféiné", category: "McCafé", sizes: ["Moyen", "Grand"] },
  { name: "Thé Earl Grey", category: "McCafé", sizes: ["Moyen", "Grand"] },
  { name: "Thé Vert Menthe", category: "McCafé", sizes: ["Moyen", "Grand"] },
  { name: "Thé Citron Gingembre", category: "McCafé", sizes: ["Moyen", "Grand"] },
  { name: "Café Latté", category: "McCafé", sizes: ["Moyen", "Grand"] },
  { name: "Cappuccino", category: "McCafé", sizes: ["Moyen", "Grand"] },
  { name: "Café Latte Gourmand", category: "McCafé", sizes: ["Moyen", "Grand"] },
  { name: "Café Latte Glacé", category: "McCafé", sizes: ["Moyen", "Grand"] },
  { name: "Café Latte Glacé Gourmand", category: "McCafé", sizes: ["Moyen", "Grand"] },
  { name: "Americano Glacé", category: "McCafé", sizes: ["Moyen", "Grand"] },
  { name: "Chocolat Chaud", category: "McCafé", sizes: ["Moyen", "Grand"] },
  { name: "Chocolat Chaud Gourmand", category: "McCafé", sizes: ["Moyen", "Grand"] },
];

const seed = async () => {
  console.log("Début du seed des produits");

  // On crée la table si elle n'existe pas encore
  await initDb();
  let inserted = 0;
  for (const product of PRODUCTS) {
    try {
      await sql`
        INSERT INTO products (name, category, sizes)
        VALUES (${product.name}, ${product.category}, ${product.sizes})
        ON CONFLICT (name) DO NOTHING
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
