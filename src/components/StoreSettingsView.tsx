import React, { useState, useEffect } from 'react';
import { StoreSettings, AppUser, UserRole } from '../types';
import { authService } from '../services/auth';
import {
  Save,
  QrCode,
  Printer,
  Check,
  Users,
  UserPlus,
  Trash2,
  Crown,
  Briefcase,
  Smartphone,
  KeyRound,
  X,
  RefreshCw,
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

  // Server-backed Team & User Management State
  const [teamUsers, setTeamUsers] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('GERENTE');
  const [teamMessage, setTeamMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Inline password reset state
  const [editingPasswordUserId, setEditingPasswordUserId] = useState<string | null>(null);
  const [updatedPassword, setUpdatedPassword] = useState('');
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  const loadServerUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await authService.fetchUsersFromServer();
      setTeamUsers(users);
    } catch {
      setTeamMessage({ text: 'Não foi possível carregar a lista de usuários do servidor.', error: true });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadServerUsers();
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

    const res = await authService.createTeamMember({
      name: newName,
      username: newUsername,
      password: newPassword,
      role: newRole,
    });

    if (res.success) {
      await loadServerUsers();
      setNewName('');
      setNewUsername('');
      setNewPassword('');
      setShowAddUser(false);
      setTeamMessage({ text: `Conta de ${newName} salva no servidor! Já pode acessar de qualquer celular.` });
      setTimeout(() => setTeamMessage(null), 4000);
    } else {
      setTeamMessage({ text: res.message || 'Erro ao criar conta.', error: true });
    }
  };

  const handleUpdateUserPassword = async (userId: string, userName: string) => {
    if (updatedPassword.trim().length < 3) {
      setTeamMessage({ text: 'A nova senha deve ter pelo menos 3 caracteres.', error: true });
      return;
    }
    const res = await authService.updateTeamMember(userId, { password: updatedPassword.trim() });
    if (res.success) {
      setEditingPasswordUserId(null);
      setUpdatedPassword('');
      await loadServerUsers();
      setTeamMessage({ text: `Senha de ${userName} atualizada no servidor com sucesso!` });
      setTimeout(() => setTeamMessage(null), 3500);
    } else {
      setTeamMessage({ text: res.message || 'Erro ao atualizar senha.', error: true });
    }
  };

  const handleDeleteTeamMember = async (userId: string, name: string) => {
    const ok = await authService.deleteUser(userId);
    setConfirmDeleteUserId(null);
    if (ok) {
      await loadServerUsers();
      setTeamMessage({ text: `Acesso de ${name} removido do servidor.` });
      setTimeout(() => setTeamMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top 3D Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 card-3d p-5 rounded-3xl">
        <div>
          <h2 className="text-xl font-black font-heading text-stone-900">
            Configurações da Pastelaria
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Dados sincronizados no servidor para todos os dispositivos em tempo real
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-3d-white text-xs font-bold cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-600" />
            <span>QR Code para Mesas</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-3d p-6 rounded-3xl space-y-6">
        {/* Basic identity */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2">
            Identidade do Estabelecimento
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1.5">
                Nome da Pastelaria *
              </label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl input-3d text-sm font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1.5">
                Slogan / Frase de Destaque
              </label>
              <input
                type="text"
                value={form.slogan}
                onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl input-3d text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1.5">
                WhatsApp de Recebimento de Pedidos * (com DDD)
              </label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                placeholder="Ex: 5511999998888"
                className="w-full px-3.5 py-2.5 rounded-xl input-3d text-sm font-medium"
                required
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Número para onde os clientes enviarão o pedido formatado.
              </p>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1.5">
                Endereço Físico
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl input-3d text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* PIX & Financial Settings */}
        <div className="space-y-4 pt-4 border-t border-stone-200/70">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2">
            Pagamentos & Taxas
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1.5">
                Chave PIX
              </label>
              <input
                type="text"
                value={form.pixKey}
                onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
                placeholder="Ex: 11999998888 ou email@dominio.com"
                className="w-full px-3.5 py-2.5 rounded-xl input-3d text-sm font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1.5">
                Tipo de Chave
              </label>
              <select
                value={form.pixKeyType}
                onChange={(e) =>
                  setForm({ ...form, pixKeyType: e.target.value as StoreSettings['pixKeyType'] })
                }
                className="w-full px-3.5 py-2.5 rounded-xl input-3d text-xs font-semibold"
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
              <label className="block font-bold text-stone-700 mb-1.5">
                Taxa Padrão de Entrega (R$)
              </label>
              <input
                type="number"
                step="0.5"
                value={form.defaultDeliveryFee}
                onChange={(e) =>
                  setForm({ ...form, defaultDeliveryFee: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl input-3d text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1.5">
                Horário de Funcionamento
              </label>
              <input
                type="text"
                value={form.openingHours}
                onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl input-3d text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Operational toggles */}
        <div className="space-y-4 pt-4 border-t border-stone-200/70">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2">
            Status Operacional
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <label className="p-4 rounded-2xl border-2 border-stone-200 bg-stone-50/70 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors">
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
            </label>

            <label className="p-4 rounded-2xl border-2 border-stone-200 bg-stone-50/70 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors">
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
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200/70">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Configurações salvas no servidor!
            </span>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 btn-3d-amber rounded-2xl text-xs font-bold cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações no Servidor</span>
          </button>
        </div>
      </form>

      {/* SERVER-BACKED TEAM & USER ACCOUNTS SECTION */}
      <div className="card-3d p-6 rounded-3xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl btn-3d-amber flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black font-heading text-stone-900">
                Equipe & Contas de Acesso (Salvas no Servidor)
              </h3>
              <p className="text-xs text-stone-500">
                Qualquer membro cadastrado aqui acessa de qualquer celular ou computador sem depender de memória local
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadServerUsers}
              className="p-2.5 rounded-xl btn-3d-white cursor-pointer"
              title="Recarregar usuários do servidor"
            >
              <RefreshCw className={`w-4 h-4 text-stone-700 ${loadingUsers ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setShowAddUser(!showAddUser)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 btn-3d-dark rounded-xl text-xs font-bold cursor-pointer"
            >
              {showAddUser ? (
                <X className="w-3.5 h-3.5" />
              ) : (
                <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{showAddUser ? 'Cancelar' : 'Novo Membro'}</span>
            </button>
          </div>
        </div>

        {teamMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              teamMessage.error
                ? 'bg-red-50 text-red-800 border-2 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-2 border-emerald-200'
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{teamMessage.text}</span>
          </div>
        )}

        {showAddUser && (
          <form
            onSubmit={handleCreateTeamMember}
            className="p-5 bg-amber-50/70 rounded-2xl border-2 border-amber-200 space-y-4"
          >
            <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-amber-700" />
              <span>Cadastrar Membro no Servidor</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Alessandra Ramos"
                  className="w-full px-3 py-2.5 rounded-xl input-3d font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Usuário para Login</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) =>
                    setNewUsername(e.target.value.toLowerCase().replace(/^@/, '').replace(/\s/g, ''))
                  }
                  placeholder="Ex: alessandraramos"
                  className="w-full px-3 py-2.5 rounded-xl input-3d font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Senha de Acesso</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 3 caracteres"
                  className="w-full px-3 py-2.5 rounded-xl input-3d font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-stone-700">Cargo & Nível de Permissão:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setNewRole('ADMIN')}
                  className={`p-3 rounded-xl border-2 text-left flex items-start gap-2 cursor-pointer transition-all ${
                    newRole === 'ADMIN'
                      ? 'border-amber-600 bg-white shadow-sm'
                      : 'border-stone-200 bg-white/80 hover:bg-white'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-stone-900">Administrador (ADM)</div>
                    <div className="text-[10px] text-stone-500 leading-tight">Acesso total</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewRole('GERENTE')}
                  className={`p-3 rounded-xl border-2 text-left flex items-start gap-2 cursor-pointer transition-all ${
                    newRole === 'GERENTE'
                      ? 'border-amber-600 bg-white shadow-sm'
                      : 'border-stone-200 bg-white/80 hover:bg-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-stone-900">Gerente</div>
                    <div className="text-[10px] text-stone-500 leading-tight">
                      Cozinha, comandas, PDV e cardápio
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewRole('ATENDENTE')}
                  className={`p-3 rounded-xl border-2 text-left flex items-start gap-2 cursor-pointer transition-all ${
                    newRole === 'ATENDENTE'
                      ? 'border-amber-600 bg-white shadow-sm'
                      : 'border-stone-200 bg-white/80 hover:bg-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-stone-900">Atendente / Garçom</div>
                    <div className="text-[10px] text-stone-500 leading-tight">
                      Comandas e caixa de balcão
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 btn-3d-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 btn-3d-emerald rounded-xl text-xs font-bold cursor-pointer"
              >
                Salvar Conta no Servidor
              </button>
            </div>
          </form>
        )}

        {/* Team Members List */}
        <div className="divide-y divide-stone-200/70 rounded-2xl border-2 border-stone-200 overflow-hidden bg-white">
          {teamUsers.map((u) => {
            const isRootAdmin = u.username === 'admin';
            const isEditingPass = editingPasswordUserId === u.id;
            const isConfirmingDelete = confirmDeleteUserId === u.id;

            return (
              <div
                key={u.id}
                className="p-4 hover:bg-stone-50/70 flex flex-col gap-3 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 text-sm">
                      {u.role === 'ADMIN' ? (
                        <Crown className="w-4 h-4 text-amber-600" />
                      ) : u.role === 'GERENTE' ? (
                        <Briefcase className="w-4 h-4 text-amber-700" />
                      ) : (
                        <Smartphone className="w-4 h-4 text-stone-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-sm text-stone-900">{u.name}</span>
                        <span className="text-stone-400" aria-hidden="true">·</span>
                        <span className="text-xs font-semibold text-amber-800">
                          {u.role === 'ADMIN'
                            ? 'Administrador'
                            : u.role === 'GERENTE'
                            ? 'Gerente'
                            : 'Atendente'}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 font-mono mt-0.5">
                        Login: <strong className="text-stone-800">{u.username}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (isEditingPass) {
                          setEditingPasswordUserId(null);
                          setUpdatedPassword('');
                        } else {
                          setEditingPasswordUserId(u.id);
                          setUpdatedPassword('');
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-3d-white text-xs font-bold cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isEditingPass ? 'Fechar' : 'Alterar Senha'}</span>
                    </button>

                    {!isRootAdmin && (
                      <>
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDeleteTeamMember(u.id, u.name)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold cursor-pointer"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteUserId(null)}
                              className="px-2 py-1.5 rounded-lg bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteUserId(u.id)}
                            className="p-2 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remover acesso deste usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {isEditingPass && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-stone-100">
                    <input
                      type="text"
                      value={updatedPassword}
                      onChange={(e) => setUpdatedPassword(e.target.value)}
                      placeholder={`Nova senha para ${u.username}...`}
                      className="flex-1 px-3 py-2 rounded-xl input-3d text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateUserPassword(u.id, u.name)}
                      className="px-4 py-2 rounded-xl btn-3d-emerald text-xs font-bold cursor-pointer"
                    >
                      Salvar Nova Senha
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Code Modal for Tables */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs">
          <div className="card-3d rounded-3xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="text-lg font-black font-heading text-stone-900">
              Placa de Mesa & Balcão com QR Code
            </h3>
            <p className="text-xs text-stone-500">
              Coloque nas mesas ou no balcão da pastelaria para os clientes acessarem o cardápio no celular.
            </p>

            <div
              id="qr-print-tent"
              className="p-6 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300 flex flex-col items-center"
            >
              <div className="w-44 h-44 bg-white p-3 rounded-xl shadow-xs border border-stone-200 flex flex-col items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-stone-900" fill="currentColor">
                  <rect x="5" y="5" width="25" height="25" />
                  <rect x="8" y="8" width="19" height="19" fill="white" />
                  <rect x="12" y="12" width="11" height="11" />

                  <rect x="70" y="5" width="25" height="25" />
                  <rect x="73" y="8" width="19" height="19" fill="white" />
                  <rect x="77" y="12" width="11" height="11" />

                  <rect x="5" y="70" width="25" height="25" />
                  <rect x="8" y="73" width="19" height="19" fill="white" />
                  <rect x="12" y="77" width="11" height="11" />

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
                className="flex items-center gap-1.5 px-4 py-2.5 btn-3d-dark rounded-xl text-xs font-bold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Plaquinha</span>
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2.5 btn-3d-white rounded-xl text-xs font-bold cursor-pointer"
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
