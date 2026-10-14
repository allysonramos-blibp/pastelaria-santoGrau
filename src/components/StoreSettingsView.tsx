import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { formatBRL } from '../utils/format';
import { Save, Store, QrCode, Printer, Check, Bell } from 'lucide-react';

interface StoreSettingsViewProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
}

export const StoreSettingsView: React.FC<StoreSettingsViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [form, setForm] = useState<StoreSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-stone-200">
        <div>
          <h2 className="text-xl font-bold font-heading text-stone-900">
            Configurações da Pastelaria
          </h2>
          <p className="text-xs text-stone-500">
            Ajuste informações comerciais, WhatsApp para pedidos, taxas e horários
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-600" />
            <span>QR Code para Mesas</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
        {/* Basic identity */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
            Identidade do Estabelecimento
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Nome da Pastelaria *
              </label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Slogan / Frase de Destaque
              </label>
              <input
                type="text"
                value={form.slogan}
                onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                WhatsApp de Recebimento de Pedidos * (com DDD)
              </label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                placeholder="Ex: 5511999998888"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Número para onde os clientes enviarão o pedido pronto formatado.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Endereço Físico
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* PIX & Financial Settings */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
            Pagamentos & Taxas
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">
                Chave PIX
              </label>
              <input
                type="text"
                value={form.pixKey}
                onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
                placeholder="Ex: 11999998888 ou pastelariadahora@gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Tipo de Chave
              </label>
              <select
                value={form.pixKeyType}
                onChange={(e) => setForm({ ...form, pixKeyType: e.target.value as StoreSettings['pixKeyType'] })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
              >
                <option value="telefone">Telefone</option>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">E-mail</option>
                <option value="aleatoria">Aleatória</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Taxa Padrão de Entrega (R$)
              </label>
              <input
                type="number"
                step="0.5"
                value={form.defaultDeliveryFee}
                onChange={(e) => setForm({ ...form, defaultDeliveryFee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Horário de Funcionamento
              </label>
              <input
                type="text"
                value={form.openingHours}
                onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Operational toggles */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
            Status Operacional
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-stone-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900 block text-sm">
                  Pastelaria Aberta para Pedidos
                </span>
                <span className="text-stone-500 text-xs">
                  {form.isOpen ? 'Recebendo pedidos normalmente' : 'Loja fechada temporariamente'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.isOpen}
                onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
                className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900 block text-sm">
                  Alertas Sonoros na Cozinha
                </span>
                <span className="text-stone-500 text-xs">
                  Tocar som de campainha ao chegar novo pedido
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.soundAlertsEnabled}
                onChange={(e) => setForm({ ...form, soundAlertsEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <Check className="w-4 h-4" /> Configurações salvas com sucesso!
            </span>
          )}
          {!savedSuccess && <div />}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>

      {/* QR Code Modal for Tables */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-stone-200 shadow-2xl">
            <h3 className="text-lg font-bold font-heading text-stone-900">
              Placa de Mesa & Balcão com QR Code
            </h3>
            <p className="text-xs text-stone-500">
              Coloque nas mesas ou no balcão da pastelaria para os clientes acessarem o cardápio no celular.
            </p>

            <div className="p-6 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300 flex flex-col items-center">
              {/* Simulated crisp QR code representation */}
              <div className="w-44 h-44 bg-white p-3 rounded-xl shadow-xs border border-stone-200 flex flex-col items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-stone-900" fill="currentColor">
                  {/* Position detection patterns */}
                  <rect x="5" y="5" width="25" height="25" />
                  <rect x="8" y="8" width="19" height="19" fill="white" />
                  <rect x="12" y="12" width="11" height="11" />
                  
                  <rect x="70" y="5" width="25" height="25" />
                  <rect x="73" y="8" width="19" height="19" fill="white" />
                  <rect x="77" y="12" width="11" height="11" />
                  
                  <rect x="5" y="70" width="25" height="25" />
                  <rect x="8" y="73" width="19" height="19" fill="white" />
                  <rect x="12" y="77" width="11" height="11" />

                  {/* QR Data bits matrix */}
                  <rect x="35" y="10" width="5" height="5" />
                  <rect x="45" y="10" width="10" height="5" />
                  <rect x="60" y="10" width="5" height="5" />
                  <rect x="35" y="20" width="5" height="10" />
                  <rect x="45" y="25" width="15" height="5" />

                  <rect x="10" y="35" width="10" height="5" />
                  <rect x="25" y="40" width="5" height="15" />
                  <rect x="35" y="35" width="10" height="10" />
                  <rect x="50" y="40" width="10" height="5" />
                  <rect x="65" y="35" width="15" height="5" />
                  <rect x="85" y="40" width="5" height="10" />

                  <rect x="15" y="55" width="10" height="5" />
                  <rect x="35" y="50" width="5" height="15" />
                  <rect x="45" y="55" width="10" height="10" />
                  <rect x="65" y="50" width="10" height="10" />
                  <rect x="80" y="55" width="10" height="5" />

                  <rect x="35" y="75" width="15" height="5" />
                  <rect x="55" y="70" width="5" height="15" />
                  <rect x="65" y="75" width="10" height="5" />
                  <rect x="80" y="70" width="10" height="10" />
                  <rect x="40" y="85" width="20" height="5" />
                  <rect x="70" y="85" width="15" height="10" />
                </svg>
              </div>

              <div className="mt-3 font-bold text-sm text-stone-900">{form.storeName}</div>
              <div className="text-[11px] text-stone-600">Aponte a câmera e peça pelo celular</div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Plaquinha</span>
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
