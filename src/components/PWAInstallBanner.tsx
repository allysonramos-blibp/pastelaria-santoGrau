import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pastelaria_install_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 1000 * 60 * 60 * 24) {
      setIsDismissed(true);
    }
  }, []);

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pastelaria_install_dismissed', Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) setIsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <aside aria-label="Instalação do Aplicativo" className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:max-w-sm z-40 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="bg-stone-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black truncate flex items-center gap-1.5">
                <span>Instalar Santo Grau App</span>
                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[9px] font-bold">Grátis</span>
              </div>
              <p className="text-[11px] text-stone-300 truncate">
                Peça com 1 toque na sua tela inicial!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
              title="Dispensar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <PWAInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
