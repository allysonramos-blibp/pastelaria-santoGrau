import { serverDb } from './server-db.js';

export function viteApiPlugin() {
  return {
    name: 'vite-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api')) {
          return next();
        }

        // Helper to read request body
        const readBody = () =>
          new Promise((resolve) => {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch {
                resolve({});
              }
            });
          });

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          return res.end();
        }

        const pathOnly = url.split('?')[0];

        try {
          if (pathOnly === '/api/health' && req.method === 'GET') {
            return res.end(JSON.stringify({ status: 'UP', service: 'Pastelaria Santo Grau Dev API' }));
          }

          if (pathOnly === '/api/products') {
            if (req.method === 'GET') {
              return res.end(JSON.stringify(serverDb.getProducts()));
            }
            if (req.method === 'POST') {
              const body = await readBody();
              const saved = serverDb.saveProduct(body);
              return res.end(JSON.stringify(saved));
            }
          }

          if (pathOnly.startsWith('/api/products/')) {
            const parts = pathOnly.split('/');
            const id = parts[3];

            if (req.method === 'DELETE') {
              const ok = serverDb.deleteProduct(id);
              return res.end(JSON.stringify({ success: ok, deletedId: id }));
            }
            if (req.method === 'PUT') {
              const body = await readBody();
              const saved = serverDb.saveProduct({ ...body, id });
              return res.end(JSON.stringify(saved));
            }
            if (req.method === 'PATCH' && parts[4] === 'availability') {
              const body = await readBody();
              const ok = serverDb.updateAvailability(id, !!body.available);
              return res.end(JSON.stringify({ success: ok }));
            }
          }

          if (pathOnly === '/api/deleted-products' && req.method === 'GET') {
            return res.end(JSON.stringify({ deletedProductIds: serverDb.getDeletedProductIds() }));
          }

          if (pathOnly === '/api/orders') {
            if (req.method === 'GET') {
              return res.end(JSON.stringify(serverDb.getOrders()));
            }
            if (req.method === 'POST') {
              const body = await readBody();
              const saved = serverDb.createOrder(body);
              return res.end(JSON.stringify(saved));
            }
          }

          if (pathOnly.startsWith('/api/orders/') && parts(pathOnly)[4] === 'status' && req.method === 'PATCH') {
            const id = pathOnly.split('/')[3];
            const body = await readBody();
            const ok = serverDb.updateOrderStatus(id, body.status);
            return res.end(JSON.stringify({ success: ok }));
          }

          if (pathOnly === '/api/sync' && req.method === 'GET') {
            return res.end(JSON.stringify(serverDb.getSyncBundle()));
          }

          return next();
        } catch (err) {
          console.error('API Error in dev server:', err);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Erro interno na API' }));
        }
      });
    },
  };
}

function parts(p) {
  return p.split('/');
}
