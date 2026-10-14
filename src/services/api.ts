import { MenuItem, ExtraOption, Order, StoreSettings, OrderStatus } from '../types';
import { authService } from './auth';

export interface ApiConfig {
  baseUrl: string;
  useBackend: boolean;
}

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:8080/api',
  useBackend: false,
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

export function getApiConfig(): ApiConfig {
  const envUrl = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL;
  const saved = localStorage.getItem('pastelaria_api_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // If environment variable is present and saved config was default localhost, prefer envUrl
      if (envUrl && (!parsed.baseUrl || parsed.baseUrl.includes('localhost'))) {
        return {
          baseUrl: envUrl,
          useBackend: true,
        };
      }
      return parsed;
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

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latency = Date.now() - startTime;
    if (response.ok) {
      return {
        success: true,
        message: `Conectado com sucesso ao Spring Boot (${response.status} OK)`,
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
      return { success: false, message: 'Tempo limite esgotado (timeout de 4s). O Spring Boot está rodando?' };
    }
    return {
      success: false,
      message: `Não foi possível conectar em ${baseUrl} (Verifique se o Spring Boot está iniciado e com @CrossOrigin configurado)`,
      latencyMs: latency,
    };
  }
}

// Java Spring Boot REST API Client
export const api = {
  // Products / Menu Items
  async getProducts(fallback: MenuItem[]): Promise<MenuItem[]> {
    const config = getApiConfig();
    if (!config.useBackend) return fallback;
    try {
      const res = await fetch(`${config.baseUrl}/products`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Spring Boot inacessível, usando dados locais:', e);
    }
    return fallback;
  },

  async saveProduct(product: MenuItem): Promise<MenuItem> {
    const config = getApiConfig();
    if (!config.useBackend) return product;
    try {
      const method = product.id.startsWith('item-') ? 'POST' : 'PUT';
      const url = method === 'POST' ? `${config.baseUrl}/products` : `${config.baseUrl}/products/${product.id}`;
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(product),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Erro ao salvar no Spring Boot:', e);
    }
    return product;
  },

  async deleteProduct(productId: string): Promise<boolean> {
    const config = getApiConfig();
    if (!config.useBackend) return true;
    try {
      const res = await fetch(`${config.baseUrl}/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async updateAvailability(productId: string, available: boolean): Promise<boolean> {
    const config = getApiConfig();
    if (!config.useBackend) return true;
    try {
      const res = await fetch(`${config.baseUrl}/products/${productId}/availability`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ available }),
      });
      if (res.ok) return true;
    } catch (e) {
      return false;
    }
    return false;
  },

  // Orders
  async getOrders(fallback: Order[]): Promise<Order[]> {
    const config = getApiConfig();
    if (!config.useBackend) return fallback;
    try {
      const res = await fetch(`${config.baseUrl}/orders`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Spring Boot inacessível, usando dados locais:', e);
    }
    return fallback;
  },

  async createOrder(order: Order): Promise<Order> {
    const config = getApiConfig();
    if (!config.useBackend) return order;
    try {
      // Cliente cria pedido sem precisar de autenticação
      const res = await fetch(`${config.baseUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Erro ao enviar pedido para o Spring Boot:', e);
    }
    return order;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    const config = getApiConfig();
    if (!config.useBackend) return true;
    try {
      const res = await fetch(`${config.baseUrl}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },
};
