import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { serverDb, createAuthToken, verifyAuthToken } from './server-db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distDir = path.join(__dirname, 'dist');

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 1. Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'UP', service: 'Pastelaria Santo Grau API', time: new Date().toISOString() });
});

// 2. Full Multi-Device Sync Bundle
app.get('/api/sync', (_req, res) => {
  res.json(serverDb.getSyncBundle());
});

// 3. Reset Demo Data
app.post('/api/reset', (_req, res) => {
  const bundle = serverDb.resetDemoData();
  res.json({ success: true, bundle });
});

// 4. Products API
app.get('/api/products', (_req, res) => {
  res.json(serverDb.getProducts());
});

app.post('/api/products', (req, res) => {
  const product = req.body;
  if (!product || !product.id || !product.name) {
    return res.status(400).json({ error: 'Produto inválido' });
  }
  const saved = serverDb.saveProduct(product);
  res.json(saved);
});

app.put('/api/products/:id', (req, res) => {
  const product = { ...req.body, id: req.params.id };
  const saved = serverDb.saveProduct(product);
  res.json(saved);
});

app.post('/api/products/bulk', (req, res) => {
  const list = Array.isArray(req.body) ? req.body : req.body?.items || [];
  const replaceAll = Boolean(req.body?.replaceAll || req.body?.replace || req.query?.replace === 'true');
  const saved = serverDb.saveProductsBulk(list, replaceAll);
  res.json({ success: true, count: saved.length, products: saved, replaced: replaceAll });
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const ok = serverDb.deleteProduct(id);
  res.json({ success: ok, deletedId: id });
});

app.patch('/api/products/:id/availability', (req, res) => {
  const { id } = req.params;
  const { available } = req.body;
  const ok = serverDb.updateAvailability(id, !!available);
  res.json({ success: ok });
});

app.get('/api/deleted-products', (_req, res) => {
  res.json({ deletedProductIds: serverDb.getDeletedProductIds() });
});

// 5. Extras API
app.get('/api/extras', (_req, res) => {
  res.json(serverDb.getExtras());
});

app.post('/api/extras', (req, res) => {
  const saved = serverDb.saveExtra(req.body);
  res.json(saved);
});

app.delete('/api/extras/:id', (req, res) => {
  const ok = serverDb.deleteExtra(req.params.id);
  res.json({ success: ok });
});

// 6. Store Settings API
app.get('/api/settings', (_req, res) => {
  res.json(serverDb.getSettings());
});

app.put('/api/settings', (req, res) => {
  const saved = serverDb.saveSettings(req.body);
  res.json(saved);
});

app.post('/api/settings', (req, res) => {
  const saved = serverDb.saveSettings(req.body);
  res.json(saved);
});

// 7. Orders API
app.get('/api/orders', (_req, res) => {
  res.json(serverDb.getOrders());
});

app.post('/api/orders', (req, res) => {
  const order = req.body;
  if (!order || !order.id) {
    return res.status(400).json({ error: 'Pedido inválido' });
  }
  const saved = serverDb.createOrder(order);
  res.json(saved);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const ok = serverDb.updateOrderStatus(id, status);
  res.json({ success: ok });
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const updated = serverDb.updateOrder(id, req.body);
  res.json({ success: !!updated, order: updated });
});

// 8. Users & Authentication API
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = serverDb.getUserByCredentials(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Usuário ou senha incorretos. Verifique os dados informados.' });
  }
  const token = createAuthToken(user);
  res.json({ success: true, token, user });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const user = verifyAuthToken(authHeader);
  if (!user) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }
  res.json({ success: true, user });
});

app.get('/api/users', (_req, res) => {
  res.json(serverDb.getUsers());
});

app.post('/api/users', (req, res) => {
  const { id, name, username, password, role } = req.body;
  if (!name || !username) {
    return res.status(400).json({ error: 'Nome e usuário são obrigatórios.' });
  }
  const saved = serverDb.saveUser({
    id: id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    username: username.trim().toLowerCase(),
    password: password || '123',
    role: role || 'GERENTE',
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(saved);
});

app.put('/api/users/:id', (req, res) => {
  const updated = serverDb.updateUser(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }
  res.json(updated);
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const ok = serverDb.deleteUser(id);
  res.json({ success: ok });
});

// Static frontend serving
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.get('*', (_req, res) => {
    res.send('<h1>Pastelaria Santo Grau</h1><p>Frontend em desenvolvimento ou execute "npm run build".</p>');
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
