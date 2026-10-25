import React, { useState } from 'react';
import { MenuItem, ExtraOption, CartItem } from '../types';
import { formatBRL } from '../utils/format';
import { PastelVisual } from './PastelVisual';
import { X, Plus, Minus, Check } from 'lucide-react';

interface CustomizeModalProps {
  item: MenuItem;
  availableExtras: ExtraOption[];
  onClose: () => void;
  onAddToCart: (cartItem: CartItem, openCartAfter?: boolean) => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  item,
  availableExtras,
  onClose,
  onAddToCart,
}) => {
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(0);
  const [selectedExtras, setSelectedExtras] = useState<ExtraOption[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const selectedSize = item.sizeOptions ? item.sizeOptions[selectedSizeIndex] : undefined;
  const basePrice = item.price + (selectedSize ? selectedSize.priceDelta : 0);
  const extrasTotal = selectedExtras.reduce((acc, curr) => acc + curr.price, 0);
  const unitPrice = basePrice + extrasTotal;
  const totalPrice = unitPrice * quantity;

  const toggleExtra = (extra: ExtraOption) => {
    if (selectedExtras.some((e) => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const handleConfirm = (openCartAfter: boolean = true) => {
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItem: item,
      selectedSize,
      extras: selectedExtras,
      notes: notes.trim() || undefined,
      quantity,
      unitPrice,
      totalPrice,
    };
    onAddToCart(cartItem, openCartAfter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with image */}
        <div className="relative">
          <PastelVisual
            category={item.category}
            name={item.name}
            imageUrl={item.imageUrl}
            className="h-44 sm:h-52 w-full"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-stone-900/70 text-white hover:bg-stone-900 transition-colors z-20 cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-stone-900">
                {item.name}
              </h2>
              <span className="text-lg font-bold text-amber-700 whitespace-nowrap tabular-nums">
                {formatBRL(item.price)}
              </span>
            </div>
            <p className="text-sm text-stone-600 mt-1 leading-relaxed">
              {item.description}
            </p>
            {item.ingredients && item.ingredients.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
                <span className="font-semibold text-stone-700">Recheio:</span>
                {item.ingredients.map((ing, i) => (
                  <span key={i}>
                    {ing}
                    {i < item.ingredients!.length - 1 && ' · '}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Size Selection (if available) */}
          {item.sizeOptions && item.sizeOptions.length > 0 && (
            <div className="pt-3 border-t border-stone-100">
              <label className="block text-sm font-semibold text-stone-900 mb-2">
                Escolha o Tamanho
              </label>
              <div className="grid grid-cols-2 gap-2">
                {item.sizeOptions.map((sz, idx) => (
                  <button
                    key={sz.name}
                    type="button"
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      selectedSizeIndex === idx
                        ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-medium'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div>
                      <div className="text-sm">{sz.name}</div>
                      {sz.priceDelta > 0 && (
                        <div className="text-xs text-amber-700 font-semibold tabular-nums">
                          +{formatBRL(sz.priceDelta)}
                        </div>
                      )}
                    </div>
                    {selectedSizeIndex === idx && (
                      <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extras / Adicionais */}
          {availableExtras.length > 0 && (
            <div className="pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-stone-900">
                  Adicionais & Recheios Extras
                </label>
                <span className="text-xs text-stone-500">Opcional</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableExtras.map((extra) => {
                  const isChecked = selectedExtras.some((e) => e.id === extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-sm transition-colors cursor-pointer ${
                        isChecked
                          ? 'border-amber-500 bg-amber-50/60 text-amber-950'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-amber-600 border-amber-600 text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{extra.name}</span>
                      </div>
                      <span className="font-semibold text-xs tabular-nums text-stone-700">
                        {extra.price === 0 ? 'Grátis' : `+${formatBRL(extra.price)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="pt-3 border-t border-stone-100">
            <label className="block text-sm font-semibold text-stone-900 mb-1.5">
              Observações do Pastel
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: sem azeitona, bem tostadinho, cortar ao meio..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              maxLength={120}
            />
          </div>
        </div>

        {/* Footer with Quantity & Add Buttons */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Quantity stepper */}
            <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                aria-label="Diminuir quantidade"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-sm tabular-nums text-stone-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 cursor-pointer"
                aria-label="Aumentar quantidade"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Submit CTA - Opens Cart/Checkout immediately */}
            <button
              type="button"
              onClick={() => handleConfirm(true)}
              className="flex-1 flex items-center justify-between px-5 py-3 rounded-xl btn-3d-amber text-white font-bold text-sm cursor-pointer"
            >
              <span>Adicionar ao Pedido</span>
              <span className="tabular-nums font-black">
                {formatBRL(totalPrice)}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleConfirm(false)}
            className="w-full py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            + Adicionar à sacola e continuar escolhendo outros itens
          </button>
        </div>
      </div>
    </div>
  );
};
