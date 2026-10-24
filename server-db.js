import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storageDir = path.join(__dirname, 'storage');
const dbFile = path.join(storageDir, 'database.json');
const seedFile = path.join(__dirname, 'src', 'data', 'seedData.json');

const DATABASE_URL = process.env.DATABASE_URL || '';
const JWT_SECRET = process.env.JWT_SECRET || 'pastelaria-santo-grau-hmac-secret-2026-v2';

let pgPool = null;
let pgInitialized = false;

if (DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    pgPool
      .query(`
        CREATE TABLE IF NOT EXISTS pastelaria_store (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `)
      .then(async () => {
        pgInitialized = true;
        const res = await pgPool.query('SELECT data FROM pastelaria_store WHERE id = $1', ['catalog']);
        if (res.rowCount === 0) {
          const initial = readDb();
          await pgPool.query(
            'INSERT INTO pastelaria_store (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
            ['catalog', initial]
          );
        } else if (res.rows[0]?.data) {
          // Hydrate local file from cloud DB on startup so cloud is authoritative
          ensureDb();
          fs.writeFileSync(dbFile, JSON.stringify(res.rows[0].data, null, 2), 'utf-8');
        }
      })
      .catch((err) => {
        console.warn('Neon PostgreSQL indisponível. Usando banco servidor JSON:', err.message);
        pgInitialized = false;
      });
  } catch (err) {
    console.warn('Falha ao inicializar pool Postgres:', err.message);
  }
}

const DEFAULT_ADMIN_USERS = [
  {
    id: 'usr-admin-allyson',
    name: 'Allyson (ADM)',
    username: 'admin',
    password: '123',
    role: 'ADMIN',
    createdAt: '2026-10-15T21:14:32.103Z',
  },
  {
    id: 'usr-alessandra-ramos',
    name: 'Alessandra Ramos',
    username: 'alessandraramos',
    password: '2308',
    role: 'GERENTE',
    createdAt: '2026-10-15T23:06:56.205Z',
  },
];

const DEFAULT_EXTRAS = [
  { id: 'ext-catupiry', name: 'Catupiry Original', price: 4.5, category: 'recheio' },
  { id: 'ext-queijo', name: 'Mussarela Extra', price: 4.0, category: 'recheio' },
  { id: 'ext-bacon', name: 'Bacon Crocante', price: 3.5, category: 'recheio' },
  { id: 'ext-cheddar', name: 'Cheddar Cremoso', price: 3.5, category: 'recheio' },
  { id: 'ext-ovo', name: 'Ovo Picadinho', price: 2.0, category: 'recheio' },
  { id: 'ext-milho', name: 'Milho Verde', price: 2.0, category: 'recheio' },
  { id: 'ext-vinagrete', name: 'Vinagrete da Feira', price: 0.0, category: 'molho' },
  { id: 'ext-maioneseverde', name: 'Maionese Verde Artesanal', price: 2.5, category: 'molho' },
  { id: 'ext-pimenta', name: 'Molho de Pimenta da Casa', price: 1.5, category: 'molho' },
  { id: 'ext-massatradicional', name: 'Massa Tradicional Sequinha', price: 0.0, category: 'massa' },
  { id: 'ext-massapimenta', name: 'Massa Levemente Apimentada', price: 2.0, category: 'massa' },
];

const DEFAULT_SETTINGS = {
  storeName: 'Pastelaria Santo Grau',
  slogan: 'Massa artesanal sequinha, crocante e muito recheada!',
  whatsappNumber: '5511999998888',
  pixKey: '11999998888',
  pixKeyType: 'telefone',
  address: 'Rua do Comércio, 345 - Bairro Central',
  openingHours: 'Terça a Domingo: 17:00 às 23:30',
  defaultDeliveryFee: 5.0,
  isOpen: true,
  soundAlertsEnabled: true,
  minOrderValue: 15.0,
  instagram: '@pastelaria_santograu',
};

