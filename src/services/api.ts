import { MenuItem, Order, OrderStatus } from '../types';
import { authService } from './auth';

export interface ApiConfig {
  baseUrl: string;
  useBackend: boolean;
}

// Default to same-origin /api so PC, Mobile, Dev & Production all share the exact same backend!
const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || '/api',
  useBackend: true,
};

function getAuthHeaders(): HeadersInit {
  const token = authService.getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Local deleted IDs cache for immediate offline + cross-sync guarantee
export function getLocalDeletedIds(): string[] {
  try {
    const raw = localStorage.getItem('pastelaria_deleted_ids');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalDeletedId(productId: string): void {
  try {
    const current = getLocalDeletedIds();
    if (!current.includes(productId)) {
      current.push(productId);
      localStorage.setItem('pastelaria_deleted_ids', JSON.stringify(current));
    }
  } catch (e) {
    console.warn('Erro ao salvar ID deletado localmente:', e);
  }
}

export function getApiConfig(): ApiConfig {
  const envUrl = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL;
  const saved = localStorage.getItem('pastelaria_api_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // If user had previous default localhost:8080 that failed on mobile, upgrade to /api
      if (!parsed.baseUrl || parsed.baseUrl.includes('localhost:8080')) {
        return {
          baseUrl: envUrl || '/api',
          useBackend: true,
        };
      }
      return {
        ...parsed,
        useBackend: true,
      };
    } catch {
      // fallback
    }
  }

  if (envUrl) {
    return {
      baseUrl: envUrl,
      useBackend: true,
    };
  }

  return DEFAULT_CONFIG;
}

export function saveApiConfig(config: ApiConfig): void {
  localStorage.setItem('pastelaria_api_config', JSON.stringify(config));
}

export async function testBackendConnection(baseUrl: string): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const cleanUrl = baseUrl.replace(/\/$/, '');
    const targetUrl = cleanUrl.endsWith('/api') ? `${cleanUrl}/health` : `${cleanUrl}/api/health`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latency = Date.now() - startTime;
    if (response.ok) {
      return {
        success: true,
        message: `Servidor conectado com sucesso (${response.status} OK)`,
        latencyMs: latency,
      };
    } else {
      return {
        success: false,
        message: `Servidor respondeu com status ${response.status}`,
        latencyMs: latency,
      };
    }
  } catch (err: unknown) {
    const latency = Date.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('abort')) {
      return { success: false, message: 'Tempo limite esgotado (timeout de 4s).' };
    }
    return {
      success: false,
      message: `Não foi possível conectar em ${baseUrl}`,
      latencyMs: latency,
    };
  }
}

// Broadcast channel for instantaneous tab-to-tab sync on same device
const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('pastelaria_sync') : null;

export const api = {
  // Full bundle sync
  async syncCatalog(fallbackItems: MenuItem[]): Promise<{ products: MenuItem[]; deletedIds: string[]; orders?: Order[] } | null> {
    const config = getApiConfig();
    try {
      const res = await fetch(`${config.baseUrl}/sync`);
      if (res.ok) {
        const bundle = await res.json();
        const deletedSet = new Set<string>([...(bundle.deletedProductIds || []), ...getLocalDeletedIds()]);
        const cleanedProducts = (bundle.products || []).filter((p: MenuItem) => !deletedSet.has(p.id));
        return {
          products: cleanedProducts,
          deletedIds: Array.from(deletedSet),
          orders: bundle.orders,
        };
      }
    } catch {
      // Fallback to separate endpoints or local
    }

    // Fallback: try /products directly
    try {
      const pRes = await fetch(`${config.baseUrl}/products`);
      if (pRes.ok) {
        const prods: MenuItem[] = await pRes.json();
        const deletedSet = new Set<string>(getLocalDeletedIds());
        return {
          products: prods.filter((p) => !deletedSet.has(p.id)),
          deletedIds: Array.from(deletedSet),
        };
      }
    } catch {
      // Local fallback
    }

    const localDeleted = new Set(getLocalDeletedIds());
    return {
      products: fallbackItems.filter((p) => !localDeleted.has(p.id)),
      deletedIds: Array.from(localDeleted),
    };
  },

  // Products / Menu Items
  async getProducts(fallback: MenuItem[]): Promise<MenuItem[]> {
    const config = getApiConfig();
    const localDeleted = new Set(getLocalDeletedIds());
    try {
      const res = await fetch(`${config.baseUrl}/products`);
      if (res.ok) {
        const data: MenuItem[] = await res.json();
        return data.filter((item) => !localDeleted.has(item.id));
      }
    } catch (e) {
      console.warn('API /products indisponível, usando dados locais:', e);
    }
    return fallback.filter((item) => !localDeleted.has(item.id));
  },

  async saveProduct(product: MenuItem): Promise<MenuItem> {
    const config = getApiConfig();
    try {
      const method = product.id.startsWith('item-') ? 'POST' : 'PUT';
      const url = method === 'POST' ? `${config.baseUrl}/products` : `${config.baseUrl}/products/${product.id}`;
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(product),
      });
      if (res.ok) {
        const saved = await res.json();
        broadcastChannel?.postMessage({ type: 'PRODUCT_SAVED', product: saved });
        return saved;
      }
    } catch (e) {
      console.warn('Erro ao salvar produto na API:', e);
    }
    broadcastChannel?.postMessage({ type: 'PRODUCT_SAVED', product });
    return product;
  },

  async deleteProduct(productId: string): Promise<boolean> {
    // 1. Mark in local deleted cache immediately so it never resurrects
    saveLocalDeletedId(productId);
    broadcastChannel?.postMessage({ type: 'PRODUCT_DELETED', productId });

    const config = getApiConfig();
    try {
      const res = await fetch(`${config.baseUrl}/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.ok;
    } catch (e) {
      console.warn('Erro ao deletar produto na API:', e);
      return false;
    }
  },

  async updateAvailability(productId: string, available: boolean): Promise<boolean> {
    const config = getApiConfig();
    try {
      const res = await fetch(`${config.baseUrl}/products/${productId}/availability`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ available }),
      });
      if (res.ok) {
        broadcastChannel?.postMessage({ type: 'PRODUCT_AVAILABILITY', productId, available });
        return true;
      }
    } catch (e) {
      console.warn('Erro ao atualizar disponibilidade na API:', e);
    }
    broadcastChannel?.postMessage({ type: 'PRODUCT_AVAILABILITY', productId, available });
    return false;
  },

  // Orders
  async getOrders(fallback: Order[]): Promise<Order[]> {
    const config = getApiConfig();
    try {
      const res = await fetch(`${config.baseUrl}/orders`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API /orders indisponível, usando dados locais:', e);
    }
    return fallback;
  },

  async createOrder(order: Order): Promise<Order> {
    const config = getApiConfig();
    try {
      const res = await fetch(`${config.baseUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (res.ok) {
        const saved = await res.json();
        broadcastChannel?.postMessage({ type: 'NEW_ORDER', order: saved });
        return saved;
      }
    } catch (e) {
      console.warn('Erro ao enviar pedido para a API:', e);
    }
    broadcastChannel?.postMessage({ type: 'NEW_ORDER', order });
    return order;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    const config = getApiConfig();
    try {
      const res = await fetch(`${config.baseUrl}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        broadcastChannel?.postMessage({ type: 'ORDER_STATUS_CHANGED', orderId, status });
        return true;
      }
    } catch (e) {
      console.warn('Erro ao atualizar status do pedido:', e);
    }
    broadcastChannel?.postMessage({ type: 'ORDER_STATUS_CHANGED', orderId, status });
    return false;
  },
};
