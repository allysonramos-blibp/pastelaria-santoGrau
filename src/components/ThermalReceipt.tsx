import React from 'react';
import { Order, StoreSettings } from '../types';
import { formatBRL, formatDateTime } from '../utils/format';

interface ThermalReceiptProps {
  order: Order | null;
  settings: StoreSettings;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ order, settings }) => {
  if (!order) return null;

  return (
    <div id="thermal-receipt" className="text-black font-mono text-xs leading-tight">
      <div className="text-center font-bold text-sm uppercase border-b border-black pb-2 mb-2">
        {settings.storeName}
        <div className="text-[10px] font-normal mt-0.5">{settings.address}</div>
        <div className="text-[10px] font-normal">WhatsApp: {settings.whatsappNumber}</div>
      </div>

      <div className="text-center my-2 border-b border-black pb-2">
        <div className="text-xl font-black">PEDIDO #{order.orderNumber}</div>
        <div className="text-[11px] font-bold uppercase mt-1">
          {order.orderType === 'delivery' && '🛵 ENTREGA / DELIVERY'}
          {order.orderType === 'mesa' && `🍽️ CONSUMO LOCAL - ${order.tableNumber || 'Mesa'}`}
          {order.orderType === 'retirada' && '🛍️ RETIRADA NO BALCÃO'}
        </div>
        <div className="text-[10px] text-stone-700">{formatDateTime(order.createdAt)}</div>
      </div>

      <div className="border-b border-black pb-2 mb-2 space-y-0.5">
        <div><span className="font-bold">Cliente:</span> {order.customerName}</div>
        <div><span className="font-bold">Fone:</span> {order.customerPhone}</div>
        {order.orderType === 'delivery' && order.deliveryAddress && (
          <div className="mt-1 pt-1 border-t border-dashed border-black">
            <span className="font-bold">Endereço:</span> {order.deliveryAddress.street}, {order.deliveryAddress.number}
            {order.deliveryAddress.complement && ` (${order.deliveryAddress.complement})`}
            <div>Bairro: {order.deliveryAddress.neighborhood}</div>
            {order.deliveryAddress.reference && <div>Ref: {order.deliveryAddress.reference}</div>}
          </div>
        )}
      </div>

      <div className="border-b border-black pb-2 mb-2">
        <div className="font-bold uppercase text-[11px] mb-1">ITENS DO PEDIDO:</div>
        <div className="space-y-1.5">
          {order.items.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between font-bold">
                <span>{item.quantity}x {item.menuItem.name} {item.selectedSize ? `(${item.selectedSize.name})` : ''}</span>
                <span>{formatBRL(item.totalPrice)}</span>
              </div>
              {item.extras && item.extras.length > 0 && (
                <div className="text-[10px] pl-2">
                  + {item.extras.map((e) => e.name).join(', ')}
                </div>
              )}
              {item.notes && (
                <div className="text-[10px] pl-2 font-bold italic bg-stone-200/50">
                  OBS: {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-b border-black pb-2 mb-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatBRL(order.subtotal)}</span>
        </div>
        {order.orderType === 'delivery' && (
          <div className="flex justify-between">
            <span>Taxa Entrega:</span>
            <span>{formatBRL(order.deliveryFee)}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
          <span>TOTAL:</span>
          <span>{formatBRL(order.total)}</span>
        </div>
      </div>

      <div className="border-b border-black pb-2 mb-2">
        <div><span className="font-bold">Pagamento:</span> {order.paymentMethod.toUpperCase()}</div>
        {order.needChangeFor && (
          <div><span className="font-bold">Troco para:</span> {formatBRL(order.needChangeFor)} (Devolver {formatBRL(order.needChangeFor - order.total)})</div>
        )}
      </div>

      {order.notes && (
        <div className="border-b border-black pb-2 mb-2">
          <span className="font-bold">Obs Geral:</span> {order.notes}
        </div>
      )}

      <div className="text-center text-[10px] mt-3">
        *** OBRIGADO PELA PREFERÊNCIA ***
      </div>
    </div>
  );
};
