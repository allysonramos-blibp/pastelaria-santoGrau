import { MenuItem, ExtraOption, StoreSettings, Order, OrderStatus } from '../types';
import { authService } from './auth';

export interface SyncBundle {
  products: MenuItem[];
  deletedIds: string[];
  extras: ExtraOption[];
  settings: StoreSettings;
  orders: Order[];
}

function getAuthHeaders(): HeadersInit {
  const token = authService.getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function testBackendConnection(
  baseUrl: string = '/api'
): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const startTime = Date.now();
  try {
    const cleanUrl = baseUrl.replace(/\/$/, '');
    const targetUrl = cleanUrl.endsWith('/api') ? `${cleanUrl}/health` : `${cleanUrl}/api/health`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const latency = Date.now() - startTime;
    if (response.ok) {
      return {
        success: true,
        message: `Servidor online (${response.status} OK)`,
        latencyMs: latency,
      };
    }
    return {
      success: false,
      message: `Servidor respondeu com status ${response.status}`,
      latencyMs: latency,
    };
  } catch {
    return {
      success: false,
      message: 'Falha ao comunicar com o servidor.',
    };
  }
}

export const api = {
  // Full authoritative server sync
  async syncCatalog(): Promise<SyncBundle | null> {
    try {
      const res = await fetch('/api/sync', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        products: Array.isArray(data.products) ? data.products : [],
        deletedIds: Array.isArray(data.deletedProductIds) ? data.deletedProductIds : [],
        extras: Array.isArray(data.extras) ? data.extras : [],
        settings: data.settings || null,
        orders: Array.isArray(data.orders) ? data.orders : [],
      };
    } catch {
      return null;
    }
  },

  async resetServerDemoData(): Promise<SyncBundle | null> {
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data?.bundle) {
        return {
          products: data.bundle.products || [],
          deletedIds: data.bundle.deletedProductIds || [],
          extras: data.bundle.extras || [],
          settings: data.bundle.settings || null,
          orders: data.bundle.orders || [],
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  // Products
  async getProducts(): Promise<MenuItem[] | null> {
    try {
      const res = await fetch('/api/products', {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveProduct(product: MenuItem): Promise<MenuItem> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product),
      });
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('pastelaria_sync');
        ch.postMessage({ type: 'SYNC_NOW' });
        ch.close();
      }
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Erro ao salvar produto no servidor:', e);
    }
    return product;
  },

  async saveProductsBulk(products: MenuItem[], replaceAll: boolean = false): Promise<MenuItem[]> {
    try {
      const res = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items: products, replaceAll }),
      });
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('pastelaria_sync');
        ch.postMessage({ type: 'SYNC_NOW' });
        ch.close();
      }
      if (res.ok) {
        const data = await res.json();
        return data.products || products;
      }
    } catch (e) {
      console.warn('Erro ao salvar produtos em lote no servidor:', e);
    }
    return products;
  },

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('pastelaria_sync');
        ch.postMessage({ type: 'SYNC_NOW' });
        ch.close();
      }
      return res.ok;
    } catch (e) {
      console.warn('Erro ao deletar produto no servidor:', e);
      return false;
    }
  },

  async updateAvailability(productId: string, available: boolean): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}/availability`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ available }),
      });
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('pastelaria_sync');
        ch.postMessage({ type: 'SYNC_NOW' });
        ch.close();
      }
      return res.ok;
    } catch {
      return false;
    }
  },

  // Extras
  async saveExtra(extra: ExtraOption): Promise<ExtraOption> {
    try {
      const res = await fetch('/api/extras', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(extra),
      });
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('pastelaria_sync');
        ch.postMessage({ type: 'SYNC_NOW' });
        ch.close();
      }
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Erro ao salvar adicional:', e);
    }
    return extra;
  },

  async deleteExtra(extraId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/extras/${encodeURIComponent(extraId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('pastelaria_sync');
        ch.postMessage({ type: 'SYNC_NOW' });
        ch.close();
      }
      return res.ok;
    } catch {
      return false;
    }
  },

  // Store Settings
  async saveSettings(settings: StoreSettings): Promise<StoreSettings> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('pastelaria_sync');
        ch.postMessage({ type: 'SYNC_NOW' });
        ch.close();
      }
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Erro ao salvar configurações:', e);
    }
    return settings;
  },

  // Orders
  async getOrders(): Promise<Order[] | null> {
    try {
      const res = await fetch('/api/orders', {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async createOrder(order: Order): Promise<Order> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(order),
      });
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('pastelaria_sync');
        ch.postMessage({ type: 'SYNC_NOW' });
        ch.close();
      }
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Erro ao enviar pedido:', e);
    }
    return order;
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('pastelaria_sync');
        ch.postMessage({ type: 'SYNC_NOW' });
        ch.close();
      }
      return res.ok;
    } catch {
      return false;
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('pastelaria_sync');
        ch.postMessage({ type: 'SYNC_NOW' });
        ch.close();
      }
      return res.ok;
    } catch {
      return false;
    }
  },
};
