import React, { useState, useMemo } from 'react';
import { MenuItem, CartItem, Order, PaymentMethod, StoreSettings, ProductCategory } from '../types';
import { formatBRL, formatDateTime } from '../utils/format';
import { playChimeSound } from '../utils/sound';
import { PastelVisual } from './PastelVisual';
import {
  User,
  Plus,
  Minus,
  Trash2,
  Printer,
  Search,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Receipt,
  CreditCard,
  QrCode,
  DollarSign,
  AlertCircle,
  X,
  Flame
} from 'lucide-react';

interface WaiterOrderPadProps {
  menuItems: MenuItem[];
  settings: StoreSettings;
  orders: Order[];
  onOrderCreated: (order: Order, printImmediately: boolean) => void;
  onAppendItemsToOrder: (orderId: string, newItems: CartItem[], printImmediately: boolean) => void;
  onCloseAccount: (orderId: string, paymentMethod: PaymentMethod, changeFor?: number) => void;
  onPrintReceipt: (order: Order) => void;
}

const QUICK_OBS_OPTIONS = [
  'Sem Cebola',
  'Bem Frito / Dourado',
  'Sem Azeitona',
  'Sem Orégano',
  'Cortar ao Meio',
  'Para Viagem',
  'Massa Crocante',
  'Pouco Recheio Quente',
];

