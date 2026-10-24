import React, { useState } from 'react';
import { MenuItem, ProductCategory, StoreSettings, CartItem } from '../types';
import { formatBRL } from '../utils/format';
import { PastelVisual } from './PastelVisual';
import { Search, Plus, Clock, MapPin, Bike, Check, Flame } from 'lucide-react';

interface CustomerMenuProps {
  menuItems: MenuItem[];
  settings: StoreSettings;
  cart: CartItem[];
  onOpenItemCustomize: (item: MenuItem) => void;
  onOpenCart: () => void;
  onViewOrderTracking?: () => void;
  activeOrderCount?: number;
}

export const CustomerMenu: React.FC<CustomerMenuProps> = ({
  menuItems,
  settings,
  cart,
  onOpenItemCustomize,
  onOpenCart,
  onViewOrderTracking,
  activeOrderCount = 0,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const categories: { id: ProductCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Todos os Sabores' },
    { id: 'salgados', label: 'Tradicionais' },
    { id: 'especiais', label: 'Especiais Gourmet' },
    { id: 'doces', label: 'Pastéis Doces' },
    { id: 'combos', label: 'Combos & Ofertas' },
    { id: 'bebidas', label: 'Caldo de Cana & Bebidas' },
    { id: 'porcoes', label: 'Porções & Mini Pastéis' },
  ];

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchIng = item.ingredients?.some((ing) => ing.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchIng) return false;
    }
    return true;
  });

  const cartItemsCount = cart.reduce((acc, c) => acc + c.quantity, 0);
  const cartSubtotal = cart.reduce((acc, c) => acc + c.totalPrice, 0);

  return (
    <div className="space-y-8 pb-28 perspective-stage">
      {/* 3D Gastronomic Hero Stage */}
      <section className="relative overflow-hidden rounded-3xl hero-3d text-white p-5 sm:p-10">
        <div
          className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-amber-400/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            {/* Unboxed Clean Kicker with Typographic Separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>Frito na Hora</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Massa Fresca Artesanal</span>
              <span aria-hidden="true">·</span>
              <span>{settings.isOpen ? 'Aberto Agora' : 'Fechado no Momento'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-tight text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
              {settings.storeName}
            </h1>

            <p className="text-xs sm:text-base text-amber-100/95 leading-relaxed max-w-xl font-medium">
              {settings.slogan}
            </p>

            {/* Unboxed Metadata Line */}
            <div className="pt-1 flex flex-wrap items-center gap-y-1.5 gap-x-3 sm:gap-x-4 text-xs sm:text-sm text-stone-200">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{settings.openingHours}</span>
              </div>
              <span aria-hidden="true" className="text-amber-400/60 hidden sm:inline">
                ·
              </span>
              <div className="flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Entrega ({formatBRL(settings.defaultDeliveryFee)})</span>
              </div>
              <span aria-hidden="true" className="text-amber-400/60 hidden sm:inline">
                ·
              </span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="truncate max-w-[220px] sm:max-w-none">{settings.address}</span>
              </div>
            </div>
          </div>

          {/* 3D Floating Emblem */}
          <div className="hidden lg:flex flex-col items-center justify-center p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_0_0_rgba(0,0,0,0.35),0_18px_30px_rgba(0,0,0,0.3)] shrink-0">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-200">
              Pedido Direto
            </div>
            <div className="text-2xl font-black font-heading text-white mt-0.5">
              Sem Cadastro
            </div>
            <div className="text-[11px] text-amber-100/80 mt-1">
              Escolha, personalize e envie
            </div>
          </div>
        </div>

        {/* Active orders notification bar */}
        {activeOrderCount > 0 && onViewOrderTracking && (
          <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between gap-2">
            <div className="text-xs text-amber-200 font-semibold">
              Você possui {activeOrderCount} pedido(s) em preparo ou andamento.
            </div>
            <button
              onClick={onViewOrderTracking}
              className="px-3.5 py-2 btn-3d-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
            >
              Acompanhar Pedido
            </button>
          </div>
        )}
      </section>

      {/* Filter and Search Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar sabor, queijo, camarão, nutella..."
              className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl input-3d font-medium placeholder:text-stone-400"
            />
          </div>

          <div className="text-xs text-stone-600 font-medium">
            Exibindo <strong className="font-bold text-stone-900">{filteredItems.length}</strong> opções no cardápio
          </div>
        </div>

        {/* 3D Tactile Category Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none py-1">
          {categories.map((cat) => {
            const count =
              cat.id === 'all'
                ? menuItems.length
                : menuItems.filter((m) => m.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                  isSelected ? 'btn-3d-amber' : 'btn-3d-white'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[11px] font-extrabold ${
                    isSelected ? 'text-amber-100' : 'text-stone-400'
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3D Product Grid */}
      <section>
        {filteredItems.length === 0 ? (
          <div className="card-3d rounded-3xl p-14 text-center text-stone-500 space-y-3">
            <p className="text-base font-bold text-stone-800">Nenhum item encontrado.</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Não encontramos resultados para sua busca. Tente pesquisar por outro ingrediente.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearch('');
              }}
              className="mt-2 px-4 py-2.5 btn-3d-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredItems.map((item) => {
              const inCartQty = cart
                .filter((c) => c.menuItem.id === item.id)
                .reduce((sum, c) => sum + c.quantity, 0);

              return (
                <article
                  key={item.id}
                  className="group card-3d-interactive rounded-3xl overflow-hidden flex flex-col justify-between"
                >
                  {/* 3D Visual Header */}
                  <div className="relative">
                    <PastelVisual
                      category={item.category}
                      name={item.name}
                      imageUrl={item.imageUrl}
                      className="h-36 sm:h-44 w-full"
                    />
                    {inCartQty > 0 && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[11px] font-bold shadow-md flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{inCartQty} no pedido</span>
                      </div>
                    )}
                    {!item.available && (
                      <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase shadow-lg">
                          Esgotado Hoje
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body — Leads directly with Title or Clean Kicker (No Badge Sandwich) */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {item.badge && (
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 mb-0.5">
                          {item.badge}
                        </div>
                      )}
                      <h3 className="font-black font-heading text-stone-900 text-lg leading-snug group-hover:text-amber-700 transition-colors">
                        {item.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      {/* Clean Unboxed Ingredients Metadata with · Separators */}
                      {item.ingredients && item.ingredients.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-stone-500 font-medium">
                          {item.ingredients.slice(0, 4).map((ing, i, arr) => (
                            <React.Fragment key={i}>
                              <span>{ing}</span>
                              {i < arr.length - 1 && <span aria-hidden="true">·</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price & 3D Action Button */}
                    <div className="pt-3.5 border-t border-stone-200/80 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                          Valor
                        </div>
                        <div className="text-xl font-black font-heading text-amber-700 tabular-nums">
                          {formatBRL(item.price)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenItemCustomize(item)}
                        disabled={!item.available}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl btn-3d-amber disabled:opacity-40 text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>
                          {item.sizeOptions || item.category === 'salgados'
                            ? 'Personalizar'
                            : 'Adicionar'}
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Sticky 3D Bottom Cart Bar */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-3 inset-x-3 sm:bottom-5 sm:inset-x-4 max-w-lg mx-auto z-40 pb-[env(safe-area-inset-bottom)]">
          <button
            type="button"
            onClick={onOpenCart}
            className="w-full flex items-center justify-between p-4 rounded-3xl btn-3d-dark text-white cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl btn-3d-amber text-white flex items-center justify-center font-black text-sm">
                {cartItemsCount}
              </div>
              <div className="text-left">
                <div className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                  Finalizar Pedido
                </div>
                <div className="text-sm font-bold">
                  {cartItemsCount} {cartItemsCount === 1 ? 'item selecionado' : 'itens selecionados'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-base font-black text-amber-400 tabular-nums font-heading">
                {formatBRL(cartSubtotal)}
              </span>
              <span className="text-xs btn-3d-white px-3.5 py-2 rounded-xl font-bold">
                Ver Sacola &rarr;
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
