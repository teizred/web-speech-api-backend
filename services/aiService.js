import { generateText } from "ai";
import { openaiClient } from "../config/openai.js";

// C'est ici qu'on définit les règles pour l'IA (le "Prompt")
// On lui explique comment reconnaître les produits et les tailles McDo
const AI_PROMPT = `Tu es un assistant pour McDonald's qui enregistre des pertes de produits.
      L'utilisateur va dicter une ou plusieurs pertes oralement en français.
      Tu dois extraire les produits, quantités et tailles.

      LISTE OFFICIELLE DES PRODUITS:

      VIANDES (pas de taille): 10:1, 4:1, 3:1
      PROTEINES (pas de taille): Poulet wrap, Poulet CBO, Poulet McChicken, Poulet BM, Filet, Nuggets, Nuggets Veggie, Palet Veggie, Apple Pie
      SANDWICHS (pas de taille): CBO Smoky Ranch, McCrispy Smoky Ranch Bacon, McWrap Smoky Ranch, Big Mac Bacon, Big Mac, McVeggie, McWrap Veggie, Filet-O-Fish, McFish Mayo, McFish, Fish New York, Double Fish New York, P'tit Chicken, Croque McDo, McChicken, Cheeseburger, Egg & Cheese McMuffin, CBO, Hamburger, McWrap New York, Royal Cheese, P'tit Wrap Ranch, Egg & Bacon McMuffin, Double Cheeseburger, Royal Deluxe, Royal Bacon, Big Tasty 1 steak, Big Tasty 2 steaks, 280 Original, Double Cheese Bacon, Big Arch, McCrispy Bacon, McCrispy, Bacon & Beef McMuffin, Boite de Nuggets (sizes: x4, x6, x9, x20), Boite de Nuggets veggie (sizes: x4, x6, x9, x20)

      ACCOMPAGNEMENTS:
      - Frites → Petit, Moyen, Grand (taille obligatoire)
      - Potatoes, Wavy Fries → Moyen, Grand (taille obligatoire)
      - Frites Cheddar, Frites Bacon, Potatoes Cheddar, Potatoes Bacon (pas de taille)

      BOISSONS (taille obligatoire: Petit, Moyen, Grand):
      Eau Plate (M/G), Eau Pétillante (M/G), Oasis Tropical, Green Apple Sprite, Coca-Cola Sans-Sucres, Coca-Cola, Coca-Cola Cherry Zéro, Sprite Sans-Sucres, Fanta Sans-Sucres, Minute Maid Orange, Lipton Ice Tea
      Sans taille: P'tit Nectar Pomme, Capri-Sun Tropical

      MCCAFE:
      - Ristretto, Espresso, Double Espresso, Espresso Décaféiné, Thé Glacé Pêche, Délifrapp Cookie, Délifrapp Vanille, Smoothie Mangue Papaye, Smoothie Banane Fraise (pas de taille)
      - Café Allongé (et Déca), Thé (Earl Grey, Menthe, Citron), Café Latté, Cappuccino, Café Latte Gourmand, Café Latte Glacé, Café Latte Glacé Gourmand, Americano Glacé, Chocolat Chaud (Moyen ou Grand obligatoire)
      - Produits Vides: Café Segafredo, Lait demi-écrémé, Croissant, Pain au Chocolat, Donut sucré, Donut choco-noisette, Macaron (Chocolat/Framboise/Vanille/Caramel), McPops (Lotus/Fruits Rouges/Choconut/Noisette/Blanc/Chocolat), Muffin (Chocolat/Caramel), Cookie (Fourré Choconuts/Framboise/Caramel Pécan), Cinnamon Roll, Cheesecake Choconuts M&M'S

      INGRÉDIENTS BOISSONS (PRODUITS VIDES):
      Concentré Jus d'orange, Concentré Ice Tea, Concentré Ice Tea Zéro, Concentré Green Ice Tea, Concentré Green Ice Tea Zéro, Concentré Oasis, Concentré Cherry Coke, Concentré Coca, CO2

      CUISINE (Nouveaux - Pas de taille):
      - Pains: Pain Mac, Pain Reg, Pain Royal, Pain 280, Pain CBO, Pain Big Arch, Pain McCrispy, Petit Tortilla, Grand Tortilla, Pains McMuffin
      - Garnitures: Bacon standard, Eclats de Bacon, Cheddar Orange, Cheddar Blanc, Gouda, Salade Mac, Salade Batavia, Salade d'été, Oignons royal, Oignons reg, Oignons frits, Tomates charnues, Cornichons, Kit Caesar
      - Sauces: Sauce Mac, Sauce Chicken, Sauce Filet, Sauce Tasty, Sauce CBO, Sauce Deluxe, Sauce Big Arch, Sauce Black Pepper Mayo, Sauce McExtreme, Sauce Ranch, Sauce Cheddar (Flavor), Moutarde vrac, Ketchup Bib
      - Autre: Oeufs coquilles, Beurre Liquide, Jambon Croque, Patty de Fromage, Jalapenos, Sauce Habanero, Sauce Smoky

      EXEMPLES DE TRANSCRIPTION ET RÉSULTAT ATTENDU:
      1. "trois oignons royal et 1 litre de sauce tasty" 
         -> [{ "product": "Oignons royal", "quantity": 3, "size": null }, { "product": "Sauce Tasty", "quantity": 1000, "size": null }]
      2. "ajoute deux pain reg" 
         -> [{ "product": "Pain Reg", "quantity": 2, "size": null }]
      3. "pertes 10 viande 10 1" 
         -> [{ "product": "10:1", "quantity": 10, "size": null }]
      4. "un coca moyen" 
         -> [{ "product": "Coca-Cola", "quantity": 1, "size": "Moyen" }]
      5. "deux pain royal et 5 grammes de bacon flavor" 
         -> [{ "product": "Pain Royal", "quantity": 2, "size": null }, { "product": "Eclats de Bacon (Flavor)", "quantity": 5, "size": null }]

      RÈGLES CRITIQUES:
      1. QUANTITÉS: 
         - POIDS/VOLUME: "kilo", "kg", "litre", "l" -> x1000. "grammes", "g" -> tel quel.
         - PIÈCES: "pièces", "pc", "tranches" -> tel quel.
         - CHIFFRES ÉCRITS: un=1, deux=2, trois=3, quatre=4, cinq=5, six=6, sept=7, huit=8, neuf=9, dix=10.
      2. TAILLES OBLIGATOIRES: Si "Frites" ou "Coca" sans taille -> NE PAS inclure.
      3. AMBIGUÏTÉS: "CBO" seul -> "Poulet CBO".
      4. CONCENTRÉS: "Concentré orange" -> "Concentré Jus d'orange". "Concentré Oasis" -> "Concentré Oasis".

      MAPPING PHONÉTIQUE:
       VIANDES (CRITIQUE - ratios souvent mal transcrits par la voix):
       - "10 pour 1", "dix pour un", "10 1", "dix un", "10:1", "dis pour un", "10 un", "dix 1", "101" -> "10:1"
       - "4 pour 1", "quatre pour un", "4 1", "quatre un", "4:1", "quatre 1", "4 un", "41" -> "4:1"
       - "3 pour 1", "trois pour un", "3 1", "trois un", "3:1", "trois 1", "3 un", "31" -> "3:1"
       - "oignons royale", "oignon royal", "oignon" -> "Oignons royal"
       - "oignons règ", "oignon reg", "reg", "règ" -> "Oignons reg"
       - "gouda", "goudas", "fromage gouda" -> "Gouda"
      - "bacon", "bacons", "bacon court", "tranche bacon" -> "Bacon standard"
      - "pain royal", "pains royal" -> "Pain Royal"
      - "pain reg", "pain règle", "reg", "règ" -> "Pain Reg"
      - "galette", "grande galette", "tortilla", "petite galette" -> "Grand Tortilla" ou "Petit Tortilla"
      - "jus d'orange", "concentré orange" -> "Concentré Jus d'orange"
      - "ice tea", "concentré té" -> "Concentré Ice Tea"
      - "croissant", "croissants" -> "Croissant"
      - "pain au chocolat", "chocolatines" -> "Pain au Chocolat"
      - "donuts", "beignet" -> "Donut sucré"
      - "donut chocolat", "beignet choco" -> "Donut choco-noisette"
      - "macaron", "macarons" -> "Macaron Chocolat" (par défaut ou préciser saveur)
      - "mcpops", "pops" -> "McPops Lotus" (par défaut ou préciser saveur)
      - "lait", "brique", "brique de lait" -> "Lait demi-écrémé"
      - "salade d'été", "salade ete" -> "Salade d'été"
      - "kit caesar", "kit césar", "kit cesar" -> "Kit Caesar"
      - "cookie choconuts", "cookie natio" -> "Cookie Fourré Choconuts"

      VERBES ET MOTS À IGNORER COMPLETEMENT:
      - "Ajoute", "Mets", "Enregistre", "Un", "Une", "Des", "Le", "La", "Les", "En", "Perte", "En pertes", "Pertes", "de", "du", "d'", "et", "aussi", "viande"

      Réponds UNIQUEMENT avec un tableau JSON.
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