export const WaiterOrderPad: React.FC<WaiterOrderPadProps> = ({
  menuItems,
  settings,
  orders,
  onOrderCreated,
  onAppendItemsToOrder,
  onCloseAccount,
  onPrintReceipt,
}) => {
  // Navigation mode within Waiter Pad
  const [activeTab, setActiveTab] = useState<'novo_pedido' | 'comandas_abertas'>('novo_pedido');

  // Customer identity
  const [customerName, setCustomerName] = useState('');
  const [selectedExistingOrderId, setSelectedExistingOrderId] = useState<string | null>(null);

  // Cart / Items selected for current customer
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [printKitchenTicket, setPrintKitchenTicket] = useState(true);

  // Success Feedback Toast
  const [successToast, setSuccessToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  // Modal to close account / receive payment
  const [closingOrder, setClosingOrder] = useState<Order | null>(null);
  const [closePaymentMethod, setClosePaymentMethod] = useState<PaymentMethod>('pix');
  const [cashGiven, setCashGiven] = useState<string>('');

  // Active open orders (not yet finished/cancelled)
  const openOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'novo' || o.status === 'em_preparo' || o.status === 'pronto'
    );
  }, [orders]);

  // Filtered menu items
  const filteredProducts = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item.available) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        return item.name.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query);
      }
      return true;
    });
  }, [menuItems, selectedCategory, search]);

  const cartSubtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const cartTotalQty = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Add product to cart with 1-tap
  const handleAddItem = (item: MenuItem) => {
    const existingIdx = cart.findIndex((c) => c.menuItem.id === item.id && !c.selectedSize);
    if (existingIdx >= 0) {
      const copy = [...cart];
      copy[existingIdx].quantity += 1;
      copy[existingIdx].totalPrice = copy[existingIdx].quantity * copy[existingIdx].unitPrice;
      setCart(copy);
    } else {
      const newCartItem: CartItem = {
        id: `waiter-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuItem: item,
        extras: [],
        quantity: 1,
        unitPrice: item.price,
        totalPrice: item.price,
        notes: '',
      };
      setCart([...cart, newCartItem]);
    }
  };

  const handleUpdateQty = (cartItemId: string, newQty: number) => {
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

  const handleToggleObservation = (cartItemId: string, obs: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== cartItemId) return item;
        const currentNotes = item.notes ? item.notes.split(', ').filter(Boolean) : [];
        let updatedNotes: string[];
        if (currentNotes.includes(obs)) {
          updatedNotes = currentNotes.filter((n) => n !== obs);
        } else {
          updatedNotes = [...currentNotes, obs];
        }
        return { ...item, notes: updatedNotes.join(', ') };
      })
    );
  };

  // Select an existing open customer to add more items
  const handleSelectExistingCustomer = (order: Order) => {
    setSelectedExistingOrderId(order.id);
    setCustomerName(order.customerName);
    setActiveTab('novo_pedido');
  };

  // Launch order directly to the kitchen
  const handleSendToKitchen = () => {
    const trimmedName = customerName.trim();
    if (!trimmedName) {
      alert('Por favor, informe o NOME DA PESSOA para identificar a comanda!');
      return;
    }

    if (cart.length === 0) {
      alert('Selecione pelo menos um pastel ou bebida para enviar.');
      return;
    }

    // Scenario A: Adding items to an existing open order for this customer
    if (selectedExistingOrderId) {
      const existing = orders.find((o) => o.id === selectedExistingOrderId);
      if (existing) {
        onAppendItemsToOrder(selectedExistingOrderId, cart, printKitchenTicket);
        playChimeSound();
        setSuccessToast({
          show: true,
          message: `Itens adicionados com sucesso à comanda de ${trimmedName}!`,
        });
        setCart([]);
        setSelectedExistingOrderId(null);
        setCustomerName('');
        setTimeout(() => setSuccessToast({ show: false, message: '' }), 3500);
        return;
      }
    }

    // Scenario B: Creating a brand new customer order
    const orderNumber = Math.floor(100 + Math.random() * 900);
    const newOrder: Order = {
      id: `ord-garcom-${Date.now()}`,
      orderNumber,
      customerName: trimmedName,
      customerPhone: settings.whatsappNumber,
      orderType: 'mesa',
      tableNumber: trimmedName,
      paymentMethod: 'pix',
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee: 0,
      total: cartSubtotal,
      status: 'novo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onOrderCreated(newOrder, printKitchenTicket);
    playChimeSound();

    setSuccessToast({
      show: true,
      message: `Comanda de ${trimmedName} enviada para a fritadeira! 🚀`,
    });

    setCart([]);
    setSelectedExistingOrderId(null);
    setCustomerName('');
    setTimeout(() => setSuccessToast({ show: false, message: '' }), 3500);
  };

  // Execute closing account
  const handleConfirmCloseAccount = () => {
    if (!closingOrder) return;
    const cashVal = parseFloat(cashGiven) || 0;
    onCloseAccount(
      closingOrder.id,
      closePaymentMethod,
      closePaymentMethod === 'dinheiro' && cashVal > closingOrder.total ? cashVal : undefined
    );
    playChimeSound();
    setClosingOrder(null);
    setCashGiven('');
    setSuccessToast({
      show: true,
      message: `Comanda de ${closingOrder.customerName} finalizada com sucesso!`,
    });
    setTimeout(() => setSuccessToast({ show: false, message: '' }), 3500);
  };

  return (
    <div className="space-y-4">
      {/* SUCCESS TOAST NOTIFICATION */}
      {successToast.show && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl font-bold text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successToast.message}</span>
        </div>
      )}

      {/* TOP HEADER CONTROLS */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-xs">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-heading text-stone-900 leading-tight">
              Tirador de Pedidos Express (Por Nome)
            </h2>
            <p className="text-xs text-stone-500">
              Anote pelo nome do cliente e envie direto para a fritadeira
            </p>
          </div>
        </div>

        {/* View Switcher: Novo Pedido vs Comandas Abertas */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('novo_pedido')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'novo_pedido'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-amber-600" />
            <span>Tirar Pedido</span>
          </button>

          <button
            onClick={() => setActiveTab('comandas_abertas')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'comandas_abertas'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Comandas Abertas ({openOrders.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW A: NOVO PEDIDO EXPRESS */}
      {activeTab === 'novo_pedido' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 7-8 COLS: Nome do Cliente + Catálogo de Pastéis */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* IDENTIFICAÇÃO DO CLIENTE (NOME DA PESSOA) */}
            <div className="bg-white rounded-2xl border-2 border-amber-300 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>Nome da Pessoa / Cliente:</span>
                </label>
                {selectedExistingOrderId && (
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                    Adicionando à comanda existente
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (selectedExistingOrderId) setSelectedExistingOrderId(null);
                  }}
                  placeholder="Ex: Dona Neide, Lucas, Marcos balcão, Seu Jorge..."
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm sm:text-base font-bold text-stone-900 bg-stone-50 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  autoFocus
                />
                {customerName && (
                  <button
                    onClick={() => {
                      setCustomerName('');
                      setSelectedExistingOrderId(null);
                    }}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* CHIPS DE COMANDAS ABERTAS PARA REPETIR / ADICIONAR ITENS */}
              {openOrders.length > 0 && (
                <div className="pt-2 border-t border-stone-100">
                  <div className="text-[11px] font-semibold text-stone-500 mb-1.5">
                    Ou selecione uma pessoa que já está consumindo:
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {openOrders.map((ord) => {
                      const isSelected = selectedExistingOrderId === ord.id;
                      return (
                        <button
                          key={ord.id}
                          type="button"
                          onClick={() => handleSelectExistingCustomer(ord)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{ord.customerName}</span>
                          <span className="opacity-75 text-[10px]">({formatBRL(ord.total)})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* BARRA DE FILTRO E CATEGORIAS */}
            <div className="bg-white rounded-2xl border border-stone-200 p-3 space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar pastel, queijo, coca..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Categorias em Pílulas Roláveis */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'salgados', label: 'Salgados' },
                  { id: 'especiais', label: 'Especiais' },
                  { id: 'doces', label: 'Doces' },
                  { id: 'bebidas', label: 'Bebidas' },
                  { id: 'combos', label: 'Combos' },
                  { id: 'porcoes', label: 'Porções' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as ProductCategory | 'all')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* GRADE DE PRODUTOS PARA TOQUE RÁPIDO */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((item) => {
                const inCartItem = cart.find((c) => c.menuItem.id === item.id);
                const qty = inCartItem?.quantity || 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    className={`bg-white rounded-2xl p-3 border transition-all text-left flex flex-col justify-between cursor-pointer select-none relative group ${
                      qty > 0
                        ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-md bg-amber-50/20'
                        : 'border-stone-200 hover:border-amber-400 hover:shadow-sm'
                    }`}
                  >
                    {qty > 0 && (
                      <span className="absolute -top-2 -right-2 bg-amber-600 text-white font-black text-xs px-2 py-0.5 rounded-full shadow-md">
                        {qty}x
                      </span>
                    )}

                    <div>
                      <div className="w-full h-20 rounded-xl overflow-hidden bg-stone-100 mb-2 flex items-center justify-center">
                        <PastelVisual
                          name={item.name}
                          category={item.category}
                          imageUrl={item.imageUrl}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        {item.description || 'Pastel crocante e sequinho'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                      <span className="font-black text-xs sm:text-sm text-amber-700">
                        {formatBRL(item.price)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddItem(item);
                        }}
                        className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer"
                        title="Adicionar item"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT 4-5 COLS: Resumo da Comanda + Observações Rápidas + Botão Enviar Cozinha */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-20">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-md overflow-hidden">
              <div className="p-3.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-stone-900">
                    Comanda: {customerName.trim() || 'Aguardando Nome...'}
                  </h3>
                  <div className="text-[11px] text-stone-500">
                    {cartTotalQty} {cartTotalQty === 1 ? 'item' : 'itens'} selecionados
                  </div>
                </div>

                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar</span>
                  </button>
                )}
              </div>

              {/* LISTA DE ITENS SELECIONADOS COM OBSERVAÇÕES DE 1 TOQUE */}
              <div className="p-3 space-y-3 max-h-[420px] overflow-y-auto divide-y divide-stone-100">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-stone-400 space-y-1">
                    <User className="w-8 h-8 mx-auto text-stone-300" />
                    <p className="text-xs">Nenhum pastel ou bebida adicionado.</p>
                    <p className="text-[11px]">Digite o nome do cliente e toque nos produtos.</p>
                  </div>
                ) : (
                  cart.map((cartItem) => (
                    <div key={cartItem.id} className="pt-2.5 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-bold text-xs text-stone-900">
                            {cartItem.menuItem.name}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {formatBRL(cartItem.unitPrice)} cada
                          </div>
                        </div>

                        {/* Controles de Quantidade */}
                        <div className="flex items-center gap-1.5 bg-stone-100 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(cartItem.id, cartItem.quantity - 1)}
                            className="p-1 rounded bg-white hover:bg-stone-200 text-stone-700 shadow-xs cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-black text-xs w-5 text-center">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(cartItem.id, cartItem.quantity + 1)}
                            className="p-1 rounded bg-white hover:bg-stone-200 text-stone-700 shadow-xs cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="font-black text-xs text-stone-900 w-16 text-right">
                          {formatBRL(cartItem.totalPrice)}
                        </div>
                      </div>

                      {/* Chips de Observações Rápidas (1 Toque) */}
                      <div className="bg-stone-50 p-2 rounded-xl space-y-1.5">
                        <div className="text-[10px] font-bold text-stone-500 uppercase">
                          Observações rápidas:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {QUICK_OBS_OPTIONS.map((obs) => {
                            const isSelected = cartItem.notes?.includes(obs);
                            return (
                              <button
                                key={obs}
                                type="button"
                                onClick={() => handleToggleObservation(cartItem.id, obs)}
                                className={`text-[10px] px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-600 text-white font-bold'
                                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                                }`}
                              >
                                {obs}
                              </button>
                            );
                          })}
                        </div>

                        {/* Campo de observação livre */}
                        <input
                          type="text"
                          value={cartItem.notes || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCart((prev) =>
                              prev.map((c) => (c.id === cartItem.id ? { ...c, notes: val } : c))
                            );
                          }}
                          placeholder="Outra observação personalizada..."
                          className="w-full text-[11px] px-2 py-1 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* RODAPÉ DO CARRINHO */}
              <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
                <div className="flex items-center justify-between text-stone-900 font-black text-base">
                  <span>Total da Comanda:</span>
                  <span className="text-lg text-amber-700 font-heading">{formatBRL(cartSubtotal)}</span>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={printKitchenTicket}
                    onChange={(e) => setPrintKitchenTicket(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-stone-300"
                  />
                  <span>Imprimir cupom térmico na cozinha</span>
                </label>

                {/* BOTÃO PRINCIPAL: ENVIAR PARA A COZINHA */}
                <button
                  type="button"
                  onClick={handleSendToKitchen}
                  disabled={cart.length === 0}
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    cart.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.01] active:scale-95'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {selectedExistingOrderId
                      ? `ADICIONAR À COMANDA DE ${customerName.toUpperCase()}`
                      : 'ENVIAR PARA A COZINHA (KDS) 🚀'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: COMANDAS ABERTAS NO SALÃO / BALCÃO */}
      {activeTab === 'comandas_abertas' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>{openOrders.length} comandas abertas</strong> no momento. Você pode adicionar mais itens à conta da pessoa ou fechá-la quando ela pedir a conta.
              </span>
            </div>
          </div>

          {openOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500 space-y-3">
              <User className="w-12 h-12 mx-auto text-stone-300" />
              <h3 className="font-bold text-base text-stone-800">Nenhuma comanda aberta agora</h3>
              <p className="text-xs">Todos os clientes foram atendidos ou as contas foram fechadas.</p>
              <button
                onClick={() => setActiveTab('novo_pedido')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Abrir Nova Comanda</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {openOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    {/* Header da comanda */}
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-black font-heading text-stone-900">
                            #{ord.orderNumber}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            {ord.status === 'novo' && 'Recebido'}
                            {ord.status === 'em_preparo' && 'Na Fritadeira 🔥'}
                            {ord.status === 'pronto' && 'Pronto na Mesa ✅'}
                          </span>
                        </div>
                        <h4 className="font-black text-sm text-stone-900 mt-1 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-amber-600" />
                          <span>{ord.customerName}</span>
                        </h4>
                        <div className="text-[10px] text-stone-500">
                          {formatDateTime(ord.createdAt)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-medium text-stone-500">Total</div>
                        <div className="font-black text-base text-amber-700">
                          {formatBRL(ord.total)}
                        </div>
                      </div>
                    </div>

                    {/* Itens já pedidos */}
                    <div className="py-2 space-y-1 max-h-36 overflow-y-auto">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-stone-800">
                            <strong>{it.quantity}x</strong> {it.menuItem.name}
                          </span>
                          <span className="text-stone-500 font-medium">
                            {formatBRL(it.totalPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ações da comanda */}
                  <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectExistingCustomer(ord)}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pedir Mais</span>
                      </button>

                      <button
                        onClick={() => onPrintReceipt(ord)}
                        className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Imprimir Cupom / Pré-Conta"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => setClosingOrder(ord)}
                      className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      <span>Fechar Conta & Receber</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL PARA FECHAR CONTA & RECEBER PAGAMENTO */}
      {closingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto">
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  Fechar Conta: {closingOrder.customerName}
                </h3>
                <p className="text-xs text-stone-500">Pedido #{closingOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setClosingOrder(null)}
                className="p-1 rounded-full hover:bg-stone-200 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-amber-800">Valor a Pagar</div>
                  <div className="text-2xl font-black font-heading text-amber-900">
                    {formatBRL(closingOrder.total)}
                  </div>
                </div>
                <div className="text-right text-xs text-stone-600">
                  {closingOrder.items.length} itens consumidos
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Forma de Pagamento:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'pix', label: 'PIX (Instantâneo)', icon: QrCode },
                    { id: 'dinheiro', label: 'Dinheiro', icon: DollarSign },
                    { id: 'cartao_credito', label: 'Cartão Crédito', icon: CreditCard },
                    { id: 'cartao_debito', label: 'Cartão Débito', icon: CreditCard },
                  ].map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setClosePaymentMethod(p.id as PaymentMethod)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          closePaymentMethod === p.id
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cálculo de Troco se Dinheiro */}
              {closePaymentMethod === 'dinheiro' && (
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                  <label className="text-xs font-bold text-stone-700">Valor Recebido em Dinheiro:</label>
                  <input
                    type="number"
                    step="0.5"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    placeholder="Ex: 50.00"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 font-bold"
                  />
                  {parseFloat(cashGiven) > closingOrder.total && (
                    <div className="text-xs font-bold text-emerald-700">
                      Troco a devolver: {formatBRL(parseFloat(cashGiven) - closingOrder.total)}
                    </div>
                  )}
                </div>
              )}

              {/* Chave Pix se Pix */}
              {closePaymentMethod === 'pix' && settings.pixKey && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-700" />
                    <span>Chave PIX da Pastelaria:</span>
                  </div>
                  <div className="font-mono text-xs font-bold bg-white p-2 rounded-lg border border-emerald-300 select-all">
                    {settings.pixKey}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex gap-2">
              <button
                onClick={handleConfirmCloseAccount}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Recebimento & Finalizar</span>
              </button>
              <button
                onClick={() => setClosingOrder(null)}
                className="px-4 py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
