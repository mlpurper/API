/**
 * MODEL — Order
 */

const { store, generateId } = require("../data/store");

const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const VALID_PAYMENT_METHODS = ["credit_card", "debit_card", "pix", "boleto"];
const IMMUTABLE_STATUSES = ["delivered", "cancelled"];

class OrderModel {
  static validate(data) {
    const errors = [];

    if (!data.customerId) errors.push("Campo obrigatório: customerId");
    if (!data.paymentMethod) errors.push("Campo obrigatório: paymentMethod");
    if (!Array.isArray(data.items) || data.items.length === 0) {
      errors.push("O pedido deve conter pelo menos um item.");
    }

    if (data.paymentMethod && !VALID_PAYMENT_METHODS.includes(data.paymentMethod)) {
      errors.push(`Método de pagamento inválido. Use: ${VALID_PAYMENT_METHODS.join(", ")}`);
    }

    return errors;
  }

  static findAll({ page = 1, limit = 10, customerId, status, paymentMethod, fromDate, toDate } = {}) {
    let result = [...store.orders];

    if (customerId) result = result.filter((o) => o.customerId === customerId);
    if (status) result = result.filter((o) => o.status === status);
    if (paymentMethod) result = result.filter((o) => o.paymentMethod === paymentMethod);
    if (fromDate) result = result.filter((o) => new Date(o.createdAt) >= new Date(fromDate));
    if (toDate) result = result.filter((o) => new Date(o.createdAt) <= new Date(toDate));

    const total = result.length;
    const start = (page - 1) * limit;
    const data = result.slice(start, start + limit);

    return { data, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
  }

  static findById(id) {
    return store.orders.find((o) => o.id === id) || null;
  }

  // Returns order enriched with customer data and full product details per item
  static findByIdEnriched(id) {
    const order = store.orders.find((o) => o.id === id);
    if (!order) return null;

    const customer = store.customers.find((c) => c.id === order.customerId) || null;
    const items = order.items.map((item) => ({
      ...item,
      product: store.products.find((p) => p.id === item.productId) || null,
    }));

    return { ...order, customer, items };
  }

  static create(data) {
    // Validate customer exists
    const customer = store.customers.find((c) => c.id === data.customerId);
    if (!customer) return { error: "customer_not_found" };

    // Validate and price items
    const items = [];
    for (const item of data.items) {
      const product = store.products.find((p) => p.id === item.productId);
      if (!product) return { error: "product_not_found", productId: item.productId };
      if (!product.active) return { error: "product_inactive", productId: item.productId };
      if (product.stock < item.quantity) return { error: "insufficient_stock", productId: item.productId };

      items.push({ productId: item.productId, quantity: item.quantity, unitPrice: product.price });
    }

    // Deduct stock
    for (const item of items) {
      const idx = store.products.findIndex((p) => p.id === item.productId);
      store.products[idx].stock -= item.quantity;
    }

    const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const now = new Date().toISOString();

    const order = {
      id: generateId("o"),
      customerId: data.customerId,
      paymentMethod: data.paymentMethod,
      items,
      total: Number(total.toFixed(2)),
      status: "pending",
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    };

    store.orders.push(order);
    return { order };
  }

  static update(id, data) {
    const idx = store.orders.findIndex((o) => o.id === id);
    if (idx === -1) return { error: "not_found" };

    const order = store.orders[idx];
    if (IMMUTABLE_STATUSES.includes(order.status)) {
      return { error: "immutable_status", status: order.status };
    }

    if (data.status && !VALID_STATUSES.includes(data.status)) {
      return { error: "invalid_status" };
    }

    const patch = {};
    if (data.status) patch.status = data.status;
    if (data.notes !== undefined) patch.notes = data.notes;

    store.orders[idx] = { ...order, ...patch, updatedAt: new Date().toISOString() };
    return { order: store.orders[idx] };
  }

  static delete(id) {
    const idx = store.orders.findIndex((o) => o.id === id);
    if (idx === -1) return { error: "not_found" };

    const order = store.orders[idx];
    if (!["pending", "cancelled"].includes(order.status)) {
      return { error: "status_not_allowed", status: order.status };
    }

    store.orders.splice(idx, 1);
    return { deleted: true };
  }

  static getSummary() {
    const orders = store.orders;
    const totalOrders = orders.length;
    const totalRevenue = Number(orders.reduce((sum, o) => sum + o.total, 0).toFixed(2));
    const avgOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

    const byStatus = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    for (const o of orders) {
      if (byStatus[o.status] !== undefined) byStatus[o.status]++;
    }

    return { totalOrders, totalRevenue, avgOrderValue, byStatus };
  }
}

module.exports = OrderModel;
