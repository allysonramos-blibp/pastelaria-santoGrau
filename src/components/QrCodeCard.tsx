import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { QrCode, Printer, Copy, Check, ExternalLink, Smartphone, Sparkles, Utensils } from 'lucide-react';

interface QrCodeCardProps {
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeCard: React.FC<QrCodeCardProps> = ({ settings, isOpen, onClose }) => {
  const [selectedTable, setSelectedTable] = useState<string>('geral');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pastelaria-santograu.app';
  const qrTargetUrl = selectedTable === 'geral' 
    ? currentUrl 
    : `${currentUrl}?mesa=${encodeURIComponent(selectedTable)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrTargetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrintTent = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-stone-900 my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-heading text-lg text-stone-900">
                QR Code do Cardápio Digital
              </h3>
              <p className="text-xs text-stone-500">
                O cliente aponta a câmera e faz o pedido direto sem login
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Configuration options */}
        <div className="p-6 space-y-5">
          {/* Table selector */}
          <div className="space-y-1.5 text-xs">
            <label className="block font-semibold text-stone-700">
              Gerar QR Code para:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setSelectedTable('geral')}
                className={`py-2 px-3 rounded-xl border text-center font-semibold transition-colors cursor-pointer ${
                  selectedTable === 'geral'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-xs'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                Cardápio Geral
              </button>
              {['Mesa 01', 'Mesa 02', 'Mesa 03', 'Mesa 04', 'Mesa 05', 'Mesa 06', 'Mesa 07'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedTable(m)}
                  className={`py-2 px-3 rounded-xl border text-center font-semibold transition-colors cursor-pointer ${
                    selectedTable === m
                      ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Printable Display Card Preview */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-stone-50 to-amber-50/50 border-2 border-stone-200 text-center space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                {selectedTable === 'geral' ? 'Balcão / Instagram' : `Display da ${selectedTable}`}
              </span>
              <h4 className="text-xl font-black font-heading text-stone-900 mt-0.5">
                {settings.storeName}
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Peça no seu celular · Sem filas · Frito na hora
              </p>
            </div>

            {/* High-Contrast SVG QR Code Representation */}
            <div className="w-48 h-48 mx-auto bg-white p-3.5 rounded-2xl shadow-md border border-stone-200 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full text-stone-900" fill="currentColor">
                {/* 3 Corner Markers */}
                <rect x="5" y="5" width="26" height="26" />
                <rect x="9" y="9" width="18" height="18" fill="white" />
                <rect x="13" y="13" width="10" height="10" />

                <rect x="69" y="5" width="26" height="26" />
                <rect x="73" y="9" width="18" height="18" fill="white" />
                <rect x="77" y="13" width="10" height="10" />

                <rect x="5" y="69" width="26" height="26" />
                <rect x="9" y="73" width="18" height="18" fill="white" />
                <rect x="13" y="77" width="10" height="10" />

                {/* Inner Data Pattern */}
                <rect x="36" y="8" width="6" height="6" />
                <rect x="46" y="8" width="14" height="6" />
                <rect x="36" y="18" width="6" height="12" />
                <rect x="46" y="24" width="16" height="6" />

                <rect x="8" y="36" width="12" height="6" />
                <rect x="24" y="42" width="6" height="18" />
                <rect x="36" y="36" width="12" height="12" />
                <rect x="52" y="42" width="12" height="6" />
                <rect x="68" y="36" width="18" height="6" />
                <rect x="90" y="42" width="6" height="12" />

                <rect x="14" y="58" width="12" height="6" />
                <rect x="36" y="52" width="6" height="18" />
                <rect x="46" y="58" width="12" height="12" />
                <rect x="68" y="52" width="12" height="12" />
                <rect x="84" y="58" width="12" height="6" />

                <rect x="36" y="78" width="18" height="6" />
                <rect x="58" y="72" width="6" height="18" />
                <rect x="68" y="78" width="12" height="6" />
                <rect x="84" y="72" width="12" height="12" />
                <rect x="42" y="88" width="24" height="6" />
                <rect x="72" y="88" width="18" height="10" />
              </svg>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-stone-500 font-mono">
              <Smartphone className="w-3.5 h-3.5 text-amber-600" />
              <span className="truncate max-w-xs">{qrTargetUrl}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              onClick={handleCopyLink}
              className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold text-xs cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Link do Cardápio</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrintTent}
              className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Display de Mesa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
