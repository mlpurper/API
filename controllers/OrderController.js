/**
 * CONTROLLER — Order
 */

const Order = require("../models/Order");

const OrderController = {
  // GET /orders
  index(req, res) {
    const { page, limit, customerId, status, paymentMethod, fromDate, toDate } = req.query;
    const result = Order.findAll({ page, limit, customerId, status, paymentMethod, fromDate, toDate });
    return res.status(200).json({ success: true, ...result });
  },

  // GET /orders/summary
  summary(_req, res) {
    const data = Order.getSummary();
    return res.status(200).json({ success: true, data });
  },

  // GET /orders/:id
  show(req, res) {
    const order = Order.findByIdEnriched(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Pedido não encontrado." });
    return res.status(200).json({ success: true, data: order });
  },

  // POST /orders
  create(req, res) {
    const errors = Order.validate(req.body);
    if (errors.length) return res.status(422).json({ success: false, message: "Validação falhou.", errors });

    const result = Order.create(req.body);

    if (result.error === "customer_not_found") {
      return res.status(404).json({ success: false, message: "Cliente não encontrado." });
    }
    if (result.error === "product_not_found") {
      return res.status(404).json({ success: false, message: `Produto não encontrado: ${result.productId}` });
    }
    if (result.error === "product_inactive") {
      return res.status(422).json({ success: false, message: `Produto inativo: ${result.productId}` });
    }
    if (result.error === "insufficient_stock") {
      return res.status(422).json({ success: false, message: `Estoque insuficiente para: ${result.productId}` });
    }

    return res.status(201).json({ success: true, data: result.order });
  },

  // PATCH /orders/:id
  update(req, res) {
    const result = Order.update(req.params.id, req.body);

    if (result.error === "not_found") {
      return res.status(404).json({ success: false, message: "Pedido não encontrado." });
    }
    if (result.error === "immutable_status") {
      return res.status(422).json({ success: false, message: `Pedidos com status '${result.status}' são imutáveis.` });
    }
    if (result.error === "invalid_status") {
      return res.status(422).json({ success: false, message: "Status inválido." });
    }

    return res.status(200).json({ success: true, data: result.order });
  },

  // DELETE /orders/:id
  destroy(req, res) {
    const result = Order.delete(req.params.id);

    if (result.error === "not_found") {
      return res.status(404).json({ success: false, message: "Pedido não encontrado." });
    }
    if (result.error === "status_not_allowed") {
      return res.status(422).json({ success: false, message: `Não é possível remover pedidos com status '${result.status}'.` });
    }

    return res.status(200).json({ success: true, message: "Pedido removido com sucesso." });
  },
};

module.exports = OrderController;
