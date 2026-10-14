import React, { useState, useId } from 'react';
import { CartItem, Order, OrderType, PaymentMethod, StoreSettings } from '../types';
import { formatBRL, buildWhatsAppOrderMessage } from '../utils/format';
import { generatePixPayload } from '../utils/pix';
import { 
  X, Trash2, Plus, Minus, ArrowRight, Copy, Check, Bike, ShoppingBag, 
  UtensilsCrossed, CheckCircle2, QrCode, CreditCard, Banknote, 
  Smartphone, ShieldCheck, Clock, AlertCircle, Sparkles
} from 'lucide-react';

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
  const [cardBrandPreference, setCardBrandPreference] = useState<string>('visa');
  const [orderNotes, setOrderNotes] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [pixPaidSimulated, setPixPaidSimulated] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string>('');

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const deliveryFee = orderType === 'delivery' ? settings.defaultDeliveryFee : 0;
  const total = subtotal + deliveryFee;

  // Generate real standard PIX EMV Code (Copia e Cola)
  const activePixKey = settings.pixKey || '11999998888';
  const pixCopiaECola = generatePixPayload({
    pixKey: activePixKey,
    merchantName: settings.storeName || 'SANTO GRAU',
    merchantCity: 'SAO PAULO',
    amount: total > 0 ? total : 10.0,
    txId: `SANTOGRAU${Math.floor(1000 + Math.random() * 9000)}`,
  });

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopiaECola);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleFinalizeOrder = () => {
    setValidationError(null);
    if (!customerName.trim()) {
      setValidationError('Por favor, informe seu nome.');
      return;
    }
    if (!customerPhone.trim()) {
      setValidationError('Por favor, informe seu WhatsApp para envio do status do pedido.');
      return;
    }
    if (orderType === 'delivery' && (!street.trim() || !number.trim() || !neighborhood.trim())) {
      setValidationError('Por favor, preencha rua, número e bairro para a entrega.');
      return;
    }
    if (orderType === 'mesa' && !tableNumber.trim()) {
      setValidationError('Por favor, informe o número da mesa.');
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

    // Build WhatsApp URL
    const msg = buildWhatsAppOrderMessage(newOrder, settings);
    const cleanPhone = settings.whatsappNumber.replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    setWhatsAppUrl(waUrl);

    setStep('success');
    onClearCart();
  };

  // Change amount calculation helper
  const parsedChange = parseFloat(needChangeFor) || 0;
  const changeToReturn = parsedChange > total ? parsedChange - total : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Step Progress */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-gradient-to-r from-stone-50 via-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  {step === 'cart' && 'Passo 1 de 2'}
                  {step === 'checkout' && 'Passo 2 de 2'}
                  {step === 'success' && 'Concluído'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-heading text-stone-900 mt-0.5">
                {step === 'cart' && 'Seu Carrinho de Pastéis'}
                {step === 'checkout' && 'Entrega & Pagamento'}
                {step === 'success' && 'Pedido Confirmado! 🎉'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper bar */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className={`h-1.5 rounded-full transition-colors ${step === 'cart' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <div className={`h-1.5 rounded-full transition-colors ${step === 'checkout' ? 'bg-amber-500' : step === 'success' ? 'bg-emerald-500' : 'bg-stone-200'}`} />
          </div>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: CART VIEW */}
          {step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="text-center py-14 text-stone-500 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="text-base font-bold text-stone-800">Seu carrinho está vazio.</p>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Escolha seus pastéis crocantes e bebidas refrescantes no cardápio para começar!
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 shadow-sm transition-all cursor-pointer"
                  >
                    Explorar Cardápio
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-white hover:border-amber-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-sm sm:text-base">
                              {item.menuItem.name}
                            </span>
                            {item.selectedSize && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                                {item.selectedSize.name}
                              </span>
                            )}
                          </div>

                          {item.extras && item.extras.length > 0 && (
                            <div className="text-xs text-stone-500 mt-1 flex flex-wrap gap-1">
                              {item.extras.map((e) => (
                                <span key={e.id} className="text-[11px] bg-amber-100/70 text-amber-900 px-1.5 py-0.5 rounded">
                                  +{e.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.notes && (
                            <div className="text-xs italic text-stone-500 mt-1">
                              Obs: {item.notes}
                            </div>
                          )}

                          <div className="text-xs text-amber-700 font-bold tabular-nums mt-1">
                            {formatBRL(item.unitPrice)} unidade
                          </div>
                        </div>

                        {/* Stepper + Delete + Total */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                          <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl p-1 shadow-xs">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="p-1 rounded-lg text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-1 rounded-lg text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="font-black text-sm text-stone-900 tabular-nums min-w-[75px] text-right font-heading">
                            {formatBRL(item.totalPrice)}
                          </span>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remover item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Type Selection in Cart */}
                  <div className="pt-2 space-y-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Modalidade do Pedido
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderType('delivery')}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                          orderType === 'delivery'
                            ? 'border-amber-600 bg-amber-50/80 text-amber-950 font-bold shadow-xs'
                            : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <Bike className="w-5 h-5 mb-1.5 text-amber-600" />
                        <span>Delivery</span>
                        <span className="text-[10px] text-stone-500 font-normal">Na sua porta</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrderType('retirada')}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                          orderType === 'retirada'
                            ? 'border-amber-600 bg-amber-50/80 text-amber-950 font-bold shadow-xs'
                            : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <ShoppingBag className="w-5 h-5 mb-1.5 text-amber-600" />
                        <span>Retirada</span>
                        <span className="text-[10px] text-stone-500 font-normal">Sem taxa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrderType('mesa')}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                          orderType === 'mesa'
                            ? 'border-amber-600 bg-amber-50/80 text-amber-950 font-bold shadow-xs'
                            : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <UtensilsCrossed className="w-5 h-5 mb-1.5 text-amber-600" />
                        <span>Mesa / Local</span>
                        <span className="text-[10px] text-stone-500 font-normal">Comer aqui</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-stone-50 rounded-2xl p-4 space-y-2 text-sm border border-stone-200">
                    <div className="flex justify-between text-stone-600 text-xs">
                      <span>Subtotal dos itens</span>
                      <span className="font-semibold tabular-nums">{formatBRL(subtotal)}</span>
                    </div>
                    {orderType === 'delivery' && (
                      <div className="flex justify-between text-stone-600 text-xs">
                        <span>Taxa de entrega moto</span>
                        <span className="font-semibold tabular-nums">{formatBRL(deliveryFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-900 font-black pt-2.5 border-t border-stone-200 text-base">
                      <span>Total do Pedido</span>
                      <span className="text-amber-700 tabular-nums font-heading">{formatBRL(total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT DETAILS & MODERN PAYMENT */}
          {step === 'checkout' && (
            <div className="space-y-6">
              {validationError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Customer Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">1</span>
                  <h3 className="text-sm font-bold text-stone-900">Seus Dados de Contato</h3>
                </div>
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
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      WhatsApp para Atualizações *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(11) 98888-7777"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery / Table location */}
              {orderType === 'delivery' && (
                <div className="space-y-3 pt-4 border-t border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">2</span>
                    <h3 className="text-sm font-bold text-stone-900">Endereço de Entrega</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-stone-700 mb-1">Rua / Avenida *</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Ex: Av. Brasil"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Número *</label>
                      <input
                        type="text"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="123"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Complemento</label>
                      <input
                        type="text"
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        placeholder="Apto 12, Bloco C"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Ponto de Referência</label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Ex: Portão preto em frente à padaria..."
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {orderType === 'mesa' && (
                <div className="space-y-3 pt-4 border-t border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">2</span>
                    <h3 className="text-sm font-bold text-stone-900">Identificação da Mesa</h3>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Número da Mesa *</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Ex: Mesa 04 ou Balcão"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* PAYMENT SECTION - ENHANCED & MODERN */}
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">3</span>
                    <h3 className="text-sm font-bold text-stone-900">Forma de Pagamento</h3>
                  </div>
                  <span className="text-xs text-stone-400 font-medium">100% Seguro</span>
                </div>

                {/* Modern Payment Selector Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* PIX */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`relative p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'pix'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[9px] font-bold uppercase tracking-wider">
                      Rápido
                    </span>
                    <QrCode className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold">PIX</span>
                    <span className="text-[10px] text-stone-500">QR Code</span>
                  </button>

                  {/* Cartão de Crédito */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cartao_credito')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'cartao_credito'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-bold">Crédito</span>
                    <span className="text-[10px] text-stone-500">Maquininha</span>
                  </button>

                  {/* Cartão de Débito */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cartao_debito')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'cartao_debito'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-bold">Débito</span>
                    <span className="text-[10px] text-stone-500">Maquininha</span>
                  </button>

                  {/* Dinheiro */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('dinheiro')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'dinheiro'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-bold">Dinheiro</span>
                    <span className="text-[10px] text-stone-500">Com troco</span>
                  </button>
                </div>

                {/* Additional option: Vale Refeição */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-stone-700">Pagar com Vale Refeição (VR / Pluxee / Alelo / Ticket)?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod(paymentMethod === 'vale_refeicao' ? 'pix' : 'vale_refeicao')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                      paymentMethod === 'vale_refeicao'
                        ? 'bg-purple-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {paymentMethod === 'vale_refeicao' ? 'Selecionado' : 'Selecionar Vale'}
                  </button>
                </div>

                {/* EXPANDED PAYMENT METHOD PANELS */}

                {/* 1. PIX DETAIL BOX */}
                {paymentMethod === 'pix' && (
                  <div className="p-4 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-2 border-emerald-300 rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          PIX
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-950">PIX Imediato & Sem Taxa</div>
                          <div className="text-[11px] text-emerald-700">Chave: {activePixKey}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-stone-500">Valor exato:</div>
                        <div className="text-base font-black text-emerald-800 font-heading tabular-nums">{formatBRL(total)}</div>
                      </div>
                    </div>

                    {/* Copia e Cola Code Box */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                        Código PIX Copia e Cola Oficial:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={pixCopiaECola}
                          className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-emerald-200 rounded-xl text-stone-700 truncate select-all focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs ${
                            copiedPix
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-900 text-white hover:bg-stone-800'
                          }`}
                        >
                          {copiedPix ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Código</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-100/50 text-emerald-950 text-[11px] flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>
                        Você pode pagar agora pelo seu banco e enviar o comprovante com 1 clique no WhatsApp ao finalizar o pedido!
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. CARD DETAIL BOX */}
                {(paymentMethod === 'cartao_credito' || paymentMethod === 'cartao_debito') && (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                      <span>Bandeiras aceitas na Maquininha Sem Fio:</span>
                      <span className="text-[11px] text-amber-700">Aproximação (NFC) / Chip</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {['Visa', 'Mastercard', 'Elo', 'Hipercard', 'Amex', 'Apple Pay', 'Google Pay'].map((brand) => (
                        <span key={brand} className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 shadow-2xs">
                          {brand}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-stone-500">
                      {orderType === 'delivery' 
                        ? 'O entregador levará a maquininha até você.' 
                        : 'O pagamento será realizado diretamente na pastelaria.'}
                    </p>
                  </div>
                )}

                {/* 3. CASH CHANGE BOX */}
                {paymentMethod === 'dinheiro' && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                    <label className="block text-xs font-bold text-amber-950">
                      Precisa de troco para quanto?
                    </label>

                    {/* Quick change presets */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setNeedChangeFor('')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                          needChangeFor === ''
                            ? 'bg-amber-600 text-white'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        Não preciso de troco
                      </button>
                      {[20, 50, 100].map((val) => {
                        if (val < total) return null;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setNeedChangeFor(val.toString())}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                              needChangeFor === val.toString()
                                ? 'bg-amber-600 text-white'
                                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            Troco para R$ {val}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-600 font-medium">Outro valor: R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={needChangeFor}
                        onChange={(e) => setNeedChangeFor(e.target.value)}
                        placeholder="Ex: 50.00"
                        className="w-32 px-3 py-1.5 text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {parsedChange > total && (
                      <div className="text-xs font-bold text-amber-900 bg-amber-100/70 p-2 rounded-lg">
                        Seu troco será de: <span className="tabular-nums font-black">{formatBRL(changeToReturn)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. VALE REFEICAO BOX */}
                {paymentMethod === 'vale_refeicao' && (
                  <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-purple-950">Vales aceitos na Maquininha:</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['Pluxee (Sodexo)', 'VR Refeição', 'Alelo', 'Ticket Restaurante', 'Ben Visa Vale'].map((v) => (
                        <span key={v} className="px-2.5 py-1 bg-white border border-purple-200 rounded-lg text-xs font-semibold text-purple-900">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* General Order Notes */}
              <div className="pt-4 border-t border-stone-200">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Observações Gerais (Opcional)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ex: Tocar interfone, embalar separado, talheres descartáveis..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Total review */}
              <div className="bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-200 rounded-2xl p-4 flex justify-between items-center text-stone-900">
                <div>
                  <div className="text-xs font-medium text-stone-600">Total a pagar:</div>
                  <div className="text-2xl font-black font-heading text-amber-800 tabular-nums">{formatBRL(total)}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-950">
                    {orderType === 'delivery' ? `+ ${formatBRL(deliveryFee)} entrega` : 'Sem taxa'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && completedOrder && (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  Pedido #{completedOrder.orderNumber}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black font-heading text-stone-900 mt-2">
                  Pedido Recebido na Cozinha!
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-md mx-auto">
                  A fritadeira já está sendo aquecida. O WhatsApp foi aberto para enviar a comanda formatada diretamente para o atendente.
                </p>
              </div>

              {/* PIX Quick Pay in Success Screen */}
              {completedOrder.paymentMethod === 'pix' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl max-w-md mx-auto text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950">Pagar com PIX:</span>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar Chave/Código'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs bg-white p-2.5 rounded-xl border border-emerald-200 text-stone-700 truncate select-all">
                    {pixCopiaECola}
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Chave PIX: <strong>{activePixKey}</strong> ({settings.pixKeyType})
                  </p>
                </div>
              )}

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-left max-w-sm mx-auto space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Cliente:</span>
                  <span className="font-bold text-stone-900">{completedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Modalidade:</span>
                  <span className="font-bold text-stone-900 uppercase">{completedOrder.orderType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Pagamento:</span>
                  <span className="font-bold text-stone-900 uppercase">{completedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-bold">
                  <span className="text-stone-900">Total:</span>
                  <span className="text-amber-700 tabular-nums font-heading">{formatBRL(completedOrder.total)}</span>
                </div>
              </div>

              {whatsAppUrl && (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all active:scale-98 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Abrir Pedido no WhatsApp da Pastelaria</span>
                </a>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewOrderTracking(completedOrder.id);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm cursor-pointer shadow-md transition-all active:scale-95"
                >
                  Acompanhar Status ao Vivo
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-sm cursor-pointer transition-all"
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
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs sm:text-sm font-semibold cursor-pointer transition"
                >
                  Continuar Escolhendo
                </button>
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <span>Avançar para Entrega</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs sm:text-sm font-semibold cursor-pointer transition"
                >
                  Voltar ao Carrinho
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeOrder}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
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
