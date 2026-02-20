import express from "express";
import * as lossController from "../controllers/lossController.js";

const router = express.Router();

// Définition des "chemins" pour les pertes
router.get("/", lossController.getLosses);           // Voir les pertes
router.post("/", lossController.createLossAI);       // Ajouter via la voix
router.post("/manual", lossController.createLossManual); // Ajouter via les boutons
router.patch("/:id", lossController.updateLoss);     // Modifier une quantité
router.delete("/", lossController.resetLosses);      // Tout effacer

export default router;
