/**
 * MODEL — Customer
 * Responsible for data shape, validation rules, and business logic.
 */

const { store, generateId } = require("../data/store");

const REQUIRED_FIELDS = ["name", "email"];

class CustomerModel {
  static validate(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
      for (const field of REQUIRED_FIELDS) {
        if (!data[field]) errors.push(`Campo obrigatório: ${field}`);
      }
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("E-mail inválido.");
    }

    if (data.phone && !/^\+?\d[\d\s\-()]{7,}$/.test(data.phone)) {
      errors.push("Telefone inválido.");
    }

    return errors;
  }

  static findAll({ page = 1, limit = 10, search, city, state } = {}) {
    let result = [...store.customers];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      );
    }

    if (city) result = result.filter((c) => c.address?.city?.toLowerCase() === city.toLowerCase());
    if (state) result = result.filter((c) => c.address?.state?.toUpperCase() === state.toUpperCase());

    const total = result.length;
    const start = (page - 1) * limit;
    const data = result.slice(start, start + limit);

    return { data, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
  }

  static findById(id) {
    return store.customers.find((c) => c.id === id) || null;
  }

  static findByEmail(email) {
    return store.customers.find((c) => c.email === email) || null;
  }

  static create(data) {
    const now = new Date().toISOString();
    const customer = {
      id: generateId("c"),
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      address: data.address || null,
      createdAt: now,
      updatedAt: now,
    };
    store.customers.push(customer);
    return customer;
  }

  static update(id, data) {
    const idx = store.customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const updated = {
      ...store.customers[idx],
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.address && { address: { ...store.customers[idx].address, ...data.address } }),
      updatedAt: new Date().toISOString(),
    };

    store.customers[idx] = updated;
    return updated;
  }

  static delete(id) {
    const idx = store.customers.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    store.customers.splice(idx, 1);
    return true;
  }

  static getOrderSummary(id) {
    const orders = store.orders.filter((o) => o.customerId === id);
    const total = orders.reduce((sum, o) => sum + o.total, 0);
    return {
      customerId: id,
      totalOrders: orders.length,
      totalSpent: Number(total.toFixed(2)),
      statuses: orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}

module.exports = CustomerModel;
