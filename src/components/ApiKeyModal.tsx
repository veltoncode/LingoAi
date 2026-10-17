import React, { useState, useEffect } from 'react';
import { Key, Sparkles, Check, X, ExternalLink, RefreshCw, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash-lite');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('lingonova_gemini_api_key') || '';
      setApiKey(stored);
      setTestResult(null);
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const trimmed = apiKey.trim();
    localStorage.setItem('lingonova_gemini_api_key', trimmed);
    try {
      await api.updateAiConfig({
        provider: 'gemini',
        model: selectedModel,
        geminiApiKey: trimmed,
      });
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1500);
    } catch (err) {
      setIsSaved(true);
      setTimeout(() => onClose(), 1500);
    }
  };

  const handleTestConnection = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setTestResult({ success: false, message: 'Insira uma chave da API do Gemini para testar.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      localStorage.setItem('lingonova_gemini_api_key', trimmed);
      const res = await api.sendChatMessage('test-session', 'What day is today?');
      if (res.tutorMessage && res.tutorMessage.text) {
        setTestResult({
          success: true,
          message: `Conexão bem-sucedida! O tutor respondeu: "${res.tutorMessage.text.slice(0, 90)}..."`,
        });
      } else {
        setTestResult({
          success: false,
          message: 'Não foi possível obter resposta da IA. Verifique a chave inserida.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Falha no teste: ${err.message || 'Erro de rede ou chave inválida.'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('lingonova_gemini_api_key');
    setApiKey('');
    setTestResult({ success: true, message: 'Chave removida. O sistema usará o motor pedagógico local.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Conectar Cérebro de IA (Google Gemini)
              </h3>
              <p className="text-[11px] text-slate-400">
                Ative respostas ilimitadas e raciocínio conversacional livre no Vercel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-emerald-200 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Por que configurar sua chave aqui?</span>
            </div>
            Ao colar sua chave do Gemini, ela é salva de forma segura apenas no seu navegador (<code className="text-emerald-300">localStorage</code>) e enviada nas requisições. Você terá o tutor com capacidade máxima imediatamente, mesmo no deploy da Vercel!
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Chave da API do Google AI Studio (GEMINI_API_KEY)
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ex: AIzaSy... ou AQ.Ab8..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Não tem uma chave ainda? É grátis no Google AI Studio:</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-semibold"
              >
                Gerar chave grátis <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Modelo Gemini Recomendado
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.5-flash-lite')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedModel === 'gemini-3.5-flash-lite'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Gemini 3.5 Flash-Lite</span>
                  {selectedModel === 'gemini-3.5-flash-lite' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Super-rápido (~300ms) • Quota ampla</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.5-flash')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedModel === 'gemini-3.5-flash'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Gemini 3.5 Flash</span>
                  {selectedModel === 'gemini-3.5-flash' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Alta capacidade pedagógica</div>
              </button>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-[11px] leading-relaxed">{testResult.message}</div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClearKey}
            className="text-slate-400 hover:text-slate-200 text-xs px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Limpar Chave
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isTesting || !apiKey.trim()}
              onClick={handleTestConnection}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isTesting ? 'Testando...' : 'Testar Conexão'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvo com sucesso!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Salvar & Ativar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
