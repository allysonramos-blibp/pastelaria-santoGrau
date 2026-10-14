import React, { useState } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare, CheckCircle, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [tab, setTab] = useState<'android' | 'ios'>(isIOS ? 'ios' : 'android');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-stone-900 p-6 space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-heading text-stone-900">
                Instalar no Celular
              </h3>
              <p className="text-xs text-stone-500">
                Acesse o cardápio com 1 toque sem digitar o link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Direct Install (for Chrome/Edge/Android supported browsers) */}
        {isInstallable && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>Instalação Rápida Disponível</span>
            </div>
            <p className="text-xs text-amber-950 font-medium">
              Seu navegador suporta a instalação direta com um clique:
            </p>
            <button
              onClick={async () => {
                await install();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Aplicativo Agora</span>
            </button>
          </div>
        )}

        {/* Platform Tabs */}
        <div>
          <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-2xl">
            <button
              onClick={() => setTab('android')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tab === 'android' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Android (Chrome / Samsung)
            </button>
            <button
              onClick={() => setTab('ios')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tab === 'ios' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              iPhone / iPad (Safari)
            </button>
          </div>

          {/* Tab content */}
          <div className="pt-4 space-y-3 text-xs text-stone-700 leading-relaxed">
            {tab === 'android' ? (
              <>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    No Google Chrome, toque no menu de <strong>3 pontinhos (⋮)</strong> no canto superior direito.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    Confirme em <strong>"Instalar"</strong>. O ícone oficial da Santo Grau aparecerá na sua tela de apps!
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <Share2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Passo 1:</strong> No Safari, toque no botão <strong>Compartilhar</strong> (o quadrado com seta para cima na barra inferior).
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <PlusSquare className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Passo 2:</strong> Role para baixo na lista de opções e toque em <strong>"Adicionar à Tela de Início"</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Passo 3:</strong> Toque em <strong>"Adicionar"</strong> no topo direito. O app abrirá em tela cheia como um aplicativo da App Store!
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Benefits badge */}
        <div className="p-3 rounded-2xl bg-stone-50 text-[11px] text-stone-600 flex items-center justify-between">
          <span>✨ Sem ocupar memória pesada</span>
          <span>·</span>
          <span>⚡ Carregamento instantâneo</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer transition"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
