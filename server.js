import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { serverDb } from './server-db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distDir = path.join(__dirname, 'dist');

// Enable JSON body parsing and CORS
app.use(express.json());

// CORS headers for local/cross-origin development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'UP', service: 'Pastelaria Santo Grau API', time: new Date().toISOString() });
});

// Products API
app.get('/api/products', (_req, res) => {
  const products = serverDb.getProducts();
  res.json(products);
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

// Orders API
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

// Full Multi-Device Sync Bundle
app.get('/api/sync', (_req, res) => {
  res.json(serverDb.getSyncBundle());
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
