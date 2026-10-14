import React, { useState } from 'react';
import { MenuItem, ExtraOption, ProductCategory } from '../types';
import { formatBRL } from '../utils/format';
import { Plus, Edit2, Trash2, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

interface MenuEditorProps {
  menuItems: MenuItem[];
  extras: ExtraOption[];
  onSaveItem: (item: MenuItem) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleAvailability: (itemId: string) => void;
  onSaveExtra: (extra: ExtraOption) => void;
  onDeleteExtra: (extraId: string) => void;
}

export const MenuEditor: React.FC<MenuEditorProps> = ({
  menuItems,
  extras,
  onSaveItem,
  onDeleteItem,
  onToggleAvailability,
  onSaveExtra,
  onDeleteExtra,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'extras'>('items');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form states for item
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProductCategory>('salgados');
  const [price, setPrice] = useState('');
  const [badge, setBadge] = useState('');
  const [ingredientsStr, setIngredientsStr] = useState('');
  const [hasGiantSize, setHasGiantSize] = useState(false);
  const [giantDelta, setGiantDelta] = useState('6.00');

  // Form state for extra
  const [editingExtra, setEditingExtra] = useState<ExtraOption | null>(null);
  const [extraName, setExtraName] = useState('');
  const [extraPrice, setExtraPrice] = useState('');
  const [extraCategory, setExtraCategory] = useState<ExtraOption['category']>('recheio');

  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setCategory('salgados');
    setPrice('');
    setBadge('');
    setIngredientsStr('');
    setHasGiantSize(true);
    setGiantDelta('6.00');
    setIsCreatingNew(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setCategory(item.category);
    setPrice(item.price.toString());
    setBadge(item.badge || '');
    setIngredientsStr(item.ingredients ? item.ingredients.join(', ') : '');
    const giant = item.sizeOptions?.find((s) => s.name.includes('Gigante'));
    setHasGiantSize(!!giant);
    setGiantDelta(giant ? giant.priceDelta.toString() : '6.00');
    setIsCreatingNew(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert('Nome e preço são obrigatórios');
      return;
    }

    const numericPrice = parseFloat(price);
    const ingredients = ingredientsStr
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    const sizeOptions = hasGiantSize
      ? [
          { name: 'Médio (20cm)', priceDelta: 0 },
          { name: 'Gigante (30cm)', priceDelta: parseFloat(giantDelta) || 6 },
        ]
      : undefined;

    const itemToSave: MenuItem = {
      id: editingItem ? editingItem.id : `item-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      price: numericPrice,
      available: editingItem ? editingItem.available : true,
      badge: badge.trim() || undefined,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      sizeOptions,
    };

    onSaveItem(itemToSave);
    setIsCreatingNew(false);
    setEditingItem(null);
  };

  const handleSaveExtraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraName.trim() || extraPrice === '') return;

    const newExtra: ExtraOption = {
      id: editingExtra ? editingExtra.id : `ext-${Date.now()}`,
      name: extraName.trim(),
      price: parseFloat(extraPrice) || 0,
      category: extraCategory,
    };

    onSaveExtra(newExtra);
    setEditingExtra(null);
    setExtraName('');
    setExtraPrice('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
        <div>
          <h2 className="text-lg font-bold font-heading text-stone-900">
            Cardápio & Ingredientes
          </h2>
          <p className="text-xs text-stone-500">
            Gerencie sabores, tamanhos, adicionais e controle o que está disponível hoje
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('items')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'items' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              Pastéis & Produtos ({menuItems.length})
            </button>
            <button
              onClick={() => setActiveTab('extras')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'extras' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              Adicionais & Recheios ({extras.length})
            </button>
          </div>

          {activeTab === 'items' && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Pastel</span>
            </button>
          )}
        </div>
      </div>

      {/* ITEMS LIST */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Disponibilidade</th>
                  <th className="py-3 px-4">Nome & Recheio</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-right">Preço</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Availability toggle */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleAvailability(item.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          item.available
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.available ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        <span>{item.available ? 'Disponível' : 'Esgotado'}</span>
                      </button>
                    </td>

                    {/* Name & details */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">
                          {item.name}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-stone-500 text-xs mt-0.5 max-w-md line-clamp-1">
                        {item.description}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 uppercase font-semibold text-stone-600 text-[11px]">
                      {item.category}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 text-right font-bold text-stone-900 tabular-nums text-sm">
                      {formatBRL(item.price)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja remover ${item.name}?`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXTRAS LIST */}
      {activeTab === 'extras' && (
        <div className="space-y-4">
          {/* Add / Edit Extra Form */}
          <form
            onSubmit={handleSaveExtraSubmit}
            className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-wrap items-end gap-3 text-xs"
          >
            <div className="flex-1 min-w-[180px]">
              <label className="block font-semibold text-stone-700 mb-1">
                Nome do Adicional
              </label>
              <input
                type="text"
                value={extraName}
                onChange={(e) => setExtraName(e.target.value)}
                placeholder="Ex: Bacon Crocante, Catupiry..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div className="w-28">
              <label className="block font-semibold text-stone-700 mb-1">
                Preço (+R$)
              </label>
              <input
                type="number"
                step="0.5"
                value={extraPrice}
                onChange={(e) => setExtraPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div className="w-36">
              <label className="block font-semibold text-stone-700 mb-1">
                Tipo
              </label>
              <select
                value={extraCategory}
                onChange={(e) => setExtraCategory(e.target.value as ExtraOption['category'])}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
              >
                <option value="recheio">Recheio Extra</option>
                <option value="molho">Molho / Acompanhamento</option>
                <option value="massa">Tipo de Massa</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer"
            >
              {editingExtra ? 'Salvar Alteração' : 'Adicionar Ingrediente'}
            </button>

            {editingExtra && (
              <button
                type="button"
                onClick={() => {
                  setEditingExtra(null);
                  setExtraName('');
                  setExtraPrice('');
                }}
                className="px-3 py-2 border border-stone-300 text-stone-600 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </form>

          {/* Table of Extras */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Ingrediente / Adicional</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-right">Valor Adicional</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {extras.map((extra) => (
                  <tr key={extra.id} className="hover:bg-stone-50/70">
                    <td className="py-3 px-4 font-bold text-stone-900">{extra.name}</td>
                    <td className="py-3 px-4 uppercase text-stone-600 text-[11px]">
                      {extra.category}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-stone-900 tabular-nums">
                      {extra.price === 0 ? 'Grátis' : formatBRL(extra.price)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingExtra(extra);
                            setExtraName(extra.name);
                            setExtraPrice(extra.price.toString());
                            setExtraCategory(extra.category);
                          }}
                          className="p-1.5 text-stone-600 hover:text-stone-900 cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteExtra(extra.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 cursor-pointer"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold font-heading text-stone-900">
                {editingItem ? 'Editar Produto' : 'Cadastrar Novo Pastel / Produto'}
              </h3>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nome do Item *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Pastel de Carne Seca com Requeijão"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500 bg-white"
                  >
                    <option value="salgados">Salgados Tradicionais</option>
                    <option value="especiais">Especiais da Casa</option>
                    <option value="doces">Pastéis Doces</option>
                    <option value="combos">Combos & Promoções</option>
                    <option value="bebidas">Bebidas & Caldo de Cana</option>
                    <option value="porcoes">Porções & Mini Pastéis</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Preço Base (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex: 14.00"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Descrição do Pastel
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o sabor, suculência e detalhes para dar água na boca..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Ingredientes (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={ingredientsStr}
                  onChange={(e) => setIngredientsStr(e.target.value)}
                  placeholder="Carne moída, ovo picado, azeitonas, cheiro verde..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Selo / Destaque (Opcional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Ex: Mais Pedido, Gourmet..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 font-semibold text-stone-800 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={hasGiantSize}
                      onChange={(e) => setHasGiantSize(e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>Opção Gigante (30cm)</span>
                  </label>
                  {hasGiantSize && (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-stone-500">+R$</span>
                      <input
                        type="number"
                        step="0.5"
                        value={giantDelta}
                        onChange={(e) => setGiantDelta(e.target.value)}
                        className="w-20 px-2 py-1 rounded border border-stone-300 text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
