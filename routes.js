/**
 * ROUTES — All resource routes
 */

const express = require("express");
const CustomerController = require("./controllers/CustomerController");
const ProductController = require("./controllers/ProductController");
const OrderController = require("./controllers/OrderController");

const router = express.Router();

// ── Customers ────────────────────────────────────────────────
router.get("/customers", CustomerController.index);
router.post("/customers", CustomerController.create);
router.get("/customers/:id/summary", CustomerController.orderSummary); // before /:id
router.get("/customers/:id", CustomerController.show);
router.patch("/customers/:id", CustomerController.update);
router.delete("/customers/:id", CustomerController.destroy);

// ── Products ─────────────────────────────────────────────────
router.get("/products", ProductController.index);
router.post("/products", ProductController.create);
router.get("/products/stats", ProductController.stats); // before /:id
router.get("/products/:id", ProductController.show);
router.patch("/products/:id", ProductController.update);
router.delete("/products/:id", ProductController.destroy);

// ── Orders ───────────────────────────────────────────────────
router.get("/orders", OrderController.index);
router.post("/orders", OrderController.create);
router.get("/orders/summary", OrderController.summary); // before /:id
router.get("/orders/:id", OrderController.show);
router.patch("/orders/:id", OrderController.update);
router.delete("/orders/:id", OrderController.destroy);

module.exports = router;
