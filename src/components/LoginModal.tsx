import React, { useState } from 'react';
import { authService, AuthUser } from '../services/auth';
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
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        setUsername('');
        setPassword('');
        onLoginSuccess(result.user);
        onClose();
      } else {
        setError(result.message || 'Usuário ou senha incorretos.');
      }
    } catch {
      setError('Erro de comunicação com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-md card-3d rounded-3xl overflow-hidden text-stone-900 my-auto animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* 3D Header Stage */}
        <div className="hero-3d px-6 py-7 text-white text-center relative border-0 rounded-none">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/25 hover:bg-black/40 text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 shadow-[0_5px_0_0_#78350f,0_10px_20px_rgba(0,0,0,0.35)] flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-stone-950" />
          </div>

          <h3 className="text-xl font-black font-heading tracking-tight">
            Acesso Restrito da Equipe
          </h3>
          <p className="text-xs text-amber-100/90 mt-1 max-w-xs mx-auto">
            Autenticação criptografada no servidor para gerência, cozinha e PDV
          </p>
        </div>

        {/* Informative notice for customers */}
        <div className="p-3 bg-amber-50 border-b border-amber-200/80 px-5 flex items-center gap-2.5 text-xs text-amber-950">
          <Utensils className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Clientes:</strong> Não é necessário login para ver o cardápio e fazer pedidos.
          </span>
        </div>

        <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-red-200 text-red-900 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Usuário de Acesso
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário cadastrado"
                className="w-full pl-10 pr-4 py-3 rounded-xl input-3d text-sm font-semibold text-stone-900 placeholder:text-stone-400 placeholder:font-normal"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full pl-10 pr-10 py-3 rounded-xl input-3d text-sm font-semibold text-stone-900 placeholder:text-stone-400 placeholder:font-normal"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl btn-3d-amber font-bold text-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Validando acesso seguro...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Entrar no Painel da Pastelaria</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-center text-stone-500 pt-1">
            Novos membros da equipe e senhas são gerenciados pelo administrador em{' '}
            <strong className="text-stone-700">Configurações &rarr; Equipe</strong>.
          </p>
        </form>
      </div>
    </div>
  );
};
