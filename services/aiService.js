import { generateText } from "ai";
import { openaiClient } from "../config/openai.js";

const SYSTEM_PROMPT = `Tu es un assistant McDonald's. Extrais les pertes d'un transcript vocal français et retourne UNIQUEMENT un tableau JSON.
Format: [{"product":"nom exact","quantity":nombre,"size":"Grand"|"Moyen"|"Petit"|"x4"|"x6"|"x9"|"x20"|null}]

PRODUITS OFFICIELS:

VIANDES (size:null): 10:1, 4:1, 3:1

PROTÉINES (size:null): Poulet wrap, Poulet CBO, Poulet McChicken, Poulet BM, Filet, Nuggets, Nuggets Veggie, Palet Veggie, Apple Pie

SANDWICHS (size:null): Big Mac, Big Mac Bacon, Royal Cheese, Royal Deluxe, Royal Bacon, Big Tasty 1 steak, Big Tasty 2 steaks, 280 Original, 280 Raclette, Big Arch, Double Cheese Bacon, Hamburger, Cheeseburger, Double Cheeseburger, McChicken, McCrispy, McCrispy Bacon, McCrispy Smoky Ranch Bacon, CBO, CBO Smoky Ranch, CBO Raclette, McVeggie, Filet-O-Fish, McFish, McFish Mayo, Fish New York, Double Fish New York, Croque McDo, Egg & Cheese McMuffin, Egg & Bacon McMuffin, Bacon & Beef McMuffin, P'tit Chicken, P'tit Wrap Ranch, McWrap New York, McWrap Smoky Ranch, McWrap Veggie, Boite de Nuggets, Boite de Nuggets Veggie

ACCOMPAGNEMENTS:
- Frites (taille P/M/G obligatoire), Potatoes (M/G obligatoire), Wavy Fries (M/G obligatoire)
- Sans taille: Frites Cheddar, Frites Bacon, Potatoes Cheddar, Potatoes Bacon

BOISSONS (taille P/M/G obligatoire): Coca-Cola, Coca-Cola Sans-Sucres, Coca-Cola Cherry Zéro, Fanta Sans-Sucres, Sprite Sans-Sucres, Oasis Tropical, Green Apple Sprite, Minute Maid Orange, Lipton Ice Tea
Sans taille: Eau Plate, Eau Pétillante, P'tit Nectar Pomme, Capri-Sun Tropical

MCCAFÉ:
- Taille M/G obligatoire: Café Allongé, Café Allongé Décaféiné, Thé Earl Grey, Thé Menthe, Thé Citron, Café Latté, Café Latte Gourmand, Café Latte Glacé, Café Latte Glacé Gourmand, Cappuccino, Chocolat Chaud, Chocolat Chaud Gourmand, Americano Glacé
- Sans taille: Espresso, Double Espresso, Ristretto, Espresso Décaféiné, Thé Glacé Pêche, Délifrapp Cookie, Délifrapp Vanille, Smoothie Mangue Papaye, Smoothie Banane Fraise
- Produits vides (size:null): Café Segafredo, Lait demi-écrémé, Croissant, Pain au Chocolat, Donut sucré, Donut choco-noisette, Macaron Chocolat, Macaron Framboise, Macaron Vanille, Macaron Caramel, McPops Lotus, McPops Fruits Rouges, McPops Choconut, Muffin Chocolat, Muffin Caramel, Cookie Fourré Choconuts, Cookie Framboise, Cookie Caramel Pécan, Cinnamon Roll, Cheesecake Choconuts M&M'S

INGRÉDIENTS BOISSONS (size:null): Concentré Jus d'orange, Concentré Ice Tea, Concentré Ice Tea Zéro, Concentré Green Ice Tea, Concentré Green Ice Tea Zéro, Concentré Oasis, Concentré Cherry Coke, Concentré Coca, CO2

CUISINE (size:null):
- Pains: Pain Mac, Pain Reg, Pain Royal, Pain 280, Pain CBO, Pain Big Arch, Pain McCrispy, Petit Tortilla, Grand Tortilla, Pains McMuffin
- Garnitures: Bacon standard, Eclats de Bacon, Cheddar Orange, Cheddar Blanc, Gouda, Salade Mac, Salade Batavia, Salade d'été, Oignons royal, Oignons reg, Oignons frits, Tomates charnues, Cornichons, Kit Caesar
- Sauces: Sauce Mac, Sauce Chicken, Sauce Filet, Sauce Tasty, Sauce CBO, Sauce Deluxe, Sauce Big Arch, Sauce Black Pepper Mayo, Sauce McExtreme, Sauce Ranch, Sauce Cheddar, Moutarde vrac, Ketchup Bib
- Autre: Oeufs coquilles, Beurre Liquide, Jambon Croque, Patty de Fromage, Jalapenos, Sauce Habanero, Sauce Smoky, Fromage Raclette, Sauce Raclette

RÈGLES CRITIQUES:
1. QUANTITÉS: "kilo/kg/litre/l" → x1000 | "grammes/g" → tel quel | un=1, deux=2, trois=3, quatre=4, cinq=5, six=6, sept=7, huit=8, neuf=9, dix=10
2. TAILLES OBLIGATOIRES: Si Frites/Potatoes/Wavy/boisson/café long/thé/cappuccino/chocolat chaud sans taille → NE PAS inclure
3. PRODUITS INCONNUS: Ignorer complètement tout produit absent de la liste
4. BOITE NUGGETS: "boite 6", "box 6", "nuggets box" → Boite de Nuggets, size: "x6"

MAPPING PHONÉTIQUE (CRITIQUE):
- "dix un", "dix pour un", "10 1", "101", "dis un" → "10:1"
- "quatre un", "4 pour 1", "41", "quatre pour un" → "4:1"
- "trois un", "3 pour 1", "31", "trois pour un" → "3:1"
- "mac", "big mac" → "Big Mac"
- "royal", "royal cheese" → "Royal Cheese"
- "cheese" seul → "Cheeseburger"
- "cbo" seul → "Poulet CBO"
- "nugs", "nuggets" seul → "Nuggets"
- "salade mac", "salade maque" → "Salade Mac"
- "oignon frit", "oignons frit", "oignon frits" → "Oignons frits"
- "oignons royale", "oignon royal" → "Oignons royal"
- "oignons règ", "oignon reg" → "Oignons reg"
- "pain reg", "pain règle" → "Pain Reg"
- "pain royal", "pains royal" → "Pain Royal"
- "galette", "tortilla" → "Grand Tortilla" (défaut) ou "Petit Tortilla"
- "bacon", "tranche bacon" → "Bacon standard"
- "concentré orange", "jus d'orange" → "Concentré Jus d'orange"
- "ice tea", "concentré thé" → "Concentré Ice Tea"
- "lait", "brique de lait" → "Lait demi-écrémé"
- "croissant" → "Croissant"
- "pain au chocolat", "chocolatine" → "Pain au Chocolat"
- "donut", "beignet" → "Donut sucré"
- "donut chocolat", "beignet choco" → "Donut choco-noisette"
- "macaron" seul → "Macaron Chocolat"
- "pops", "mcpops" seul → "McPops Lotus"
- "kit caesar", "kit césar" → "Kit Caesar"
- "wavy", "wavi", "ouavy" → "Wavy Fries"
- "pota", "potato" → "Potatoes"
- "smoky", "smouki" → garder dans le nom du produit
- "crispy", "crispie" → garder dans le nom du produit

MOTS À IGNORER: "ajoute", "mets", "enregistre", "perte", "pertes", "en perte", "perte de", "une perte de", "en pertes", "de", "du", "et", "aussi", "viande"

EXEMPLES:
"dix viande dix un" → [{"product":"10:1","quantity":10,"size":null}]
"1 kg salade mac en perte" → [{"product":"Salade Mac","quantity":1000,"size":null}]
"300g oignons frits" → [{"product":"Oignons frits","quantity":300,"size":null}]
"deux coca moyen et 5 pain royal" → [{"product":"Coca-Cola","quantity":2,"size":"Moyen"},{"product":"Pain Royal","quantity":5,"size":null}]
"boite 6 nuggets" → [{"product":"Boite de Nuggets","quantity":1,"size":"x6"}]
"3 litre sauce tasty" → [{"product":"Sauce Tasty","quantity":3000,"size":null}]`;

export const parseTranscript = async (transcript) => {
  // Garde-fou : transcript trop court (moins de 2 mots)
  if (!transcript || transcript.trim().split(/\s+/).length < 2) {
    console.log("Transcript trop court, bypass API.");
    return [];
  }

  try {
    console.log("--- AI Parsing ---", transcript);

    const { text } = await generateText({
      model: openaiClient("gpt-4o-mini"),
      system: SYSTEM_PROMPT,
      prompt: `Transcript: "${transcript}"`,
    });

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    console.log("Parsed:", JSON.stringify(parsed));
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("AI Error:", err.message);
    return [];
  }
};