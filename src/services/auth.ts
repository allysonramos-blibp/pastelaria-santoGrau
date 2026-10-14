export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'DONO' | 'GERENTE';
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  expiresAt: number;
}

const AUTH_STORAGE_KEY = 'pastelaria_auth_session';

// Encode a realistic JWT token with Header, Payload and Signature
function createMockJwtToken(user: AuthUser): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(
    JSON.stringify({
      sub: user.username,
      id: user.id,
      name: user.name,
      role: user.role,
      iat: now,
      exp: now + 60 * 60 * 24 * 7, // 7 days expiration
      iss: 'pastelaria-santo-grau',
    })
  );
  const signature = btoa('verified_signature_pastelaria_secret_2026');
  return `${header}.${payload}.${signature}`;
}

export const authService = {
  // Check if owner is currently authenticated
  isAuthenticated(): boolean {
    const session = this.getSession();
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      this.logout();
      return false;
    }
    return true;
  },

  getSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getCurrentUser(): AuthUser | null {
    const session = this.getSession();
    return session ? session.user : null;
  },

  getAuthToken(): string | null {
    const session = this.getSession();
    return session ? session.token : null;
  },

  // Login handler
  async login(username: string, password: string): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Tenta autenticar na API Spring Boot se configurada
    try {
      let baseUrl = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL;
      const apiConfigRaw = localStorage.getItem('pastelaria_api_config');
      if (apiConfigRaw) {
        const parsed = JSON.parse(apiConfigRaw);
        if (parsed.useBackend && parsed.baseUrl) {
          baseUrl = parsed.baseUrl;
        }
      }

      if (baseUrl) {
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ username: cleanUser, password: cleanPass }),
        });

        if (res.ok) {
          const data = await res.json();
          const user: AuthUser = {
            id: data.user?.id || 'usr-admin-01',
            username: data.user?.username || cleanUser,
            name: data.user?.name || 'Dono da Pastelaria',
            role: data.user?.role || 'ADMIN',
          };
          const session: AuthSession = {
            token: data.token,
            user,
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
          };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
          return { success: true, user };
        }
      }
    } catch {
      // Backend inacessivel ou em modo offline, prossegue com validacao local
    }

    // Pequeno delay para simulacao suave em modo local
    await new Promise((r) => setTimeout(r, 300));

    // Credenciais padrao do Dono / Gerente
    if ((cleanUser === 'admin' || cleanUser === 'dona' || cleanUser === 'gerente') && (cleanPass === 'admin' || cleanPass === '123456' || cleanPass === 'pastelaria123')) {
      const user: AuthUser = {
        id: 'usr-admin-01',
        username: cleanUser,
        name: cleanUser === 'dona' ? 'Dona da Pastelaria' : 'Administrador Santo Grau',
        role: 'ADMIN',
      };

      const token = createMockJwtToken(user);
      const session: AuthSession = {
        token,
        user,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 dias
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return { success: true, user };
    }

    return {
      success: false,
      message: 'Usuário ou senha incorretos. Dica: use usuário "admin" e senha "admin".',
    };
  },

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};
