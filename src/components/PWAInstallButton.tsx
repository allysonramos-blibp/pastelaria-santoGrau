import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, X, Share2, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed or running as standalone native app, do not show button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer ${className}`}
        title="Instalar aplicativo no celular"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-all cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-600" />
          <span>Instalar no iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 text-stone-900 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold font-heading text-base">Instalar no iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <Share2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>Passo 1:</strong> Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) no Safari.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <PlusSquare className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>Passo 2:</strong> Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 font-medium text-[11px]">
                  ✨ Pronto! O aplicativo será adicionado à sua tela inicial funcionando como um app nativo, sem barra de navegador.
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback button for devices before install prompt fires or desktop browsers
  return (
    <button
      onClick={() => {
        alert('Para instalar no celular: abra no Chrome/Safari, toque no menu de 3 pontinhos (ou Compartilhar) e clique em "Adicionar à tela inicial"!');
      }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-all cursor-pointer ${className}`}
      title="Instalar no celular"
    >
      <Smartphone className="w-3.5 h-3.5 text-amber-600" />
      <span>Instalar App</span>
    </button>
  );
};
