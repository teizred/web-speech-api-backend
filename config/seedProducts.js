import { sql, initDb } from "./db.js";

/**
 * Script de seed pour insérer tous les produits McDo dans la table products.
 * Idempotent : utilise ON CONFLICT DO UPDATE pour mettre à jour les sous-catégories.
 *
 * Usage : node server/config/seedProducts.js
 */

const PRODUCTS = [
  // Viandes (pas de sous-catégorie)
  { name: "10:1", category: "Viandes", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "4:1", category: "Viandes", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "3:1", category: "Viandes", subcategory: null, sizes: null, unit_type: "unit" },

  // Protéines — Poulet
  { name: "Poulet wrap", category: "Protéines", subcategory: "Poulet", sizes: null, unit_type: "unit" },
  { name: "Poulet CBO", category: "Protéines", subcategory: "Poulet", sizes: null, unit_type: "unit" },
  { name: "Poulet McChicken", category: "Protéines", subcategory: "Poulet", sizes: null, unit_type: "unit" },
  { name: "Poulet BM", category: "Protéines", subcategory: "Poulet", sizes: null, unit_type: "unit" },
  { name: "Nuggets", category: "Protéines", subcategory: "Poulet", sizes: null, unit_type: "unit" },

  // Protéines — Poisson
  { name: "Filet", category: "Protéines", subcategory: "Poisson", sizes: null, unit_type: "unit" },

  // Protéines — Veggie
  { name: "Palet Veggie", category: "Protéines", subcategory: "Veggie", sizes: null, unit_type: "unit" },
  { name: "Nuggets Veggie", category: "Protéines", subcategory: "Veggie", sizes: null, unit_type: "unit" },

  // Protéines — Desserts frits
  { name: "Apple Pie", category: "Protéines", subcategory: "Desserts frits", sizes: null, unit_type: "unit" },

  // Sandwichs — Bœuf
  { name: "Big Mac", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit" },
  { name: "Big Mac Bacon", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit" },
  { name: "Big Tasty 1 steak", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit" },
  { name: "Big Tasty 2 steaks", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit" },
  { name: "280 Original", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit" },
  { name: "Royal Cheese", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit" },
  { name: "Royal Deluxe", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit" },
  { name: "Royal Bacon", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit" },
  { name: "Big Arch", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit" },
  { name: "Cheeseburger", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit" },
  { name: "Double Cheeseburger", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit" },
  { name: "Double Cheese Bacon", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit" },
  { name: "Hamburger", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit" },

  // Sandwichs — Poulet
  { name: "CBO", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit" },
  { name: "CBO Smoky Ranch", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit" },
  { name: "McCrispy", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit" },
  { name: "McCrispy Bacon", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit" },
  { name: "McCrispy Smoky Ranch Bacon", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit" },
  { name: "McChicken", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit" },
  { name: "P'tit Chicken", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit" },
  { name: "P'tit Wrap Ranch", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit" },
  { name: "Boite de Nuggets", category: "Sandwichs", subcategory: "Poulet", sizes: ["x4", "x6", "x9", "x20"], unit_type: "unit" },

  // Sandwichs — Poisson
  { name: "Filet-O-Fish", category: "Sandwichs", subcategory: "Poisson", sizes: null, unit_type: "unit" },
  { name: "McFish", category: "Sandwichs", subcategory: "Poisson", sizes: null, unit_type: "unit" },
  { name: "McFish Mayo", category: "Sandwichs", subcategory: "Poisson", sizes: null, unit_type: "unit" },
  { name: "Fish New York", category: "Sandwichs", subcategory: "Poisson", sizes: null, unit_type: "unit" },
  { name: "Double Fish New York", category: "Sandwichs", subcategory: "Poisson", sizes: null, unit_type: "unit" },

  // Sandwichs — Wraps
  { name: "McWrap Smoky Ranch", category: "Sandwichs", subcategory: "Wraps", sizes: null, unit_type: "unit" },
  { name: "McWrap New York", category: "Sandwichs", subcategory: "Wraps", sizes: null, unit_type: "unit" },

  // Sandwichs — Veggie
  { name: "McVeggie", category: "Sandwichs", subcategory: "Veggie", sizes: null, unit_type: "unit" },
  { name: "McWrap Veggie", category: "Sandwichs", subcategory: "Veggie", sizes: null, unit_type: "unit" },
  { name: "Boite de Nuggets veggie", category: "Sandwichs", subcategory: "Veggie", sizes: ["x4", "x6", "x9", "x20"], unit_type: "unit" },

  // Sandwichs — Petit-déj
  { name: "Egg & Cheese", category: "Sandwichs", subcategory: "Petit-déj", sizes: null, unit_type: "unit" },
  { name: "Egg & Bacon", category: "Sandwichs", subcategory: "Petit-déj", sizes: null, unit_type: "unit" },
  { name: "Bacon & Beef McMuffin", category: "Sandwichs", subcategory: "Petit-déj", sizes: null, unit_type: "unit" },
  { name: "Croque McDo", category: "Sandwichs", subcategory: "Petit-déj", sizes: null, unit_type: "unit" },

  // Accompagnements — Frites
  { name: "Frites", category: "Accompagnements", subcategory: "Frites", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit" },
  { name: "Frites Cheddar", category: "Accompagnements", subcategory: "Frites", sizes: null, unit_type: "unit" },
  { name: "Frites Bacon", category: "Accompagnements", subcategory: "Frites", sizes: null, unit_type: "unit" },
  { name: "Wavy Fries", category: "Accompagnements", subcategory: "Frites", sizes: ["Moyen", "Grand"], unit_type: "unit" },

  // Accompagnements — Potatoes
  { name: "Potatoes", category: "Accompagnements", subcategory: "Potatoes", sizes: ["Moyen", "Grand"], unit_type: "unit" },
  { name: "Potatoes Cheddar", category: "Accompagnements", subcategory: "Potatoes", sizes: null, unit_type: "unit" },
  { name: "Potatoes Bacon", category: "Accompagnements", subcategory: "Potatoes", sizes: null, unit_type: "unit" },

  // Boissons — Sodas
  { name: "Coca-Cola", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit" },
  { name: "Coca-Cola Sans-Sucres", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit" },
  { name: "Coca-Cola Cherry Zéro", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit" },
  { name: "Fanta Sans-Sucres", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit" },
  { name: "Sprite Sans-Sucres", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit" },
  { name: "Green Apple Sprite", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit" },

  // Boissons — Thés & Jus
  { name: "Lipton Ice Tea", category: "Boissons", subcategory: "Thés & Jus", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit" },
  { name: "Oasis Tropical", category: "Boissons", subcategory: "Thés & Jus", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit" },
  { name: "Minute Maid Orange", category: "Boissons", subcategory: "Thés & Jus", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit" },
  { name: "P'tit Nectar Pomme", category: "Boissons", subcategory: "Thés & Jus", sizes: null, unit_type: "unit" },
  { name: "Capri-Sun Tropical", category: "Boissons", subcategory: "Thés & Jus", sizes: null, unit_type: "unit" },

  // Boissons — Eaux
  { name: "Eau Plate", category: "Boissons", subcategory: "Eaux", sizes: ["Moyen", "Grand"], unit_type: "unit" },
  { name: "Eau Pétillante", category: "Boissons", subcategory: "Eaux", sizes: ["Moyen", "Grand"], unit_type: "unit" },

  // McCafé (pas de sous-catégorie)
  { name: "Ristretto", category: "McCafé", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Espresso", category: "McCafé", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Double Espresso", category: "McCafé", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Espresso Décaféiné", category: "McCafé", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Thé Glacé Pêche", category: "McCafé", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Délifrapp Cookie", category: "McCafé", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Délifrapp Vanille", category: "McCafé", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Smoothie Mangue Papaye", category: "McCafé", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Smoothie Banane Fraise", category: "McCafé", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Café Allongé", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit" },
  { name: "Café Allongé Décaféiné", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit" },
  { name: "Thé Earl Grey", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit" },
  { name: "Thé Vert Menthe", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit" },
  { name: "Thé Citron Gingembre", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit" },
  { name: "Café Latté", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit" },
  { name: "Cappuccino", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit" },
  { name: "Café Latte Gourmand", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit" },
  { name: "Café Latte Glacé", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit" },
  { name: "Café Latte Glacé Gourmand", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit" },
  { name: "Americano Glacé", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit" },
  { name: "Chocolat Chaud", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit" },
  { name: "Chocolat Chaud Gourmand", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit" },

  // --- Nouveaux produits de la liste DLC Cuisine ---

  // Pains Cuisine
  { name: "Pain Mac", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Pain Reg", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Pain Royal", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Pain 280", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Pain CBO", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Pain Big Arch", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Pain McCrispy", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Petit Tortilla", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Grand Tortilla", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Pains McMuffin", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit" },

  // Garnitures
  { name: "Bacon standard", category: "Garnitures", subcategory: null, sizes: null, unit_type: "pieces" },
  { name: "Eclats de Bacon (Flavor)", category: "Garnitures", subcategory: null, sizes: null, unit_type: "weight" },
  { name: "Cheddar Orange", category: "Garnitures", subcategory: "Cheddar", sizes: null, unit_type: "pieces" },
  { name: "Cheddar Blanc", category: "Garnitures", subcategory: "Cheddar", sizes: null, unit_type: "pieces" },
  { name: "Gouda", category: "Garnitures", subcategory: null, sizes: null, unit_type: "pieces" },
  { name: "Salade Mac", category: "Garnitures", subcategory: "Salades", sizes: null, unit_type: "weight" },
  { name: "Salade Batavia", category: "Garnitures", subcategory: "Salades", sizes: null, unit_type: "weight" },
  { name: "Oignons royal", category: "Garnitures", subcategory: "Oignons", sizes: null, unit_type: "weight" },
  { name: "Oignons reg", category: "Garnitures", subcategory: "Oignons", sizes: null, unit_type: "weight" },
  { name: "Oignons frits", category: "Garnitures", subcategory: "Oignons", sizes: null, unit_type: "weight" },
  { name: "Tomates charnues", category: "Garnitures", subcategory: null, sizes: null, unit_type: "pieces" },
  { name: "Cornichons", category: "Garnitures", subcategory: null, sizes: null, unit_type: "weight" },

  // Sauces Cuisine
  { name: "Sauce Mac", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "weight" },
  { name: "Sauce Chicken", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "weight" },
  { name: "Sauce Filet", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "weight" },
  { name: "Sauce Tasty", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "weight" },
  { name: "Sauce CBO", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "weight" },
  { name: "Sauce Deluxe", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "weight" },
  { name: "Sauce Big Arch", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "weight" },
  { name: "Sauce Black Pepper Mayo", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "weight" },
  { name: "Sauce McExtreme", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "weight" },
  { name: "Sauce Ranch", category: "Sauces Cuisine", subcategory: "Poches", sizes: null, unit_type: "weight" },
  { name: "Sauce Cheddar (Flavor)", category: "Sauces Cuisine", subcategory: "Poches", sizes: null, unit_type: "weight" },
  { name: "Moutarde vrac", category: "Sauces Cuisine", subcategory: null, sizes: null, unit_type: "weight" },
  { name: "Ketchup Bib", category: "Sauces Cuisine", subcategory: null, sizes: null, unit_type: "weight" },

  // Cuisine Autre
  { name: "Oeufs coquilles", category: "Cuisine Autre", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Beurre Liquide", category: "Cuisine Autre", subcategory: null, sizes: null, unit_type: "weight" },
  { name: "Jambon Croque", category: "Cuisine Autre", subcategory: null, sizes: null, unit_type: "pieces" },

  // Campagnes
  { name: "Patty de Fromage", category: "Campagnes", subcategory: null, sizes: null, unit_type: "unit" },
  { name: "Jalapenos", category: "Campagnes", subcategory: null, sizes: null, unit_type: "weight" },
  { name: "Sauce Habanero", category: "Campagnes", subcategory: null, sizes: null, unit_type: "weight" },
  { name: "Sauce Smoky", category: "Campagnes", subcategory: null, sizes: null, unit_type: "weight" },
];

const seed = async () => {
  console.log("Début du seed des produits");

  // On crée la table si elle n'existe pas encore
  await initDb();

  let inserted = 0;
  for (const product of PRODUCTS) {
    try {
      await sql`
        INSERT INTO products (name, category, subcategory, sizes, unit_type)
        VALUES (${product.name}, ${product.category}, ${product.subcategory}, ${product.sizes}, ${product.unit_type})
        ON CONFLICT (name) DO UPDATE SET
          category = ${product.category},
          subcategory = ${product.subcategory},
          sizes = ${product.sizes},
          unit_type = ${product.unit_type}
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