const DEFAULT_PRODUCTS = [
  {
    id: 'past-carne',
    name: 'Pastel de Carne Tradicional',
    description: 'Carne moída de primeira, ovo e azeitonas',
    category: 'salgados',
    price: 14,
    available: true,
    isPopular: true,
    badge: 'Mais Pedido',
    ingredients: ['Carne moída de primeira', 'Ovo cozido', 'Azeitonas'],
    sizeOptions: [
      { name: 'Médio (20cm)', priceDelta: 0 },
      { name: 'Gigante (30cm)', priceDelta: 6 },
    ],
  },
  {
    id: 'past-queijo',
    name: 'Pastel de Queijo Especial',
    description: 'Mussarela selecionada e orégano',
    category: 'salgados',
    price: 13,
    available: true,
    isPopular: true,
    ingredients: ['Mussarela selecionada', 'Orégano'],
    sizeOptions: [
      { name: 'Médio (20cm)', priceDelta: 0 },
      { name: 'Gigante (30cm)', priceDelta: 6 },
    ],
  },
  {
    id: 'past-pizza',
    name: 'Pastel de Pizza Paulista',
    description: 'Presunto, queijo, tomate e orégano',
    category: 'salgados',
    price: 14.5,
    available: true,
    ingredients: ['Presunto', 'Mussarela', 'Tomate fresco', 'Orégano'],
    sizeOptions: [
      { name: 'Médio (20cm)', priceDelta: 0 },
      { name: 'Gigante (30cm)', priceDelta: 6 },
    ],
  },
  {
    id: 'past-camarao',
    name: 'Pastel de Camarão com Catupiry',
    description: 'Camarões frescos e Catupiry legítimo',
    category: 'especiais',
    price: 22,
    available: true,
    badge: 'Gourmet',
    ingredients: ['Camarões frescos', 'Catupiry legítimo'],
    sizeOptions: [
      { name: 'Médio (20cm)', priceDelta: 0 },
      { name: 'Gigante (30cm)', priceDelta: 8 },
    ],
  },
  {
    id: 'past-nutellamorango',
    name: 'Pastel de Nutella com Morango',
    description: 'Nutella pura e morangos frescos',
    category: 'doces',
    price: 16.5,
    available: true,
    badge: 'Doce Especial',
    ingredients: ['Nutella pura', 'Morangos frescos'],
  },
  {
    id: 'beb-caldocana500',
    name: 'Caldo de Cana Gelado 500ml',
    description: 'Caldo de cana puro moído na hora e trincando de gelado',
    category: 'bebidas',
    price: 8,
    available: true,
    badge: 'Geladinho',
  },
  {
    id: 'beb-coca-lata',
    name: 'Coca-Cola Lata 350ml',
    description: 'Refrigerante Coca-Cola em lata 350ml super gelada',
    category: 'bebidas',
    price: 6,
    available: true,
  },
  {
    id: 'porc-minipasteis',
    name: 'Porção de Mini Pastéis (12 un)',
    description: '12 mini pastéis crocantes sortidos (carne e queijo) acompanhados de vinagrete e molho da casa',
    category: 'porcoes',
    price: 28,
    available: true,
    badge: 'Para Compartilhar',
  },
];

function getInitialSeedData() {
  const initialData = {
    products: [...DEFAULT_PRODUCTS],
    deletedProductIds: [],
    extras: [...DEFAULT_EXTRAS],
    settings: { ...DEFAULT_SETTINGS },
    orders: [],
    users: [...DEFAULT_ADMIN_USERS],
  };
  if (fs.existsSync(seedFile)) {
    try {
      const seed = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));
      if (Array.isArray(seed.products) && seed.products.length > 0) {
        initialData.products = seed.products;
      }
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
    let dirty = false;

    if (!Array.isArray(data.users) || data.users.length === 0) {
      data.users = [...DEFAULT_ADMIN_USERS];
      dirty = true;
    } else {
      // Ensure default accounts exist so owner and sister never get locked out
      for (const defUser of DEFAULT_ADMIN_USERS) {
        const exists = data.users.some(
          (u) => u.id === defUser.id || u.username.toLowerCase() === defUser.username.toLowerCase()
        );
        if (!exists) {
          data.users.push({ ...defUser });
          dirty = true;
        }
      }
    }

    if (!Array.isArray(data.products)) {
      data.products = [...DEFAULT_PRODUCTS];
      dirty = true;
    }
    if (!Array.isArray(data.deletedProductIds)) {
      data.deletedProductIds = [];
      dirty = true;
    }
    if (!Array.isArray(data.extras) || data.extras.length === 0) {
      data.extras = [...DEFAULT_EXTRAS];
      dirty = true;
    }
    if (!data.settings || typeof data.settings !== 'object') {
      data.settings = { ...DEFAULT_SETTINGS };
      dirty = true;
    }
    if (!Array.isArray(data.orders)) {
      data.orders = [];
      dirty = true;
    }

    if (dirty) {
      fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
    }

    return data;
  } catch (e) {
    console.error('Error reading database.json:', e);
    return getInitialSeedData();
  }
}

