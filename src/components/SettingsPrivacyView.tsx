import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Trash2, 
  Check, 
  Sliders, 
  Lock, 
  User, 
  AlertTriangle,
  RefreshCw,
  Cpu,
  Sparkles,
  Zap,
  DollarSign,
  Key,
  Info
} from 'lucide-react';
import { UserProfile, api } from '../services/api';

interface SettingsPrivacyViewProps {
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const SettingsPrivacyView: React.FC<SettingsPrivacyViewProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const [nativeLanguage, setNativeLanguage] = useState<string>(profile.nativeLanguage);
  const [targetLanguage, setTargetLanguage] = useState<string>(profile.targetLanguage);
  const [cefrLevel, setCefrLevel] = useState<string>(profile.cefrLevel);
  const [correctionStyle, setCorrectionStyle] = useState<'subtle' | 'detailed' | 'free'>(profile.correctionStyle);
  const [explanationLang, setExplanationLang] = useState<'pt' | 'target' | 'both'>(profile.explanationLang);
  const [pace, setPace] = useState<'relaxed' | 'normal' | 'fast'>(profile.pace);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // AI Configuration State
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('gemini');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-lite');
  const [customKey, setCustomKey] = useState<string>('');
  const [isSavingAi, setIsSavingAi] = useState<boolean>(false);
  const [saveAiSuccess, setSaveAiSuccess] = useState<boolean>(false);

  useEffect(() => {
    loadAiStatus();
  }, []);

  const loadAiStatus = async () => {
    try {
      const status = await api.getAiStatus();
      setAiStatus(status);
      setSelectedProvider(status.provider);
      setSelectedModel(status.model);
    } catch (err) {
      console.error('Error loading AI status:', err);
    }
  };

