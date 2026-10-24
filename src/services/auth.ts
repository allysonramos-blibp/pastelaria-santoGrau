import { UserRole, AppUser } from '../types';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  expiresAt: number;
}

const SESSION_KEY = 'pastelaria_jwt_session_v2';

// Purge legacy localStorage databases so data never stays stuck in browser storage
function purgeLegacyLocalStorage() {
  if (typeof window === 'undefined') return;
  try {
    const legacyKeys = [
      'pastelaria_users_db',
      'pastelaria_auth_session',
      'pastelaria_menu_items',
      'pastelaria_extras',
      'pastelaria_settings',
      'pastelaria_orders',
      'pastelaria_deleted_ids',
      'pastelaria_api_config',
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

purgeLegacyLocalStorage();

let memorySession: AuthSession | null = null;

function readSession(): AuthSession | null {
  if (memorySession) {
    if (Date.now() > memorySession.expiresAt) {
      memorySession = null;
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch {
        // ignore
      }
      return null;
    }
    return memorySession;
  }
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: AuthSession = JSON.parse(raw);
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    memorySession = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession | null) {
  memorySession = session;
  try {
    if (session) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // ignore
  }
}

export const authService = {
  isAuthenticated(): boolean {
    return readSession() !== null;
  },

  getSession(): AuthSession | null {
    return readSession();
  },

  getCurrentUser(): AuthUser | null {
    const s = readSession();
    return s ? s.user : null;
  },

  getAuthToken(): string | null {
    const s = readSession();
    return s ? s.token : null;
  },

  // Verify active token against backend server
  async verifyServerSession(): Promise<AuthUser | null> {
    const token = this.getAuthToken();
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          const current = readSession();
          if (current) {
            writeSession({ ...current, user: data.user });
          }
          return data.user;
        }
      } else if (res.status === 401) {
        this.logout();
        return null;
      }
    } catch {
      // Network hiccup: preserve current memory session
    }
    return this.getCurrentUser();
  },

  // Fetch all team users directly from server database
  async fetchUsersFromServer(): Promise<AppUser[]> {
    const res = await fetch('/api/users', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error('Falha ao buscar usuários do servidor.');
    }
    return await res.json();
  },

  // Create or update a team member on the server (does NOT overwrite current logged-in admin session)
  async createTeamMember(data: {
    name: string;
    username: string;
    password: string;
    role: UserRole;
  }): Promise<{ success: boolean; user?: AppUser; message?: string }> {
    const cleanUser = data.username.trim().toLowerCase().replace(/^@/, '').replace(/\s+/g, '');
    const cleanName = data.name.trim();
    const cleanPass = data.password.trim();

    if (!cleanName) {
      return { success: false, message: 'Por favor, informe o nome completo.' };
    }
    if (!cleanUser) {
      return { success: false, message: 'Por favor, informe um nome de usuário.' };
    }
    if (cleanPass.length < 3) {
      return { success: false, message: 'A senha deve ter no mínimo 3 caracteres.' };
    }

    try {
      const token = this.getAuthToken();
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: cleanName,
          username: cleanUser,
          password: cleanPass,
          role: data.role,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        return { success: false, message: body?.error || 'Erro ao salvar membro no servidor.' };
      }
      return { success: true, user: body };
    } catch {
      return { success: false, message: 'Erro de conexão com o servidor.' };
    }
  },

  // Update an existing team member (password, role, or name) on the server
  async updateTeamMember(
    userId: string,
    updates: { name?: string; username?: string; password?: string; role?: UserRole }
  ): Promise<{ success: boolean; user?: AppUser; message?: string }> {
    try {
      const token = this.getAuthToken();
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      });
      const body = await res.json();
      if (!res.ok) {
        return { success: false, message: body?.error || 'Não foi possível atualizar o usuário.' };
      }
      return { success: true, user: body };
    } catch {
      return { success: false, message: 'Erro de conexão com o servidor.' };
    }
  },

  // Delete a team member from the server
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Strict server-side login (Works from any phone, tablet, or computer)
  async login(
    username: string,
    password: string
  ): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    const cleanUser = username.trim().toLowerCase().replace(/^@/, '').replace(/\s+/g, '');
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      return {
        success: false,
        message: 'Informe seu usuário e senha para entrar.',
      };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass }),
      });

      const data = await res.json();

      if (res.ok && data?.user && data?.token) {
        const user: AuthUser = {
          id: data.user.id,
          username: data.user.username,
          name: data.user.name,
          role: data.user.role || 'ADMIN',
        };
        const session: AuthSession = {
          token: data.token,
          user,
          expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14, // 14 days
        };
        writeSession(session);
        return { success: true, user };
      }

      return {
        success: false,
        message: data?.error || 'Usuário ou senha incorretos.',
      };
    } catch {
      return {
        success: false,
        message: 'Não foi possível conectar ao servidor de autenticação. Tente novamente.',
      };
    }
  },

  logout(): void {
    writeSession(null);
  },
};
