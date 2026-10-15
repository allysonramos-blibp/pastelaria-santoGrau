import React, { useState } from 'react';
import { MenuItem, ProductCategory, StoreSettings, CartItem } from '../types';
import { formatBRL } from '../utils/format';
import { PastelVisual } from './PastelVisual';
import { Search, Plus, ShoppingBag, Clock, MapPin, Bike, Sparkles, Check, Flame } from 'lucide-react';

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

  const categories: { id: ProductCategory | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'Todos os Sabores', icon: '🥟' },
    { id: 'salgados', label: 'Tradicionais', icon: '🥟' },
    { id: 'especiais', label: 'Especiais Gourmet', icon: '⭐' },
    { id: 'doces', label: 'Pastéis Doces', icon: '🍫' },
    { id: 'combos', label: 'Combos & Ofertas', icon: '🎁' },
    { id: 'bebidas', label: 'Caldo de Cana & Bebidas', icon: '🥤' },
    { id: 'porcoes', label: 'Porções & Mini Pastéis', icon: '🍟' },
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
    <div className="space-y-8 pb-28">
      {/* Modern Gastronomic Hero Showcase Section */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-stone-900 text-white p-4 sm:p-10 shadow-xl border border-amber-500/20">
        {/* Subtle decorative circles */}
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-amber-400/25 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-orange-500/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-amber-200 uppercase tracking-wider">
            <span className="flex items-center gap-1 bg-amber-500/30 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-300/30">
              <Flame className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-300" />
              <span>Frito na Hora</span>
            </span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span className="bg-white/10 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">Massa Fresca Todo Dia</span>
          </div>

          <h1 className="text-2xl sm:text-5xl font-black font-heading tracking-tight leading-tight text-white text-balance">
            {settings.storeName}
          </h1>

          <p className="text-xs sm:text-base text-amber-100/90 leading-relaxed max-w-xl">
            {settings.slogan}
          </p>

          {/* Quick Info Grid */}
          <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-y-1.5 gap-x-3 sm:gap-x-4 text-xs sm:text-sm text-stone-200">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{settings.openingHours}</span>
            </div>
            <span aria-hidden="true" className="text-amber-400/60 hidden sm:inline">·</span>
            <div className="flex items-center gap-1">
              <Bike className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Entrega ({formatBRL(settings.defaultDeliveryFee)})</span>
            </div>
            <span aria-hidden="true" className="text-amber-400/60 hidden sm:inline">·</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-none">{settings.address}</span>
            </div>
          </div>
        </div>

        {/* Floating badge for active orders */}
        {activeOrderCount > 0 && onViewOrderTracking && (
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/15 flex items-center justify-between gap-2">
            <div className="text-xs text-amber-200 font-medium">
              Você tem {activeOrderCount} pedido(s) em andamento!
            </div>
            <button
              onClick={onViewOrderTracking}
              className="px-3 py-1.5 bg-white text-stone-900 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              Acompanhar
            </button>
          </div>
        )}
      </section>

      {/* Filter and Search Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar sabor, carne seca, queijo, nutella..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl bg-white border border-stone-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-stone-400"
            />
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Exibindo <span className="font-bold text-stone-800">{filteredItems.length}</span> opções no cardápio
          </div>
        </div>

        {/* Category Segmented Scrollable Tabs with Icons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none py-1">
          {categories.map((cat) => {
            const count = cat.id === 'all' 
              ? menuItems.length 
              : menuItems.filter(m => m.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 scale-[1.02]'
                    : 'bg-white text-stone-700 border border-stone-200/90 hover:border-amber-300 hover:bg-stone-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id ? 'bg-amber-700 text-amber-100' : 'bg-stone-100 text-stone-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Product Grid */}
      <section>
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-14 text-center text-stone-500 space-y-3 shadow-xs">
            <div className="text-4xl">🥟</div>
            <p className="text-base font-bold text-stone-800">Nenhum pastel encontrado.</p>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Não encontramos resultados para sua busca. Tente buscar por outro sabor ou ingrediente.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearch(''); }}
              className="mt-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {filteredItems.map((item) => {
              const inCartQty = cart
                .filter((c) => c.menuItem.id === item.id)
                .reduce((sum, c) => sum + c.quantity, 0);

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-300 transition-all flex flex-col justify-between"
                >
                  {/* Visual Cover */}
                  <div className="relative">
                    <PastelVisual
                      category={item.category}
                      name={item.name}
                      imageUrl={item.imageUrl}
                      className="h-32 sm:h-44 w-full"
                    />
                    {item.badge && (
                      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-stone-900/85 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-bold tracking-wide shadow-xs">
                        {item.badge}
                      </div>
                    )}
                    {inCartQty > 0 && (
                      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-600 text-white text-[10px] sm:text-[11px] font-bold tracking-wide shadow-xs flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{inCartQty} no carrinho</span>
                      </div>
                    )}
                    {!item.available && (
                      <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3.5 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold uppercase shadow-md">
                          Esgotado Hoje
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold font-heading text-stone-900 text-base leading-snug group-hover:text-amber-700 transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      {item.ingredients && item.ingredients.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px] text-stone-500">
                          {item.ingredients.slice(0, 3).map((ing, i) => (
                            <span key={i} className="bg-stone-100 text-stone-600 px-1.5 sm:px-2 py-0.5 rounded-md font-medium">
                              {ing}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price & Action */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                          A partir de
                        </div>
                        <div className="text-lg sm:text-xl font-black font-heading text-amber-700 tabular-nums">
                          {formatBRL(item.price)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenItemCustomize(item)}
                        disabled={!item.available}
                        className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{item.sizeOptions || item.category === 'salgados' ? 'Personalizar' : 'Adicionar'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sticky Bottom Cart Bar (Appears when cart has items) */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 max-w-lg mx-auto z-40 pb-[env(safe-area-inset-bottom)] animate-in fade-in slide-in-from-bottom-4 duration-150">
          <button
            type="button"
            onClick={onOpenCart}
            className="w-full flex items-center justify-between p-4 rounded-3xl bg-stone-900 hover:bg-stone-800 text-white shadow-2xl transition-all active:scale-[0.99] cursor-pointer border border-stone-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-black text-sm shadow-md">
                {cartItemsCount}
              </div>
              <div className="text-left">
                <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">Ver Pedido</div>
                <div className="text-sm font-bold">{cartItemsCount} {cartItemsCount === 1 ? 'pastel' : 'itens'} no carrinho</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-base font-black text-amber-400 tabular-nums font-heading">
                {formatBRL(cartSubtotal)}
              </span>
              <span className="text-xs bg-white text-stone-950 px-3 py-1.5 rounded-xl font-bold shadow-xs">
                Avançar →
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
