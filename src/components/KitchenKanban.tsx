import React, { useState } from 'react';
import { Order, OrderStatus, OrderType, StoreSettings } from '../types';
import { formatBRL, formatTimeAgo, buildWhatsAppNotificationMessage } from '../utils/format';
import { playChimeSound } from '../utils/sound';
import { Flame, Clock, CheckCircle2, Printer, MessageSquare, Volume2, Search, ArrowRight, XCircle } from 'lucide-react';

interface KitchenKanbanProps {
  orders: Order[];
  settings: StoreSettings;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onSelectPrintOrder: (order: Order) => void;
}

export const KitchenKanban: React.FC<KitchenKanbanProps> = ({
  orders,
  settings,
  onUpdateStatus,
  onSelectPrintOrder,
}) => {
  const [filterType, setFilterType] = useState<OrderType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileActiveStage, setMobileActiveStage] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = orders.filter((order) => {
    if (filterType !== 'all' && order.orderType !== filterType) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNum = order.orderNumber.toString().includes(term);
      const matchName = order.customerName.toLowerCase().includes(term);
      if (!matchNum && !matchName) return false;
    }
    return true;
  });

  const columns: { id: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }>; countColor: string }[] = [
    { id: 'novo', label: 'Novos Pedidos', icon: Clock, countColor: 'text-amber-800' },
    { id: 'em_preparo', label: 'Na Fritadeira', icon: Flame, countColor: 'text-orange-800' },
    { id: 'pronto', label: 'Prontos para Saída', icon: CheckCircle2, countColor: 'text-emerald-800' },
    { id: 'entregue', label: 'Concluídos Hoje', icon: CheckCircle2, countColor: 'text-stone-600' },
  ];

  const handlePrint = (order: Order) => {
    onSelectPrintOrder(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleNotifyWhatsApp = (order: Order, status: OrderStatus) => {
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const msg = buildWhatsAppNotificationMessage(order, status, settings.storeName);
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const advanceStatus = (order: Order) => {
    let nextStatus: OrderStatus = 'em_preparo';
    if (order.status === 'novo') nextStatus = 'em_preparo';
    else if (order.status === 'em_preparo') nextStatus = 'pronto';
    else if (order.status === 'pronto') nextStatus = 'entregue';
    
    onUpdateStatus(order.id, nextStatus);
    if (settings.soundAlertsEnabled) {
      playChimeSound();
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Filter and Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setFilterType('delivery')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterType === 'delivery' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Delivery ({orders.filter(o => o.orderType === 'delivery').length})
            </button>
            <button
              onClick={() => setFilterType('mesa')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterType === 'mesa' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Mesas ({orders.filter(o => o.orderType === 'mesa').length})
            </button>
            <button
              onClick={() => setFilterType('retirada')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterType === 'retirada' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Balcão ({orders.filter(o => o.orderType === 'retirada').length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar pedido ou cliente..."
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={() => playChimeSound()}
            title="Testar som de notificação da cozinha"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Som</span>
          </button>
        </div>
      </div>

      {/* Mobile Stage Selector Tabs (< md) */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
        <button
          type="button"
          onClick={() => setMobileActiveStage('all')}
          className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
            mobileActiveStage === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          Todas ({filteredOrders.length})
        </button>
        {columns.map((c) => {
          const count = filteredOrders.filter((o) => o.status === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setMobileActiveStage(c.id)}
              className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
                mobileActiveStage === c.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              {c.label} ({count})
            </button>
          );
        })}
      </div>

      {/* 4-Column Kitchen Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colOrders = filteredOrders.filter((o) => o.status === col.id);
          const ColIcon = col.icon;
          const isHiddenOnMobile = mobileActiveStage !== 'all' && mobileActiveStage !== col.id;

          return (
            <div
              key={col.id}
              className={`bg-stone-100/80 rounded-2xl p-3 border border-stone-200 flex flex-col min-h-[220px] md:min-h-[500px] ${
                isHiddenOnMobile ? 'hidden md:flex' : 'flex'
              }`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-200/70 px-1">
                <div className="flex items-center gap-2">
                  <ColIcon className="w-4 h-4 text-stone-700" />
                  <span className="font-bold text-stone-900 text-sm">{col.label}</span>
                </div>
                <span className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-md bg-white border border-stone-200 ${col.countColor}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Order Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colOrders.length === 0 ? (
                  <div className="text-center py-12 text-stone-400 text-xs">
                    Nenhum pedido nesta etapa
                  </div>
                ) : (
                  colOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-xs hover:shadow-sm transition-all space-y-3"
                    >
                      {/* Top card row */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-black font-heading text-stone-900">
                              #{order.orderNumber}
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                              {order.orderType === 'delivery' && '🛵 Delivery'}
                              {order.orderType === 'mesa' && `🍽️ ${order.tableNumber || 'Mesa'}`}
                              {order.orderType === 'retirada' && '🛍️ Balcão'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 bg-amber-100/70 px-2 py-0.5 rounded-lg mt-1 border border-amber-300">
                            <span className="text-[10px] text-amber-800 uppercase font-bold">Cliente:</span>
                            <span className="truncate">{order.customerName}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-stone-500 tabular-nums font-medium block">
                            {formatTimeAgo(order.createdAt)}
                          </span>
                          <span className="text-xs font-bold text-amber-700 tabular-nums">
                            {formatBRL(order.total)}
                          </span>
                        </div>
                      </div>

                      {/* Items list with highlight */}
                      <div className="space-y-1.5 py-2 border-y border-stone-100 text-xs">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="leading-tight">
                            <div className="flex justify-between font-bold text-stone-900">
                              <span>
                                {item.quantity}x {item.menuItem.name}
                                {item.selectedSize && ` (${item.selectedSize.name})`}
                              </span>
                            </div>

                            {item.extras && item.extras.length > 0 && (
                              <div className="text-[11px] text-stone-600 pl-2">
                                + {item.extras.map((e) => e.name).join(', ')}
                              </div>
                            )}

                            {item.notes && (
                              <div className="text-[11px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded font-semibold mt-0.5">
                                Obs: {item.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Address preview if delivery */}
                      {order.orderType === 'delivery' && order.deliveryAddress && (
                        <div className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded-lg">
                          <span className="font-semibold text-stone-800">Endereço: </span>
                          {order.deliveryAddress.street}, {order.deliveryAddress.number} - {order.deliveryAddress.neighborhood}
                          {order.deliveryAddress.reference && ` (${order.deliveryAddress.reference})`}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handlePrint(order)}
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-xs cursor-pointer"
                            title="Imprimir comanda térmica 80mm"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleNotifyWhatsApp(order, order.status)}
                            className="p-1.5 rounded-lg border border-stone-200 text-emerald-700 hover:bg-emerald-50 text-xs cursor-pointer"
                            title="Avisar cliente no WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {order.status !== 'cancelado' && order.status !== 'entregue' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(order.id, 'cancelado')}
                              className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-red-600 hover:bg-red-50 text-xs cursor-pointer"
                              title="Cancelar pedido"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Status advance button */}
                        {order.status !== 'entregue' && order.status !== 'cancelado' && (
                          <button
                            type="button"
                            onClick={() => advanceStatus(order)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs text-white shadow-xs cursor-pointer transition-all active:scale-95 ${
                              order.status === 'novo'
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : order.status === 'em_preparo'
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-stone-800 hover:bg-stone-900'
                            }`}
                          >
                            <span>
                              {order.status === 'novo' && 'Fritar'}
                              {order.status === 'em_preparo' && 'Pronto'}
                              {order.status === 'pronto' && 'Concluir'}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
