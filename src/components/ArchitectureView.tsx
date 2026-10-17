import React, { useState } from 'react';
import { 
  Cpu, 
  DollarSign, 
  Server, 
  Layers, 
  ShieldCheck, 
  Database, 
  TrendingUp, 
  Workflow, 
  CheckCircle2 
} from 'lucide-react';
import { MVP_FEATURES } from '../data/reverseEngineeringData';

export const ArchitectureView: React.FC = () => {
  // Cost Calculator States
  const [activeUsers, setActiveUsers] = useState<number>(1500);
  const [turnsPerDay, setTurnsPerDay] = useState<number>(15);
  const [audioPercentage, setAudioPercentage] = useState<number>(70);
  const [subscriptionPriceBrl, setSubscriptionPriceBrl] = useState<number>(49.90);

  // Unit costs in USD
  const costPerAudioMinSTT = 0.0043; // Deepgram Nova-2 / Whisper
  const costPer1kCharsTTS = 0.015; // Cartesia Sonic / ElevenLabs Flash
  const costPerTurnLLM = 0.0003; // Gemini 2.5 Flash / GPT-4o-mini
  const costPerWaMessage = 0.0005; // WhatsApp Cloud API service message

  // Calculations
  const daysInMonth = 30;
  const totalTurnsPerMonth = activeUsers * turnsPerDay * daysInMonth;
  const audioTurns = totalTurnsPerMonth * (audioPercentage / 100);
  const textTurns = totalTurnsPerMonth - audioTurns;

  // Average turn: 15s audio user, 120 chars Iris response
  const totalSttMinutes = (audioTurns * 15) / 60;
  const totalTtsChars = audioTurns * 120;

  const monthlySttCost = totalSttMinutes * costPerAudioMinSTT;
  const monthlyTtsCost = (totalTtsChars / 1000) * costPer1kCharsTTS;
  const monthlyLlmCost = totalTurnsPerMonth * costPerTurnLLM;
  const monthlyWaCost = totalTurnsPerMonth * costPerWaMessage;
  const monthlyInfraFixed = 120; // Server, Redis, Postgres

  const totalMonthlyCostUsd = monthlySttCost + monthlyTtsCost + monthlyLlmCost + monthlyWaCost + monthlyInfraFixed;
  const costPerUserUsd = totalMonthlyCostUsd / activeUsers;
  const costPerTurnUsd = totalMonthlyCostUsd / totalTurnsPerMonth;

  // Revenue in USD (assuming 1 USD = 5.30 BRL)
  const usdToBrl = 5.30;
  const grossMonthlyRevenueBrl = activeUsers * subscriptionPriceBrl;
  const grossMonthlyRevenueUsd = grossMonthlyRevenueBrl / usdToBrl;
  const netMonthlyProfitUsd = grossMonthlyRevenueUsd - totalMonthlyCostUsd;
  const marginPercentage = Math.round((netMonthlyProfitUsd / grossMonthlyRevenueUsd) * 100);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4" />
              Blueprint de Engenharia
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Proposta de Arquitetura & Viabilidade Econômica
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Especificação técnica de microsserviços, pipeline assíncrono de áudio e calculadora interativa de unit economics.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Modules Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Workflow className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">1. Ingestão & Fila Assíncrona</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            API Gateway em Node.js/FastAPI com fila Redis (BullMQ/Celery). Responde <strong>HTTP 200 OK</strong> ao webhook da Meta em &lt; 200ms para evitar retentativas indesejadas, despachando o processamento pesado para background workers.
          </p>
          <div className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
            Stack: Node.js / Python • BullMQ • Redis
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">2. Pipeline de Áudio & IA</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Download do arquivo .ogg, normalização com FFmpeg, transcrição com <strong>Deepgram Nova-2 / Faster-Whisper</strong>. Injeção no <strong>Gemini 2.5 Flash</strong> com prompt de Persona Tutor e síntese imediata via <strong>Cartesia Sonic / ElevenLabs Flash</strong>.
          </p>
          <div className="text-[11px] font-mono text-cyan-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
            STT: Nova-2 • LLM: Gemini Flash • TTS: Cartesia
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">3. Memória & Banco Relacional</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            PostgreSQL para persistência de perfis, assinaturas, turnos e repetição espaçada (SRS). Extração assíncrona de entidades via function calling gravando preferências biográficas e catálogo de erros gramaticais.
          </p>
          <div className="text-[11px] font-mono text-purple-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
            Banco: PostgreSQL + pgvector • Storage: S3
          </div>
        </div>
      </div>

      {/* Interactive Cost Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              Calculadora Dinâmica de Unit Economics & Margem Bruta
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg font-semibold border border-emerald-500/30">
            Simulação em Tempo Real
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div>
            <div className="flex justify-between font-semibold mb-1 text-slate-300">
              <span>Alunos Ativos:</span>
              <span className="font-mono text-emerald-400">{activeUsers.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={100}
              max={10000}
              step={100}
              value={activeUsers}
              onChange={(e) => setActiveUsers(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1 text-slate-300">
              <span>Turnos Diários / Aluno:</span>
              <span className="font-mono text-emerald-400">{turnsPerDay} turnos</span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={turnsPerDay}
              onChange={(e) => setTurnsPerDay(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1 text-slate-300">
              <span>% de Mensagens em Áudio:</span>
              <span className="font-mono text-emerald-400">{audioPercentage}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={audioPercentage}
              onChange={(e) => setAudioPercentage(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1 text-slate-300">
              <span>Mensalidade (BRL):</span>
              <span className="font-mono text-emerald-400">R$ {subscriptionPriceBrl.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={29.90}
              max={99.90}
              step={5}
              value={subscriptionPriceBrl}
              onChange={(e) => setSubscriptionPriceBrl(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Output Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Faturamento Bruto
            </span>
            <div className="text-lg font-bold text-white">
              R$ {grossMonthlyRevenueBrl.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-slate-500">~${grossMonthlyRevenueUsd.toFixed(0)} USD/mês</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Custo Total de APIs
            </span>
            <div className="text-lg font-bold text-rose-400">
              ${totalMonthlyCostUsd.toFixed(0)} USD
            </div>
            <span className="text-[10px] text-slate-500">STT + LLM + TTS + WhatsApp</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Custo por Aluno/Mês
            </span>
            <div className="text-lg font-bold text-emerald-400">
              ${costPerUserUsd.toFixed(2)} USD
            </div>
            <span className="text-[10px] text-slate-500">~R$ {(costPerUserUsd * usdToBrl).toFixed(2)} / aluno</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 bg-emerald-950/10">
            <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-bold block mb-1">
              Margem Bruta
            </span>
            <div className="text-2xl font-extrabold text-emerald-300">
              {marginPercentage}%
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">
              Lucro: ~R$ {(netMonthlyProfitUsd * usdToBrl).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* MVP Prioritization (RICE Matrix) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Plano de MVP Priorizado (Framework RICE)
          </h3>
          <span className="text-xs text-slate-400">Priorização por Impacto, Confiança e Custo</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-950">
              <tr>
                <th className="p-3">Fase</th>
                <th className="p-3">Funcionalidade</th>
                <th className="p-3 text-center">Impacto (1-5)</th>
                <th className="p-3 text-center">Confiança</th>
                <th className="p-3 text-center">Esforço</th>
                <th className="p-3 text-center">Custo</th>
                <th className="p-3 text-right">Score RICE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {MVP_FEATURES.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        item.phase.startsWith('P0')
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : item.phase.startsWith('P1')
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.phase}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-white">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-200">{item.impact}</td>
                  <td className="p-3 text-center text-slate-300">{item.confidence}</td>
                  <td className="p-3 text-center text-slate-300">{item.effort}</td>
                  <td className="p-3 text-center text-slate-300">{item.cost}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">
                    {Math.round(item.riceScore)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
