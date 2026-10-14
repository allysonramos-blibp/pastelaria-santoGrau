import React from 'react';
import { Order, StoreSettings } from '../types';
import { formatBRL, formatDateTime } from '../utils/format';
import { Clock, Flame, CheckCircle, Bike, ArrowLeft, MessageSquare } from 'lucide-react';

interface CustomerOrderTrackerProps {
  order: Order;
  settings: StoreSettings;
  onBackToMenu: () => void;
}

export const CustomerOrderTracker: React.FC<CustomerOrderTrackerProps> = ({
  order,
  settings,
  onBackToMenu,
}) => {
  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'novo':
        return 0;
      case 'em_preparo':
        return 1;
      case 'pronto':
        return 2;
      case 'entregue':
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order.status);

  const steps = [
    {
      title: 'Pedido Recebido',
      desc: 'Registrado no caixa da pastelaria',
      icon: Clock,
    },
    {
      title: 'Na Fritadeira',
      desc: 'Massa recheada e fritando sequinha',
      icon: Flame,
    },
    {
      title: order.orderType === 'delivery' ? 'Saiu para Entrega' : 'Pronto para Retirada',
      desc: order.orderType === 'delivery' ? 'Motoboy a caminho' : 'Quentinho no balcão/mesa',
      icon: order.orderType === 'delivery' ? Bike : CheckCircle,
    },
    {
      title: 'Concluído',
      desc: 'Bom apetite!',
      icon: CheckCircle,
    },
  ];

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      `Olá ${settings.storeName}! Gostaria de informações sobre meu Pedido #${order.orderNumber} (${order.customerName}).`
    );
    window.open(`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <button
        type="button"
        onClick={onBackToMenu}
        className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Cardápio</span>
      </button>

      {/* Main Status Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-amber-700">
              Acompanhamento ao Vivo
            </div>
            <h1 className="text-2xl font-bold font-heading text-stone-900 mt-0.5">
              Pedido #{order.orderNumber}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Realizado em {formatDateTime(order.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppContact}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Falar com a Pastelaria</span>
            </button>
          </div>
        </div>

        {/* Dynamic Status Progress bar */}
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-amber-600 text-white ring-4 ring-amber-100 shadow-md scale-105'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-stone-800 line-clamp-1">
                    {s.title}
                  </div>
                  <div className="hidden sm:block text-[11px] text-stone-500 mt-0.5">
                    {s.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Status banner */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-center gap-3">
            <Flame className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Status Atual
              </div>
              <div className="text-sm font-semibold">
                {order.status === 'novo' && 'Pedido registrado! A cozinha já está separando os ingredientes.'}
                {order.status === 'em_preparo' && 'Na fritadeira! Nossos pastéis são fritos na hora no óleo limpinho.'}
                {order.status === 'pronto' && (order.orderType === 'delivery' ? 'Saiu para entrega! O motoboy está a caminho do seu endereço.' : 'Pronto! Já pode retirar seu pastel quentinho no balcão.')}
                {order.status === 'entregue' && 'Pedido concluído com sucesso. Bom apetite!'}
                {order.status === 'cancelado' && 'Este pedido foi cancelado pela pastelaria.'}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details List */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <h3 className="text-sm font-bold text-stone-900">Resumo dos Itens</h3>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start text-sm">
                <div>
                  <span className="font-semibold text-stone-900">
                    {item.quantity}x {item.menuItem.name}
                  </span>
                  {item.selectedSize && (
                    <span className="text-stone-500 text-xs ml-1">
                      ({item.selectedSize.name})
                    </span>
                  )}
                  {item.extras && item.extras.length > 0 && (
                    <div className="text-xs text-stone-500">
                      ↳ {item.extras.map((e) => e.name).join(', ')}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-xs italic text-stone-500">
                      ↳ Obs: {item.notes}
                    </div>
                  )}
                </div>
                <span className="font-semibold tabular-nums text-stone-800">
                  {formatBRL(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-100 space-y-1 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="tabular-nums">{formatBRL(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Taxa de entrega:</span>
                <span className="tabular-nums">{formatBRL(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-stone-900 pt-1 border-t border-stone-100">
              <span>Total:</span>
              <span className="text-amber-700 tabular-nums">{formatBRL(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
