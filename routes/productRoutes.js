import express from "express";
import * as productController from "../controllers/productController.js";

const router = express.Router();

// ── Read ──────────────────────────────────────────────────────────────────────
router.get("/", productController.getProducts);          // GET /api/products?type=vide|complet
router.get("/inventory", productController.getInventory); // GET /api/products/inventory?month=YYYY-MM

// ── Write ─────────────────────────────────────────────────────────────────────
router.post("/", productController.createProduct);        // POST /api/products
router.patch("/:id", productController.updateProduct);    // PATCH /api/products/:id
router.delete("/:id", productController.deleteProduct);   // DELETE /api/products/:id

export default router;
