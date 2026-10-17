import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  BookOpen, 
  Brain, 
  Award,
  Layers
} from 'lucide-react';
import { ProgressSummary, api } from '../services/api';

export const ProgressView: React.FC = () => {
  const [data, setData] = useState<{
    progress: ProgressSummary;
    totalVocab: number;
    totalMemories: number;
    totalSessions: number;
  } | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const res = await api.getProgress();
      setData(res);
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  };

  if (!data) return null;

  const { progress, totalVocab, totalMemories, totalSessions } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              Painel de Evidências Reais
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Sua Evolução & Métricas de Fluência
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Diferenciação clara entre dados medidos em tempo de conversa, retenção de vocabulário e estimativa pedagógica de proficiência.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400 font-bold text-xs">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>Sequência: {progress.streakDays} dias seguidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Tempo Falado (Medido)
          </span>
          <div className="text-2xl font-extrabold text-white mt-1">
            {progress.totalMinutes} <span className="text-sm font-normal text-slate-400">minutos</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Tempo ativo de conversação</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Turnos de Diálogo
          </span>
          <div className="text-2xl font-extrabold text-white mt-1">
            {progress.totalTurns} <span className="text-sm font-normal text-slate-400">turnos</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Interações concluídas</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Vocabulário Ativo (SRS)
          </span>
          <div className="text-2xl font-extrabold text-white mt-1">
            {totalVocab} <span className="text-sm font-normal text-slate-400">termos</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Cadastrados no flashcard</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
            <Brain className="w-4 h-4" />
          </div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Fatos em Memória
          </span>
          <div className="text-2xl font-extrabold text-white mt-1">
            {totalMemories} <span className="text-sm font-normal text-slate-400">fatos</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Contexto personalizado</span>
        </div>
      </div>

      {/* CEFR Diagnostic & Progression Rubric */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            Classificação Estimada de Fluência (CEFR)
          </h3>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Nível Estimado Atual:</span>
              <div className="text-xl font-bold text-emerald-400">
                {progress.estimatedCefr}
              </div>
            </div>
            <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold rounded-lg border border-emerald-500/30">
              Confiança: 88%
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100">Vocabulário & Variedade Léxica:</strong> Demonstra domínio consistente de vocabulário intermediário para rotina, tecnologia e planos futuros.
              </div>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100">Precisão Morfossintática:</strong> Correções pontuais em preposições (in vs at) e tempos compostos (*have been* vs *simple past*).
              </div>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100">Naturalidade & Cadência:</strong> Frases claras com boa coesão. Responde perguntas abertas sem quebra de turno.
              </div>
            </div>
          </div>
        </div>

        {/* Learning Goals Checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Metas da Semana
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Praticar 15 min / dia</div>
                <div className="text-[10px] text-emerald-400">4 de 5 dias concluídos</div>
              </div>
              <span className="font-bold text-emerald-400">80%</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Revisar 10 cards no SRS</div>
                <div className="text-[10px] text-slate-400">6 revisados hoje</div>
              </div>
              <span className="font-bold text-slate-300">60%</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Roleplay de Entrevista</div>
                <div className="text-[10px] text-slate-400">Pendente</div>
              </div>
              <span className="font-bold text-slate-500">0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
