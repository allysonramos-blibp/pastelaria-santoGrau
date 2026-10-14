import React from 'react';
import { Order } from '../types';
import { formatBRL, formatDateTime } from '../utils/format';
import { Download, TrendingUp, DollarSign, ShoppingBag, Utensils, CreditCard, Banknote, QrCode } from 'lucide-react';

interface FinancialReportsProps {
  orders: Order[];
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({ orders }) => {
  const activeOrders = orders.filter((o) => o.status !== 'cancelado');

  const totalRevenue = activeOrders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = activeOrders.length;
  const avgTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // Total pastéis sold
  let totalPastelsCount = 0;
  const productCountMap: Record<string, { name: string; count: number; total: number }> = {};

  activeOrders.forEach((o) => {
    o.items.forEach((item) => {
      totalPastelsCount += item.quantity;
      if (!productCountMap[item.menuItem.id]) {
        productCountMap[item.menuItem.id] = {
          name: item.menuItem.name,
          count: 0,
          total: 0,
        };
      }
      productCountMap[item.menuItem.id].count += item.quantity;
      productCountMap[item.menuItem.id].total += item.totalPrice;
    });
  });

  const topProducts = Object.values(productCountMap).sort((a, b) => b.count - a.count).slice(0, 5);

  // By Payment Method
  const byPayment = {
    pix: activeOrders.filter((o) => o.paymentMethod === 'pix').reduce((acc, o) => acc + o.total, 0),
    dinheiro: activeOrders.filter((o) => o.paymentMethod === 'dinheiro').reduce((acc, o) => acc + o.total, 0),
    cartao_credito: activeOrders.filter((o) => o.paymentMethod === 'cartao_credito').reduce((acc, o) => acc + o.total, 0),
    cartao_debito: activeOrders.filter((o) => o.paymentMethod === 'cartao_debito').reduce((acc, o) => acc + o.total, 0),
  };

  // By Order Type
  const byType = {
    delivery: activeOrders.filter((o) => o.orderType === 'delivery').length,
    mesa: activeOrders.filter((o) => o.orderType === 'mesa').length,
    retirada: activeOrders.filter((o) => o.orderType === 'retirada').length,
  };

  const handleExportCSV = () => {
    const headers = ['Numero', 'Data', 'Cliente', 'Tipo', 'Pagamento', 'Subtotal', 'TaxaEntrega', 'Total', 'Status'];
    const rows = activeOrders.map((o) => [
      `#${o.orderNumber}`,
      formatDateTime(o.createdAt),
      `"${o.customerName}"`,
      o.orderType,
      o.paymentMethod,
      o.subtotal.toFixed(2),
      o.deliveryFee.toFixed(2),
      o.total.toFixed(2),
      o.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_pastelaria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-heading text-stone-900">
            Painel Financeiro & Vendas
          </h2>
          <p className="text-xs text-stone-500">
            Visão consolidada do faturamento, ticket médio e fluxo de caixa da pastelaria
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Planilha (CSV)</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total revenue */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Faturamento Bruto</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-emerald-700 tabular-nums">
            {formatBRL(totalRevenue)}
          </div>
          <div className="text-[11px] text-stone-400">Total de pedidos válidos</div>
        </div>

        {/* Total orders */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Pedidos Realizados</span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-stone-900 tabular-nums">
            {totalOrdersCount}
          </div>
          <div className="text-[11px] text-stone-400">Atendidos hoje</div>
        </div>

        {/* Average Ticket */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Ticket Médio</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-stone-900 tabular-nums">
            {formatBRL(avgTicket)}
          </div>
          <div className="text-[11px] text-stone-400">Por cliente / comanda</div>
        </div>

        {/* Total Pastéis */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Itens Vendidos</span>
            <Utensils className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-orange-700 tabular-nums">
            {totalPastelsCount}
          </div>
          <div className="text-[11px] text-stone-400">Pastéis e bebidas servidos</div>
        </div>
      </div>

      {/* Breakdowns 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Payment Methods Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold font-heading text-stone-900">
            Faturamento por Forma de Pagamento
          </h3>

          <div className="space-y-3 text-xs">
            {/* PIX */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-emerald-950">PIX</span>
              </div>
              <span className="font-bold text-sm text-emerald-900 tabular-nums">
                {formatBRL(byPayment.pix)}
              </span>
            </div>

            {/* Dinheiro (Caixa) */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Banknote className="w-4 h-4 text-amber-700" />
                <span className="font-semibold text-amber-950">Dinheiro Físico (Caixa)</span>
              </div>
              <span className="font-bold text-sm text-amber-900 tabular-nums">
                {formatBRL(byPayment.dinheiro)}
              </span>
            </div>

            {/* Cartão de Crédito */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-stone-700" />
                <span className="font-semibold text-stone-800">Cartão de Crédito</span>
              </div>
              <span className="font-bold text-sm text-stone-900 tabular-nums">
                {formatBRL(byPayment.cartao_credito)}
              </span>
            </div>

            {/* Cartão de Débito */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-stone-700" />
                <span className="font-semibold text-stone-800">Cartão de Débito</span>
              </div>
              <span className="font-bold text-sm text-stone-900 tabular-nums">
                {formatBRL(byPayment.cartao_debito)}
              </span>
            </div>
          </div>
        </div>

        {/* Top 5 Best-Selling Pastéis */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold font-heading text-stone-900">
            Top Pastéis & Produtos Mais Vendidos
          </h3>

          {topProducts.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">Nenhum pedido finalizado ainda.</p>
          ) : (
            <div className="space-y-3 text-xs">
              {topProducts.map((p, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-stone-800">
                      {idx + 1}. {p.name}
                    </span>
                    <span className="font-bold text-amber-700 tabular-nums">
                      {p.count} unid ({formatBRL(p.total)})
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (p.count / (topProducts[0]?.count || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
