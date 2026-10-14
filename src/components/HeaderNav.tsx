import React from 'react';
import { StoreSettings } from '../types';
import { AuthUser } from '../services/auth';
import { PWAInstallButton } from './PWAInstallButton';
import { ShoppingBag, Utensils, Lock, LogOut, QrCode, ShieldCheck } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6 sm:gap-8">
        {/* ZONE 1: Brand Wordmark (Single text element, whitespace-nowrap shrink-0) */}
        <button
          onClick={() => onSelectMode('cliente')}
          className="text-lg sm:text-xl font-black font-heading tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:text-amber-700 transition-colors cursor-pointer"
        >
          {settings.storeName}
        </button>

        {/* ZONE 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          {currentMode === 'cliente' ? (
            <>
              <button
                type="button"
                onClick={() => onSelectClienteTab('menu')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer ${
                  activeClientTab === 'menu' ? 'text-amber-700 font-bold' : ''
                }`}
              >
                Cardápio Digital
              </button>
              <button
                type="button"
                onClick={() => onSelectClienteTab('tracking')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer ${
                  activeClientTab === 'tracking' ? 'text-amber-700 font-bold' : ''
                }`}
              >
                Acompanhar Pedido {activeOrdersCount > 0 && `(${activeOrdersCount})`}
              </button>
              <button
                type="button"
                onClick={onOpenQrModal}
                className="whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer flex items-center gap-1.5"
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
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer ${
                  gestaoSubTab === 'kds' ? 'text-amber-700 font-bold' : ''
                }`}
              >
                Cozinha & Fritadeira
              </button>
              <button
                type="button"
                onClick={() => onSelectGestaoTab('comandas')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  gestaoSubTab === 'comandas' ? 'text-amber-700 font-bold' : ''
                }`}
              >
                <span>Comandas (Nome)</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-md font-bold">Rápido</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectGestaoTab('pos')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer ${
                  gestaoSubTab === 'pos' ? 'text-amber-700 font-bold' : ''
                }`}
              >
                Caixa & Balcão (PDV)
              </button>
              <button
                type="button"
                onClick={() => onSelectGestaoTab('menu')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer ${
                  gestaoSubTab === 'menu' ? 'text-amber-700 font-bold' : ''
                }`}
              >
                Cardápio
              </button>
              <button
                type="button"
                onClick={() => onSelectGestaoTab('financeiro')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer ${
                  gestaoSubTab === 'financeiro' ? 'text-amber-700 font-bold' : ''
                }`}
              >
                Financeiro
              </button>
              <button
                type="button"
                onClick={() => onSelectGestaoTab('config')}
                className={`whitespace-nowrap shrink-0 hover:text-stone-900 transition-colors cursor-pointer ${
                  gestaoSubTab === 'config' ? 'text-amber-700 font-bold' : ''
                }`}
              >
                Configurações
              </button>
            </>
          )}
        </nav>

        {/* ZONE 3: 1 primary action + PWA Install & Owner Auth */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* PWA Install Button (auto-hides if standalone) */}
          <PWAInstallButton />

          {currentMode === 'cliente' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenCart}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Carrinho ({cartCount})</span>
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title="Acesso restrito do dono / gerência com JWT"
              >
                <Lock className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Acesso Dono</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-950 border border-amber-200 text-xs font-bold shadow-xs">
                <span>{currentUser?.role === 'ADMIN' ? '👑' : currentUser?.role === 'GERENTE' ? '💼' : '📱'}</span>
                <span className="truncate max-w-[120px] sm:max-w-none">{currentUser?.name || 'Dono'}</span>
              </div>

              <button
                type="button"
                onClick={() => onSelectMode('cliente')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Utensils className="w-3.5 h-3.5 text-amber-600" />
                <span>Ver Cardápio</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Sair do painel administrativo (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Secondary Navigation Row (Mobile only) */}
      <div className="md:hidden border-t border-stone-100 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-medium">
        {currentMode === 'cliente' ? (
          <>
            <button
              onClick={() => onSelectClienteTab('menu')}
              className={`px-3 py-1 rounded-lg shrink-0 ${
                activeClientTab === 'menu' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-stone-600'
              }`}
            >
              Cardápio
            </button>
            <button
              onClick={() => onSelectClienteTab('tracking')}
              className={`px-3 py-1 rounded-lg shrink-0 ${
                activeClientTab === 'tracking' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-stone-600'
              }`}
            >
              Acompanhar ({activeOrdersCount})
            </button>
            <button
              onClick={onOpenQrModal}
              className="px-3 py-1 rounded-lg shrink-0 text-stone-600 flex items-center gap-1"
            >
              <QrCode className="w-3 h-3 text-amber-600" />
              <span>QR Mesa</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onSelectGestaoTab('kds')}
              className={`px-2.5 py-1 rounded-lg shrink-0 ${
                gestaoSubTab === 'kds' ? 'bg-amber-600 text-white font-bold' : 'text-stone-600'
              }`}
            >
              Cozinha
            </button>
            <button
              onClick={() => onSelectGestaoTab('comandas')}
              className={`px-2.5 py-1 rounded-lg shrink-0 ${
                gestaoSubTab === 'comandas' ? 'bg-amber-600 text-white font-bold' : 'text-stone-600'
              }`}
            >
              Comandas (Nome)
            </button>
            <button
              onClick={() => onSelectGestaoTab('pos')}
              className={`px-2.5 py-1 rounded-lg shrink-0 ${
                gestaoSubTab === 'pos' ? 'bg-amber-600 text-white font-bold' : 'text-stone-600'
              }`}
            >
              Caixa
            </button>
            <button
              onClick={() => onSelectGestaoTab('menu')}
              className={`px-2.5 py-1 rounded-lg shrink-0 ${
                gestaoSubTab === 'menu' ? 'bg-amber-600 text-white font-bold' : 'text-stone-600'
              }`}
            >
              Cardápio
            </button>
            <button
              onClick={() => onSelectGestaoTab('financeiro')}
              className={`px-2.5 py-1 rounded-lg shrink-0 ${
                gestaoSubTab === 'financeiro' ? 'bg-amber-600 text-white font-bold' : 'text-stone-600'
              }`}
            >
              Financeiro
            </button>
            <button
              onClick={() => onSelectGestaoTab('config')}
              className={`px-2.5 py-1 rounded-lg shrink-0 ${
                gestaoSubTab === 'config' ? 'bg-amber-600 text-white font-bold' : 'text-stone-600'
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
