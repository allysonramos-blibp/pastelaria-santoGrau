import { Order, StoreSettings } from '../types';

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatTimeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins === 1) return 'Há 1 min';
  if (diffMins < 60) return `Há ${diffMins} min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return 'Há 1 hora';
  return `Há ${diffHours} horas`;
}

export function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function buildWhatsAppOrderMessage(order: Order, settings: StoreSettings): string {
  const itemsText = order.items
    .map((item, idx) => {
      let txt = `${idx + 1}. *${item.quantity}x ${item.menuItem.name}*`;
      if (item.selectedSize) {
        txt += ` (${item.selectedSize.name})`;
      }
      txt += ` - ${formatBRL(item.totalPrice)}`;
      
      if (item.extras && item.extras.length > 0) {
        txt += `\n   ↳ Adicionais: ${item.extras.map(e => e.name).join(', ')}`;
      }
      if (item.notes) {
        txt += `\n   ↳ Obs: _${item.notes}_`;
      }
      return txt;
    })
    .join('\n\n');

  let orderTypeDesc = '';
  if (order.orderType === 'delivery') {
    const addr = order.deliveryAddress;
    orderTypeDesc = `🛵 *ENTREGA (DELIVERY)*\n📍 Endereço: ${addr?.street}, ${addr?.number} - ${addr?.neighborhood}${addr?.complement ? ` (${addr.complement})` : ''}${addr?.reference ? `\nPonto de Ref: ${addr.reference}` : ''}`;
  } else if (order.orderType === 'mesa') {
    orderTypeDesc = `🍽️ *CONSUMO NO LOCAL*\n📍 ${order.tableNumber || 'Mesa não informada'}`;
  } else {
    orderTypeDesc = `🛍️ *RETIRADA NO BALCÃO*`;
  }

  const paymentLabels = {
    pix: 'PIX (Chave da Pastelaria)',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    dinheiro: `Dinheiro${order.needChangeFor ? ` (Troco para ${formatBRL(order.needChangeFor)})` : ' (Sem troco)'}`,
  };

  let message = `🥟 *PEDIDO #${order.orderNumber} - ${settings.storeName.toUpperCase()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `👤 *Cliente:* ${order.customerName}\n`;
  message += `📱 *Telefone:* ${order.customerPhone}\n\n`;
  message += `${orderTypeDesc}\n\n`;
  message += `📋 *ITENS DO PEDIDO:*\n${itemsText}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Subtotal: ${formatBRL(order.subtotal)}\n`;
  if (order.orderType === 'delivery' && order.deliveryFee > 0) {
    message += `Taxa de Entrega: ${formatBRL(order.deliveryFee)}\n`;
  }
  message += `💰 *TOTAL A PAGAR:* *${formatBRL(order.total)}*\n`;
  message += `💳 *Forma de Pagamento:* ${paymentLabels[order.paymentMethod]}\n`;
  
  if (order.paymentMethod === 'pix' && settings.pixKey) {
    message += `\n🔑 *Chave PIX:* \`${settings.pixKey}\` (${settings.pixKeyType})`;
  }

  if (order.notes) {
    message += `\n\n📝 *Observações Gerais:* ${order.notes}`;
  }

  message += `\n\nMuito obrigado pela preferência! ✨`;

  return message;
}

export function buildWhatsAppNotificationMessage(order: Order, newStatus: Order['status'], storeName: string): string {
  let statusText = '';
  if (newStatus === 'em_preparo') {
    statusText = '🔥 *Seu pedido já está no óleo quente sendo preparado com todo carinho!* Fique atento, logo fica pronto sequinho e crocante!';
  } else if (newStatus === 'pronto') {
    if (order.orderType === 'delivery') {
      statusText = '🛵 *Seu pedido acabou de sair para entrega!* O motoboy está a caminho.';
    } else if (order.orderType === 'mesa') {
      statusText = '✨ *Seu pedido está pronto e sendo servido na sua mesa!* Bom apetite!';
    } else {
      statusText = '🛍️ *Seu pedido está pronto para retirada no balcão!* Pode vir retirar quentinho.';
    }
  } else if (newStatus === 'entregue') {
    statusText = '🎉 *Pedido concluído!* Esperamos que você adore nossos pastéis. Bom apetite e volte sempre!';
  }

  return `Olá ${order.customerName}! Aqui é da *${storeName}*.\n\nInformamos sobre seu *Pedido #${order.orderNumber}*:\n${statusText}`;
}
