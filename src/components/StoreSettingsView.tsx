import React, { useState, useEffect } from 'react';
import { StoreSettings, AppUser, UserRole } from '../types';
import { authService } from '../services/auth';
import { formatBRL, formatDateTime } from '../utils/format';
import {
  Save,
  Store,
  QrCode,
  Printer,
  Check,
  Bell,
  Users,
  UserPlus,
  Trash2,
  Crown,
  Briefcase,
  Smartphone,
  ShieldCheck,
  X,
} from 'lucide-react';

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

  // Team & User Management State
  const [teamUsers, setTeamUsers] = useState<AppUser[]>(() => authService.getRegisteredUsers());
  const [showAddUser, setShowAddUser] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('ADMIN');
  const [teamMessage, setTeamMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    authService.fetchUsersFromServer().then((users) => {
      if (users && users.length > 0) setTeamUsers(users);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCreateTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamMessage(null);

    const res = await authService.register({
      name: newName,
      username: newUsername,
      password: newPassword,
      role: newRole,
    });

    if (res.success) {
      setTeamUsers(authService.getRegisteredUsers());
      setNewName('');
      setNewUsername('');
      setNewPassword('');
      setShowAddUser(false);
      setTeamMessage({ text: `Conta de ${newName} criada com sucesso!` });
      setTimeout(() => setTeamMessage(null), 3000);
    } else {
      setTeamMessage({ text: res.message || 'Erro ao criar conta.', error: true });
    }
  };

  const handleDeleteTeamMember = async (userId: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover o acesso de ${name}?`)) {
      await authService.deleteUser(userId);
      setTeamUsers(authService.getRegisteredUsers());
      setTeamMessage({ text: `Acesso de ${name} removido.` });
      setTimeout(() => setTeamMessage(null), 3000);
    }
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

      {/* TEAM & USER ACCOUNTS SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Equipe & Contas de Acesso (ADM & Gerência)
              </h3>
              <p className="text-xs text-stone-500">
                Gerencie quem pode acessar o sistema da pastelaria no celular ou computador
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddUser(!showAddUser)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            {showAddUser ? <X className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5 text-amber-400" />}
            <span>{showAddUser ? 'Cancelar' : 'Cadastrar Membro da Equipe'}</span>
          </button>
        </div>

        {teamMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              teamMessage.error
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{teamMessage.text}</span>
          </div>
        )}

        {/* Form to add a team member (Sister, Manager, Attendant) */}
        {showAddUser && (
          <form
            onSubmit={handleCreateTeamMember}
            className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-4 animate-in fade-in"
          >
            <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-amber-700" />
              <span>Novo Cadastro de Acesso (Ex: Sua Irmã, Sócia ou Atendente)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Minha Irmã (Camila)"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Usuário para Login</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="Ex: irma, camila"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Senha de Acesso</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-stone-700">Cargo & Nível de Permissão:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewRole('ADMIN')}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2 cursor-pointer transition-all ${
                    newRole === 'ADMIN'
                      ? 'border-amber-600 bg-white ring-2 ring-amber-500 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-stone-900">👑 Administradora (ADM)</div>
                    <div className="text-[10px] text-stone-500 leading-tight">Acesso total (igual a você)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewRole('GERENTE')}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2 cursor-pointer transition-all ${
                    newRole === 'GERENTE'
                      ? 'border-amber-600 bg-white ring-2 ring-amber-500 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-stone-900">💼 Gerente</div>
                    <div className="text-[10px] text-stone-500 leading-tight">Cozinha, comandas, caixa e cardápio</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewRole('ATENDENTE')}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2 cursor-pointer transition-all ${
                    newRole === 'ATENDENTE'
                      ? 'border-amber-600 bg-white ring-2 ring-amber-500 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-stone-900">📱 Atendente / Garçom</div>
                    <div className="text-[10px] text-stone-500 leading-tight">Comandas por nome e caixa de balcão</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Criar Conta do Membro
              </button>
            </div>
          </form>
        )}

        {/* Team Members List */}
        <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 overflow-hidden">
          {teamUsers.map((u) => {
            const isRootAdmin = u.username === 'admin';
            return (
              <div
                key={u.id}
                className="p-4 bg-white hover:bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      u.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-800'
                        : u.role === 'GERENTE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {u.role === 'ADMIN' ? '👑' : u.role === 'GERENTE' ? '💼' : '📱'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">{u.name}</span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-100 text-amber-800'
                            : u.role === 'GERENTE'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role === 'ADMIN' && 'Administrador (ADM)'}
                        {u.role === 'GERENTE' && 'Gerente'}
                        {u.role === 'ATENDENTE' && 'Atendente / Garçom'}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 font-mono mt-0.5">
                      Usuário: <span className="font-semibold text-stone-700">@{u.username}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isRootAdmin ? (
                    <span className="text-[11px] font-semibold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-lg">
                      Conta Principal
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDeleteTeamMember(u.id, u.name)}
                      className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remover acesso deste usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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

            <div id="qr-print-tent" className="p-6 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300 flex flex-col items-center">
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
