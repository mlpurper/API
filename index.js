/**
 * ROUTES — All resource routes
 */

const express = require("express");
const CustomerController = require("../controllers/CustomerController");
const ProductController = require("../controllers/ProductController");
const OrderController = require("../controllers/OrderController");

const router = express.Router();

// ── Customers ────────────────────────────────────────────────
// GET    /customers              → list (paginated, filterable)
// POST   /customers              → create
// GET    /customers/:id          → show
// PATCH  /customers/:id          → update
// DELETE /customers/:id          → delete
// GET    /customers/:id/summary  → order summary for customer

router.get("/customers", CustomerController.index);
router.post("/customers", CustomerController.create);
router.get("/customers/:id", CustomerController.show);
router.patch("/customers/:id", CustomerController.update);
router.delete("/customers/:id", CustomerController.destroy);
router.get("/customers/:id/summary", CustomerController.orderSummary);

// ── Products ─────────────────────────────────────────────────
router.get("/products", ProductController.index);
router.post("/products", ProductController.create);
router.get("/products/stats", ProductController.stats);   // before /:id to avoid param conflict
router.get("/products/:id", ProductController.show);
router.patch("/products/:id", ProductController.update);
router.delete("/products/:id", ProductController.destroy);

// ── Orders ───────────────────────────────────────────────────
router.get("/orders", OrderController.index);
router.post("/orders", OrderController.create);
router.get("/orders/summary", OrderController.summary);
router.get("/orders/:id", OrderController.show);
router.patch("/orders/:id", OrderController.update);
router.delete("/orders/:id", OrderController.destroy);

module.exports = router;
