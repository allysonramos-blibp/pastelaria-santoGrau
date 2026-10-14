import React, { useState, useEffect } from 'react';
import { getApiConfig, saveApiConfig, testBackendConnection, ApiConfig } from '../services/api';
import { SPRING_BOOT_PROJECT_FILES, ProjectFile } from '../data/springBootProjectFiles';
import JSZip from 'jszip';
import {
  Server,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Code,
  Download,
  Folder,
  FileCode,
  Globe,
  RefreshCw,
  Terminal,
  Play,
} from 'lucide-react';

import { CloudDeployGuide } from './CloudDeployGuide';

export const SpringBootIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'deploy' | 'code'>('deploy');
  const [config, setConfig] = useState<ApiConfig>(getApiConfig());
  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    result?: { success: boolean; message: string; latencyMs?: number };
  }>({
    loading: false,
  });

  const [selectedFile, setSelectedFile] = useState<ProjectFile>(SPRING_BOOT_PROJECT_FILES[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    saveApiConfig(config);
  }, [config]);

  const handleTestPing = async () => {
    setTestStatus({ loading: true });
    const res = await testBackendConnection(config.baseUrl);
    setTestStatus({ loading: false, result: res });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Generate and download full .ZIP package
  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add each file to the zip archive preserving directory structure
      SPRING_BOOT_PROJECT_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pastelaria-api-spring-boot.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar arquivo zip:', err);
      alert('Não foi possível gerar o ZIP automaticamente.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Sub Tabs: Deploy na Nuvem vs Código Java */}
      <div className="flex border-b border-stone-200 gap-2 pb-1">
        <button
          onClick={() => setActiveTab('deploy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'deploy'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>☁️ Deploy na Nuvem (Vercel + Render + Neon)</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'code'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>☕ Código Java & Arquivos do Backend</span>
        </button>
      </div>

      {activeTab === 'deploy' ? (
        <CloudDeployGuide />
      ) : (
        <>
          {/* Top Banner */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                <Server className="w-4 h-4" />
                <span>Projeto Backend Completo</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-stone-900">
                API Java (Spring Boot 3 + JPA)
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Projeto Java 100% pronto com Controllers, Entidades, Repositórios, H2/PostgreSQL e CORS configurado.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isZipping ? 'Compactando...' : 'Baixar Projeto Completo (.ZIP)'}</span>
              </button>
            </div>
          </div>

      {/* Quick Setup instructions cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black">
              1
            </div>
            <span>Baixe ou Abra na IDE</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Clique no botão acima para baixar o ZIP ou abra a pasta <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px]">backend-spring-boot</code> no IntelliJ IDEA, Eclipse ou VS Code.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black">
              2
            </div>
            <span>Execute com 1 Comando</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            No terminal da pasta, rode <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px] font-mono">mvn spring-boot:run</code> ou clique em Run na classe <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px]">PastelariaApplication.java</code>.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black">
              3
            </div>
            <span>Banco Pré-Configurado</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            O banco H2 em memória já inicia com todos os pastéis (Carne, Queijo, Frango, Caldo de Cana) sem você precisar instalar nada!
          </p>
        </div>
      </div>

      {/* URL Config & Live Health Test */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-600" />
            <span>Conectar Frontend ao Servidor Spring Boot</span>
          </h3>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-stone-600">
              {config.useBackend ? 'Sincronizar via Spring Boot' : 'Usar Memória Local (Offline)'}
            </span>
            <input
              type="checkbox"
              checked={config.useBackend}
              onChange={(e) => setConfig({ ...config, useBackend: e.target.checked })}
              className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Base URL do Spring Boot
            </label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
              placeholder="http://localhost:8080/api"
              className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleTestPing}
              disabled={testStatus.loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testStatus.loading ? 'animate-spin' : ''}`} />
              <span>{testStatus.loading ? 'Testando...' : 'Testar Conexão / Ping'}</span>
            </button>
          </div>
        </div>

        {/* Test Result Callout */}
        {testStatus.result && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
              testStatus.result.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            {testStatus.result.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold">
                {testStatus.result.success ? 'Conexão Bem-Sucedida!' : 'Servidor Spring Boot Inacessível'}
              </div>
              <div className="mt-0.5 leading-relaxed">{testStatus.result.message}</div>
              {testStatus.result.latencyMs !== undefined && (
                <div className="text-[11px] font-mono mt-1 opacity-80">
                  Latência: {testStatus.result.latencyMs}ms
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* File Explorer & Code Viewer */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-stone-900 text-sm">
              Estrutura de Arquivos do Projeto Spring Boot
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(selectedFile.content)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 cursor-pointer shadow-xs"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Arquivo Selecionado</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          {/* File Explorer Sidebar (4 cols) */}
          <div className="md:col-span-4 border-r border-stone-200 p-3 space-y-1 overflow-y-auto max-h-[520px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2 py-1">
              Arquivos Java & Configuração
            </div>
            {SPRING_BOOT_PROJECT_FILES.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
                  selectedFile.path === file.path
                    ? 'bg-amber-100 text-amber-950 font-bold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <FileCode className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer Panel (8 cols) */}
          <div className="md:col-span-8 flex flex-col bg-stone-950 text-stone-100">
            {/* File Path Header */}
            <div className="px-4 py-2.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between text-xs font-mono text-stone-400">
              <span className="truncate">{selectedFile.path}</span>
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                {selectedFile.category}
              </span>
            </div>

            {/* Code */}
            <div className="p-4 font-mono text-xs overflow-x-auto max-h-[480px] leading-relaxed">
              <pre>{selectedFile.content}</pre>
            </div>
          </div>
        </div>
      </div>
    </>
  )}
</div>
  );
};
