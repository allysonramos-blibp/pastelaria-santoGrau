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

                    if (pathOnly === '/api/users') {
            if (req.method === 'GET') {
              return res.end(JSON.stringify(serverDb.getUsers()));
            }
            if (req.method === 'POST') {
              const body = await readBody();
              const { name, username, password, role } = body;
              if (!name || !username) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Nome e usuário são obrigatórios.' }));
              }
              const cleanUsername = username.trim().toLowerCase();
              const existing = serverDb.getUsers().find((u) => u.username.toLowerCase() === cleanUsername);
              if (existing) {
                res.statusCode = 409;
                return res.end(JSON.stringify({ error: 'Este nome de usuário já está em uso.' }));
              }
              const newUser = {
                id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                name: name.trim(),
                username: cleanUsername,
                password: password || '123',
                role: role || 'GERENTE',
                createdAt: new Date().toISOString(),
              };
              const saved = serverDb.saveUser(newUser);
              res.statusCode = 201;
              return res.end(JSON.stringify(saved));
            }
          }

          if (pathOnly.startsWith('/api/users/') && req.method === 'DELETE') {
            const id = pathOnly.split('/')[3];
            const ok = serverDb.deleteUser(id);
            return res.end(JSON.stringify({ success: ok }));
          }

          if (pathOnly === '/api/auth/login' && req.method === 'POST') {
            const body = await readBody();
            const { username, password } = body;
            const user = serverDb.getUserByCredentials(username, password);
            if (!user) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: 'Usuário ou senha incorretos.' }));
            }
            const token = `jwt-${Buffer.from(JSON.stringify({ sub: user.username, role: user.role, time: Date.now() })).toString('base64')}`;
            return res.end(JSON.stringify({ success: true, token, user }));
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
