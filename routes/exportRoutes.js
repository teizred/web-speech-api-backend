import express from "express";
import * as exportController from "../controllers/exportController.js";

const router = express.Router();

// Routes pour exporter les données
router.get("/pdf", exportController.exportPdf);    // Télécharger le PDF
router.post("/email", exportController.exportEmail); // Envoyer par mail

export default router;
