import React, { useState } from 'react';
import { MenuItem, CartItem, Order, OrderType, PaymentMethod, StoreSettings, ProductCategory } from '../types';
import { formatBRL } from '../utils/format';
import { playChimeSound } from '../utils/sound';
import { Plus, Minus, Trash2, Printer, Search } from 'lucide-react';

interface PosTerminalProps {
  menuItems: MenuItem[];
  settings: StoreSettings;
  onOrderCreated: (order: Order, printImmediately: boolean) => void;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({
  menuItems,
  settings,
  onOrderCreated,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  // Order meta
  const [orderType, setOrderType] = useState<OrderType>('mesa');
  const [customerName, setCustomerName] = useState('Cliente Balcão');
  const [tableNumber, setTableNumber] = useState('Mesa 01');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [cashReceived, setCashReceived] = useState<string>('');

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (search.trim()) {
      const match = item.name.toLowerCase().includes(search.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const deliveryFee = orderType === 'delivery' ? settings.defaultDeliveryFee : 0;
  const total = subtotal + deliveryFee;

  const cashValue = parseFloat(cashReceived) || 0;
  const changeValue = Math.max(0, cashValue - total);

  const addItemToCart = (item: MenuItem) => {
    const existingIdx = cart.findIndex((c) => c.menuItem.id === item.id && !c.selectedSize && c.extras.length === 0);
    if (existingIdx >= 0) {
      const updated = [...cart];
      updated[existingIdx].quantity += 1;
      updated[existingIdx].totalPrice = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
      setCart(updated);
    } else {
      const newCartItem: CartItem = {
        id: `pos-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuItem: item,
        extras: [],
        quantity: 1,
        unitPrice: item.price,
        totalPrice: item.price,
      };
      setCart([...cart, newCartItem]);
    }
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(cart.filter((c) => c.id !== cartItemId));
    } else {
      setCart(
        cart.map((c) =>
          c.id === cartItemId
            ? { ...c, quantity: newQty, totalPrice: newQty * c.unitPrice }
            : c
        )
      );
    }
  };

  const handleLaunchOrder = (printReceipt: boolean) => {
    if (cart.length === 0) {
      return;
    }

    const orderNumber = Math.floor(100 + Math.random() * 900);
    const newOrder: Order = {
      id: `ord-pos-${Date.now()}`,
      orderNumber,
      customerName: customerName.trim() || 'Balcão',
      customerPhone: settings.whatsappNumber,
      orderType,
      tableNumber: orderType === 'mesa' ? tableNumber : undefined,
      paymentMethod,
      needChangeFor: paymentMethod === 'dinheiro' && cashValue > total ? cashValue : undefined,
      items: [...cart],
      subtotal,
      deliveryFee,
      total,
      status: 'novo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onOrderCreated(newOrder, printReceipt);
    playChimeSound();

    // Reset POS cart
    setCart([]);
    setCashReceived('');
    setCustomerName('Cliente Balcão');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* LEFT: Products Grid (7 cols) */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Category & Search Filter Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar sabor ou item..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="text-xs text-stone-500">
              {filteredItems.length} itens encontrados
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'salgados', label: 'Salgados' },
              { id: 'especiais', label: 'Especiais' },
              { id: 'doces', label: 'Doces' },
              { id: 'combos', label: 'Combos' },
              { id: 'bebidas', label: 'Bebidas' },
              { id: 'porcoes', label: 'Porções' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as ProductCategory | 'all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => addItemToCart(item)}
              disabled={!item.available}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all bg-white cursor-pointer active:scale-95 ${
                !item.available
                  ? 'opacity-50 cursor-not-allowed border-stone-200'
                  : 'border-stone-200 hover:border-amber-400 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-stone-900 line-clamp-1">
                  {item.name}
                </div>
                <div className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                  {item.description}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                <span className="font-bold text-xs text-amber-700 tabular-nums">
                  {formatBRL(item.price)}
                </span>
                <span className="p-1 rounded bg-amber-50 text-amber-700 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Current Order Cart & Checkout (5 cols) */}
      <div id="pos-summary-panel" className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-stone-200 p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Comanda / Caixa</h3>
            <p className="text-xs text-stone-500">Lançamento rápido no balcão</p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs text-red-600 hover:underline cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Type selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setOrderType('mesa')}
            className={`py-1.5 rounded-lg cursor-pointer ${
              orderType === 'mesa' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'
            }`}
          >
            Mesa
          </button>
          <button
            onClick={() => setOrderType('retirada')}
            className={`py-1.5 rounded-lg cursor-pointer ${
              orderType === 'retirada' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'
            }`}
          >
            Balcão
          </button>
          <button
            onClick={() => setOrderType('delivery')}
            className={`py-1.5 rounded-lg cursor-pointer ${
              orderType === 'delivery' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'
            }`}
          >
            Delivery
          </button>
        </div>

        {/* Identification */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-stone-600 font-medium mb-1">Cliente / Identif.</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {orderType === 'mesa' ? (
            <div>
              <label className="block text-stone-600 font-medium mb-1">Mesa</label>
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
              >
                {Array.from({ length: 15 }, (_, i) => `Mesa ${String(i + 1).padStart(2, '0')}`).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-stone-600 font-medium mb-1">Senha Balcão</label>
              <div className="px-2.5 py-1.5 bg-stone-100 rounded-lg text-stone-700 font-mono">
                Auto
              </div>
            </div>
          )}
        </div>

        {/* Cart items list */}
        <div className="border border-stone-200 rounded-xl p-2.5 max-h-56 overflow-y-auto space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs">
              Nenhum pastel ou bebida na comanda ainda.
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-b-0">
                <div className="flex-1 pr-2">
                  <div className="font-semibold text-stone-900">{item.menuItem.name}</div>
                  <div className="text-[11px] text-stone-500 tabular-nums">
                    {formatBRL(item.unitPrice)} cada
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-4 text-center font-bold tabular-nums">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>

                  <span className="font-bold tabular-nums text-stone-900 min-w-[50px] text-right">
                    {formatBRL(item.totalPrice)}
                  </span>

                  <button
                    onClick={() => updateQuantity(item.id, 0)}
                    className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="bg-stone-50 rounded-xl p-3 space-y-1 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal:</span>
            <span className="tabular-nums font-semibold">{formatBRL(subtotal)}</span>
          </div>
          {orderType === 'delivery' && (
            <div className="flex justify-between text-stone-600">
              <span>Taxa Entrega:</span>
              <span className="tabular-nums font-semibold">{formatBRL(deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-stone-900 pt-1.5 border-t border-stone-200">
            <span>Total da Comanda:</span>
            <span className="text-amber-700 tabular-nums">{formatBRL(total)}</span>
          </div>
        </div>

        {/* Payment selector */}
        <div className="space-y-2 pt-1 border-t border-stone-100">
          <label className="block text-xs font-semibold text-stone-700">Forma de Pagamento</label>
          <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
            {(['dinheiro', 'pix', 'cartao_debito', 'cartao_credito'] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`py-1.5 rounded-lg border text-center transition-colors cursor-pointer ${
                  paymentMethod === m
                    ? 'border-amber-600 bg-amber-50 text-amber-950'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                {m === 'dinheiro' && 'Dinheiro'}
                {m === 'pix' && 'PIX'}
                {m === 'cartao_debito' && 'Débito'}
                {m === 'cartao_credito' && 'Crédito'}
              </button>
            ))}
          </div>

          {/* Quick cash calculate */}
          {paymentMethod === 'dinheiro' && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="Valor recebido R$..."
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500"
                />
                <div className="flex items-center gap-1">
                  {[20, 50, 100].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setCashReceived(v.toString())}
                      className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-[11px] font-bold text-stone-700 cursor-pointer"
                    >
                      R${v}
                    </button>
                  ))}
                </div>
              </div>

              {cashValue > total && (
                <div className="flex justify-between items-center text-xs p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 font-bold">
                  <span>Troco a devolver:</span>
                  <span className="tabular-nums text-sm">{formatBRL(changeValue)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => handleLaunchOrder(false)}
            disabled={cart.length === 0}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
          >
            Lançar Cozinha
          </button>

          <button
            onClick={() => handleLaunchOrder(true)}
            disabled={cart.length === 0}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Lançar & Imprimir</span>
          </button>
        </div>
      </div>

      {/* Floating Bottom Bar on Mobile for POS */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 max-w-lg mx-auto pb-[env(safe-area-inset-bottom)] animate-in fade-in slide-in-from-bottom-4 duration-150">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('pos-summary-panel');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-900 text-white shadow-2xl border border-stone-700 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </div>
              <div className="text-left text-xs">
                <div className="font-bold text-amber-300">Caixa / Balcão</div>
                <div className="text-[11px] text-stone-400">Toque para fechar pagamento</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-amber-400 text-sm tabular-nums">
                {formatBRL(total)}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-xs">
                Cobrar →
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
