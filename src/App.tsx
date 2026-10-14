/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MenuItem, ExtraOption, StoreSettings, Order, CartItem, OrderStatus, PaymentMethod } from './types';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_EXTRAS,
  INITIAL_SETTINGS,
  INITIAL_ORDERS,
} from './data/initialData';
import { HeaderNav } from './components/HeaderNav';
import { CustomerMenu } from './components/CustomerMenu';
import { CustomizeModal } from './components/CustomizeModal';
import { CartCheckoutModal } from './components/CartCheckoutModal';
import { CustomerOrderTracker } from './components/CustomerOrderTracker';
import { KitchenKanban } from './components/KitchenKanban';
import { WaiterOrderPad } from './components/WaiterOrderPad';
import { PosTerminal } from './components/PosTerminal';
import { MenuEditor } from './components/MenuEditor';
import { FinancialReports } from './components/FinancialReports';
import { StoreSettingsView } from './components/StoreSettingsView';
import { ThermalReceipt } from './components/ThermalReceipt';
import { LoginModal } from './components/LoginModal';
import { QrCodeCard } from './components/QrCodeCard';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { playChimeSound } from './utils/sound';
import { api, getLocalDeletedIds, saveLocalDeletedId } from './services/api';
import { authService, AuthUser } from './services/auth';
import { RotateCcw, Heart, Lock, ShieldAlert, Wifi, RefreshCw } from 'lucide-react';

