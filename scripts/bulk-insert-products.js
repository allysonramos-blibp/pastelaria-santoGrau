/**
 * Script utilitário para inserção em lote (bulk insert) de itens no cardápio
 * Pode ser executado via terminal: node scripts/bulk-insert-products.js
 */
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve('storage', 'database.json');

export function insertProducts(newProducts) {
  if (!fs.existsSync(DB_PATH)) {
    console.error('Arquivo de banco não encontrado em:', DB_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(DB_PATH, 'utf8');
  const db = JSON.parse(raw);
  if (!db.products) db.products = [];
  if (!db.deletedProductIds) db.deletedProductIds = [];

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of newProducts) {
    if (!item.name || !item.price) continue;

    const id = item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const product = {
      id,
      name: item.name.trim(),
      description: item.description ? item.description.trim() : '',
      category: item.category || 'salgados',
      price: Number(item.price),
      available: item.available !== undefined ? Boolean(item.available) : true,
      badge: item.badge || undefined,
      ingredients: Array.isArray(item.ingredients)
        ? item.ingredients
        : (typeof item.ingredients === 'string' && item.ingredients ? item.ingredients.split(',').map((s) => s.trim()).filter(Boolean) : undefined),
      sizeOptions: item.sizeOptions || (item.category === 'salgados' || item.category === 'especiais'
        ? [
            { name: 'Médio (20cm)', priceDelta: 0 },
            { name: 'Gigante (30cm)', priceDelta: 6 },
          ]
        : undefined),
    };

    // Remove from deleted list
    db.deletedProductIds = db.deletedProductIds.filter((dId) => dId !== product.id);

    const existingIdx = db.products.findIndex(
      (p) => p.id === product.id || p.name.toLowerCase() === product.name.toLowerCase()
    );

    if (existingIdx >= 0) {
      db.products[existingIdx] = { ...db.products[existingIdx], ...product };
      updatedCount++;
    } else {
      db.products.push(product);
      insertedCount++;
    }
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  console.log(`✅ Concluído! Inseridos: ${insertedCount} novos | Atualizados: ${updatedCount} existentes.`);
  console.log(`Total atual no cardápio: ${db.products.length} itens.`);
  return { insertedCount, updatedCount, total: db.products.length };
}

// Se executado diretamente via terminal
if (process.argv[1] && process.argv[1].endsWith('bulk-insert-products.js')) {
  const jsonArg = process.argv[2];
  if (jsonArg) {
    try {
      const data = JSON.parse(jsonArg);
      insertProducts(Array.isArray(data) ? data : [data]);
    } catch (e) {
      console.error('Erro ao interpretar JSON fornecido:', e.message);
    }
  } else {
    console.log('Uso: node scripts/bulk-insert-products.js \'[{"name": "Pastel de Frango", "price": 14, "category": "salgados"}]\'');
  }
}
