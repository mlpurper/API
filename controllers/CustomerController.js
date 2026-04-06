/**
 * CONTROLLER — Customer
 */

const Customer = require("../models/Customer");

const CustomerController = {
  // GET /customers
  index(req, res) {
    const { page, limit, search, city, state } = req.query;
    const result = Customer.findAll({ page, limit, search, city, state });
    return res.status(200).json({ success: true, ...result });
  },

  // GET /customers/:id
  show(req, res) {
    const customer = Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Cliente não encontrado." });
    return res.status(200).json({ success: true, data: customer });
  },

  // POST /customers
  create(req, res) {
    const errors = Customer.validate(req.body);
    if (errors.length) return res.status(422).json({ success: false, message: "Validação falhou.", errors });

    if (Customer.findByEmail(req.body.email)) {
      return res.status(409).json({ success: false, message: "E-mail já cadastrado." });
    }

    const customer = Customer.create(req.body);
    return res.status(201).json({ success: true, data: customer });
  },

  // PATCH /customers/:id
  update(req, res) {
    const errors = Customer.validate(req.body, true);
    if (errors.length) return res.status(422).json({ success: false, message: "Validação falhou.", errors });

    if (req.body.email) {
      const existing = Customer.findByEmail(req.body.email);
      if (existing && existing.id !== req.params.id) {
        return res.status(409).json({ success: false, message: "E-mail já cadastrado para outro cliente." });
      }
    }

    const customer = Customer.update(req.params.id, req.body);
    if (!customer) return res.status(404).json({ success: false, message: "Cliente não encontrado." });
    return res.status(200).json({ success: true, data: customer });
  },

  // DELETE /customers/:id
  destroy(req, res) {
    const deleted = Customer.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Cliente não encontrado." });
    return res.status(200).json({ success: true, message: "Cliente removido com sucesso." });
  },

  // GET /customers/:id/summary
  orderSummary(req, res) {
    const customer = Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Cliente não encontrado." });
    const summary = Customer.getOrderSummary(req.params.id);
    return res.status(200).json({ success: true, data: summary });
  },
};

module.exports = CustomerController;
