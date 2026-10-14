import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storageDir = path.join(__dirname, 'storage');
const dbFile = path.join(storageDir, 'database.json');
const seedFile = path.join(__dirname, 'src', 'data', 'seedData.json');

function ensureDb() {
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  if (!fs.existsSync(dbFile)) {
    let initialData = { products: [], deletedProductIds: [], orders: [] };
    if (fs.existsSync(seedFile)) {
      try {
        const seed = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));
        initialData.products = seed.products || [];
        initialData.deletedProductIds = seed.deletedProductIds || [];
      } catch (e) {
        console.error('Error reading seed file:', e);
      }
    }
    fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export function readDb() {
  ensureDb();
  try {
    const raw = fs.readFileSync(dbFile, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading database.json:', e);
    return { products: [], deletedProductIds: [], orders: [] };
  }
}

export function writeDb(data) {
  ensureDb();
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
}

export const serverDb = {
  getProducts() {
    const db = readDb();
    const deleted = new Set(db.deletedProductIds || []);
    return (db.products || []).filter((p) => !deleted.has(p.id));
  },

  getDeletedProductIds() {
    const db = readDb();
    return db.deletedProductIds || [];
  },

  saveProduct(product) {
    const db = readDb();
    if (!db.products) db.products = [];
    if (!db.deletedProductIds) db.deletedProductIds = [];

    // If previously marked deleted, remove from deleted list
    db.deletedProductIds = db.deletedProductIds.filter((id) => id !== product.id);

    const idx = db.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      db.products[idx] = { ...db.products[idx], ...product };
    } else {
      db.products.push(product);
    }
    writeDb(db);
    return product;
  },

  deleteProduct(productId) {
    const db = readDb();
    if (!db.products) db.products = [];
    if (!db.deletedProductIds) db.deletedProductIds = [];

    // Remove from products
    db.products = db.products.filter((p) => p.id !== productId);

    // Record in deletedProductIds so ALL clients prune this product
    if (!db.deletedProductIds.includes(productId)) {
      db.deletedProductIds.push(productId);
    }
    writeDb(db);
    return true;
  },

  updateAvailability(productId, available) {
    const db = readDb();
    if (!db.products) return false;
    const p = db.products.find((item) => item.id === productId);
    if (p) {
      p.available = available;
      writeDb(db);
      return true;
    }
    return false;
  },

  getOrders() {
    const db = readDb();
    return db.orders || [];
  },

  createOrder(order) {
    const db = readDb();
    if (!db.orders) db.orders = [];
    db.orders.unshift(order);
    writeDb(db);
    return order;
  },

  updateOrderStatus(orderId, status) {
    const db = readDb();
    if (!db.orders) return false;
    const o = db.orders.find((ord) => ord.id === orderId);
    if (o) {
      o.status = status;
      o.updatedAt = new Date().toISOString();
      writeDb(db);
      return true;
    }
    return false;
  },

  getSyncBundle() {
    const db = readDb();
    const deleted = new Set(db.deletedProductIds || []);
    return {
      products: (db.products || []).filter((p) => !deleted.has(p.id)),
      deletedProductIds: db.deletedProductIds || [],
      orders: db.orders || [],
      timestamp: Date.now(),
    };
  },
};
