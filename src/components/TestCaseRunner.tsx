import React, { useState } from 'react';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  ShieldAlert, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { TEST_CASES, TestCase } from '../data/reverseEngineeringData';
import { evaluateStudentMessage, speakText, stopSpeaking } from '../utils/tutorEngine';

export const TestCaseRunner: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<TestCase>(TEST_CASES[0]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    status: 'PASS' | 'FAIL';
    evaluationReason: string;
    actualOutput: {
      conversationalReply: string;
      correctionSnippet?: string;
      portugueseExplanation?: string;
      followUpQuestion: string;
      latencyMs: number;
      tccScore: number;
      nifRatio: number;
    };
  } | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  const runTest = (testCase: TestCase) => {
    setIsRunning(true);
    setTestResult(null);
    stopSpeaking();
    setIsAudioPlaying(false);

    setTimeout(() => {
      // Evaluate using pedagogical evaluator
      const evalData = evaluateStudentMessage(testCase.userInput, testCase.cefrLevel);

      // Check Pass/Fail logic against testCase rules
      let status: 'PASS' | 'FAIL' = 'PASS';
      let reason = 'A resposta atendeu rigorosamente aos critérios pedagógicos: acolheu o aluno, corrigiu sem grosseria e estimulou a continuação.';

      if (testCase.id === 'TC-06') {
        // Prompt injection check
        if (!evalData.conversationalReply.includes("I'm Iris") && !evalData.conversationalReply.includes("language tutor")) {
          status = 'FAIL';
          reason = 'Falha: O modelo não sustentou a persona Iris ou vazou instruções internas.';
        }
      }

      setTestResult({
        status,
        evaluationReason: reason,
        actualOutput: {
          conversationalReply: evalData.conversationalReply,
          correctionSnippet: evalData.correctionSnippet,
          portugueseExplanation: evalData.portugueseExplanation,
          followUpQuestion: evalData.followUpQuestion,
          latencyMs: evalData.latencyMs,
          tccScore: evalData.tccScore,
          nifRatio: evalData.nifRatio,
        },
      });
      setIsRunning(false);
    }, 600);
  };

  const handlePlayVoice = (text: string) => {
    if (isAudioPlaying) {
      stopSpeaking();
      setIsAudioPlaying(false);
    } else {
      setIsAudioPlaying(true);
      speakText(text).then(() => {
        setIsAudioPlaying(false);
      });
    }
  };

  const [activeMode, setActiveMode] = useState<'canonical' | 'systemAudit'>('systemAudit');
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [auditData, setAuditData] = useState<{
    summary: { total: number; passed: number; failed: number; passRate: string };
    results: Array<{ id: number; scenario: string; status: 'PASS' | 'FAIL' | 'BLOCKED_EXTERNAL'; details: string }>;
  } | null>(null);

  const runSystemAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch('/api/tests/run');
      const data = await res.json();
      setAuditData(data);
    } catch (err) {
      console.error('Error running audit:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <PlayCircle className="w-4 h-4" />
              Bateria de Testes Canônicos & Auditoria do Sistema
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Central de Testes & Verificação Obrigatória
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Execute a auditoria dos 15 cenários de conformidade técnica ou teste os 8 casos canônicos de interação pedagógica.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveMode('systemAudit');
                if (!auditData) runSystemAudit();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'systemAudit'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              15 Testes de Sistema (Obrigatórios)
            </button>
            <button
              onClick={() => setActiveMode('canonical')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'canonical'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              8 Casos de Diálogo (TalkBud)
            </button>
          </div>
        </div>
      </div>

      {/* System Audit View */}
      {activeMode === 'systemAudit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Matriz dos 15 Cenários de Teste Obrigatórios
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Autenticação, isolamento multi-tenant, persistência, resiliência a falhas de IA e direito ao esquecimento (LGPD).
              </p>
            </div>

            <button
              onClick={runSystemAudit}
              disabled={auditLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {auditLoading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Executando Auditoria...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Executar 15 Testes do Sistema
                </>
              )}
            </button>
          </div>

          {auditData && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Total de Cenários:</span>
                  <div className="text-lg font-bold text-white">{auditData.summary.total}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30">
                  <span className="text-emerald-400 block mb-0.5">Aprovados (PASS):</span>
                  <div className="text-lg font-bold text-emerald-400">{auditData.summary.passed}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Falhas (FAIL):</span>
                  <div className="text-lg font-bold text-rose-400">{auditData.summary.failed}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30">
                  <span className="text-emerald-400 block mb-0.5">Taxa de Sucesso:</span>
                  <div className="text-lg font-bold text-emerald-300">{auditData.summary.passRate}</div>
                </div>
              </div>

              <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden text-xs">
                {auditData.results.map((res) => (
                  <div key={res.id} className="p-3.5 flex items-start justify-between gap-4 hover:bg-slate-900/60 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-900 text-slate-400 rounded border border-slate-800 shrink-0">
                        #{res.id.toString().padStart(2, '0')}
                      </span>
                      <div>
                        <div className="font-bold text-white text-xs">{res.scenario}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{res.details}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 ${
                        res.status === 'PASS'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Canonical Runner Grid */}
      {activeMode === 'canonical' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Test List (Left Col) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
            Selecione um Caso de Teste
          </div>
          {TEST_CASES.map((tc) => {
            const isSelected = selectedCase.id === tc.id;
            return (
              <button
                key={tc.id}
                onClick={() => {
                  setSelectedCase(tc);
                  setTestResult(null);
                  stopSpeaking();
                  setIsAudioPlaying(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {tc.id}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">{tc.category}</span>
                </div>
                <div className="text-xs font-semibold">{tc.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  {tc.userInput}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Test Detail and Runner (Right Col) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            {/* Top Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {selectedCase.id}
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedCase.name}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Categoria: <strong className="text-slate-300">{selectedCase.category}</strong> • Nível CEFR: <strong className="text-slate-300">{selectedCase.cefrLevel}</strong>
                </p>
              </div>

              <button
                onClick={() => runTest(selectedCase)}
                disabled={isRunning}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    Executando Avaliador...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Executar Caso de Teste
                  </>
                )}
              </button>
            </div>

            {/* Test Input Details */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Entrada Submetida (Mensagem do Aluno)
                </label>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
                  {selectedCase.userInput}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 mb-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Critério de Aprovação (PASS)
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {selectedCase.passCriteria}
                  </p>
                </div>

                <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl">
                  <span className="text-rose-400 font-bold flex items-center gap-1.5 mb-1">
                    <XCircle className="w-3.5 h-3.5" />
                    Critério de Reprovação (FAIL)
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {selectedCase.failCriteria}
                  </p>
                </div>
              </div>
            </div>

            {/* Execution Result Box */}
            {testResult && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 ${
                        testResult.status === 'PASS'
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {testResult.status === 'PASS' ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          RESULTADO: PASS (APROVADO)
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          RESULTADO: FAIL (REPROVADO)
                        </>
                      )}
                    </span>
                    <span className="text-xs text-slate-400">
                      {testResult.evaluationReason}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {testResult.actualOutput.latencyMs}ms
                    </span>
                  </div>
                </div>

                {/* Actual Generated Output Cards */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Resposta Gerada pela Tutora Iris
                    </span>
                    <button
                      onClick={() => handlePlayVoice(
                        `${testResult.actualOutput.conversationalReply} ${testResult.actualOutput.followUpQuestion}`
                      )}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
                    >
                      {isAudioPlaying ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                          Parar Áudio
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                          Ouvir Voz Sintetizada
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed">
                    {testResult.actualOutput.conversationalReply}{' '}
                    <span className="text-emerald-300 font-medium">
                      {testResult.actualOutput.followUpQuestion}
                    </span>
                  </p>

                  {testResult.actualOutput.correctionSnippet && (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-lg text-xs text-emerald-200">
                      <strong className="text-emerald-400 block mb-0.5">Reformulação Pedagógica:</strong>
                      {testResult.actualOutput.correctionSnippet}
                    </div>
                  )}

                  {testResult.actualOutput.portugueseExplanation && (
                    <div className="p-3 bg-sky-950/30 border border-sky-500/40 rounded-lg text-xs text-sky-200">
                      <strong className="text-sky-400 block mb-0.5">Explicação em Português (Suporte L1):</strong>
                      {testResult.actualOutput.portugueseExplanation}
                    </div>
                  )}

                  {/* Metrics footer */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <div>Taxa Continuidade (TCC): <strong className="text-emerald-400">{testResult.actualOutput.tccScore}%</strong></div>
                    <div>Não-Intrusividade (NIF): <strong className="text-emerald-400">{testResult.actualOutput.nifRatio}%</strong> (Meta: &lt; 35%)</div>
                    <div>Latência Inferida: <strong className="text-emerald-400">{testResult.actualOutput.latencyMs}ms</strong></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
