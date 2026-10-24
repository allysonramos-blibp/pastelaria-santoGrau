import React from 'react';
import { StoreSettings } from '../types';
import { AuthUser } from '../services/auth';
import { PWAInstallButton } from './PWAInstallButton';
import { ShoppingBag, Utensils, Lock, LogOut, QrCode } from 'lucide-react';

interface HeaderNavProps {
  currentMode: 'cliente' | 'gestao';
  gestaoSubTab: 'kds' | 'comandas' | 'pos' | 'menu' | 'financeiro' | 'config';
  onSelectMode: (mode: 'cliente' | 'gestao') => void;
  onSelectGestaoTab: (tab: 'kds' | 'comandas' | 'pos' | 'menu' | 'financeiro' | 'config') => void;
  onSelectClienteTab: (tab: 'menu' | 'tracking') => void;
  activeClientTab: 'menu' | 'tracking';
  cartCount: number;
  onOpenCart: () => void;
  onOpenQrModal: () => void;
  settings: StoreSettings;
  activeOrdersCount: number;
  currentUser: AuthUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentMode,
  gestaoSubTab,
  onSelectMode,
  onSelectGestaoTab,
  onSelectClienteTab,
  activeClientTab,
  cartCount,
  onOpenCart,
  onOpenQrModal,
  settings,
  activeOrdersCount,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-stone-200/90 shadow-[0_4px_16px_-4px_rgba(28,25,23,0.08)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 sm:h-17 flex items-center justify-between gap-2 sm:gap-8">
        {/* ZONE 1: Brand Wordmark */}
        <button
          onClick={() => onSelectMode('cliente')}
          className="text-sm xs:text-base sm:text-xl font-black font-heading tracking-tight text-stone-900 truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none hover:text-amber-700 transition-colors cursor-pointer text-left shrink-0"
        >
          {settings.storeName}
        </button>

        {/* ZONE 2: Desktop Navigation Links (Clean Typography per Frontend Design Guidelines) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          {currentMode === 'cliente' ? (
            <>
              <button
                type="button"
                onClick={() => onSelectClienteTab('menu')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer py-1 border-b-2 ${
                  activeClientTab === 'menu'
                    ? 'text-amber-700 font-bold border-amber-600'
                    : 'border-transparent'
                }`}
              >
                Cardápio Digital
              </button>
              <button
                type="button"
                onClick={() => onSelectClienteTab('tracking')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer py-1 border-b-2 ${
                  activeClientTab === 'tracking'
                    ? 'text-amber-700 font-bold border-amber-600'
                    : 'border-transparent'
                }`}
              >
                Acompanhar Pedido {activeOrdersCount > 0 && `(${activeOrdersCount})`}
              </button>
              <button
                type="button"
                onClick={onOpenQrModal}
                className="whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer flex items-center gap-1.5 py-1"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-600" />
                <span>QR Code Mesa</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onSelectGestaoTab('kds')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer py-1 border-b-2 ${
                  gestaoSubTab === 'kds'
                    ? 'text-amber-700 font-bold border-amber-600'
                    : 'border-transparent'
                }`}
              >
                Cozinha & Fritadeira
              </button>
              <button
                type="button"
                onClick={() => onSelectGestaoTab('comandas')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer py-1 border-b-2 ${
                  gestaoSubTab === 'comandas'
                    ? 'text-amber-700 font-bold border-amber-600'
                    : 'border-transparent'
                }`}
              >
                Comandas (Nome)
              </button>
              <button
                type="button"
                onClick={() => onSelectGestaoTab('pos')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer py-1 border-b-2 ${
                  gestaoSubTab === 'pos'
                    ? 'text-amber-700 font-bold border-amber-600'
                    : 'border-transparent'
                }`}
              >
                Caixa & Balcão (PDV)
              </button>
              <button
                type="button"
                onClick={() => onSelectGestaoTab('menu')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer py-1 border-b-2 ${
                  gestaoSubTab === 'menu'
                    ? 'text-amber-700 font-bold border-amber-600'
                    : 'border-transparent'
                }`}
              >
                Cardápio
              </button>
              <button
                type="button"
                onClick={() => onSelectGestaoTab('financeiro')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer py-1 border-b-2 ${
                  gestaoSubTab === 'financeiro'
                    ? 'text-amber-700 font-bold border-amber-600'
                    : 'border-transparent'
                }`}
              >
                Financeiro
              </button>
              <button
                type="button"
                onClick={() => onSelectGestaoTab('config')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer py-1 border-b-2 ${
                  gestaoSubTab === 'config'
                    ? 'text-amber-700 font-bold border-amber-600'
                    : 'border-transparent'
                }`}
              >
                Configurações
              </button>
            </>
          )}
        </nav>

        {/* ZONE 3: 3D Tactile Actions + Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <PWAInstallButton />

          {currentMode === 'cliente' ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onOpenCart}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-bold rounded-xl btn-3d-amber whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Carrinho</span>
                <span className="font-black text-[11px] bg-amber-900/40 text-white px-1.5 py-0.2 rounded-md">
                  {cartCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentUser) {
                    onSelectMode('gestao');
                  } else {
                    onOpenLogin();
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-bold rounded-xl btn-3d-white whitespace-nowrap shrink-0 cursor-pointer"
                title="Acesso restrito da gerência e equipe"
              >
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">{currentUser ? 'Painel' : 'Gerência'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-bold text-stone-700 truncate max-w-[85px] sm:max-w-none px-1">
                {currentUser?.name || 'Gerência'}
              </span>

              <button
                type="button"
                onClick={() => onSelectMode('cliente')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-bold rounded-xl btn-3d-white whitespace-nowrap shrink-0 cursor-pointer"
                title="Voltar ao Cardápio"
              >
                <Utensils className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Cardápio</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-xl btn-3d-white text-stone-500 hover:text-red-600 cursor-pointer"
                title="Sair (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Secondary Segmented Bar */}
      <div className="md:hidden border-t border-stone-200/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-bold bg-stone-100/80">
        {currentMode === 'cliente' ? (
          <>
            <button
              onClick={() => onSelectClienteTab('menu')}
              className={`px-3 py-1.5 rounded-xl shrink-0 cursor-pointer ${
                activeClientTab === 'menu' ? 'btn-3d-amber' : 'btn-3d-white'
              }`}
            >
              Cardápio
            </button>
            <button
              onClick={() => onSelectClienteTab('tracking')}
              className={`px-3 py-1.5 rounded-xl shrink-0 cursor-pointer ${
                activeClientTab === 'tracking' ? 'btn-3d-amber' : 'btn-3d-white'
              }`}
            >
              Acompanhar {activeOrdersCount > 0 && `(${activeOrdersCount})`}
            </button>
            <button
              onClick={onOpenQrModal}
              className="px-3 py-1.5 rounded-xl shrink-0 btn-3d-white flex items-center gap-1 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-600" />
              <span>QR Mesa</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onSelectGestaoTab('kds')}
              className={`px-3 py-1.5 rounded-xl shrink-0 cursor-pointer ${
                gestaoSubTab === 'kds' ? 'btn-3d-amber' : 'btn-3d-white'
              }`}
            >
              Cozinha
            </button>
            <button
              onClick={() => onSelectGestaoTab('comandas')}
              className={`px-3 py-1.5 rounded-xl shrink-0 cursor-pointer ${
                gestaoSubTab === 'comandas' ? 'btn-3d-amber' : 'btn-3d-white'
              }`}
            >
              Comandas
            </button>
            <button
              onClick={() => onSelectGestaoTab('pos')}
              className={`px-3 py-1.5 rounded-xl shrink-0 cursor-pointer ${
                gestaoSubTab === 'pos' ? 'btn-3d-amber' : 'btn-3d-white'
              }`}
            >
              Caixa
            </button>
            <button
              onClick={() => onSelectGestaoTab('menu')}
              className={`px-3 py-1.5 rounded-xl shrink-0 cursor-pointer ${
                gestaoSubTab === 'menu' ? 'btn-3d-amber' : 'btn-3d-white'
              }`}
            >
              Cardápio
            </button>
            <button
              onClick={() => onSelectGestaoTab('financeiro')}
              className={`px-3 py-1.5 rounded-xl shrink-0 cursor-pointer ${
                gestaoSubTab === 'financeiro' ? 'btn-3d-amber' : 'btn-3d-white'
              }`}
            >
              Financeiro
            </button>
            <button
              onClick={() => onSelectGestaoTab('config')}
              className={`px-3 py-1.5 rounded-xl shrink-0 cursor-pointer ${
                gestaoSubTab === 'config' ? 'btn-3d-amber' : 'btn-3d-white'
              }`}
            >
              Config
            </button>
          </>
        )}
      </div>
    </header>
  );
};