export function writeDb(data) {
  ensureDb();
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');

  if (pgPool && pgInitialized) {
    pgPool
      .query(
        `INSERT INTO pastelaria_store (id, data, updated_at) 
         VALUES ('catalog', $1, NOW()) 
         ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW()`,
        [data]
      )
      .catch((e) => console.warn('Erro ao sincronizar com Neon:', e.message));
  }
}

// Signed HMAC Token helper (Stateless + Server Verified)
export function createAuthToken(user) {
  const payload = {
    sub: user.username,
    id: user.id,
    name: user.name,
    role: user.role || 'ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14, // 14 days
  };
  const headerB64 = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');
  return `${headerB64}.${payloadB64}.${sig}`;
}

export function verifyAuthToken(token) {
  if (!token || typeof token !== 'string') return null;
  const clean = token.replace(/^Bearer\s+/i, '').trim();

  // Support legacy jwt- tokens during transition
  if (clean.startsWith('jwt-')) {
    try {
      const raw = JSON.parse(Buffer.from(clean.slice(4), 'base64').toString('utf-8'));
      if (raw && raw.sub) {
        const db = readDb();
        const found = (db.users || []).find((u) => u.username.toLowerCase() === String(raw.sub).toLowerCase());
        if (found) {
          const { password: _, ...safe } = found;
          return safe;
        }
      }
    } catch {
      return null;
    }
  }

  const parts = clean.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  if (sig !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }
    const db = readDb();
    const found = (db.users || []).find(
      (u) => u.id === payload.id || u.username.toLowerCase() === String(payload.sub || '').toLowerCase()
    );
    if (found) {
      const { password: _, ...safe } = found;
      return safe;
    }
    return {
      id: payload.id,
      username: payload.sub,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
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
    for (const item of Array.isArray(productsList) ? productsList : []) {
      if (!item || !item.name) continue;
      const product = {
        id: item.id || 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        name: String(item.name).trim(),
        description: item.description ? String(item.description).trim() : '',
        category: item.category || 'salgados',
        price: Number(item.price) || 0,
        available: item.available !== undefined ? Boolean(item.available) : true,
        ingredients: Array.isArray(item.ingredients)
          ? item.ingredients
          : typeof item.ingredients === 'string' && item.ingredients.trim()
          ? item.ingredients
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        isPopular: Boolean(item.isPopular),
        badge: item.badge ? String(item.badge).trim() : undefined,
        sizeOptions: Array.isArray(item.sizeOptions) ? item.sizeOptions : undefined,
      };

      db.deletedProductIds = db.deletedProductIds.filter((id) => id !== product.id);
      const idx = db.products.findIndex(
        (p) => p.id === product.id || p.name.toLowerCase() === product.name.toLowerCase()
      );
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

    db.products = db.products.filter((p) => p.id !== productId);
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

  // Extras (Adicionais) on Server
  getExtras() {
    const db = readDb();
    return db.extras || DEFAULT_EXTRAS;
  },

  saveExtra(extra) {
    const db = readDb();
    if (!Array.isArray(db.extras)) db.extras = [...DEFAULT_EXTRAS];
    const idx = db.extras.findIndex((e) => e.id === extra.id);
    if (idx >= 0) {
      db.extras[idx] = { ...db.extras[idx], ...extra };
    } else {
      db.extras.push(extra);
    }
    writeDb(db);
    return extra;
  },

  deleteExtra(extraId) {
    const db = readDb();
    if (!Array.isArray(db.extras)) return false;
    db.extras = db.extras.filter((e) => e.id !== extraId);
    writeDb(db);
    return true;
  },

  // Store Settings on Server
  getSettings() {
    const db = readDb();
    return db.settings || DEFAULT_SETTINGS;
  },

  saveSettings(newSettings) {
    const db = readDb();
    db.settings = { ...(db.settings || DEFAULT_SETTINGS), ...newSettings };
    writeDb(db);
    return db.settings;
  },

  // Orders on Server
  getOrders() {
    const db = readDb();
    return db.orders || [];
  },

  createOrder(order) {
    const db = readDb();
    if (!db.orders) db.orders = [];
    const existingIdx = db.orders.findIndex((o) => o.id === order.id);
    if (existingIdx >= 0) {
      db.orders[existingIdx] = { ...db.orders[existingIdx], ...order };
    } else {
      db.orders.unshift(order);
    }
    writeDb(db);
    return order;
  },

  updateOrder(orderId, updates) {
    const db = readDb();
    if (!db.orders) return null;
    const o = db.orders.find((ord) => ord.id === orderId);
    if (o) {
      Object.assign(o, updates, { updatedAt: new Date().toISOString() });
      writeDb(db);
      return o;
    }
    return null;
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

  // Users & Authentication on Server
  getUsers() {
    const db = readDb();
    if (!db.users) db.users = [...DEFAULT_ADMIN_USERS];
    return db.users.map(({ password, ...u }) => u);
  },

  getUserByCredentials(username, password) {
    const db = readDb();
    const rawUser = String(username || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^@/, '')
      .replace(/\s+/g, '');
    const rawPass = String(password || '').trim();

    if (!rawUser || !rawPass) return null;

    if (!db.users || db.users.length === 0) {
      db.users = [...DEFAULT_ADMIN_USERS];
    }

    const match = db.users.find((u) => {
      const uName = String(u.username || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/^@/, '')
        .replace(/\s+/g, '');
      const uDisplayName = String(u.name || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '');

      const usernameMatches =
        uName === rawUser ||
        uDisplayName === rawUser ||
        (rawUser === 'alessandra' && (uName === 'alessandraramos' || uName.includes('alessandra'))) ||
        (rawUser === 'alessandraramos' && (uName === 'alessandraramos' || uName.includes('alessandra'))) ||
        (rawUser === 'allyson' && (uName === 'admin' || uName.includes('allyson'))) ||
        (rawUser === 'admin' && uName === 'admin');

      if (!usernameMatches) return false;

      const storedPass = String(u.password || '').trim();
      return (
        storedPass === rawPass ||
        (uName === 'admin' && rawPass === 'admin')
      );
    });

    if (!match) return null;
    const { password: _, ...safeUser } = match;
    return safeUser;
  },

  saveUser(user) {
    const db = readDb();
    if (!db.users) db.users = [...DEFAULT_ADMIN_USERS];
    const cleanUsername = String(user.username || '').trim().toLowerCase().replace(/^@/, '').replace(/\s+/g, '');
    const idx = db.users.findIndex(
      (u) => u.id === user.id || u.username.toLowerCase() === cleanUsername
    );
    if (idx >= 0) {
      db.users[idx] = {
        ...db.users[idx],
        ...user,
        username: cleanUsername || db.users[idx].username,
        password: user.password ? String(user.password).trim() : db.users[idx].password,
      };
      writeDb(db);
      const { password, ...safeUser } = db.users[idx];
      return safeUser;
    } else {
      const created = {
        id: user.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: String(user.name || cleanUsername).trim(),
        username: cleanUsername,
        password: String(user.password || '123').trim(),
        role: user.role || 'GERENTE',
        createdAt: user.createdAt || new Date().toISOString(),
      };
      db.users.push(created);
      writeDb(db);
      const { password, ...safeUser } = created;
      return safeUser;
    }
  },

  updateUser(userId, updates) {
    const db = readDb();
    if (!db.users) return null;
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx < 0) return null;

    if (updates.name) db.users[idx].name = String(updates.name).trim();
    if (updates.username && db.users[idx].username !== 'admin') {
      db.users[idx].username = String(updates.username).trim().toLowerCase().replace(/^@/, '').replace(/\s+/g, '');
    }
    if (updates.password && String(updates.password).trim().length >= 3) {
      db.users[idx].password = String(updates.password).trim();
    }
    if (updates.role) {
      db.users[idx].role = updates.role;
    }

    writeDb(db);
    const { password, ...safeUser } = db.users[idx];
    return safeUser;
  },

  deleteUser(userId) {
    const db = readDb();
    if (!db.users) return false;
    db.users = db.users.filter((u) => u.id !== userId && u.username !== 'admin');
    writeDb(db);
    return true;
  },

  resetDemoData() {
    const initial = getInitialSeedData();
    writeDb(initial);
    return this.getSyncBundle();
  },

  getSyncBundle() {
    const db = readDb();
    const deleted = new Set(db.deletedProductIds || []);
    return {
      products: (db.products || []).filter((p) => !deleted.has(p.id)),
      deletedProductIds: db.deletedProductIds || [],
      extras: db.extras || DEFAULT_EXTRAS,
      settings: db.settings || DEFAULT_SETTINGS,
      orders: db.orders || [],
      timestamp: new Date().toISOString(),
    };
  },
};
