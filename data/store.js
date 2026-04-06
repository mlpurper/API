/**
 * DATA STORE — In-memory data store
 * Shared singleton across all models.
 */

let _counter = 0;

const store = {
  customers: [],
  products: [],
  orders: [],
};

function generateId(prefix) {
  return `${prefix}${++_counter}_${Date.now()}`;
}

module.exports = { store, generateId };
