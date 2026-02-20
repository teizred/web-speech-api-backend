import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb } from "./config/db.js";
import lossRoutes from "./routes/lossRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";

// On charge les variables d'environnement (.env)
dotenv.config();

const app = express();

// On autorise le frontend à appeler l'API
app.use(cors());
// On permet à Express de lire le JSON dans les requêtes
app.use(express.json());

// let's initialize the database (create tables if they don't exist yet)
initDb().catch((err) => console.error("Database initialization failed:", err));


app.use("/api/losses", lossRoutes);
app.use("/api/export", exportRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});