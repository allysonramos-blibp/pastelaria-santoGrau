import React, { useState } from 'react';
import { authService, AuthUser } from '../services/auth';
import { UserRole } from '../types';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  ArrowRight,
  AlertCircle,
  Utensils,
  UserPlus,
  Crown,
  Briefcase,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('ADMIN');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authService.login(username, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
        onClose();
      } else {
        setError(result.message || 'Falha na autenticação.');
      }
    } catch {
      setError('Erro ao processar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authService.register({
        name: regName,
        username: regUsername,
        password: regPassword,
        role: regRole,
      });

      if (result.success && result.user) {
        onLoginSuccess(result.user);
        onClose();
      } else {
        setError(result.message || 'Erro ao criar conta.');
      }
    } catch {
      setError('Erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const registeredUsers = authService.getRegisteredUsers();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-stone-900 my-auto animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-stone-900 px-6 py-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-2 shadow-inner">
            {tab === 'login' ? (
              <Lock className="w-6 h-6 text-amber-100" />
            ) : (
              <UserPlus className="w-6 h-6 text-amber-100" />
            )}
          </div>

          <h3 className="text-lg font-black font-heading tracking-tight">
            {tab === 'login' ? 'Acesso da Gerência & Equipe' : 'Criar Conta da Equipe'}
          </h3>
          <p className="text-xs text-amber-100/90 mt-0.5 max-w-xs mx-auto">
            {tab === 'login'
              ? 'Painel da cozinha, comandas, caixa e administração'
              : 'Cadastre sua conta (ADM, Gerente ou Atendente) para acessar'}
          </p>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 p-1 bg-black/20 backdrop-blur-md rounded-xl mt-4 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              Entrar (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === 'register' ? 'bg-white text-stone-900 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              Criar Conta ✨
            </button>
          </div>
        </div>

        {/* Informative notice for customers */}
        <div className="p-2.5 bg-amber-50/80 border-b border-amber-100 px-5 flex items-center gap-2 text-[11px] text-amber-900">
          <Utensils className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            <strong>Aviso:</strong> Clientes não precisam de login para fazer pedidos!
          </span>
        </div>

        {/* TAB 1: LOGIN */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Usuário / E-mail
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: admin ou o usuário da sua irmã"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick user selection */}
            {registeredUsers.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                <div className="text-[11px] font-bold text-amber-900 flex items-center justify-between">
                  <span>Toque na sua conta para entrar direto:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {registeredUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        const targetUser = u.username;
                        const targetPass = u.password || '123';
                        setUsername(targetUser);
                        setPassword(targetPass);
                        authService.login(targetUser, targetPass).then((res) => {
                          if (res.success && res.user) {
                            onLoginSuccess(res.user);
                            onClose();
                          }
                        });
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-xl bg-white border border-amber-300 hover:border-amber-500 hover:bg-amber-100/50 text-stone-900 font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
                    >
                      <span>
                        {u.role === 'ADMIN' ? '👑' : u.role === 'GERENTE' ? '💼' : '📱'}
                      </span>
                      <span>{u.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Entrar no Painel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setTab('register')}
                className="text-xs text-amber-700 font-semibold hover:underline cursor-pointer"
              >
                Sua irmã ainda não tem conta? Clique aqui para cadastrar
              </button>
            </div>
          </form>
        ) : (
          /* TAB 2: REGISTER ACCOUNT */
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nome Completo (ou Apelido)
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ex: Minha Irmã, Camila Ramos..."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Usuário de Login
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="Ex: camila, irma"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Senha</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-stone-700">Cargo / Função:</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('ADMIN')}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    regRole === 'ADMIN'
                      ? 'border-amber-600 bg-amber-50/70 shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      👑 Administradora (ADM / Sócia)
                    </div>
                    <div className="text-[11px] text-stone-500 leading-tight">
                      Acesso completo: faturamento, configurações da loja, cardápio e equipe
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('GERENTE')}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    regRole === 'GERENTE'
                      ? 'border-amber-600 bg-amber-50/70 shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-stone-900">💼 Gerente de Operação</div>
                    <div className="text-[11px] text-stone-500 leading-tight">
                      Acesso à cozinha (KDS), comandas, caixa (PDV) e cardápio
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('ATENDENTE')}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    regRole === 'ATENDENTE'
                      ? 'border-amber-600 bg-amber-50/70 shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      📱 Atendente / Garçom Móvel
                    </div>
                    <div className="text-[11px] text-stone-500 leading-tight">
                      Tirador de pedidos rápido por nome e caixa de balcão
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Criando conta...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Criar Minha Conta & Entrar</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
