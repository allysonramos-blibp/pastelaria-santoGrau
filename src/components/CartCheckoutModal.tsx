import React, { useState } from 'react';
import { CartItem, Order, OrderType, PaymentMethod, StoreSettings } from '../types';
import { formatBRL, buildWhatsAppOrderMessage } from '../utils/format';
import { X, Trash2, Plus, Minus, ArrowRight, Copy, Check, Bike, ShoppingBag, UtensilsCrossed, CheckCircle2 } from 'lucide-react';

interface CartCheckoutModalProps {
  cart: CartItem[];
  settings: StoreSettings;
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onCreateOrder: (order: Order) => void;
  onViewOrderTracking: (orderId: string) => void;
}

export const CartCheckoutModal: React.FC<CartCheckoutModalProps> = ({
  cart,
  settings,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCreateOrder,
  onViewOrderTracking,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  
  // Delivery address
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [needChangeFor, setNeedChangeFor] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const deliveryFee = orderType === 'delivery' ? settings.defaultDeliveryFee : 0;
  const total = subtotal + deliveryFee;

  const handleCopyPix = () => {
    if (settings.pixKey) {
      navigator.clipboard.writeText(settings.pixKey);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  const handleFinalizeOrder = () => {
    if (!customerName.trim()) {
      alert('Por favor, informe seu nome.');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Por favor, informe seu WhatsApp para contato.');
      return;
    }
    if (orderType === 'delivery' && (!street.trim() || !number.trim() || !neighborhood.trim())) {
      alert('Por favor, preencha rua, número e bairro para entrega.');
      return;
    }
    if (orderType === 'mesa' && !tableNumber.trim()) {
      alert('Por favor, informe o número da mesa.');
      return;
    }

    const orderNumber = Math.floor(100 + Math.random() * 900);
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim().replace(/\D/g, ''),
      orderType,
      tableNumber: orderType === 'mesa' ? tableNumber.trim() : undefined,
      deliveryAddress: orderType === 'delivery' ? {
        street: street.trim(),
        number: number.trim(),
        neighborhood: neighborhood.trim(),
        complement: complement.trim() || undefined,
        reference: reference.trim() || undefined,
      } : undefined,
      paymentMethod,
      needChangeFor: paymentMethod === 'dinheiro' && needChangeFor ? parseFloat(needChangeFor) : undefined,
      items: [...cart],
      subtotal,
      deliveryFee,
      total,
      status: 'novo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: orderNotes.trim() || undefined,
    };

    onCreateOrder(newOrder);
    setCompletedOrder(newOrder);
    setStep('success');

    // Build WhatsApp URL and open in new tab
    const msg = buildWhatsAppOrderMessage(newOrder, settings);
    const cleanPhone = settings.whatsappNumber.replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    onClearCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-stone-900">
              {step === 'cart' && 'Seu Carrinho de Pastéis'}
              {step === 'checkout' && 'Finalizar Pedido'}
              {step === 'success' && 'Pedido Confirmado! 🎉'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {step === 'cart' && `${cart.length} item(s) selecionado(s)`}
              {step === 'checkout' && 'Informe os dados para preparo e entrega'}
              {step === 'success' && 'Enviado com sucesso para a pastelaria'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: CART VIEW */}
          {step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <p className="text-base font-medium">Seu carrinho está vazio.</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Escolha seus pastéis crocantes no cardápio para começar!
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 cursor-pointer"
                  >
                    Ver Cardápio
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900 text-sm sm:text-base">
                            {item.menuItem.name}
                          </span>
                          {item.selectedSize && (
                            <span className="text-xs text-stone-500 font-medium">
                              ({item.selectedSize.name})
                            </span>
                          )}
                        </div>

                        {item.extras && item.extras.length > 0 && (
                          <div className="text-xs text-stone-500 mt-1">
                            + {item.extras.map((e) => e.name).join(', ')}
                          </div>
                        )}

                        {item.notes && (
                          <div className="text-xs italic text-stone-500 mt-0.5">
                            Obs: {item.notes}
                          </div>
                        )}

                        <div className="text-xs text-amber-700 font-bold tabular-nums mt-1">
                          {formatBRL(item.unitPrice)} cada
                        </div>
                      </div>

                      {/* Stepper + Delete + Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/60">
                        <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded text-stone-600 hover:bg-stone-100 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded text-stone-600 hover:bg-stone-100 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-bold text-sm text-stone-900 tabular-nums min-w-[70px] text-right">
                          {formatBRL(item.totalPrice)}
                        </span>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Order Type Preview in Cart */}
                  <div className="pt-4 border-t border-stone-200 space-y-2">
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                      Como deseja receber?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderType('delivery')}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                          orderType === 'delivery'
                            ? 'border-amber-600 bg-amber-50 text-amber-950 font-semibold'
                            : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <Bike className="w-4 h-4 mb-1 text-amber-600" />
                        <span>Entrega (Delivery)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrderType('retirada')}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                          orderType === 'retirada'
                            ? 'border-amber-600 bg-amber-50 text-amber-950 font-semibold'
                            : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4 mb-1 text-amber-600" />
                        <span>Retirada Balcão</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrderType('mesa')}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                          orderType === 'mesa'
                            ? 'border-amber-600 bg-amber-50 text-amber-950 font-semibold'
                            : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <UtensilsCrossed className="w-4 h-4 mb-1 text-amber-600" />
                        <span>Comer no Local</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-stone-50 rounded-xl p-3.5 space-y-1.5 text-sm">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal dos itens</span>
                      <span className="font-semibold tabular-nums">{formatBRL(subtotal)}</span>
                    </div>
                    {orderType === 'delivery' && (
                      <div className="flex justify-between text-stone-600">
                        <span>Taxa de entrega</span>
                        <span className="font-semibold tabular-nums">{formatBRL(deliveryFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-900 font-bold pt-2 border-t border-stone-200 text-base">
                      <span>Total</span>
                      <span className="text-amber-700 tabular-nums">{formatBRL(total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT DETAILS */}
          {step === 'checkout' && (
            <div className="space-y-4">
              {/* Customer Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-stone-900">1. Seus Dados</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Seu Nome *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Mariana Silva"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      WhatsApp para contato *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(11) 98888-7777"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery / Table location */}
              {orderType === 'delivery' && (
                <div className="space-y-3 pt-3 border-t border-stone-200">
                  <h3 className="text-sm font-bold text-stone-900">2. Endereço de Entrega</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-stone-700 mb-1">Rua / Avenida *</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Ex: Av. Brasil"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Número *</label>
                      <input
                        type="text"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Bairro *</label>
                      <input
                        type="text"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="Ex: Centro"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Complemento</label>
                      <input
                        type="text"
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        placeholder="Apto 12, Bloco C"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Ponto de Referência</label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Ex: Em frente à farmácia..."
                      className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {orderType === 'mesa' && (
                <div className="space-y-2 pt-3 border-t border-stone-200">
                  <h3 className="text-sm font-bold text-stone-900">2. Identificação da Mesa</h3>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Número da Mesa *</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Ex: Mesa 04"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-3 pt-3 border-t border-stone-200">
                <h3 className="text-sm font-bold text-stone-900">3. Forma de Pagamento</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer text-center ${
                      paymentMethod === 'pix'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    PIX
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cartao_credito')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer text-center ${
                      paymentMethod === 'cartao_credito'
                        ? 'border-amber-600 bg-amber-50 text-amber-950'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    Crédito
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cartao_debito')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer text-center ${
                      paymentMethod === 'cartao_debito'
                        ? 'border-amber-600 bg-amber-50 text-amber-950'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    Débito
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('dinheiro')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer text-center ${
                      paymentMethod === 'dinheiro'
                        ? 'border-amber-600 bg-amber-50 text-amber-950'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    Dinheiro
                  </button>
                </div>

                {/* PIX Key Box */}
                {paymentMethod === 'pix' && settings.pixKey && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">
                        Chave PIX da Pastelaria:
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                      >
                        {copiedPix ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Chave</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-xs text-emerald-950 bg-white/80 p-2 rounded-lg border border-emerald-100 select-all">
                      {settings.pixKey}
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Você pode pagar agora ou enviar o comprovante no WhatsApp ao finalizar!
                    </p>
                  </div>
                )}

                {/* Cash change */}
                {paymentMethod === 'dinheiro' && (
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Precisa de troco para quanto? (Deixe em branco se tiver trocado)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={needChangeFor}
                      onChange={(e) => setNeedChangeFor(e.target.value)}
                      placeholder="Ex: 50.00"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* General Order Notes */}
              <div className="pt-3 border-t border-stone-200">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Observações Gerais do Pedido
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ex: Campainha não funciona, talheres descartáveis..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Total review */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex justify-between items-center text-amber-950">
                <div>
                  <div className="text-xs font-medium text-amber-800">Total a pagar:</div>
                  <div className="text-xl font-bold font-heading tabular-nums">{formatBRL(total)}</div>
                </div>
                <div className="text-xs text-amber-800 text-right">
                  {orderType === 'delivery' ? 'Com taxa de entrega' : 'Sem taxa de entrega'}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && completedOrder && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading text-stone-900">
                  Pedido #{completedOrder.orderNumber} Enviado!
                </h3>
                <p className="text-sm text-stone-600 mt-1 max-w-md mx-auto">
                  Seu pedido foi registrado no sistema da pastelaria e a mensagem formatada foi gerada para o WhatsApp.
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-left max-w-sm mx-auto space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Cliente:</span>
                  <span className="font-semibold text-stone-900">{completedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Tipo:</span>
                  <span className="font-semibold text-stone-900 uppercase">{completedOrder.orderType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Itens:</span>
                  <span className="font-semibold text-stone-900">{completedOrder.items.length} itens</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-1.5 text-sm">
                  <span className="font-bold text-stone-900">Total:</span>
                  <span className="font-bold text-amber-700 tabular-nums">{formatBRL(completedOrder.total)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewOrderTracking(completedOrder.id);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm cursor-pointer shadow-sm"
                >
                  Acompanhar Status ao Vivo
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-medium text-sm cursor-pointer"
                >
                  Voltar ao Cardápio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        {step !== 'success' && cart.length > 0 && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
            {step === 'cart' ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-sm font-medium cursor-pointer"
                >
                  Continuar Escolhendo
                </button>
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  <span>Avançar para Dados</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-sm font-medium cursor-pointer"
                >
                  Voltar ao Carrinho
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeOrder}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  <span>Enviar Pedido pelo WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