export default function App() {
  // 1. Persistent State with localStorage fallback and server sync
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const deletedSet = new Set(getLocalDeletedIds());
    const saved = localStorage.getItem('pastelaria_menu_items');
    const list: MenuItem[] = saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
    return list.filter((item) => !deletedSet.has(item.id));
  });

  const [extras, setExtras] = useState<ExtraOption[]>(() => {
    const saved = localStorage.getItem('pastelaria_extras');
    return saved ? JSON.parse(saved) : INITIAL_EXTRAS;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('pastelaria_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pastelaria_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pastelaria_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // UI Navigation states
  const [mode, setMode] = useState<'cliente' | 'gestao'>('cliente');
  const [gestaoTab, setGestaoTab] = useState<'kds' | 'comandas' | 'pos' | 'menu' | 'financeiro' | 'config'>('kds');
  const [clienteTab, setClienteTab] = useState<'menu' | 'tracking'>('menu');

  // Modal states
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Authentication State for Owner
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    return authService.getCurrentUser();
  });

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('pastelaria_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('pastelaria_extras', JSON.stringify(extras));
  }, [extras]);

  useEffect(() => {
    localStorage.setItem('pastelaria_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pastelaria_orders', JSON.stringify(orders));
  }, [orders]);

  // Multi-Device Auto-Sync Engine (Keeps PC, Mobile, and Server in perfect sync)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const refreshSync = async () => {
    try {
      setSyncStatus('syncing');
      const bundle = await api.syncCatalog(INITIAL_MENU_ITEMS);
      if (bundle) {
        const deletedSet = new Set(bundle.deletedIds);
        setMenuItems((current) => {
          const cleaned = bundle.products.filter((p) => !deletedSet.has(p.id));
          return cleaned;
        });
        if (bundle.orders && bundle.orders.length > 0) {
          setOrders(bundle.orders);
        }
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      }
    } catch {
      setSyncStatus('offline');
    }
  };

  useEffect(() => {
    refreshSync();

    // Polling every 5 seconds so deletions on PC reflect on mobile automatically
    const interval = setInterval(refreshSync, 5000);

    // Sync immediately when user switches tabs or unlocks phone screen
    const handleVis = () => {
      if (document.visibilityState === 'visible') {
        refreshSync();
      }
    };
    window.addEventListener('visibilitychange', handleVis);
    window.addEventListener('focus', refreshSync);

    // Cross-tab broadcast listener for immediate updates
    const ch = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('pastelaria_sync') : null;
    if (ch) {
      ch.onmessage = (e) => {
        if (e.data?.type === 'PRODUCT_DELETED') {
          const delId = e.data.productId;
          saveLocalDeletedId(delId);
          setMenuItems((prev) => prev.filter((p) => p.id !== delId));
        } else if (e.data?.type === 'PRODUCT_SAVED') {
          const prod = e.data.product;
          setMenuItems((prev) => {
            const idx = prev.findIndex((p) => p.id === prod.id);
            if (idx >= 0) {
              const cp = [...prev];
              cp[idx] = prod;
              return cp;
            }
            return [...prev, prod];
          });
        } else if (e.data?.type === 'NEW_ORDER') {
          setOrders((prev) => [e.data.order, ...prev.filter((o) => o.id !== e.data.order.id)]);
        }
      };
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVis);
      window.removeEventListener('focus', refreshSync);
      ch?.close();
    };
  }, []);

  // Cart Handlers
  const handleAddToCart = (newItem: CartItem) => {
    setCart((prev) => [...prev, newItem]);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== cartItemId));
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.id === cartItemId
            ? { ...i, quantity: newQty, totalPrice: newQty * i.unitPrice }
            : i
        )
      );
    }
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order Handlers
  const handleCreateOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setTrackingOrderId(newOrder.id);
    api.createOrder(newOrder);
    if (settings.soundAlertsEnabled) {
      playChimeSound();
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
          : o
      )
    );
    api.updateOrderStatus(orderId, newStatus);
  };

  // POS & Waiter Order Handlers
  const handlePosOrderCreated = (order: Order, printImmediately: boolean) => {
    setOrders((prev) => [order, ...prev]);
    api.createOrder(order);
    if (printImmediately) {
      setPrintOrder(order);
      setTimeout(() => {
        window.print();
        setTimeout(() => setPrintOrder(null), 1000);
      }, 150);
    }
  };

  const handleAppendItemsToOrder = (orderId: string, newItems: CartItem[], printImmediately: boolean) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updatedItems = [...ord.items, ...newItems];
        const addedSubtotal = newItems.reduce((acc, it) => acc + it.totalPrice, 0);
        const updatedTotal = ord.total + addedSubtotal;
        const updatedOrder: Order = {
          ...ord,
          items: updatedItems,
          subtotal: ord.subtotal + addedSubtotal,
          total: updatedTotal,
          status: 'em_preparo',
          updatedAt: new Date().toISOString(),
        };
        api.createOrder(updatedOrder);
        if (printImmediately) {
          setPrintOrder(updatedOrder);
          setTimeout(() => {
            window.print();
            setTimeout(() => setPrintOrder(null), 1000);
          }, 150);
        }
        return updatedOrder;
      })
    );
  };

  const handleCloseAccount = (orderId: string, paymentMethod: PaymentMethod, changeFor?: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updated: Order = {
          ...ord,
          status: 'entregue',
          paymentMethod,
          needChangeFor: changeFor,
          updatedAt: new Date().toISOString(),
        };
        api.updateOrderStatus(orderId, 'entregue');
        return updated;
      })
    );
  };

  const handleManualPrintOrder = (order: Order) => {
    setPrintOrder(order);
    setIsReceiptModalOpen(true);
  };

  // Menu Management Handlers
  const handleSaveMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [...prev, item];
    });
    api.saveProduct(item);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    saveLocalDeletedId(itemId);
    setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
    api.deleteProduct(itemId);
  };

  const handleToggleItemAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const updated = !i.available;
          api.updateAvailability(itemId, updated);
          return { ...i, available: updated };
        }
        return i;
      })
    );
  };

  // Extras Handlers
  const handleSaveExtra = (extra: ExtraOption) => {
    setExtras((prev) => {
      const idx = prev.findIndex((e) => e.id === extra.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = extra;
        return copy;
      }
      return [...prev, extra];
    });
  };

  const handleDeleteExtra = (extraId: string) => {
    setExtras((prev) => prev.filter((e) => e.id !== extraId));
  };

  // Settings Handlers
  const handleSaveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
  };

  // Reset to initial demo data
  const handleResetDemoData = () => {
    if (confirm('Deseja restaurar o cardápio e dados de demonstração originais?')) {
      setMenuItems(INITIAL_MENU_ITEMS);
      setExtras(INITIAL_EXTRAS);
      setSettings(INITIAL_SETTINGS);
      setOrders(INITIAL_ORDERS);
      setCart([]);
      localStorage.clear();
      alert('Dados restaurados com sucesso!');
    }
  };

  const activeOrdersCount = orders.filter((o) => o.status !== 'entregue' && o.status !== 'cancelado').length;
  const currentTrackingOrder = orders.find((o) => o.id === trackingOrderId) || orders[0];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      {/* Printable receipt for thermal printer & optional preview modal */}
      <ThermalReceipt
        order={printOrder}
        settings={settings}
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setPrintOrder(null);
        }}
      />

      {/* Top Bar Navigation */}
      <HeaderNav
        currentMode={mode}
        gestaoSubTab={gestaoTab}
        onSelectMode={(m) => {
          if (m === 'gestao' && !currentUser) {
            setIsLoginModalOpen(true);
            return;
          }
          setMode(m);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectGestaoTab={(tab) => {
          setGestaoTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectClienteTab={(tab) => {
          setClienteTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeClientTab={clienteTab}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        settings={settings}
        activeOrdersCount={activeOrdersCount}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          authService.logout();
          setCurrentUser(null);
          setMode('cliente');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* CUSTOMER MODE (100% Free - No login required for customers!) */}
        {mode === 'cliente' && (
          <>
            {clienteTab === 'menu' && (
              <CustomerMenu
                menuItems={menuItems}
                settings={settings}
                cart={cart}
                onOpenItemCustomize={(item) => setCustomizingItem(item)}
                onOpenCart={() => setIsCartOpen(true)}
                onViewOrderTracking={() => setClienteTab('tracking')}
                activeOrderCount={activeOrdersCount}
              />
            )}

            {clienteTab === 'tracking' && (
              <>
                {currentTrackingOrder ? (
                  <CustomerOrderTracker
                    order={currentTrackingOrder}
                    settings={settings}
                    onBackToMenu={() => setClienteTab('menu')}
                  />
                ) : (
                  <div className="max-w-md mx-auto text-center py-16 space-y-4">
                    <p className="text-base text-stone-600 font-semibold">
                      Você ainda não tem nenhum pedido em andamento.
                    </p>
                    <button
                      onClick={() => setClienteTab('menu')}
                      className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 cursor-pointer"
                    >
                      Ver Cardápio & Fazer Pedido
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* MANAGEMENT / GESTÃO MODE (Protected by JWT Authentication) */}
        {mode === 'gestao' && (
          <>
            {!currentUser ? (
              <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold font-heading text-stone-900">
                  Área Restrita da Gerência
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Esta seção é protegida por token JWT e reservada exclusivamente para o dono e funcionários da pastelaria. Clientes podem fazer pedidos livremente no cardápio sem login!
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                  >
                    Fazer Login do Dono
                  </button>
                  <button
                    onClick={() => setMode('cliente')}
                    className="w-full sm:w-auto px-4 py-2.5 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                  >
                    Voltar ao Cardápio
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {gestaoTab === 'kds' && (
                  <KitchenKanban
                    orders={orders}
                    settings={settings}
                    onUpdateStatus={handleUpdateOrderStatus}
                    onSelectPrintOrder={handleManualPrintOrder}
                  />
                )}

                {gestaoTab === 'comandas' && (
                  <WaiterOrderPad
                    menuItems={menuItems}
                    settings={settings}
                    orders={orders}
                    onOrderCreated={handlePosOrderCreated}
                    onAppendItemsToOrder={handleAppendItemsToOrder}
                    onCloseAccount={handleCloseAccount}
                    onPrintReceipt={handleManualPrintOrder}
                  />
                )}

                {gestaoTab === 'pos' && (
                  <PosTerminal
                    menuItems={menuItems}
                    settings={settings}
                    onOrderCreated={handlePosOrderCreated}
                  />
                )}

                {gestaoTab === 'menu' && (
                  <MenuEditor
                    menuItems={menuItems}
                    extras={extras}
                    onSaveItem={handleSaveMenuItem}
                    onDeleteItem={handleDeleteMenuItem}
                    onToggleAvailability={handleToggleItemAvailability}
                    onSaveExtra={handleSaveExtra}
                    onDeleteExtra={handleDeleteExtra}
                  />
                )}

                {gestaoTab === 'financeiro' && <FinancialReports orders={orders} />}

                {gestaoTab === 'config' && (
                  <StoreSettingsView
                    settings={settings}
                    onSaveSettings={handleSaveSettings}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Item Customization Modal */}
      {customizingItem && (
        <CustomizeModal
          item={customizingItem}
          availableExtras={extras}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart & Checkout Slide / Modal */}
      {isCartOpen && (
        <CartCheckoutModal
          cart={cart}
          settings={settings}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={handleClearCart}
          onCreateOrder={handleCreateOrder}
          onViewOrderTracking={(orderId) => {
            setTrackingOrderId(orderId);
            setClienteTab('tracking');
          }}
        />
      )}

      {/* Login Modal for Owner */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setMode('gestao');
        }}
      />

      {/* QR Code Modal for Tables & Counter */}
      <QrCodeCard
        settings={settings}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">{settings.storeName}</span>
            <span aria-hidden="true">·</span>
            <span>{settings.address}</span>
            <span aria-hidden="true">·</span>
            <span>WhatsApp: {settings.whatsappNumber}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Sync Status indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-[11px] font-medium text-stone-600">
              <span className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500' : syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : 'bg-red-400'}`} />
              <span>
                {syncStatus === 'synced' ? 'Cardápio sincronizado ao vivo' : syncStatus === 'syncing' ? 'Sincronizando...' : 'Modo local'}
              </span>
            </div>

            <button
              onClick={handleResetDemoData}
              className="flex items-center gap-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              title="Restaurar dados padrão de teste"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Demonstração</span>
            </button>
            <span className="text-stone-400">Sistema para Pastelaria & Delivery</span>
          </div>
        </div>
      </footer>

      {/* Floating mobile PWA install banner */}
      <PWAInstallBanner />
    </div>
  );
}
