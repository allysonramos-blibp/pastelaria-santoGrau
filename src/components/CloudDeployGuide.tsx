import React, { useState } from 'react';
import {
  Cloud,
  Database,
  Server,
  Zap,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HelpCircle,
  Key,
} from 'lucide-react';
import { testBackendConnection } from '../services/api';

export const CloudDeployGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Neon connection string parser state (pre-filled with configured database)
  const [neonInput, setNeonInput] = useState(
    'postgresql://neondb_owner:npg_TwvgO8qDR7BL@ep-curly-cloud-b5keor3y-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  );
  const [renderTestUrl, setRenderTestUrl] = useState('');
  const [testResult, setTestResult] = useState<{
    loading: boolean;
    result?: { success: boolean; message: string; latencyMs?: number };
  }>({ loading: false });

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Helper to parse Neon postgresql:// URL
  const parseNeonString = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    try {
      // Expecting postgresql://user:password@host/database?... or postgres://...
      const url = new URL(trimmed.replace(/^jdbc:/, ''));
      const username = decodeURIComponent(url.username);
      const password = decodeURIComponent(url.password);
      const host = url.host;
      const pathname = url.pathname.replace(/^\//, '') || 'neondb';

      const jdbcUrl = `jdbc:postgresql://${host}/${pathname}?sslmode=require`;

      return {
        host,
        database: pathname,
        username,
        password,
        jdbcUrl,
      };
    } catch {
      // Regex fallback
      const match = trimmed.match(/^(?:postgresql|postgres):\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
      if (match) {
        const [, username, password, host, database] = match;
        return {
          host,
          database,
          username,
          password,
          jdbcUrl: `jdbc:postgresql://${host}/${database}?sslmode=require`,
        };
      }
      return null;
    }
  };

  const parsedNeon = parseNeonString(neonInput);

  const handleTestRenderApi = async () => {
    if (!renderTestUrl.trim()) return;
    setTestResult({ loading: true });
    const formattedUrl = renderTestUrl.trim().replace(/\/$/, '');
    const apiEndpoint = formattedUrl.endsWith('/api') ? formattedUrl : `${formattedUrl}/api`;
    const res = await testBackendConnection(apiEndpoint);
    setTestResult({ loading: false, result: res });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
            <Cloud className="w-3.5 h-3.5" />
            <span>Guia de Deploy na Nuvem (100% Gratuito)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            Vercel + Render + Neon PostgreSQL
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Configure seu banco de dados no <strong>Neon</strong>, sua API Java Spring Boot no <strong>Render</strong> e o cardápio PWA na <strong>Vercel</strong> com sincronização contínua pelo GitHub.
          </p>
        </div>
      </div>

      {/* ETAPA 1: NEON */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
              1
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Neon (Banco PostgreSQL Serverless)</span>
              </h3>
              <p className="text-xs text-stone-500">Crie o banco gratuito em menos de 1 minuto</p>
            </div>
          </div>
          <a
            href="https://neon.tech"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700 transition-colors"
          >
            <span>Acessar Neon</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="text-xs text-stone-600 space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200/80">
          <p className="font-semibold text-stone-800">Passos no painel do Neon:</p>
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>Faça login com seu GitHub em <strong>neon.tech</strong>.</li>
            <li>Clique em <strong>"Create Project"</strong> (ex: <code className="bg-white px-1 py-0.5 rounded border border-stone-200">pastelaria-db</code>).</li>
            <li>No Dashboard principal, localize <strong>"Connection Details"</strong>.</li>
            <li>Selecione a aba <strong>"Connection string"</strong> e copie a URL completa.</li>
          </ol>
        </div>

        {/* Gerador e extrator inteligente de variáveis do Neon */}
        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Extrator Automático: Cole sua URL do Neon aqui:</span>
          </div>

          <input
            type="text"
            value={neonInput}
            onChange={(e) => setNeonInput(e.target.value)}
            placeholder="postgresql://alex:Abc123Xyz@ep-cool-flower-123.us-east-2.aws.neon.tech/neondb?sslmode=require"
            className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {parsedNeon ? (
            <div className="space-y-2 pt-2 border-t border-emerald-200">
              <div className="text-xs font-bold text-emerald-900">
                ✅ Dados extraídos prontos para preencher no Render:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-white rounded-lg border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-500 block">SPRING_DATASOURCE_URL:</span>
                    <span className="font-bold text-emerald-950 truncate max-w-[280px] block">{parsedNeon.jdbcUrl}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(parsedNeon.jdbcUrl, 'neon_jdbc')}
                    className="p-1.5 hover:bg-stone-100 rounded text-stone-600 cursor-pointer"
                  >
                    {copiedKey === 'neon_jdbc' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-500 block">SPRING_DATASOURCE_USERNAME:</span>
                    <span className="font-bold text-emerald-950 block">{parsedNeon.username}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(parsedNeon.username, 'neon_user')}
                    className="p-1.5 hover:bg-stone-100 rounded text-stone-600 cursor-pointer"
                  >
                    {copiedKey === 'neon_user' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-500 block">SPRING_DATASOURCE_PASSWORD:</span>
                    <span className="font-bold text-emerald-950 block">••••••••</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(parsedNeon.password, 'neon_pass')}
                    className="p-1.5 hover:bg-stone-100 rounded text-stone-600 cursor-pointer"
                  >
                    {copiedKey === 'neon_pass' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-500 block">HOST / ENDPOINT:</span>
                    <span className="font-bold text-emerald-950 truncate max-w-[280px] block">{parsedNeon.host}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(parsedNeon.host, 'neon_host')}
                    className="p-1.5 hover:bg-stone-100 rounded text-stone-600 cursor-pointer"
                  >
                    {copiedKey === 'neon_host' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-emerald-800">
              💡 Dica: Ao colar a connection string do Neon, nós separamos e formatamos automaticamente a <strong>JDBC URL</strong> compatível com o Spring Boot!
            </p>
          )}
        </div>
      </div>

      {/* ETAPA 2: RENDER */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-sm">
              2
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-600" />
                <span>Render (API Java Spring Boot 3)</span>
              </h3>
              <p className="text-xs text-stone-500">Hospede o backend com Docker e SSL automático</p>
            </div>
          </div>
          <a
            href="https://dashboard.render.com/select-repo?type=web"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors"
          >
            <span>Criar Web Service</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="text-xs text-stone-600 space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200/80">
          <p className="font-semibold text-stone-800">Configurações principais ao criar o serviço:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[11px]">Repositório GitHub:</span>
              <span className="font-mono font-bold text-stone-900">allysonramos-blibp/pastelaria-santoGrau</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[11px]">Root Directory (⚠️ Essencial):</span>
              <span className="font-mono font-bold text-amber-700">backend-spring-boot</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[11px]">Runtime:</span>
              <span className="font-mono font-bold text-stone-900">Docker</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[11px]">Plano:</span>
              <span className="font-mono font-bold text-stone-900">Free ($0/mês)</span>
            </div>
          </div>
        </div>

        {/* Tabela de Variáveis de Ambiente do Render */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-600" />
              <span>Variáveis de Ambiente no Render (Environment Variables)</span>
            </h4>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Key (Nome)</th>
                  <th className="py-2.5 px-3">Value (Valor)</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-mono">
                <tr className="hover:bg-stone-50">
                  <td className="py-2 px-3 font-bold text-purple-900">SPRING_PROFILES_ACTIVE</td>
                  <td className="py-2 px-3 text-stone-600">prod</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => copyToClipboard('prod', 'var_profile')}
                      className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] cursor-pointer"
                    >
                      {copiedKey === 'var_profile' ? 'Copiado!' : 'Copiar Valor'}
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-stone-50">
                  <td className="py-2 px-3 font-bold text-purple-900">SPRING_DATASOURCE_URL</td>
                  <td className="py-2 px-3 text-stone-600 truncate max-w-[260px]">
                    {parsedNeon?.jdbcUrl || 'jdbc:postgresql://[HOST-NEON]/neondb?sslmode=require'}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          parsedNeon?.jdbcUrl || 'jdbc:postgresql://[HOST-NEON]/neondb?sslmode=require',
                          'var_url'
                        )
                      }
                      className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] cursor-pointer"
                    >
                      {copiedKey === 'var_url' ? 'Copiado!' : 'Copiar Valor'}
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-stone-50">
                  <td className="py-2 px-3 font-bold text-purple-900">SPRING_DATASOURCE_USERNAME</td>
                  <td className="py-2 px-3 text-stone-600">
                    {parsedNeon?.username || '[USUARIO-DO-NEON]'}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => copyToClipboard(parsedNeon?.username || 'neondb_owner', 'var_user')}
                      className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] cursor-pointer"
                    >
                      {copiedKey === 'var_user' ? 'Copiado!' : 'Copiar Valor'}
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-stone-50">
                  <td className="py-2 px-3 font-bold text-purple-900">SPRING_DATASOURCE_PASSWORD</td>
                  <td className="py-2 px-3 text-stone-600">
                    {parsedNeon?.password ? '••••••••' : '[SENHA-DO-NEON]'}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => copyToClipboard(parsedNeon?.password || 'SUA_SENHA', 'var_pass')}
                      className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] cursor-pointer"
                    >
                      {copiedKey === 'var_pass' ? 'Copiado!' : 'Copiar Valor'}
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-stone-50">
                  <td className="py-2 px-3 font-bold text-purple-900">PORT</td>
                  <td className="py-2 px-3 text-stone-600">8080</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => copyToClipboard('8080', 'var_port')}
                      className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] cursor-pointer"
                    >
                      {copiedKey === 'var_port' ? 'Copiado!' : 'Copiar Valor'}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Testar backend do Render */}
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
              <span>Testar se o seu Backend no Render já está Online:</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={renderTestUrl}
              onChange={(e) => setRenderTestUrl(e.target.value)}
              placeholder="https://pastelaria-backend-api.onrender.com"
              className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-purple-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleTestRenderApi}
              disabled={testResult.loading || !renderTestUrl.trim()}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testResult.loading ? 'animate-spin' : ''}`} />
              <span>{testResult.loading ? 'Verificando...' : 'Testar URL'}</span>
            </button>
          </div>

          {testResult.result && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                testResult.result.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              {testResult.result.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{testResult.result.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* ETAPA 3: VERCEL */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm">
              3
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Vercel (Frontend React + PWA)</span>
              </h3>
              <p className="text-xs text-stone-500">Hospede o cardápio com CDN global e HTTPS ultra rápido</p>
            </div>
          </div>
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            <span>Importar na Vercel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="text-xs text-stone-600 space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200/80">
          <p className="font-semibold text-stone-800">Passos na Vercel:</p>
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>Em <strong>vercel.com/new</strong>, selecione o repositório <strong>pastelaria-santoGrau</strong> e clique em <strong>Import</strong>.</li>
            <li><strong>Framework Preset:</strong> Vite (detectado automaticamente).</li>
            <li><strong>Root Directory:</strong> deixe em branco ou <code className="bg-white px-1 py-0.5 rounded border border-stone-200">./</code> (raiz).</li>
            <li>Abra a seção <strong>Environment Variables</strong> e adicione a variável abaixo:</li>
          </ol>
        </div>

        {/* Variável de ambiente da Vercel */}
        <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3">
          <div className="text-xs font-bold text-blue-950">
            Variável de Ambiente necessária na Vercel:
          </div>

          <div className="p-3 bg-white rounded-lg border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs">
            <div>
              <span className="text-[10px] text-stone-500 block">KEY:</span>
              <span className="font-bold text-blue-900">VITE_API_URL</span>
            </div>

            <div className="flex-1 sm:px-4">
              <span className="text-[10px] text-stone-500 block">VALUE (Cole o link do seu Render com /api):</span>
              <span className="text-stone-700 truncate block">
                {renderTestUrl.trim()
                  ? `${renderTestUrl.trim().replace(/\/$/, '')}/api`
                  : 'https://pastelaria-backend-api.onrender.com/api'}
              </span>
            </div>

            <button
              onClick={() =>
                copyToClipboard(
                  renderTestUrl.trim()
                    ? `${renderTestUrl.trim().replace(/\/$/, '')}/api`
                    : 'https://pastelaria-backend-api.onrender.com/api',
                  'var_vite_url'
                )
              }
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shrink-0 text-xs flex items-center gap-1 justify-center"
            >
              {copiedKey === 'var_vite_url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'var_vite_url' ? 'Copiado!' : 'Copiar Valor'}</span>
            </button>
          </div>

          <p className="text-[11px] text-blue-800">
            ✨ O arquivo <code className="bg-blue-100/80 px-1 py-0.5 rounded">vercel.json</code> já está configurado no repositório para garantir que todas as rotas e o PWA funcionem perfeitamente!
          </p>
        </div>
      </div>

      {/* Resumo & Dúvidas Rápidas */}
      <div className="bg-stone-100 p-5 rounded-2xl border border-stone-300/80 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-700 space-y-1">
          <div className="font-bold text-stone-900">Como tudo se conecta na nuvem?</div>
          <p>
            1. O cliente abre o cardápio no domínio da <strong>Vercel</strong> (ex: <code className="bg-stone-200 px-1 py-0.5 rounded">https://pastelaria.vercel.app</code>).<br />
            2. O aplicativo faz requisições HTTPS para a API Java no <strong>Render</strong> (<code className="bg-stone-200 px-1 py-0.5 rounded">https://...onrender.com/api</code>).<br />
            3. A API Java gerencia pedidos, cardápio e login salvando tudo de forma permanente no banco <strong>Neon PostgreSQL</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
