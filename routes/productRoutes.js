import express from "express";
import * as productController from "../controllers/productController.js";

const router = express.Router();

// Route pour récupérer tous les produits
router.get("/", productController.getProducts);

export default router;
