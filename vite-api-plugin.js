import { serverDb, createAuthToken, verifyAuthToken } from './server-db.js';

export function viteApiPlugin() {
  return {
    name: 'vite-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api')) {
          return next();
        }

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

        const [pathOnly, queryString = ''] = url.split('?');
        const parts = pathOnly.split('/');

        try {
          // 1. Health Check
          if (pathOnly === '/api/health' && req.method === 'GET') {
            return res.end(
              JSON.stringify({ status: 'UP', service: 'Pastelaria Santo Grau API', time: new Date().toISOString() })
            );
          }

          // 2. Full Server Sync Bundle
          if (pathOnly === '/api/sync' && req.method === 'GET') {
            return res.end(JSON.stringify(serverDb.getSyncBundle()));
          }

          // 3. Reset Demo Data
          if (pathOnly === '/api/reset' && req.method === 'POST') {
            const bundle = serverDb.resetDemoData();
            return res.end(JSON.stringify({ success: true, bundle }));
          }

          // 4. Products API
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

          if (pathOnly === '/api/products/bulk' && req.method === 'POST') {
            const body = await readBody();
            const list = Array.isArray(body) ? body : body?.items || [];
            const replaceAll = Boolean(
              body?.replaceAll || body?.replace || queryString.includes('replace=true')
            );
            const saved = serverDb.saveProductsBulk(list, replaceAll);
            return res.end(
              JSON.stringify({ success: true, count: saved.length, products: saved, replaced: replaceAll })
            );
          }

          if (pathOnly.startsWith('/api/products/')) {
            const id = decodeURIComponent(parts[3] || '');
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

          // 5. Extras (Adicionais) API
          if (pathOnly === '/api/extras') {
            if (req.method === 'GET') {
              return res.end(JSON.stringify(serverDb.getExtras()));
            }
            if (req.method === 'POST') {
              const body = await readBody();
              const saved = serverDb.saveExtra(body);
              return res.end(JSON.stringify(saved));
            }
          }

          if (pathOnly.startsWith('/api/extras/') && req.method === 'DELETE') {
            const id = decodeURIComponent(parts[3] || '');
            const ok = serverDb.deleteExtra(id);
            return res.end(JSON.stringify({ success: ok }));
          }

          // 6. Store Settings API
          if (pathOnly === '/api/settings') {
            if (req.method === 'GET') {
              return res.end(JSON.stringify(serverDb.getSettings()));
            }
            if (req.method === 'PUT' || req.method === 'POST') {
              const body = await readBody();
              const saved = serverDb.saveSettings(body);
              return res.end(JSON.stringify(saved));
            }
          }

          // 7. Orders API
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

          if (pathOnly.startsWith('/api/orders/')) {
            const id = decodeURIComponent(parts[3] || '');
            if (parts[4] === 'status' && req.method === 'PATCH') {
              const body = await readBody();
              const ok = serverDb.updateOrderStatus(id, body.status);
              return res.end(JSON.stringify({ success: ok }));
            }
            if (req.method === 'PUT' || req.method === 'PATCH') {
              const body = await readBody();
              const updated = serverDb.updateOrder(id, body);
              return res.end(JSON.stringify({ success: !!updated, order: updated }));
            }
          }

          // 8. Authentication & Users API
          if (pathOnly === '/api/auth/login' && req.method === 'POST') {
            const body = await readBody();
            const { username, password } = body;
            const user = serverDb.getUserByCredentials(username, password);
            if (!user) {
              res.statusCode = 401;
              return res.end(
                JSON.stringify({
                  error: 'Usuário ou senha incorretos. Verifique os dados informados.',
                })
              );
            }
            const token = createAuthToken(user);
            return res.end(JSON.stringify({ success: true, token, user }));
          }

          if (pathOnly === '/api/auth/me' && req.method === 'GET') {
            const authHeader = req.headers['authorization'] || '';
            const user = verifyAuthToken(authHeader);
            if (!user) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: 'Sessão inválida ou expirada.' }));
            }
            return res.end(JSON.stringify({ success: true, user }));
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
              const saved = serverDb.saveUser({
                id: body.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                name: name.trim(),
                username: username.trim().toLowerCase(),
                password: password || '123',
                role: role || 'GERENTE',
                createdAt: new Date().toISOString(),
              });
              res.statusCode = 201;
              return res.end(JSON.stringify(saved));
            }
          }

          if (pathOnly.startsWith('/api/users/')) {
            const id = decodeURIComponent(parts[3] || '');
            if (req.method === 'PUT' || req.method === 'PATCH') {
              const body = await readBody();
              const updated = serverDb.updateUser(id, body);
              if (!updated) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ error: 'Usuário não encontrado.' }));
              }
              return res.end(JSON.stringify(updated));
            }
            if (req.method === 'DELETE') {
              const ok = serverDb.deleteUser(id);
              return res.end(JSON.stringify({ success: ok }));
            }
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
