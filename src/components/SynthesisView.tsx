import React from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  FlaskConical, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { HYPOTHESES } from '../data/reverseEngineeringData';

export const SynthesisView: React.FC = () => {
  const confirmedFacts = [
    {
      title: 'Canal Primário via WhatsApp',
      desc: 'O TalkBud concentra a experiência de uso diário 100% no WhatsApp (áudio e texto), com a web apenas para onboarding e checkout.',
    },
    {
      title: 'Persona "Iris" Empática e Descontraída',
      desc: 'A tutora adota tom paciente e amigável, intercalando perguntas abertas e incentivando a prática sem julgamentos.',
    },
    {
      title: 'Suporte Bilíngue para Travas (Português)',
      desc: 'Quando o aluno se expressa em português ou relata não ter entendido, a IA responde na língua materna antes de voltar ao inglês.',
    },
    {
      title: 'Formato Dual: Voz Sintetizada + Texto',
      desc: 'Entrega respostas em notas de voz audíveis no formato WhatsApp acompanhadas de texto com a frase e a reformulação.',
    },
    {
      title: 'Monetização por Assinatura com Trial',
      desc: 'Modelo de negócio baseado em plano mensal/anual recorrente após período de degustação com ativação via link wa.me.',
    },
  ];

  const futureExperiments = [
    {
      title: 'Teste de Resistência a Longo Histórico (500 turnos)',
      protocol: 'Submeter 500 mensagens consecutivas em dias alternados para auditar se há perda de persona, alucinação de dados ou custos desproporcionais.',
    },
    {
      title: 'Auditoria de Sotaques Regionais Brasileiros',
      protocol: 'Enviar gravações com sotaques acentuados (Nordeste, Sul, Caipira) com a mesma frase em inglês para avaliar a taxa de erro de transcrição (WER).',
    },
    {
      title: 'Cadência Real de Notificações de Retenção',
      protocol: 'Interromper a prática intencionalmente por 24h, 48h, 72h e 7 dias para mapear os gatilhos e templates de reengajamento do bot.',
    },
    {
      title: 'Teste de Contenção de Crise & Conteúdo Sensível',
      protocol: 'Testar reações da tutora quando o usuário relata extrema ansiedade, depressão ou tenta direcionar o diálogo para assuntos adultos.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <FlaskConical className="w-4 h-4" />
              Conclusão Metodológica
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              O Que Sabemos, O Que Suspeitamos e O Que Ainda Precisamos Testar
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Síntese executiva do estado do conhecimento atual sobre o TalkBud e plano de experimentos para validação contínua.
            </p>
          </div>
        </div>
      </div>

      {/* Triad Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. O Que Sabemos */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">O Que Sabemos</h3>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Fatos Comprovados por Testes
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {confirmedFacts.map((fact, idx) => (
                <div key={idx} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-emerald-300 mb-1">{fact.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{fact.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. O Que Suspeitamos */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">O Que Suspeitamos</h3>
                <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                  Hipóteses Técnicas Racionais
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {HYPOTHESES.map((hyp) => (
                <div key={hyp.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-amber-300">{hyp.title}</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/10 text-amber-400 rounded">
                      {hyp.confidencePercentage}% conf.
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">{hyp.rationalJustification}</p>
                  <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800 font-mono">
                    Status: <span className="text-slate-200">{hyp.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. O Que Precisamos Testar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">O Que Precisamos Testar</h3>
                <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                  Protocolos Experimentais
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {futureExperiments.map((exp, idx) => (
                <div key={idx} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-cyan-300 mb-1">{exp.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{exp.protocol}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <strong className="text-slate-200 block mb-0.5">Próximo Passo Recomendado:</strong>
            Executar o MVP P0 com backend em Node.js/Redis + Gemini 2.5 Flash + Cartesia TTS para validação da latência sub-4s.
          </div>
        </div>
      </div>
    </div>
  );
};
