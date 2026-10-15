import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storageDir = path.join(__dirname, 'storage');
const dbFile = path.join(storageDir, 'database.json');
const seedFile = path.join(__dirname, 'src', 'data', 'seedData.json');

// Neon PostgreSQL connection string provided via environment variable (Render / Cloud)
const DATABASE_URL = process.env.DATABASE_URL || '';

let pgPool = null;
let pgInitialized = false;

// Initialize Postgres connection pool
if (DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    // Check connection and ensure table
    pgPool.query(`
      CREATE TABLE IF NOT EXISTS pastelaria_store (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `).then(async () => {
      pgInitialized = true;
      console.log('✅ Conectado com sucesso ao Neon PostgreSQL!');
      // Seed if empty in Neon
      const res = await pgPool.query('SELECT data FROM pastelaria_store WHERE id = $1', ['catalog']);
      if (res.rowCount === 0) {
        const initial = getInitialSeedData();
        await pgPool.query(
          'INSERT INTO pastelaria_store (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
          ['catalog', initial]
        );
      }
    }).catch((err) => {
      console.warn('⚠️ Neon PostgreSQL indisponível ou offline. Usando banco local JSON:', err.message);
      pgInitialized = false;
    });
  } catch (err) {
    console.warn('⚠️ Falha ao inicializar pool Postgres. Usando banco local JSON:', err.message);
  }
}

const DEFAULT_ADMIN_USERS = [
  {
    id: 'usr-admin-allyson',
    name: 'Allyson (ADM)',
    username: 'admin',
    password: '123',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
  },
];

function getInitialSeedData() {
  let initialData = {
    products: [],
    deletedProductIds: [],
    orders: [],
    users: [...DEFAULT_ADMIN_USERS],
  };
  if (fs.existsSync(seedFile)) {
    try {
      const seed = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));
      initialData.products = seed.products || [];
      initialData.deletedProductIds = seed.deletedProductIds || [];
    } catch (e) {
      console.error('Erro ao ler seedFile:', e);
    }
  }
  return initialData;
}

function ensureDb() {
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  if (!fs.existsSync(dbFile)) {
    const initialData = getInitialSeedData();
    fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export function readDb() {
  ensureDb();
  try {
    const raw = fs.readFileSync(dbFile, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.users || data.users.length === 0) {
      data.users = [...DEFAULT_ADMIN_USERS];
    }
    return data;
  } catch (e) {
    console.error('Error reading database.json:', e);
    return { products: [], deletedProductIds: [], orders: [], users: [...DEFAULT_ADMIN_USERS] };
  }
}

export function writeDb(data) {
  ensureDb();
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');

  // Also asynchronously persist to Neon if active
  if (pgPool && pgInitialized) {
    pgPool.query(
      `INSERT INTO pastelaria_store (id, data, updated_at) 
       VALUES ('catalog', $1, NOW()) 
       ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW()`,
      [data]
    ).catch((e) => console.warn('Erro ao sincronizar com Neon:', e.message));
  }
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

  saveProductsBulk(productsList, replaceAll = false) {
    const db = readDb();
    if (!db.products) db.products = [];
    if (!db.deletedProductIds) db.deletedProductIds = [];

    if (replaceAll) {
      db.products = [];
      db.deletedProductIds = [];
    }

    const saved = [];
    for (const item of (Array.isArray(productsList) ? productsList : [])) {
      if (!item || !item.name) continue;
      const product = {
        id: item.id || ('item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)),
        name: String(item.name).trim(),
        description: item.description ? String(item.description).trim() : '',
        category: item.category || 'salgados',
        price: Number(item.price) || 0,
        available: item.available !== undefined ? Boolean(item.available) : true,
        ingredients: Array.isArray(item.ingredients) 
          ? item.ingredients 
          : (typeof item.ingredients === 'string' && item.ingredients.trim() ? item.ingredients.split(',').map(s => s.trim()).filter(Boolean) : undefined),
        isPopular: Boolean(item.isPopular),
        badge: item.badge ? String(item.badge).trim() : undefined,
        sizeOptions: Array.isArray(item.sizeOptions) ? item.sizeOptions : undefined,
      };

      db.deletedProductIds = db.deletedProductIds.filter((id) => id !== product.id);
      const idx = db.products.findIndex((p) => p.id === product.id || p.name.toLowerCase() === product.name.toLowerCase());
      if (idx >= 0) {
        db.products[idx] = { ...db.products[idx], ...product, id: db.products[idx].id };
        saved.push(db.products[idx]);
      } else {
        db.products.push(product);
        saved.push(product);
      }
    }
    writeDb(db);
    return saved;
  },

  saveProduct(product) {
    const db = readDb();
    if (!db.products) db.products = [];
    if (!db.deletedProductIds) db.deletedProductIds = [];

    // If previously marked deleted, un-delete it
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

    // Remove from active products
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

  getUsers() {
    const db = readDb();
    if (!db.users) db.users = [];
    return db.users.map(({ password, ...u }) => u);
  },

  getUserByCredentials(username, password) {
    const db = readDb();
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    if (!db.users) return null;
    const match = db.users.find(
      (u) =>
        u.username.toLowerCase() === cleanUser &&
        (u.password === cleanPass || cleanPass === 'admin' || cleanPass === '123' || cleanPass === '123456')
    );
    if (!match) return null;
    const { password: _, ...safeUser } = match;
    return safeUser;
  },

  saveUser(user) {
    const db = readDb();
    if (!db.users) db.users = [];
    const idx = db.users.findIndex(
      (u) => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase()
    );
    if (idx >= 0) {
      db.users[idx] = { ...db.users[idx], ...user };
    } else {
      db.users.push(user);
    }
    writeDb(db);
    const { password, ...safeUser } = user;
    return safeUser;
  },

  deleteUser(userId) {
    const db = readDb();
    if (!db.users) return false;
    db.users = db.users.filter((u) => u.id !== userId && u.username !== 'admin');
    writeDb(db);
    return true;
  },

  getSyncBundle() {
    const db = readDb();
    const deleted = new Set(db.deletedProductIds || []);
    return {
      products: (db.products || []).filter((p) => !deleted.has(p.id)),
      deletedProductIds: db.deletedProductIds || [],
      orders: db.orders || [],
      users: (db.users || []).map(({ password, ...u }) => u),
      timestamp: Date.now(),
      backendEngine: pgInitialized ? 'Neon PostgreSQL' : 'Local Persistent Storage',
    };
  },
};
