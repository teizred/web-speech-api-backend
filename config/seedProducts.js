import { sql, initDb } from "./db.js";

/**
 * Script de seed pour insérer tous les produits McDo dans la table products.
 * Idempotent : utilise ON CONFLICT DO UPDATE pour mettre à jour les sous-catégories.
 *
 * Usage : node server/config/seedProducts.js
 */

const PRODUCTS = [
  // --- PERTES VIDES (Ingrédients / Matières premières) ---
  
  // Viandes
  { name: "10:1", category: "Viandes", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "4:1", category: "Viandes", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "3:1", category: "Viandes", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },

  // Protéines
  { name: "Poulet wrap", category: "Protéines", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Poulet CBO", category: "Protéines", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Poulet McChicken", category: "Protéines", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Poulet BM", category: "Protéines", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Nuggets", category: "Protéines", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Filet", category: "Protéines", subcategory: "Poisson", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Palet Veggie", category: "Protéines", subcategory: "Veggie", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Nuggets Veggie", category: "Protéines", subcategory: "Veggie", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Apple Pie", category: "Protéines", subcategory: "Desserts frits", sizes: null, unit_type: "unit", loss_type: "vide" },

  // Pains Cuisine
  { name: "Pain Mac", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Pain Reg", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Pain Royal", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Pain 280", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Pain CBO", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Pain Big Arch", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Pain McCrispy", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Petit Tortilla", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Grand Tortilla", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Pains McMuffin", category: "Pains Cuisine", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },

  // Garnitures
  { name: "Bacon standard", category: "Garnitures", subcategory: null, sizes: null, unit_type: "pieces", loss_type: "vide" },
  { name: "Eclats de Bacon (Flavor)", category: "Garnitures", subcategory: null, sizes: null, unit_type: "weight", loss_type: "vide" },
  { name: "Cheddar Orange", category: "Garnitures", subcategory: "Cheddar", sizes: null, unit_type: "pieces", loss_type: "vide" },
  { name: "Cheddar Blanc", category: "Garnitures", subcategory: "Cheddar", sizes: null, unit_type: "pieces", loss_type: "vide" },
  { name: "Gouda", category: "Garnitures", subcategory: null, sizes: null, unit_type: "pieces", loss_type: "vide" },
  { name: "Salade Mac", category: "Garnitures", subcategory: "Salades", sizes: null, unit_type: "weight", loss_type: "vide" },
  { name: "Salade Batavia", category: "Garnitures", subcategory: "Salades", sizes: null, unit_type: "weight", loss_type: "vide" },
  { name: "Salade d'été", category: "Garnitures", subcategory: "Salades", sizes: null, unit_type: "weight", loss_type: "vide" },
  { name: "Oignons royal", category: "Garnitures", subcategory: "Oignons", sizes: null, unit_type: "weight", loss_type: "vide" },
  { name: "Oignons reg", category: "Garnitures", subcategory: "Oignons", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Oignons frits", category: "Garnitures", subcategory: "Oignons", sizes: null, unit_type: "weight", loss_type: "vide" },
  { name: "Tomates charnues", category: "Garnitures", subcategory: null, sizes: null, unit_type: "pieces", loss_type: "vide" },
  { name: "Cornichons", category: "Garnitures", subcategory: null, sizes: null, unit_type: "weight", loss_type: "vide" },
  { name: "Kit Caesar", category: "Garnitures", subcategory: "Autres", sizes: null, unit_type: "unit", loss_type: "vide" },

  // Sauces Cuisine
  { name: "Sauce Mac", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Sauce Chicken", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Sauce Filet", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Sauce Tasty", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Sauce CBO", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Sauce Deluxe", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Sauce Big Arch", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Sauce Black Pepper Mayo", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Sauce McExtreme", category: "Sauces Cuisine", subcategory: "Cartouches", sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Sauce Ranch", category: "Sauces Cuisine", subcategory: "Poches", sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Sauce Cheddar (Flavor)", category: "Sauces Cuisine", subcategory: "Poches", sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Moutarde vrac", category: "Sauces Cuisine", subcategory: null, sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Ketchup Bib", category: "Sauces Cuisine", subcategory: null, sizes: null, unit_type: "liquid", loss_type: "vide" },

  // Cuisine Autre
  { name: "Oeufs coquilles", category: "Cuisine Autre", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Beurre Liquide", category: "Cuisine Autre", subcategory: null, sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Jambon Croque", category: "Cuisine Autre", subcategory: null, sizes: null, unit_type: "pieces", loss_type: "vide" },

  // Campagnes
  { name: "Patty de Fromage", category: "Campagnes", subcategory: null, sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Jalapenos", category: "Campagnes", subcategory: null, sizes: null, unit_type: "weight", loss_type: "vide" },
  { name: "Sauce Habanero", category: "Campagnes", subcategory: null, sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Sauce Smoky", category: "Campagnes", subcategory: null, sizes: null, unit_type: "liquid", loss_type: "vide" },

  // Ingrédients Boissons (Nouveau)
  { name: "CO2", category: "Ingrédients Boissons", subcategory: null, sizes: null, unit_type: "weight", loss_type: "vide" },
  { name: "Concentré Jus d'orange", category: "Ingrédients Boissons", subcategory: null, sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Concentré Ice Tea", category: "Ingrédients Boissons", subcategory: null, sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Concentré Ice Tea Zéro", category: "Ingrédients Boissons", subcategory: null, sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Concentré Green Ice Tea", category: "Ingrédients Boissons", subcategory: null, sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Concentré Green Ice Tea Zéro", category: "Ingrédients Boissons", subcategory: null, sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Concentré Oasis", category: "Ingrédients Boissons", subcategory: null, sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Concentré Cherry Coke", category: "Ingrédients Boissons", subcategory: null, sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Concentré Coca", category: "Ingrédients Boissons", subcategory: null, sizes: null, unit_type: "liquid", loss_type: "vide" },

  // McCafé Ingrédients (Produit McCafé Vide)
  { name: "Café Segafredo", category: "McCafé", subcategory: "Ingrédients", sizes: null, unit_type: "weight", loss_type: "vide" },
  { name: "Lait demi-écrémé", category: "McCafé", subcategory: "Ingrédients", sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Coulis Choconuts", category: "McCafé", subcategory: "Ingrédients", sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Poudre Chocolat Monbana", category: "McCafé", subcategory: "Ingrédients", sizes: null, unit_type: "weight", loss_type: "vide" },
  { name: "Base Multifruits pour Smoothie", category: "McCafé", subcategory: "Ingrédients", sizes: null, unit_type: "liquid", loss_type: "vide" },
  { name: "Poudre Délifrapp'", category: "McCafé", subcategory: "Ingrédients", sizes: null, unit_type: "weight", loss_type: "vide" },
  { name: "Fruits Fraise/Banane", category: "McCafé", subcategory: "Ingrédients", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Fruits Mangue/Papaye", category: "McCafé", subcategory: "Ingrédients", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Thés Clipper Earl Grey", category: "McCafé", subcategory: "Ingrédients", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Thés Clipper Vert Menthe", category: "McCafé", subcategory: "Ingrédients", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Thés Clipper Infusion Citron/Gingembre", category: "McCafé", subcategory: "Ingrédients", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Croissant", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Pain au Chocolat", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Donut sucré", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Donut choco-noisette", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Macaron Chocolat", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Macaron Framboise", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Macaron Vanille", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Macaron Caramel", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "McPops Lotus", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "McPops Fruits Rouges", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "McPops Choconut", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "McPops Noisette", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "McPops Chocolat Blanc", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "McPops Au Chocolat", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Muffin Chocolat", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Muffin Caramel", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Cookie Fourré Choconuts", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Cookie Framboise", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Cookie Caramel Pécan", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Cinnamon Roll", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Cheesecake Nature", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },

  // --- PERTES COMPLÈTES (Produits finis) ---

  // Sandwichs
  { name: "Big Mac", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Big Mac Bacon", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Big Tasty 1v", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Big Tasty 2v", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "280 Original", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Royal Cheese", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Royal Deluxe", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Royal Bacon", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Big Arch", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Cheeseburger", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Double Cheeseburger", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Double Cheese Bacon", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Hamburger", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "CBO", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "CBO Smoky Ranch", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McCrispy", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McCrispy Bacon", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McCrispy Smoky Ranch Bacon", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McChicken", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "P'tit Chicken", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "P'tit Wrap Ranch", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "P'tit Wrap Ranch Veggie", category: "Sandwichs", subcategory: "Veggie", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "P'tit Wrap New York", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "P'tit Wrap New York Veggie", category: "Sandwichs", subcategory: "Veggie", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Boite de Nuggets", category: "Sandwichs", subcategory: "Poulet", sizes: ["x4", "x6", "x9", "x20"], unit_type: "unit", loss_type: "complet" },
  { name: "Filet-O-Fish", category: "Sandwichs", subcategory: "Poisson", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Double Filet-O-Fish", category: "Sandwichs", subcategory: "Poisson", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McFish", category: "Sandwichs", subcategory: "Poisson", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McFish Mayo", category: "Sandwichs", subcategory: "Poisson", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Fish New York 1F", category: "Sandwichs", subcategory: "Poisson", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Fish New York 2F", category: "Sandwichs", subcategory: "Poisson", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McExtreme 1v", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McExtreme 2v", category: "Sandwichs", subcategory: "Bœuf", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McWrap Smoky Ranch", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McWrap New York", category: "Sandwichs", subcategory: "Poulet", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McVeggie", category: "Sandwichs", subcategory: "Veggie", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McWrap Veggie", category: "Sandwichs", subcategory: "Veggie", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Boite de Nuggets veggie", category: "Sandwichs", subcategory: "Veggie", sizes: ["x4", "x6", "x9", "x20"], unit_type: "unit", loss_type: "complet" },
  { name: "Egg & Cheese", category: "Sandwichs", subcategory: "Petit-déj", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Egg & Bacon", category: "Sandwichs", subcategory: "Petit-déj", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Bacon & Beef McMuffin", category: "Sandwichs", subcategory: "Petit-déj", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Croque McDo", category: "Sandwichs", subcategory: "Petit-déj", sizes: null, unit_type: "unit", loss_type: "complet" },

  // Accompagnements
  { name: "Frites", category: "Accompagnements", subcategory: "Frites", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Frites Cheddar Bacon", category: "Accompagnements", subcategory: "Frites", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Frites Double Cheddar", category: "Accompagnements", subcategory: "Frites", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Potatoes", category: "Accompagnements", subcategory: "Potatoes", sizes: ["Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Potatoes Cheddar Bacon", category: "Accompagnements", subcategory: "Potatoes", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Potatoes Double Cheddar", category: "Accompagnements", subcategory: "Potatoes", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "P'tite Salade", category: "Accompagnements", subcategory: "Salades", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Salade Caesar", category: "Accompagnements", subcategory: "Salades", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Salade Veggie", category: "Accompagnements", subcategory: "Salades", sizes: null, unit_type: "unit", loss_type: "complet" },

  // Boissons
  { name: "Coca-Cola", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Coca-Cola Sans-Sucres", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Coca-Cola Cherry Zéro", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Fanta Sans-Sucres", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Sprite Sans-Sucres", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Green Apple Sprite", category: "Boissons", subcategory: "Sodas", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Lipton Ice Tea", category: "Boissons", subcategory: "Thés & Jus", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Oasis Tropical", category: "Boissons", subcategory: "Thés & Jus", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Minute Maid Orange", category: "Boissons", subcategory: "Thés & Jus", sizes: ["Petit", "Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "P'tit Nectar Pomme", category: "Boissons", subcategory: "Thés & Jus", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Capri-Sun Tropical", category: "Boissons", subcategory: "Thés & Jus", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Eau Plate", category: "Boissons", subcategory: "Eaux", sizes: ["Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Eau Pétillante", category: "Boissons", subcategory: "Eaux", sizes: ["Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },

  // McCafé
  { name: "Sundae Chocolat", category: "Desserts", subcategory: "Glaces", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Sundae Caramel", category: "Desserts", subcategory: "Glaces", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Sundae Pistache", category: "Desserts", subcategory: "Glaces", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Sundae Affogato", category: "Desserts", subcategory: "Glaces", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "P'tit Sundae Chocolat", category: "Desserts", subcategory: "Glaces", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "P'tit Sundae Caramel", category: "Desserts", subcategory: "Glaces", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McFlurry KitKat", category: "Desserts", subcategory: "Glaces", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McFlurry M&M's", category: "Desserts", subcategory: "Glaces", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McFlurry Daim", category: "Desserts", subcategory: "Glaces", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McFlurry Oreo", category: "Desserts", subcategory: "Glaces", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "McFlurry Shortbread", category: "Desserts", subcategory: "Glaces", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Milkshake", category: "Desserts", subcategory: "Milshake", sizes: ["Vanille", "Fraise", "Café"], unit_type: "unit", loss_type: "complet" },
  { name: "Milkshake Chantilly", category: "Desserts", subcategory: "Milshake", sizes: ["Vanille", "Fraise", "Café"], unit_type: "unit", loss_type: "complet" },
  { name: "P'tit Ice Squeeze (Vanille)", category: "Desserts", subcategory: "Glaces", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Berlingot Pomme Pêche", category: "Desserts", subcategory: "Fruits", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Bio à boire", category: "Desserts", subcategory: "Fruits", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "P'tite Pomme", category: "Desserts", subcategory: "Fruits", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "P'tit Ananas", category: "Desserts", subcategory: "Fruits", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "P'tits Carottes", category: "Desserts", subcategory: "Fruits", sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Duo Macaron Vanille/Caramel", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },
  { name: "Duo Macaron Chocolat/Framboise", category: "McCafé", subcategory: "Pâtisseries", sizes: null, unit_type: "unit", loss_type: "vide" },

  // McCafé (Pertes Complètes)
  { name: "Ristretto", category: "McCafé", subcategory: null, sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Espresso", category: "McCafé", subcategory: null, sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Double Espresso", category: "McCafé", subcategory: null, sizes: null, unit_type: "unit", loss_type: "complet" },
  { name: "Café Allongé", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Cappucino", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Café Latté", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Café Latté Gourmand", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Chocolat Chaud", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Chocolat Chaud Gourmand", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Thé Earl Grey", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Thé Vert Menthe", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
  { name: "Infusion Citron/Gingembre", category: "McCafé", subcategory: null, sizes: ["Moyen", "Grand"], unit_type: "unit", loss_type: "complet" },
];

const seed = async () => {
  console.log("Début du seed des produits");

  // On crée la table si elle n'existe pas encore
  await initDb();

  // On vide la table pour éviter les doublons avec des noms légèrement différents
  console.log("Nettoyage de la base de données...");
  await sql`TRUNCATE TABLE products CASCADE`;

  let inserted = 0;
  for (const product of PRODUCTS) {
    try {
      await sql`
        INSERT INTO products (name, category, subcategory, sizes, unit_type, loss_type)
        VALUES (${product.name}, ${product.category}, ${product.subcategory}, ${product.sizes}, ${product.unit_type}, ${product.loss_type})
        ON CONFLICT (name) DO UPDATE SET
          category = ${product.category},
          subcategory = ${product.subcategory},
          sizes = ${product.sizes},
          unit_type = ${product.unit_type},
          loss_type = ${product.loss_type}
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
