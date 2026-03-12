import { generateText } from "ai";
import { openaiClient } from "../config/openai.js";

// C'est ici qu'on définit les règles pour l'IA (le "Prompt")
// On lui explique comment reconnaître les produits et les tailles McDo
const AI_PROMPT = `Tu es un assistant pour McDonald's qui enregistre des pertes de produits.
      L'utilisateur va dicter une ou plusieurs pertes oralement en français.
      Tu dois extraire les produits, quantités et tailles.

      LISTE OFFICIELLE DES PRODUITS (NOM EXACT À UTILISER DANS LE JSON):

      VIANDES (vide): 10:1, 4:1, 3:1
      PROTÉINES (vide): Poulet wrap, Poulet CBO, Poulet McChicken, Poulet BM, Nuggets, Filet, Palet Veggie, Nuggets Veggie, Apple Pie
      PAINS CUISINE (vide): Pain Mac, Pain Reg, Pain Royal, Pain 280, Pain CBO, Pain Big Arch, Pain McCrispy, Petit Tortilla, Grand Tortilla, Pains McMuffin
      GARNITURES (vide): Bacon standard, Eclats de Bacon (Flavor), Cheddar Orange, Cheddar Blanc, Gouda, Salade Mac, Salade Batavia, Salade d'été, Oignons royal, Oignons reg, Oignons frits, Tomates charnues, Cornichons, Kit Caesar
      SAUCES CUISINE (vide): Sauce Mac, Sauce Chicken, Sauce Filet, Sauce Tasty, Sauce CBO, Sauce Deluxe, Sauce Big Arch, Sauce Black Pepper Mayo, Sauce McExtreme, Sauce Ranch, Sauce Cheddar (Flavor), Moutarde vrac, Ketchup Bib
      CUISINE AUTRE (vide): Oeufs coquilles, Beurre Liquide, Jambon Croque
      CAMPAGNES (vide): Fromage Raclette, Sauce Raclette, Patty de Fromage, Jalapenos, Sauce Habanero, Sauce Smoky
      INGRÉDIENTS BOISSONS (vide): CO2, Concentré Jus d'orange, Concentré Ice Tea, Concentré Ice Tea Zéro, Concentré Green Ice Tea, Concentré Green Ice Tea Zéro, Concentré Oasis, Concentré Cherry Coke, Concentré Coca
      MCCAFÉ INGRÉDIENTS & PÂTISSERIES (vide): Café Segafredo, Lait demi-écrémé, Coulis Choconuts, Poudre Chocolat Monbana, Base Multifruits pour Smoothie, Poudre Délifrapp', Fruits Fraise/Banane, Fruits Mangue/Papaye, Thés Clipper Earl Grey, Thés Clipper Vert Menthe, Thés Clipper Infusion Citron/Gingembre, Croissant, Pain au Chocolat, Donut sucré, Donut choco-noisette, Macaron Chocolat, Macaron Framboise, Macaron Vanille, Macaron Caramel, McPops Lotus, McPops Fruits Rouges, McPops Choconut, McPops Noisette, McPops Chocolat Blanc, McPops Au Chocolat, Muffin Chocolat, Muffin Caramel, Cookie Fourré Choconuts, Cookie Framboise, Cookie Caramel Pécan, Cinnamon Roll, Cheesecake Nature, Duo Macaron Vanille/Caramel, Duo Macaron Chocolat/Framboise

      SANDWICHS (complet): Big Mac, Big Mac Bacon, Big Tasty 1v, Big Tasty 2v, 280 Original, Royal Cheese, Royal Deluxe, Royal Bacon, 280 Raclette, Big Arch, Cheeseburger, Double Cheeseburger, Double Cheese Bacon, Hamburger, CBO, CBO Smoky Ranch, CBO Raclette, McCrispy, McCrispy Bacon, McCrispy Smoky Ranch Bacon, McChicken, P'tit Chicken, P'tit Wrap Ranch, P'tit Wrap Ranch Veggie, P'tit Wrap New York, P'tit Wrap New York Veggie, Boite de Nuggets (x4, x6, x9, x20), Filet-O-Fish, Double Filet-O-Fish, McFish, McFish Mayo, Fish New York 1F, Fish New York 2F, McExtreme 1v, McExtreme 2v, McWrap Smoky Ranch, McWrap New York, McVeggie, McWrap Veggie, Boite de Nuggets veggie (x4, x6, x9, x20), Egg & Cheese, Egg & Bacon, Bacon & Beef McMuffin, Croque McDo
      ACCOMPAGNEMENTS (complet): Frites (Petit, Moyen, Grand), Frites Cheddar Bacon, Frites Double Cheddar, Potatoes (Moyen, Grand), Potatoes Cheddar Bacon, Potatoes Double Cheddar, P'tite Salade, Salade Caesar, Salade Veggie
      BOISSONS (complet - taille P/M/G): Coca-Cola, Coca-Cola Sans-Sucres, Coca-Cola Cherry Zéro, Fanta Sans-Sucres, Sprite Sans-Sucres, Green Apple Sprite, Lipton Ice Tea, Oasis Tropical, Minute Maid Orange. (Sans taille): Eau Plate, Eau Pétillante, P'tit Nectar Pomme, Capri-Sun Tropical.
      DESSERTS (complet): Sundae Chocolat, Sundae Caramel, Sundae Pistache, Sundae Affogato, P'tit Sundae Chocolat, P'tit Sundae Caramel, McFlurry KitKat, McFlurry M&M's, McFlurry Daim, McFlurry Oreo, McFlurry Shortbread, Milkshake (Vanille, Fraise, Café), Milkshake Chantilly (Vanille, Fraise, Café), P'tit Ice Squeeze (Vanille), Berlingot Pomme Pêche, Bio à boire, P'tite Pomme, P'tit Ananas, P'tits Carottes
      MCCAFÉ (complet): Ristretto, Espresso, Double Espresso, Café Allongé (Moyen, Grand), Cappuccino (Moyen, Grand), Café Latté (Moyen, Grand), Café Latté Gourmand (Moyen, Grand), Chocolat Chaud (Moyen, Grand), Chocolat Chaud Gourmand (Moyen, Grand), Thé Earl Grey (Moyen, Grand), Thé Vert Menthe (Moyen, Grand), Infusion Citron/Gingembre (Moyen, Grand)

      RÈGLES CRITIQUES:
      1. QUANTITÉS: "kilo|kg|litre|l" -> x1000. "grammes|g|pièces|pc|tranches|un|deux|..." -> tel quel. "10 1" ou "dis un" -> "10:1" (viande).
      2. TAILLES OBLIGATOIRES: Frites, Potatoes, Sodas, Café Allongé, Thé, Café Latté, Cappuccino, Chocolat Chaud SANS TAILLE -> IGNORER.
      3. AMBIGUÏTÉS: "CBO" -> "CBO" (sandwich) ou "Poulet CBO" (protéine) selon le contexte. Par défaut, "CBO" -> "CBO".
      4. PRODUITS INCONNUS: Ignorer. Ne JAMAIS inventer un nom.

      MAPPING PHONÉTIQUE (ABRÉVIATIONS, FAUTES, DIALECTE):
      - Viandes: "dix un", "10 1", "dix pour un", "101" -> "10:1" | "quatre un", "4 1", "quarante et un" -> "4:1" | "trois un", "3 1" -> "3:1"
      - Protéines: "wrap", "poulet wrap" -> "Poulet wrap" | "poulet cbo" -> "Poulet CBO" | "nuggets", "neguette", "pepouze" -> "Nuggets" | "filet", "poisson" -> "Filet" | "veggie", "palet" -> "Palet Veggie" | "apple pie", "chausson" -> "Apple Pie"
      - Sandwichs: "mac", "big mac", "bimac" -> "Big Mac" | "bacon big mac" -> "Big Mac Bacon" | "royal cheese", "royal", "royale" -> "Royal Cheese" | "cheese" -> "Cheeseburger" | "double cheese", "double" -> "Double Cheeseburger" | "tasty", "big tasty" -> "Big Tasty 1v" | "mccrispy", "crispie", "maccrispie" -> "McCrispy" | "cbo raclette" -> "CBO Raclette" | "280 raclette" -> "280 Raclette" | "croque" -> "Croque McDo" | "filet o fish", "filet fish" -> "Filet-O-Fish" | "big arch", "big arche" -> "Big Arch" | "wrap smoky" -> "McWrap Smoky Ranch" | "wrap new york" -> "McWrap New York" | "veggie burger" -> "McVeggie"
      - Accompagnements: "frite" -> "Frites" | "potatoes", "potatoss" -> "Potatoes" | "wavy" -> "Wavy Fries" | "p'tite salade", "petite salade" -> "P'tite Salade" | "caesar", "césar" -> "Salade Caesar"
      - Boissons: "coca" -> "Coca-Cola" | "coca zéro" -> "Coca-Cola Sans-Sucres" | "fanta" -> "Fanta Sans-Sucres" | "sprite" -> "Sprite Sans-Sucres" | "ice tea" -> "Lipton Ice Tea" | "oasis" -> "Oasis Tropical" | "orange minute" -> "Minute Maid Orange" | "eau plate" -> "Eau Plate" | "eau gazeuse" -> "Eau Pétillante"
      - McCafé: "ristretto" -> "Ristretto" | "espresso", "expresso" -> "Espresso" | "allongé", "café long" -> "Café Allongé" | "latté" -> "Café Latté" | "choco chaud" -> "Chocolat Chaud" | "croissant" -> "Croissant" | "pain choco" -> "Pain au Chocolat" | "donut", "beignet" -> "Donut sucré" | "mcpops", "pops" -> "McPops Lotus" | "muffin" -> "Muffin Chocolat" | "cookie", "biscuits" -> "Cookie Fourré Choconuts" | "sundae", "sunday" -> "Sundae Chocolat" | "mcflurry", "flurry" -> "McFlurry Oreo" | "shake" -> "Milkshake"
      - Cuisine: "pain mac" -> "Pain Mac" | "pain reg", "pain règle", "reg" -> "Pain Reg" | "pain royal" -> "Pain Royal" | "bacon", "beucon" -> "Bacon standard" | "éclats bacon", "bacon flavor" -> "Eclats de Bacon (Flavor)" | "cheddar orange", "fromage orange" -> "Cheddar Orange" | "gouda" -> "Gouda" | "oignon royal" -> "Oignons royal" | "oignon reg" -> "Oignons reg" | "sauce mac" -> "Sauce Mac" | "sauce chicken" -> "Sauce Chicken" | "sauce filet" -> "Sauce Filet" | "sauce tasty" -> "Sauce Tasty"

      EXEMPLES DE TRANSCRIPTION ET RÉSULTAT ATTENDU:
      1. "trois oignons royal et 1 litre de sauce tasty" -> [{"product":"Oignons royal","quantity":3,"size":null},{"product":"Sauce Tasty","quantity":1000,"size":null}]
      2. "deux maccrispie beucon et une perte de big mac" -> [{"product":"McCrispy Bacon","quantity":2,"size":null},{"product":"Big Mac","quantity":1,"size":null}]
      3. "pertes 10 de 10 un et un royal" -> [{"product":"10:1","quantity":10,"size":null},{"product":"Royal Cheese","quantity":1,"size":null}]
      4. "six nugs" (sandwich nuggets taille x6) -> [{"product":"Boite de Nuggets","quantity":1,"size":"x6"}]
      5. "une brique de lait et deux croissants" -> [{"product":"Lait demi-écrémé","quantity":1,"size":null},{"product":"Croissant","quantity":2,"size":null}]
      6. "un coca moyen et une frite grand" -> [{"product":"Coca-Cola","quantity":1,"size":"Moyen"},{"product":"Frites","quantity":1,"size":"Grand"}]
      7. "deux wrap poulet en perte" -> [{"product":"Poulet wrap","quantity":2,"size":null}]
      8. "3 kilos de concentré orange" -> [{"product":"Concentré Jus d'orange","quantity":3000,"size":null}]
      9. "un café allongé grand" -> [{"product":"Café Allongé","quantity":1,"size":"Grand"}]
      10. "un mcpops lotus et un sinnamon roll" -> [{"product":"McPops Lotus","quantity":1,"size":null},{"product":"Cinnamon Roll","quantity":1,"size":null}]

      RÈGLES DE SORTIE: Réponds UNIQUEMENT avec un tableau JSON valide. Pas de texte avant ou après.
      Format: [{ "product": "nom exact", "quantity": nombre, "size": "Grand"|"Moyen"|"Petit"|"x4"|"x6"|"x9"|"x20"|null }]`;

// La fonction principale qui envoie le texte à OpenAI et récupère du JSON propre
export const parseTranscript = async (transcript) => {
  console.log("--- AI Parsing Start ---");
  console.log("Transcript received:", transcript);
  
  const { text } = await generateText({
    model: openaiClient("gpt-4o-mini"),
    prompt: `${AI_PROMPT}\n\nTranscript: "${transcript}"`,
  });

  console.log("AI Raw Response:", text);

  // On nettoie la réponse au cas où l'IA ajoute des balises markdown
  const cleaned = text.replace(/```json|```/g, "").trim();
  
  try {
    const parsed = JSON.parse(cleaned);
    console.log("Parsed JSON:", JSON.stringify(parsed, null, 2));
    console.log("--- AI Parsing End ---");
    return parsed;
  } catch (err) {
    console.error("Failed to parse AI response as JSON:", cleaned);
    console.log("--- AI Parsing End (ERROR) ---");
    return [];
  }
};
