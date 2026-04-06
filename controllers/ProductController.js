/**
 * CONTROLLER — Product
 */

const Product = require("../models/Product");

const ProductController = {
  // GET /products
  index(req, res) {
    const { page, limit, search, category, active, minPrice, maxPrice } = req.query;
    const result = Product.findAll({ page, limit, search, category, active, minPrice, maxPrice });
    return res.status(200).json({ success: true, ...result });
  },

  // GET /products/stats
  stats(_req, res) {
    const data = Product.getStats();
    return res.status(200).json({ success: true, data });
  },

  // GET /products/:id
  show(req, res) {
    const product = Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Produto não encontrado." });
    return res.status(200).json({ success: true, data: product });
  },

  // POST /products
  create(req, res) {
    const errors = Product.validate(req.body);
    if (errors.length) return res.status(422).json({ success: false, message: "Validação falhou.", errors });

    if (Product.findBySku(req.body.sku)) {
      return res.status(409).json({ success: false, message: "SKU já cadastrado." });
    }

    const product = Product.create(req.body);
    return res.status(201).json({ success: true, data: product });
  },

  // PATCH /products/:id
  update(req, res) {
    const errors = Product.validate(req.body, true);
    if (errors.length) return res.status(422).json({ success: false, message: "Validação falhou.", errors });

    const product = Product.update(req.params.id, req.body);
    if (!product) return res.status(404).json({ success: false, message: "Produto não encontrado." });
    return res.status(200).json({ success: true, data: product });
  },

  // DELETE /products/:id
  destroy(req, res) {
    const deleted = Product.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Produto não encontrado." });
    return res.status(200).json({ success: true, message: "Produto removido com sucesso." });
  },
};

module.exports = ProductController;