  const handleSaveAiConfig = async () => {
    setIsSavingAi(true);
    setSaveAiSuccess(false);
    try {
      const payload: any = {
        provider: selectedProvider,
        model: selectedModel,
      };
      if (customKey.trim()) {
        if (selectedProvider === 'gemini') payload.geminiApiKey = customKey.trim();
        if (selectedProvider === 'deepseek') payload.deepseekApiKey = customKey.trim();
        if (selectedProvider === 'groq') payload.groqApiKey = customKey.trim();
      }
      const updated = await api.updateAiConfig(payload);
      setAiStatus(updated);
      setSaveAiSuccess(true);
      setCustomKey('');
      setTimeout(() => setSaveAiSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating AI config:', err);
    } finally {
      setIsSavingAi(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const { profile: updated } = await api.updateProfile({
        nativeLanguage,
        targetLanguage,
        cefrLevel,
        correctionStyle,
        explanationLang,
        pace,
      });
      onProfileUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error updating settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEraseData = async () => {
    const confirmation = prompt(
      'ATENÇÃO: Isso excluirá permanentemente todo o seu histórico de conversas, memórias salvas, vocabulário e métricas de progresso conforme a LGPD/GDPR. Digite "EXCLUIR" para confirmar:'
    );
    if (confirmation === 'EXCLUIR') {
      try {
        await api.eraseUserData();
        alert('Seus dados foram excluídos com sucesso. A página será reiniciada.');
        window.location.reload();
      } catch (err) {
        console.error('Error erasing data:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Settings className="w-4 h-4" />
              Preferências & Segurança
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Configurações do Tutor & Privacidade (LGPD)
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Ajuste fino da personalidade pedagógica da IA e gestão soberana dos seus dados pessoais.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tutor Personality & Correction Tuning (Left 2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Parâmetros do Tutor Conversacional
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Idioma Nativo (L1)</label>
              <select
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="Português">Português (Brasil)</option>
                <option value="Espanhol">Espanhol</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Idioma Alvo (L2)</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-bold text-emerald-400"
              >
                <option value="Inglês">Inglês</option>
                <option value="Espanhol">Espanhol</option>
                <option value="Francês">Francês</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">
                Nível de Proficiência Alvo (CEFR):
              </label>
              <div className="grid grid-cols-5 gap-2">
                {['A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setCefrLevel(lvl)}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      cefrLevel === lvl
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Modo de Correção:</label>
                <select
                  value={correctionStyle}
                  onChange={(e) => setCorrectionStyle(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="subtle">Sutil / Sanduíche (Recomendado)</option>
                  <option value="detailed">Modo Professor Detalhado</option>
                  <option value="free">Conversação Livre (Fluência)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Idioma das Explicações:</label>
                <select
                  value={explanationLang}
                  onChange={(e) => setExplanationLang(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="pt">Português para travas</option>
                  <option value="target">100% no Idioma Alvo</option>
                  <option value="both">Híbrido</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-slate-300 font-semibold block mb-1">Ritmo & Velocidade de Fala da Voz:</label>
              <select
                value={pace}
                onChange={(e) => setPace(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="relaxed">Pausado e Didático (0.85x)</option>
                <option value="normal">Normal / Cotidiano (0.95x)</option>
                <option value="fast">Rápido e Fluido (1.05x)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-medium">
              {saveSuccess && 'Preferências salvas com sucesso!'}
            </span>
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar Preferências'}
            </button>
          </div>
        </div>

        {/* Privacy & LGPD / GDPR Controls (Right 1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Segurança & Privacidade
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Isolamento Multiusuário</strong>
                  Todas as suas mensagens, memórias e vocabulário são estritamente isolados pelo seu ID autenticado.
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Chaves de API Protegidas</strong>
                  Nenhuma chave do Gemini ou provedores de áudio é exposta ao navegador. Todas as requisições passam por proxy seguro no backend Express.
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone: Erase Data */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Direito ao Esquecimento (LGPD/GDPR)
              </span>
              <p className="text-[11px] text-slate-400 leading-snug">
                Apague todo o seu histórico de mensagens, memórias e vocabulário de forma irrevogável.
              </p>
              <button
                onClick={handleEraseData}
                className="w-full mt-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir Todos os Meus Dados
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Model & Cost Efficiency Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4" />
              Gestão de Provedores & Economia de Tokens
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Motor de IA & Modelos (Gemini, DeepSeek, Groq)
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Alterne entre modelos para otimizar custo financeiro, velocidade de resposta (latência) ou capacidade de raciocínio.
            </p>
          </div>

          {aiStatus && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Ativo Agora</span>
                <span className="text-xs font-semibold text-white">{aiStatus.model}</span>
              </div>
            </div>
          )}
        </div>

        {/* Providers selection cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Google Gemini */}
          <div 
            onClick={() => {
              setSelectedProvider('gemini');
              if (selectedModel !== 'gemini-3.1-flash-lite' && selectedModel !== 'gemini-3.8-flash') {
                setSelectedModel('gemini-3.1-flash-lite');
              }
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedProvider === 'gemini'
                ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-white">Google Gemini</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                Padrão
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Respostas rápidas, excelente no aprendizado de idiomas com esquema estruturado JSON nativo.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="text-[11px] font-semibold text-slate-400 block">Modelo Gemini:</label>
              <select
                value={selectedModel.startsWith('gemini') ? selectedModel : 'gemini-3.1-flash-lite'}
                onChange={(e) => {
                  setSelectedProvider('gemini');
                  setSelectedModel(e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-econômico: ~$0.075/1M)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (Capacidade máxima: ~$0.35/1M)</option>
              </select>
            </div>
          </div>

          {/* 2. DeepSeek V3 (Chinese LLM) */}
          <div 
            onClick={() => {
              setSelectedProvider('deepseek');
              setSelectedModel('deepseek-chat');
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedProvider === 'deepseek'
                ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-sm text-white">DeepSeek V3</span>
              </div>
              <span className="text-[10px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full font-bold">
                Ultra-Barato
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              LLM chinesa com custo de apenas <strong>$0.14 por 1 milhão de tokens</strong> e excelente capacidade multilíngue.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="text-[11px] font-semibold text-slate-400 block">Modelo DeepSeek:</label>
              <select
                value={selectedModel === 'deepseek-chat' ? 'deepseek-chat' : 'deepseek-chat'}
                onChange={(e) => {
                  setSelectedProvider('deepseek');
                  setSelectedModel(e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="deepseek-chat">deepseek-chat (DeepSeek V3)</option>
              </select>
            </div>
          </div>

          {/* 3. Groq (Llama / Qwen) */}
          <div 
            onClick={() => {
              setSelectedProvider('groq');
              if (selectedModel !== 'llama-3.1-8b-instant' && selectedModel !== 'qwen-2.5-32b') {
                setSelectedModel('llama-3.1-8b-instant');
              }
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedProvider === 'groq'
                ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-white">Groq Cloud</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                ~180ms
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Hardware LPU com latência ultra-baixa, ideal para conversas de áudio em tempo real sem pausas perceptíveis.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="text-[11px] font-semibold text-slate-400 block">Modelo no Groq:</label>
              <select
                value={selectedModel.includes('llama') || selectedModel.includes('qwen') ? selectedModel : 'llama-3.1-8b-instant'}
                onChange={(e) => {
                  setSelectedProvider('groq');
                  setSelectedModel(e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Gratuito / Rápido)</option>
                <option value="qwen-2.5-32b">qwen-2.5-32b (Alibaba / Multilíngue)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Optional Custom API Key input */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              Chave de API do Provedor Selecionado ({selectedProvider.toUpperCase()}) - Opcional:
            </label>
            <span className="text-[11px] text-slate-500">
              (Se não preencher, o sistema usa as chaves do ambiente .env)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              placeholder={`Cole sua chave ${selectedProvider === 'gemini' ? 'AI Studio (AQ...)' : selectedProvider === 'deepseek' ? 'DeepSeek (sk-...)' : 'Groq (gsk_...)'} aqui`}
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSaveAiConfig}
              disabled={isSavingAi}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Check className="w-3.5 h-3.5" />
              {isSavingAi ? 'Salvando...' : 'Ativar Modelo Escolhido'}
            </button>
          </div>

          {saveAiSuccess && (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Configuração de IA atualizada com sucesso! O tutor conversacional já está utilizando o modelo selecionado.
            </div>
          )}
        </div>

        {/* Deploy on Vercel Guidance */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-200 block">Como configurar no Deploy da Vercel:</span>
            <p>
              Ao conectar seu repositório GitHub na <strong>Vercel</strong>, adicione em <em>Settings &gt; Environment Variables</em>:
            </p>
            <div className="font-mono text-[11px] text-emerald-400 bg-slate-900 p-2 rounded-lg border border-slate-800 mt-1">
              GEMINI_API_KEY="sua_chave"<br />
              GEMINI_MODEL="gemini-3.1-flash-lite"<br />
              # Opcional (para DeepSeek): DEEPSEEK_API_KEY="sk-..." AI_PROVIDER="deepseek"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

