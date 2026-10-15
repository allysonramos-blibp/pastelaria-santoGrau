import React, { useState, useMemo } from 'react';
import { MenuItem, ExtraOption, ProductCategory } from '../types';
import { formatBRL } from '../utils/format';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ShieldAlert,
  Sparkles,
  Download,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
} from 'lucide-react';

interface MenuEditorProps {
  menuItems: MenuItem[];
  extras: ExtraOption[];
  onSaveItem: (item: MenuItem) => void;
  onBulkSaveItems?: (items: MenuItem[], replaceExisting?: boolean) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleAvailability: (itemId: string) => void;
  onSaveExtra: (extra: ExtraOption) => void;
  onDeleteExtra: (extraId: string) => void;
  onRefreshSync?: () => void;
  syncStatus?: 'synced' | 'syncing' | 'offline';
}

export const MenuEditor: React.FC<MenuEditorProps> = ({
  menuItems,
  extras,
  onSaveItem,
  onBulkSaveItems,
  onDeleteItem,
  onToggleAvailability,
  onSaveExtra,
  onDeleteExtra,
  onRefreshSync,
  syncStatus = 'synced',
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'extras'>('items');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Bulk Insert Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState<'text' | 'json'>('text');
  const [bulkText, setBulkText] = useState('');
  const [bulkDefaultCategory, setBulkDefaultCategory] = useState<ProductCategory>('salgados');
  const [bulkAddGiant, setBulkAddGiant] = useState(true);
  const [bulkGiantDelta, setBulkGiantDelta] = useState('6.00');
  const [bulkReplaceExisting, setBulkReplaceExisting] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

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

  // Smart Parser for Bulk Text
  const parsedBulkItems = useMemo<MenuItem[]>(() => {
    if (!bulkText.trim()) return [];

    if (bulkMode === 'json') {
      try {
        const parsed = JSON.parse(bulkText);
        const list = Array.isArray(parsed) ? parsed : parsed.products || parsed.items || [];
        return list.map((it: any, idx: number) => ({
          id: it.id || `item-bulk-${Date.now()}-${idx}`,
          name: String(it.name || '').trim(),
          description: String(it.description || '').trim(),
          category: (it.category || bulkDefaultCategory) as ProductCategory,
          price: Number(it.price) || 0,
          available: it.available !== undefined ? Boolean(it.available) : true,
          badge: it.badge ? String(it.badge).trim() : undefined,
          ingredients: Array.isArray(it.ingredients)
            ? it.ingredients
            : typeof it.ingredients === 'string' && it.ingredients.trim()
            ? it.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean)
            : undefined,
          sizeOptions: it.sizeOptions || (bulkAddGiant && (it.category === 'salgados' || it.category === 'especiais')
            ? [
                { name: 'Médio (20cm)', priceDelta: 0 },
                { name: 'Gigante (30cm)', priceDelta: parseFloat(bulkGiantDelta) || 6 },
              ]
            : undefined),
        })).filter((it: MenuItem) => it.name.length > 0);
      } catch {
        return [];
      }
    }

    // Text parsing mode (line by line)
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    const items: MenuItem[] = [];

    lines.forEach((line, index) => {
      // Ignore comment or header lines
      if (line.startsWith('#') || line.startsWith('//') || line.toLowerCase().startsWith('cardapio') || line.toLowerCase().startsWith('cardápio')) {
        return;
      }

      // Try pipe separation: Name | Price | Category | Description/Ingredients
      if (line.includes('|')) {
        const parts = line.split('|').map((p) => p.trim());
        const itemName = parts[0] || '';
        const itemPrice = parseFloat((parts[1] || '0').replace('R$', '').replace('$', '').replace(',', '.').trim()) || 0;
        let itemCat: ProductCategory = bulkDefaultCategory;
        if (parts[2]) {
          const catNorm = parts[2].toLowerCase();
          if (['salgados', 'especiais', 'doces', 'combos', 'bebidas', 'porcoes'].includes(catNorm)) {
            itemCat = catNorm as ProductCategory;
          }
        }
        const descOrIng = parts[3] || '';
        if (itemName) {
          items.push({
            id: `item-bulk-${Date.now()}-${index}`,
            name: itemName,
            description: descOrIng,
            category: itemCat,
            price: itemPrice,
            available: true,
            ingredients: descOrIng ? descOrIng.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
            sizeOptions: bulkAddGiant && (itemCat === 'salgados' || itemCat === 'especiais')
              ? [
                  { name: 'Médio (20cm)', priceDelta: 0 },
                  { name: 'Gigante (30cm)', priceDelta: parseFloat(bulkGiantDelta) || 6 },
                ]
              : undefined,
          });
        }
        return;
      }

      // 1. Remove leading bullets and numbering like '1. ', '01 - ', '• ', '-'
      let cleanLine = line.replace(/^(\d{1,3}[.)\-]\s*|[•*\-–—]\s*)/, '').trim();

      let detectedPrice = 0;

      // 2. Try explicit R$ or BRL: e.g. ' - R$ 14,00' or 'R$ 14,00' or 'R$14'
      const rDollarMatch = cleanLine.match(/(?:[-–—:]\s*)?(?:R\$|BRL)\s*(\d{1,3}(?:[.,]\d{1,2})?)/i);
      if (rDollarMatch && rDollarMatch.index !== undefined) {
        detectedPrice = parseFloat(rDollarMatch[1].replace(',', '.'));
        cleanLine = (cleanLine.substring(0, rDollarMatch.index) + ' ' + cleanLine.substring(rDollarMatch.index + rDollarMatch[0].length)).trim();
      } else {
        // End of line price: '... - 14,00' or '... 14.50'
        const endPriceMatch = cleanLine.match(/(?:[-–—:]\s*|\s+)(\d{1,3}(?:[.,]\d{1,2})?)\s*$/);
        if (endPriceMatch && endPriceMatch.index !== undefined) {
          detectedPrice = parseFloat(endPriceMatch[1].replace(',', '.'));
          cleanLine = cleanLine.substring(0, endPriceMatch.index).trim();
        } else {
          // Decimal price anywhere: e.g. 15,50
          const decMatch = cleanLine.match(/\b(\d{1,3}[.,]\d{2})\b/);
          if (decMatch && decMatch.index !== undefined) {
            detectedPrice = parseFloat(decMatch[1].replace(',', '.'));
            cleanLine = (cleanLine.substring(0, decMatch.index) + ' ' + cleanLine.substring(decMatch.index + decMatch[0].length)).trim();
          }
        }
      }

      // Clean double spaces and leading/trailing separators
      cleanLine = cleanLine.replace(/\s{2,}/g, ' ').replace(/^[-–—:]\s*/, '').replace(/[-–—:]\s*$/, '').trim();

      // Split name and description: look for ' - ' (hyphen with spaces) or ' : '
      let itemName = cleanLine;
      let itemDesc = '';
      const sepIdx = cleanLine.search(/\s+[-–—:]\s+/);
      if (sepIdx !== -1) {
        itemName = cleanLine.substring(0, sepIdx).trim();
        itemDesc = cleanLine.substring(sepIdx).replace(/^[\s-–—:]+/, '').trim();
      }

      if (!itemName) return;

      // Smart category detection based on name keywords
      let detectedCategory: ProductCategory = bulkDefaultCategory;
      const lower = (itemName + ' ' + itemDesc).toLowerCase();

      if (/(camar[aã]o|carne seca|costela|quatro queijos|gourmet|picanha|bacon cheddar|fil[eé])/i.test(lower)) {
        detectedCategory = 'especiais';
      } else if (/(nutella|chocolate|morango|banana|romeu|leite ninho|doce de leite|churros|doce)/i.test(lower)) {
        detectedCategory = 'doces';
      } else if (/(coca|guaran[aá]|suco|caldo de cana|refrigerante|cerveja|agua|água|bebida|refri|lata|fanta|sprite)/i.test(lower)) {
        detectedCategory = 'bebidas';
      } else if (/(por[cç][aã]o|fritas|batata|mandioca|mini past[eé]is|petisco)/i.test(lower)) {
        detectedCategory = 'porcoes';
      } else if (/(combo|promoc|promo)/i.test(lower)) {
        detectedCategory = 'combos';
      }

      items.push({
        id: `item-bulk-${Date.now()}-${index}`,
        name: itemName,
        description: itemDesc,
        category: detectedCategory,
        price: detectedPrice,
        available: true,
        ingredients: itemDesc ? itemDesc.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        sizeOptions: bulkAddGiant && (detectedCategory === 'salgados' || detectedCategory === 'especiais')
          ? [
              { name: 'Médio (20cm)', priceDelta: 0 },
              { name: 'Gigante (30cm)', priceDelta: parseFloat(bulkGiantDelta) || 6 },
            ]
          : undefined,
      });
    });

    return items;
  }, [bulkText, bulkMode, bulkDefaultCategory, bulkAddGiant, bulkGiantDelta]);

  const handleExecuteBulkInsert = () => {
    if (parsedBulkItems.length === 0) {
      setBulkError('Nenhum item válido identificado para inserção.');
      return;
    }

    if (onBulkSaveItems) {
      onBulkSaveItems(parsedBulkItems, bulkReplaceExisting);
    } else {
      parsedBulkItems.forEach((it) => onSaveItem(it));
    }

    setBulkSuccessMsg(
      bulkReplaceExisting
        ? `🎉 Cardápio atualizado! ${parsedBulkItems.length} itens definidos como catálogo oficial!`
        : `🎉 ${parsedBulkItems.length} itens inseridos com sucesso no cardápio!`
    );
    setBulkError(null);

    setTimeout(() => {
      setIsBulkModalOpen(false);
      setBulkSuccessMsg(null);
      setBulkText('');
    }, 1800);
  };

  const handleExportMenuJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(menuItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cardapio-santograu-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-heading text-stone-900">
            Cardápio & Ingredientes
          </h2>
          <p className="text-xs text-stone-500">
            Gerencie sabores, tamanhos, adicionais e controle o que está disponível hoje
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                activeTab === 'items' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              Produtos ({menuItems.length})
            </button>
            <button
              onClick={() => setActiveTab('extras')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                activeTab === 'extras' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              Adicionais ({extras.length})
            </button>
          </div>

          {activeTab === 'items' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Inserção em Massa Button */}
              <button
                type="button"
                onClick={() => {
                  setBulkError(null);
                  setBulkSuccessMsg(null);
                  setIsBulkModalOpen(true);
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs shadow-xs cursor-pointer transition-colors active:scale-95"
                title="Inserir múltiplos itens de uma só vez"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Inserir em Massa</span>
              </button>

              {/* Novo Pastel Button */}
              <button
                type="button"
                onClick={openCreateModal}
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo</span>
              </button>

              {/* Sincronizar Agora */}
              {onRefreshSync && (
                <button
                  type="button"
                  onClick={onRefreshSync}
                  className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs cursor-pointer transition-colors active:scale-95"
                  title="Sincronizar com o banco de dados agora"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-amber-600' : 'text-stone-500'}`} />
                </button>
              )}

              {/* Exportar JSON */}
              <button
                type="button"
                onClick={handleExportMenuJson}
                className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl border border-stone-200 cursor-pointer transition-colors"
                title="Exportar Cardápio em JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ITEMS LIST */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          {/* Mobile Card List (< md) */}
          <div className="md:hidden divide-y divide-stone-100">
            {menuItems.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                Nenhum produto cadastrado no cardápio.
              </div>
            ) : (
              menuItems.map((item) => (
                <div key={item.id} className="p-3.5 space-y-2.5 hover:bg-stone-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-stone-900 text-sm leading-snug">{item.name}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                          {item.category}
                        </span>
                        <span className="font-black text-amber-700 text-sm tabular-nums">
                          {formatBRL(item.price)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-stone-500 text-xs mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => onToggleAvailability(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                        item.available
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span>{item.available ? 'Disponível' : 'Esgotado'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(item)}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block overflow-x-auto">
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
                          onClick={() => onDeleteItem(item.id)}
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
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-800">
              {editingExtra ? 'Editar Adicional' : 'Cadastrar Adicional'}
            </h3>
          </div>
          <form onSubmit={handleSaveExtraSubmit} className="p-4 bg-stone-50/50 border-b border-stone-200 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nome do Adicional
              </label>
              <input
                type="text"
                value={extraName}
                onChange={(e) => setExtraName(e.target.value)}
                placeholder="Ex: Bacon Crocante, Catupiry..."
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white"
                required
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Preço (R$)
              </label>
              <input
                type="number"
                step="0.5"
                value={extraPrice}
                onChange={(e) => setExtraPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white"
                required
              />
            </div>
            <div className="w-36">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tipo
              </label>
              <select
                value={extraCategory}
                onChange={(e) => setExtraCategory(e.target.value as ExtraOption['category'])}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white"
              >
                <option value="recheio">Recheio Extra</option>
                <option value="molho">Molho / Acompanhamento</option>
                <option value="massa">Tipo de Massa</option>
                <option value="borda">Borda</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              {editingExtra ? 'Atualizar' : 'Adicionar'}
            </button>
            {editingExtra && (
              <button
                type="button"
                onClick={() => {
                  setEditingExtra(null);
                  setExtraName('');
                  setExtraPrice('');
                }}
                className="px-3 py-1.5 border border-stone-300 text-stone-600 rounded-xl text-xs font-semibold hover:bg-stone-100 cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </form>

          {/* Mobile Card List (< md) */}
          <div className="md:hidden divide-y divide-stone-100">
            {extras.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                Nenhum adicional cadastrado.
              </div>
            ) : (
              extras.map((extra) => (
                <div key={extra.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-stone-900 text-sm truncate">{extra.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                        {extra.category}
                      </span>
                      <span className="font-extrabold text-amber-700 text-xs tabular-nums">
                        {extra.price === 0 ? 'Grátis' : formatBRL(extra.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExtra(extra);
                        setExtraName(extra.name);
                        setExtraPrice(extra.price.toString());
                        setExtraCategory(extra.category);
                      }}
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteExtra(extra.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-right">Preço Adicional</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {extras.map((extra) => (
                  <tr key={extra.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-900">{extra.name}</td>
                    <td className="py-3 px-4 uppercase text-stone-500 font-medium text-[11px]">
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

      {/* MODAL INSERÇÃO EM MASSA (BULK INSERT) */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header (shrink-0) */}
            <div className="p-3.5 sm:p-4 border-b border-stone-200 flex items-center justify-between shrink-0 bg-stone-50/70">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-stone-900">
                    Inserção em Massa no Cardápio
                  </h3>
                  <p className="text-xs text-stone-500">
                    Cole sua lista de itens para cadastrar tudo de uma vez
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1.5 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body (flex-1 overflow-y-auto) */}
            <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-4 min-h-0">
              {/* Mode selection + Quick Sample */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setBulkMode('text')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      bulkMode === 'text' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    Lista Rápida
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkMode('json')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      bulkMode === 'json' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    Modo JSON
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-stone-600 pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkMode('text');
                      setBulkText(
                        'Pastel de Carne Tradicional - R$ 14,00 - Carne moída de primeira, ovo e azeitonas\n' +
                        'Pastel de Queijo Especial - R$ 13,00 - Mussarela selecionada e orégano\n' +
                        'Pastel de Pizza Paulista - R$ 14,50 - Presunto, queijo, tomate e orégano\n' +
                        'Pastel de Camarão com Catupiry - R$ 22,00 - Camarões frescos e Catupiry legítimo\n' +
                        'Pastel de Nutella com Morango - R$ 16,50 - Nutella pura e morangos frescos\n' +
                        'Caldo de Cana Gelado 500ml - R$ 8,00\n' +
                        'Coca-Cola Lata 350ml - R$ 6,00\n' +
                        'Porção de Mini Pastéis (12 un) - R$ 28,00'
                      );
                    }}
                    className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-amber-700 font-bold hover:bg-amber-50 cursor-pointer"
                  >
                    Colar Seus Itens
                  </button>
                  <span>Categoria padrão:</span>
                  <select
                    value={bulkDefaultCategory}
                    onChange={(e) => setBulkDefaultCategory(e.target.value as ProductCategory)}
                    className="bg-white border border-stone-300 rounded-md px-1.5 py-0.5 text-xs text-stone-800 focus:outline-none"
                  >
                    <option value="salgados">Salgados</option>
                    <option value="especiais">Especiais</option>
                    <option value="doces">Doces</option>
                    <option value="bebidas">Bebidas</option>
                    <option value="porcoes">Porções</option>
                    <option value="combos">Combos</option>
                  </select>
                </div>
              </div>

              {/* Helper tips */}
              {bulkMode === 'text' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    Formatos aceitos automaticamente:
                  </div>
                  <div className="text-amber-800 font-mono text-[10.5px] pl-4 space-y-0.5">
                    <div>• Pastel de Carne Tradicional - R$ 14,00 - Carne moída de primeira, ovo e azeitonas</div>
                    <div>• Pastel de Queijo Especial - R$ 13,00 - Mussarela selecionada e orégano</div>
                    <div>• Caldo de Cana Gelado 500ml - R$ 8,00</div>
                  </div>
                </div>
              )}

              {/* Textarea */}
              <div className="flex flex-col space-y-1">
                <textarea
                  value={bulkText}
                  onChange={(e) => {
                    setBulkText(e.target.value);
                    setBulkError(null);
                  }}
                  rows={6}
                  placeholder={
                    bulkMode === 'text'
                      ? 'Cole aqui a lista de produtos...\n\nPastel de Carne Tradicional - R$ 14,00 - Carne moída, ovo, azeitonas\nPastel de Queijo Especial - R$ 13,00 - Mussarela e orégano\nCaldo de Cana Gelado 500ml - R$ 8,00'
                      : '[\n  { "name": "Pastel de Carne", "price": 14, "category": "salgados" }\n]'
                  }
                  className="w-full h-36 sm:h-44 p-3 rounded-xl border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-stone-50/50 resize-y"
                />
              </div>

              {/* Selection Mode: Replace vs Append */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2 text-xs">
                <div className="font-bold text-stone-800">Opção de Cadastro:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    onClick={() => setBulkReplaceExisting(true)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      bulkReplaceExisting
                        ? 'bg-amber-50/90 border-amber-500 text-amber-950 font-bold shadow-xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="bulkModeChoice"
                      checked={bulkReplaceExisting}
                      onChange={() => setBulkReplaceExisting(true)}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-bold text-xs text-stone-900">Substituir Cardápio</div>
                      <div className="text-[11px] font-normal text-stone-500 mt-0.5">
                        Define esta lista como o cardápio oficial, removendo itens antigos de teste
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setBulkReplaceExisting(false)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      !bulkReplaceExisting
                        ? 'bg-amber-50/90 border-amber-500 text-amber-950 font-bold shadow-xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="bulkModeChoice"
                      checked={!bulkReplaceExisting}
                      onChange={() => setBulkReplaceExisting(false)}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-bold text-xs text-stone-900">Acrescentar / Atualizar</div>
                      <div className="text-[11px] font-normal text-stone-500 mt-0.5">
                        Mantém os itens já cadastrados e adiciona ou atualiza estes
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Quick Options */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={bulkAddGiant}
                    onChange={(e) => setBulkAddGiant(e.target.checked)}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Adicionar opção Gigante (30cm) para pastéis (+R$</span>
                  <input
                    type="number"
                    step="0.5"
                    value={bulkGiantDelta}
                    onChange={(e) => setBulkGiantDelta(e.target.value)}
                    className="w-14 px-1.5 py-0.5 border border-stone-300 rounded text-xs text-center"
                  />
                  <span>)</span>
                </label>

                <div className="text-xs font-bold text-stone-600">
                  Detectados: <span className="text-amber-600 font-extrabold">{parsedBulkItems.length} itens</span>
                </div>
              </div>

              {/* Live Preview List */}
              {parsedBulkItems.length > 0 && (
                <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100 bg-stone-50/50">
                  <div className="px-3 py-1.5 bg-stone-100 font-bold text-[11px] text-stone-700 flex justify-between items-center sticky top-0">
                    <span>Pré-visualização dos itens a serem inseridos:</span>
                    <span className="text-amber-700 font-bold">{parsedBulkItems.length} prontos</span>
                  </div>
                  {parsedBulkItems.map((it, idx) => (
                    <div key={idx} className="px-3 py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 flex-1 truncate pr-2">
                        <span className="font-bold text-stone-900 truncate">{it.name}</span>
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                          {it.category}
                        </span>
                        {it.description && (
                          <span className="text-[11px] text-stone-400 truncate max-w-[200px]">
                            {it.description}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-amber-700 tabular-nums">
                        {formatBRL(it.price)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error & Success Messages */}
              {bulkError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bulkError}</span>
                </div>
              )}

              {bulkSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{bulkSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Actions (Sticky Footer) */}
            <div className="p-3 sm:p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between sm:justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2.5 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-100 font-semibold cursor-pointer text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={parsedBulkItems.length === 0}
                onClick={handleExecuteBulkInsert}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer text-xs shadow-md transition-colors active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>
                  {bulkReplaceExisting ? 'Substituir Cardápio' : 'Inserir Itens'} ({parsedBulkItems.length})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SINGLE PRODUCT MODAL */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl p-4 sm:p-6 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold font-heading text-stone-900">
                {editingItem ? 'Editar Produto' : 'Cadastrar Novo Pastel / Produto'}
              </h3>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
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

              <div className="sticky bottom-0 bg-white flex items-center justify-end gap-2 pt-3 border-t border-stone-100 z-10">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 font-semibold cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer text-xs shadow-xs"
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
