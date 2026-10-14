import React from 'react';
import { Order, StoreSettings } from '../types';
import { formatBRL, formatDateTime } from '../utils/format';
import { Printer, X, Share2, Check } from 'lucide-react';

interface ThermalReceiptProps {
  order: Order | null;
  settings: StoreSettings;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  order,
  settings,
  isOpen = false,
  onClose,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const cleanPhone = order.customerPhone ? order.customerPhone.replace(/\D/g, '') : '';
    let text = `*COMPROVANTE - ${settings.storeName.toUpperCase()}*\n`;
    text += `Pedido: #${order.orderNumber}\n`;
    text += `Cliente: ${order.customerName}\n`;
    text += `Tipo: ${order.orderType === 'delivery' ? 'Entrega' : order.orderType === 'mesa' ? `Consumo Local (${order.tableNumber || 'Mesa'})` : 'Balcão / Retirada'}\n`;
    text += `Data: ${formatDateTime(order.createdAt)}\n\n`;
    text += `*ITENS:*\n`;
    order.items.forEach((item) => {
      text += `• ${item.quantity}x ${item.menuItem.name} ${item.selectedSize ? `(${item.selectedSize.name})` : ''} - ${formatBRL(item.totalPrice)}\n`;
      if (item.notes) text += `  _Obs: ${item.notes}_\n`;
    });
    text += `\n*TOTAL: ${formatBRL(order.total)}*\n`;
    text += `Pagamento: ${order.paymentMethod.toUpperCase()}\n`;
    if (order.needChangeFor) text += `Troco para: ${formatBRL(order.needChangeFor)}\n`;
    text += `\nObrigado pela preferência!`;

