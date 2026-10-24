/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  MenuItem,
  ExtraOption,
  StoreSettings,
  Order,
  CartItem,
  OrderStatus,
  PaymentMethod,
} from './types';
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
import { api } from './services/api';
import { authService, AuthUser } from './services/auth';
import { RotateCcw, Lock } from 'lucide-react';

export default function App() {
  // 100% Server-Authoritative State (Zero localStorage database)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [extras, setExtras] = useState<ExtraOption[]>(INITIAL_EXTRAS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);

  // UI Navigation states
  const [mode, setMode] = useState<'cliente' | 'gestao'>('cliente');
  const [gestaoTab, setGestaoTab] = useState<
    'kds' | 'comandas' | 'pos' | 'menu' | 'financeiro' | 'config'
  >('kds');
  const [clienteTab, setClienteTab] = useState<'menu' | 'tracking'>('menu');

  // Modal states
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  // Server-Verified Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    return authService.getCurrentUser();
  });

  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  const refreshSync = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      const bundle = await api.syncCatalog();
      if (bundle) {
        if (Array.isArray(bundle.products)) {
          setMenuItems(bundle.products);
        }
        if (Array.isArray(bundle.extras) && bundle.extras.length > 0) {
          setExtras(bundle.extras);
        }
        if (bundle.settings) {
          setSettings(bundle.settings);
        }
        if (Array.isArray(bundle.orders)) {
          setOrders(bundle.orders);
        }
        setSyncStatus('synced');
      } else {
        setSyncStatus('offline');
      }
    } catch {
      setSyncStatus('offline');
    }
  }, []);

  useEffect(() => {
    refreshSync();
    authService.verifyServerSession().then((verifiedUser) => {
      setCurrentUser(verifiedUser);
    });

    const interval = setInterval(refreshSync, 4000);

    const handleVis = () => {
      if (document.visibilityState === 'visible') {
        refreshSync();
      }
    };
    window.addEventListener('visibilitychange', handleVis);
    window.addEventListener('focus', refreshSync);

    const ch =
      typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('pastelaria_sync') : null;
    if (ch) {
      ch.onmessage = () => {
        refreshSync();
      };
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVis);
      window.removeEventListener('focus', refreshSync);
      ch?.close();
    };
  }, [refreshSync]);

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
          i.id === cartItemId ? { ...i, quantity: newQty, totalPrice: newQty * i.unitPrice } : i
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

  // Order Handlers (Persisted on Server)
  const handleCreateOrder = async (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    setTrackingOrderId(newOrder.id);
    if (settings.soundAlertsEnabled) {
      playChimeSound();
    }
    await api.createOrder(newOrder);
    await refreshSync();
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
      )
    );
    await api.updateOrderStatus(orderId, newStatus);
    await refreshSync();
  };

  // POS & Waiter Order Handlers
  const handlePosOrderCreated = async (order: Order, printImmediately: boolean) => {
    setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
    await api.createOrder(order);
    await refreshSync();
    if (printImmediately) {
      setPrintOrder(order);
      setTimeout(() => {
        window.print();
        setTimeout(() => setPrintOrder(null), 1000);
      }, 150);
    }
  };

  const handleAppendItemsToOrder = async (
    orderId: string,
    newItems: CartItem[],
    printImmediately: boolean
  ) => {
    const target = orders.find((ord) => ord.id === orderId);
    if (!target) return;

    const updatedItems = [...target.items, ...newItems];
    const addedSubtotal = newItems.reduce((acc, it) => acc + it.totalPrice, 0);
    const updatedOrder: Order = {
      ...target,
      items: updatedItems,
      subtotal: target.subtotal + addedSubtotal,
      total: target.total + addedSubtotal,
      status: 'em_preparo',
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => prev.map((ord) => (ord.id === orderId ? updatedOrder : ord)));
    await api.updateOrder(orderId, updatedOrder);
    await refreshSync();

    if (printImmediately) {
      setPrintOrder(updatedOrder);
      setTimeout(() => {
        window.print();
        setTimeout(() => setPrintOrder(null), 1000);
      }, 150);
    }
  };

  const handleCloseAccount = async (
    orderId: string,
    paymentMethod: PaymentMethod,
    changeFor?: number
  ) => {
    const updates: Partial<Order> = {
      status: 'entregue',
      paymentMethod,
      needChangeFor: changeFor,
      updatedAt: new Date().toISOString(),
    };
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, ...updates } : ord))
    );
    await api.updateOrder(orderId, updates);
    await refreshSync();
  };

  const handleManualPrintOrder = (order: Order) => {
    setPrintOrder(order);
    setIsReceiptModalOpen(true);
  };

  // Menu Management Handlers (Persisted on Server)
  const handleSaveMenuItem = async (item: MenuItem) => {
    setMenuItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [...prev, item];
    });
    await api.saveProduct(item);
    await refreshSync();
  };

  const handleBulkSaveMenuItems = async (
    newItems: MenuItem[],
    replaceExisting: boolean = false
  ) => {
    if (replaceExisting) {
      setMenuItems(newItems);
      await api.saveProductsBulk(newItems, true);
      await refreshSync();
      return;
    }

    setMenuItems((prev) => {
      const copy = [...prev];
      newItems.forEach((item) => {
        const idx = copy.findIndex(
          (i) => i.id === item.id || i.name.toLowerCase() === item.name.toLowerCase()
        );
        if (idx >= 0) {
          copy[idx] = item;
        } else {
          copy.push(item);
        }
      });
      return copy;
    });
    await api.saveProductsBulk(newItems, false);
    await refreshSync();
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
    await api.deleteProduct(itemId);
    await refreshSync();
  };

  const handleToggleItemAvailability = async (itemId: string) => {
    const target = menuItems.find((i) => i.id === itemId);
    if (!target) return;
    const updated = !target.available;
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, available: updated } : i))
    );
    await api.updateAvailability(itemId, updated);
    await refreshSync();
  };

  // Extras Handlers (Persisted on Server)
  const handleSaveExtra = async (extra: ExtraOption) => {
    setExtras((prev) => {
      const idx = prev.findIndex((e) => e.id === extra.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = extra;
        return copy;
      }
      return [...prev, extra];
    });
    await api.saveExtra(extra);
    await refreshSync();
  };

  const handleDeleteExtra = async (extraId: string) => {
    setExtras((prev) => prev.filter((e) => e.id !== extraId));
    await api.deleteExtra(extraId);
    await refreshSync();
  };

  // Settings Handlers (Persisted on Server)
  const handleSaveSettings = async (newSettings: StoreSettings) => {
    setSettings(newSettings);
    await api.saveSettings(newSettings);
    await refreshSync();
  };

  // Reset to initial demo data on Server
  const handleResetDemoData = async () => {
    setConfirmingReset(false);
    const bundle = await api.resetServerDemoData();
    if (bundle) {
      setMenuItems(bundle.products);
      setExtras(bundle.extras);
      if (bundle.settings) setSettings(bundle.settings);
      setOrders(bundle.orders);
      setCart([]);
    }
  };

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'entregue' && o.status !== 'cancelado'
  ).length;
  const currentTrackingOrder = orders.find((o) => o.id === trackingOrderId) || orders[0];

  return (
    <div className="min-h-screen flex flex-col text-stone-900 w-full overflow-x-hidden">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* CUSTOMER MODE */}
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
                  <div className="max-w-md mx-auto card-3d rounded-3xl text-center p-10 my-10 space-y-4">
                    <p className="text-base text-stone-700 font-bold">
                      Você ainda não tem nenhum pedido em andamento.
                    </p>
                    <button
                      onClick={() => setClienteTab('menu')}
                      className="px-5 py-3 btn-3d-amber rounded-2xl text-xs font-bold cursor-pointer"
                    >
                      Ver Cardápio & Fazer Pedido
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* MANAGEMENT / GESTÃO MODE */}
        {mode === 'gestao' && (
          <>
            {!currentUser ? (
              <div className="max-w-md mx-auto my-12 card-3d rounded-3xl p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl btn-3d-amber flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-black font-heading text-stone-900">
                  Área Restrita da Gerência
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Esta seção é protegida por autenticação no servidor e reservada exclusivamente para a gerência e equipe.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-3 btn-3d-amber rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Entrar na Gerência
                  </button>
                  <button
                    onClick={() => setMode('cliente')}
                    className="w-full sm:w-auto px-4 py-3 btn-3d-white rounded-xl text-xs font-bold cursor-pointer"
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
                    onBulkSaveItems={handleBulkSaveMenuItems}
                    onDeleteItem={handleDeleteMenuItem}
                    onToggleAvailability={handleToggleItemAvailability}
                    onSaveExtra={handleSaveExtra}
                    onDeleteExtra={handleDeleteExtra}
                    onRefreshSync={refreshSync}
                    syncStatus={syncStatus}
                  />
                )}

                {gestaoTab === 'financeiro' && <FinancialReports orders={orders} />}

                {gestaoTab === 'config' && (
                  <StoreSettingsView settings={settings} onSaveSettings={handleSaveSettings} />
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

      {/* Login Modal for Owner & Team */}
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
      <footer className="border-t border-stone-200/80 bg-white/80 py-6 mt-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-stone-800">{settings.storeName}</span>
            <span aria-hidden="true">·</span>
            <span>{settings.address}</span>
            <span aria-hidden="true">·</span>
            <span>WhatsApp: {settings.whatsappNumber}</span>
          </div>

          {currentUser && (
            <div className="flex items-center gap-3">
              {confirmingReset ? (
                <div className="flex items-center gap-2">
                  <span className="text-stone-700 font-semibold">Restaurar padrão?</span>
                  <button
                    onClick={handleResetDemoData}
                    className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold cursor-pointer"
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setConfirmingReset(false)}
                    className="px-2.5 py-1 rounded-lg bg-stone-200 text-stone-700 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingReset(true)}
                  className="flex items-center gap-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrão</span>
                </button>
              )}
            </div>
          )}
        </div>
      </footer>

      <PWAInstallBanner />
    </div>
  );
}
