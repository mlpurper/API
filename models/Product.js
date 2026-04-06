/**
 * MODEL — Product
 */

const { store, generateId } = require("../data/store");

const REQUIRED_FIELDS = ["name", "sku", "price"];
const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

class ProductModel {
  static validate(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
      for (const field of REQUIRED_FIELDS) {
        if (data[field] === undefined || data[field] === null || data[field] === "") {
          errors.push(`Campo obrigatório: ${field}`);
        }
      }
    }

    if (data.price !== undefined && (typeof data.price !== "number" || data.price < 0)) {
      errors.push("Preço deve ser um número maior ou igual a zero.");
    }

    if (data.stock !== undefined && (!Number.isInteger(data.stock) || data.stock < 0)) {
      errors.push("Estoque deve ser um inteiro maior ou igual a zero.");
    }

    return errors;
  }

  static findAll({ page = 1, limit = 10, search, category, active, minPrice, maxPrice } = {}) {
    let result = [...store.products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }

    if (category) result = result.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    if (active !== undefined) {
      const isActive = active === "true" || active === true;
      result = result.filter((p) => p.active === isActive);
    }
    if (minPrice !== undefined) result = result.filter((p) => p.price >= Number(minPrice));
    if (maxPrice !== undefined) result = result.filter((p) => p.price <= Number(maxPrice));

    const total = result.length;
    const start = (page - 1) * limit;
    const data = result.slice(start, start + limit);

    return { data, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
  }

  static findById(id) {
    return store.products.find((p) => p.id === id) || null;
  }

  static findBySku(sku) {
    return store.products.find((p) => p.sku === sku) || null;
  }

  static create(data) {
    const now = new Date().toISOString();
    const product = {
      id: generateId("p"),
      name: data.name,
      sku: data.sku,
      price: data.price,
      category: data.category || "Geral",
      stock: data.stock ?? 0,
      description: data.description || null,
      active: data.active !== undefined ? data.active : true,
      createdAt: now,
      updatedAt: now,
    };
    store.products.push(product);
    return product;
  }

  static update(id, data) {
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const allowed = ["name", "category", "price", "stock", "description", "active"];
    const patch = {};
    for (const key of allowed) {
      if (data[key] !== undefined) patch[key] = data[key];
    }

    store.products[idx] = { ...store.products[idx], ...patch, updatedAt: new Date().toISOString() };
    return store.products[idx];
  }

  static delete(id) {
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    store.products.splice(idx, 1);
    return true;
  }

  static getStats() {
    const products = store.products;
    const total = products.length;
    const active = products.filter((p) => p.active).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
    const avgPrice =
      total > 0
        ? Number((products.reduce((sum, p) => sum + p.price, 0) / total).toFixed(2))
        : 0;

    return { total, active, outOfStock, categories, avgPrice };
  }
}

module.exports = ProductModel;
