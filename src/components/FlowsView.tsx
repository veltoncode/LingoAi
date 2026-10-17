import React, { useState } from 'react';
import { 
  GitBranch, 
  ArrowRight, 
  Smartphone, 
  Globe, 
  MessageSquare, 
  Clock, 
  Layers, 
  RefreshCw,
  Database,
  Volume2
} from 'lucide-react';

export const FlowsView: React.FC = () => {
  const [activeFlow, setActiveFlow] = useState<'onboarding' | 'turntaking' | 'reengagement'>('turntaking');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <GitBranch className="w-4 h-4" />
              Arquitetura Comportamental & Fluxos
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Mapa dos Fluxos de Usuário</h2>
            <p className="text-sm text-slate-300 mt-1">
              Visualização sequencial ponta a ponta dos três fluxos nucleares do produto TalkBud.
            </p>
          </div>

          {/* Flow selector buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveFlow('onboarding')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFlow === 'onboarding'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Onboarding & Handshake
            </button>
            <button
              onClick={() => setActiveFlow('turntaking')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFlow === 'turntaking'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Turn-Taking (STT/LLM/TTS)
            </button>
            <button
              onClick={() => setActiveFlow('reengagement')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFlow === 'reengagement'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Lembretes Diários
            </button>
          </div>
        </div>
      </div>

      {/* Flow Detailed Visualizer */}
      {activeFlow === 'onboarding' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              Jornada de Aquisição, Onboarding e Ativação no WhatsApp
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Como o aluno transita da web para a primeira conversa sem fricção de login tradicional.
            </p>
          </div>

          {/* Stepper Visual */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl relative">
              <div className="text-xs font-bold text-emerald-400 mb-1">Passo 01</div>
              <h4 className="font-semibold text-white text-sm mb-2">Landing Page & Perfil</h4>
              <p className="text-xs text-slate-300">
                Usuário seleciona idioma alvo (ex: Inglês), autoavalia seu nível (Iniciante, Médio, Destravado) e preenche WhatsApp.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl relative">
              <div className="text-xs font-bold text-emerald-400 mb-1">Passo 02</div>
              <h4 className="font-semibold text-white text-sm mb-2">Checkout / Trial</h4>
              <p className="text-xs text-slate-300">
                Ativação de teste gratuito (3 a 7 dias) via gateway de pagamento com criação do registro do usuário no banco.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl relative">
              <div className="text-xs font-bold text-emerald-400 mb-1">Passo 03</div>
              <h4 className="font-semibold text-white text-sm mb-2">Handshake wa.me</h4>
              <p className="text-xs text-slate-300">
                Redirecionamento automático com link profundo <code className="text-emerald-300">wa.me/numero?text=START_TOKEN</code> que vincula o número de telefone à conta.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl relative">
              <div className="text-xs font-bold text-emerald-400 mb-1">Passo 04</div>
              <h4 className="font-semibold text-white text-sm mb-2">Boas-Vindas da Iris</h4>
              <p className="text-xs text-slate-300">
                Iris envia mensagem de áudio calorosa se apresentando, explica como funciona e lança a primeira pergunta diagnóstica.
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
            <strong>Evidência Operacional:</strong> A passagem de parâmetros na URL do WhatsApp permite autenticação passiva (zero senha). O número do remetente passa a ser a chave primária de identificação do assinante.
          </div>
        </div>
      )}

      {activeFlow === 'turntaking' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Ciclo Turno-a-Turno (Speech-to-Text → LLM Cognitivo → Text-to-Speech)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Arquitetura de processamento de um turno individual com controle estrito de latência e feedback educacional.
            </p>
          </div>

          {/* Interactive Turn Taking Pipeline */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Etapa 1</span>
                  <div className="font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    Áudio do Usuário
                  </div>
                  <p className="text-slate-400 mt-1.5 text-[11px]">
                    Usuário envia nota de voz (formato Ogg Opus). Webhook da Meta chega ao Ingress.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-emerald-400 font-mono">Latência: ~300ms</div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Etapa 2</span>
                  <div className="font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    Transcrição (STT)
                  </div>
                  <p className="text-slate-400 mt-1.5 text-[11px]">
                    Download da mídia e conversão via Whisper / Deepgram Nova-2 com pontuação.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-cyan-400 font-mono">Latência: ~1.200ms</div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Etapa 3</span>
                  <div className="font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    Injeção de Memória
                  </div>
                  <p className="text-slate-400 mt-1.5 text-[11px]">
                    Carrega histórico recente (10 mensagens) + ficha de erros frequentes e nível CEFR.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-amber-400 font-mono">Latência: ~100ms</div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Etapa 4</span>
                  <div className="font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Inferência LLM
                  </div>
                  <p className="text-slate-400 mt-1.5 text-[11px]">
                    Gera resposta da Iris, extrai reformulação sutil e prepara texto fonético.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-purple-400 font-mono">Latência: ~900ms</div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Etapa 5</span>
                  <div className="font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    Síntese TTS & Envio
                  </div>
                  <p className="text-slate-400 mt-1.5 text-[11px]">
                    Gera nota de voz (Cartesia / ElevenLabs), faz upload e despacha áudio + texto.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-emerald-400 font-mono">Latência: ~1.400ms</div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300">
                <strong>Latência Total Estimada (P50/P90):</strong>
              </span>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                3.9 segundos (Dentro da janela psicológica de resposta do WhatsApp)
              </span>
            </div>
          </div>
        </div>
      )}

      {activeFlow === 'reengagement' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Fluxo de Retenção: Lembretes Contextuais e Manutenção de Hábito
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Como o sistema evita o abandono (churn) através de prompts diários sob medida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <h4 className="font-semibold text-white mb-2">Cron Noturno / Matutino</h4>
              <p className="text-slate-300">
                Verifica se o aluno já completou pelo menos 1 turno nas últimas 20 horas. Se não, dispara gatilho no horário cadastrado.
              </p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <h4 className="font-semibold text-white mb-2">Gancho Temático Personalizado</h4>
              <p className="text-slate-300">
                Em vez de mensagens genéricas ("Lembre-se de praticar"), Iris envia: <em>"Hey! Lembrei que você ia viajar hoje. Como foi o voo?"</em>
              </p>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <h4 className="font-semibold text-white mb-2">Alerta de Streak em Risco</h4>
              <p className="text-slate-300">
                Se passar das 20h sem interação, envia alerta amigável de proteção do histórico contínuo de dias de prática.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