    const url = cleanPhone
      ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* 1. PRINTABLE ELEMENT FOR THERMAL PRINTER (100% HIDDEN ON SCREEN, VISIBLE ON PRINT ONLY) */}
      <div id="thermal-receipt-printable" className="hidden print:block text-black font-mono text-[11px] leading-tight">
        <div className="text-center font-bold text-xs uppercase border-b border-dashed border-black pb-2 mb-2">
          {settings.storeName}
          <div className="text-[10px] font-normal mt-0.5">{settings.address}</div>
          <div className="text-[10px] font-normal">WhatsApp: {settings.whatsappNumber}</div>
        </div>

        <div className="text-center my-2 border-b border-black pb-2">
          <div className="text-lg font-black">PEDIDO #{order.orderNumber}</div>
          <div className="text-[11px] font-bold uppercase mt-0.5">
            {order.orderType === 'delivery' && '🛵 ENTREGA / DELIVERY'}
            {order.orderType === 'mesa' && `🍽️ COMANDA: ${order.customerName || order.tableNumber || 'Salão'}`}
            {order.orderType === 'retirada' && `🛍️ BALCÃO: ${order.customerName || 'Retirada'}`}
          </div>
          <div className="text-[10px]">{formatDateTime(order.createdAt)}</div>
        </div>

        <div className="border-b border-dashed border-black pb-2 mb-2 space-y-0.5">
          <div><span className="font-bold">Cliente:</span> {order.customerName}</div>
          {order.customerPhone && <div><span className="font-bold">Fone:</span> {order.customerPhone}</div>}
          {order.orderType === 'delivery' && order.deliveryAddress && (
            <div className="mt-1 pt-1 border-t border-dotted border-black">
              <span className="font-bold">Endereço:</span> {order.deliveryAddress.street}, {order.deliveryAddress.number}
              {order.deliveryAddress.complement && ` (${order.deliveryAddress.complement})`}
              <div>Bairro: {order.deliveryAddress.neighborhood}</div>
              {order.deliveryAddress.reference && <div>Ref: {order.deliveryAddress.reference}</div>}
            </div>
          )}
        </div>

        <div className="border-b border-dashed border-black pb-2 mb-2">
          <div className="font-bold uppercase text-[10px] mb-1">ITENS DO PEDIDO:</div>
          <div className="space-y-1.5">
            {order.items.map((item, idx) => (
              <div key={idx}>
                <div className="receipt-flex font-bold">
                  <span>{item.quantity}x {item.menuItem.name} {item.selectedSize ? `(${item.selectedSize.name})` : ''}</span>
                  <span>{formatBRL(item.totalPrice)}</span>
                </div>
                {item.extras && item.extras.length > 0 && (
                  <div className="text-[10px] pl-2">
                    + {item.extras.map((e) => e.name).join(', ')}
                  </div>
                )}
                {item.notes && (
                  <div className="text-[10px] pl-2 font-bold italic">
                    OBS: {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-dashed border-black pb-2 mb-2 space-y-0.5">
          <div className="receipt-flex">
            <span>Subtotal:</span>
            <span>{formatBRL(order.subtotal)}</span>
          </div>
          {order.orderType === 'delivery' && (
            <div className="receipt-flex">
              <span>Taxa Entrega:</span>
              <span>{formatBRL(order.deliveryFee)}</span>
            </div>
          )}
          <div className="receipt-flex font-black text-xs pt-1 border-t border-black">
            <span>TOTAL:</span>
            <span>{formatBRL(order.total)}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-black pb-2 mb-2">
          <div><span className="font-bold">Pagamento:</span> {order.paymentMethod.toUpperCase()}</div>
          {order.needChangeFor && (
            <div><span className="font-bold">Troco para:</span> {formatBRL(order.needChangeFor)} (Devolver {formatBRL(order.needChangeFor - order.total)})</div>
          )}
        </div>

        {order.notes && (
          <div className="border-b border-dashed border-black pb-2 mb-2">
            <span className="font-bold">Obs Geral:</span> {order.notes}
          </div>
        )}

        <div className="text-center text-[10px] mt-3 font-bold">
          *** OBRIGADO PELA PREFERÊNCIA ***
        </div>
      </div>

      {/* 2. OPTIONAL SCREEN PREVIEW MODAL (CLEAN AND CONTROLLED) */}
      {isOpen && onClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-stone-900 text-white">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Comprovante de Pedido</h3>
                  <p className="text-[11px] text-stone-500">Cupom térmico 80mm / 58mm</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Paper Slip Preview */}
            <div className="p-4 bg-stone-100 overflow-y-auto flex-1 flex justify-center">
              <div className="w-full max-w-[300px] bg-white p-4 shadow-md rounded-lg font-mono text-[11px] leading-snug text-stone-900 border border-stone-200">
                <div className="text-center font-bold text-xs uppercase border-b border-dashed border-stone-400 pb-2 mb-2">
                  {settings.storeName}
                  <div className="text-[10px] font-normal text-stone-600 mt-0.5">{settings.address}</div>
                  <div className="text-[10px] font-normal text-stone-600">WhatsApp: {settings.whatsappNumber}</div>
                </div>

                <div className="text-center my-2 border-b border-stone-400 pb-2">
                  <div className="text-base font-black">PEDIDO #{order.orderNumber}</div>
                  <div className="text-[10px] font-bold uppercase mt-0.5 text-stone-700">
                    {order.orderType === 'delivery' && '🛵 Delivery'}
                    {order.orderType === 'mesa' && `🍽️ Comanda: ${order.customerName || order.tableNumber || 'Salão'}`}
                    {order.orderType === 'retirada' && `🛍️ Balcão: ${order.customerName || 'Retirada'}`}
                  </div>
                  <div className="text-[9px] text-stone-500">{formatDateTime(order.createdAt)}</div>
                </div>

                <div className="border-b border-dashed border-stone-400 pb-2 mb-2 text-[10px]">
                  <div><span className="font-bold">Cliente:</span> {order.customerName}</div>
                  {order.customerPhone && <div><span className="font-bold">Fone:</span> {order.customerPhone}</div>}
                </div>

                <div className="border-b border-dashed border-stone-400 pb-2 mb-2">
                  <div className="font-bold text-[10px] uppercase mb-1">Itens:</div>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between font-bold">
                          <span>{item.quantity}x {item.menuItem.name}</span>
                          <span>{formatBRL(item.totalPrice)}</span>
                        </div>
                        {item.notes && (
                          <div className="text-[9px] pl-2 font-bold italic text-amber-700">
                            Obs: {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-b border-dashed border-stone-400 pb-2 mb-2 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatBRL(order.subtotal)}</span>
                  </div>
                  {order.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>Taxa:</span>
                      <span>{formatBRL(order.deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-xs pt-1 border-t border-stone-400">
                    <span>TOTAL:</span>
                    <span>{formatBRL(order.total)}</span>
                  </div>
                </div>

                <div className="text-[10px]">
                  <div><span className="font-bold">Pagamento:</span> {order.paymentMethod.toUpperCase()}</div>
                  {order.needChangeFor && (
                    <div>Troco para: {formatBRL(order.needChangeFor)} (Voltar {formatBRL(order.needChangeFor - order.total)})</div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-col gap-2">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Imprimir Cupom Térmico (80mm)</span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
