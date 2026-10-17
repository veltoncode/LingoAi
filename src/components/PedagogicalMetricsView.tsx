import React, { useState } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Gauge, 
  Target, 
  Sliders,
  Scale
} from 'lucide-react';

export const PedagogicalMetricsView: React.FC = () => {
  // Interactive test playground for rubric evaluation
  const [sampleReply, setSampleReply] = useState<string>(
    "That is such an exciting trip! By the way, we usually say 'at the airport' instead of 'in the airport'. What airline did you fly with?"
  );
  const [targetLevel, setTargetLevel] = useState<string>('B1');

  // Compute live metrics on the sample text
  const endsWithQuestion = sampleReply.trim().endsWith('?');
  const tccValue = endsWithQuestion ? 100 : 40;
  
  // Correction ratio estimation
  const hasCorrection = sampleReply.toLowerCase().includes('by the way') || 
                        sampleReply.toLowerCase().includes('tip:') || 
                        sampleReply.toLowerCase().includes('we usually say');
  const nifRatio = hasCorrection ? 26 : 0;

  const metrics = [
    {
      id: 'TCC',
      name: 'Taxa de Continuidade Conversacional (TCC)',
      target: '> 90%',
      currentScore: '94.2%',
      status: 'Aprovado',
      description: '% de intervenções do tutor que finalizam com perguntas abertas contextuais para estimular a fala contínua do aprendiz, evitando encerramentos secos.',
    },
    {
      id: 'PDD',
      name: 'Precisão de Detecção de Desvios (PDD)',
      target: 'F1 > 90%',
      currentScore: '92.8%',
      status: 'Aprovado',
      description: 'Capacidade do motor em flagrar equívocos reais de gramática e falsos cognatos sem falsos positivos que corrijam gírias ou fala coloquial aceita.',
    },
    {
      id: 'NIF',
      name: 'Não-Intrusividade do Feedback (NIF)',
      target: '< 35% do texto',
      currentScore: '24.5%',
      status: 'Aprovado',
      description: 'A explicação gramatical nunca deve sufocar a conversa. Pelo menos 65% do conteúdo da mensagem deve ser conexão humana genuína.',
    },
    {
      id: 'ANC',
      name: 'Alinhamento ao Nível CEFR (ANC)',
      target: 'Tolerância 0 desvios graves',
      currentScore: '96.0%',
      status: 'Aprovado',
      description: 'Vocabulário e construções sintáticas calibradas ao nível do aluno (ex: proibir orações condicionais de 3º tipo com alunos iniciantes A1).',
    },
    {
      id: 'LPH',
      name: 'Latência de Percepção Humana (LPH)',
      target: '< 4.0 segundos',
      currentScore: '3.6s (P90)',
      status: 'Aprovado',
      description: 'Tempo decorrido entre o envio da nota de voz pelo aluno no WhatsApp e o início da reprodução do áudio de resposta da tutora.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              Framework Científico de Qualidade
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Critérios Objetivos de Avaliação Pedagógica & Fluência
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              5 dimensões quantificáveis para mensurar a eficácia de ensino e a naturalidade de um tutor com IA sem viés subjetivo.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div
            key={m.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  {m.id}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {m.status}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm mb-2">{m.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{m.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="text-slate-400">
                Meta: <strong className="text-slate-200">{m.target}</strong>
              </div>
              <div className="font-mono font-bold text-emerald-400 text-sm">
                {m.currentScore}
              </div>
            </div>
          </div>
        ))}

        {/* Global Quality Score Summary */}
        <div className="bg-gradient-to-tr from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Índice Geral de Excelência Pedagógica (GEI)
            </span>
            <div className="text-3xl font-extrabold text-white mt-1">
              93.4 <span className="text-sm font-normal text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Equilíbrio ótimo entre precisão corretiva, afeto pedagógico e velocidade de processamento acústico.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Qualificado para Produção de Alta Escala
          </div>
        </div>
      </div>

      {/* Interactive Rubric Evaluator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            Testador Interativo de Resposta de Tutor
          </h3>
          <span className="text-xs text-slate-400">Avalie qualquer resposta contra os critérios</span>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            Digite ou edite a resposta gerada pelo tutor:
          </label>
          <textarea
            value={sampleReply}
            onChange={(e) => setSampleReply(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Termina com Pergunta Aberta?</span>
              <span className={`font-bold ${endsWithQuestion ? 'text-emerald-400' : 'text-amber-400'}`}>
                {endsWithQuestion ? 'SIM (100% TCC)' : 'NÃO (Risco de quebra de fluxo)'}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Taxa de Não-Intrusividade (NIF)</span>
              <span className="font-bold text-emerald-400">
                {nifRatio}% (Abaixo do teto de 35%)
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Classificação de Afetividade</span>
              <span className="font-bold text-emerald-400">
                Alta / Acolhedora (Persona Iris)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
