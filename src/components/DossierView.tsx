import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  Lightbulb, 
  Bookmark, 
  Compass, 
  Layers, 
  Sparkles,
  Cpu
} from 'lucide-react';

export const DossierView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('sec1');

  const copyToClipboard = () => {
    fetch('/docs/ANALISE_ENGENHARIA_REVERSA_TALKBUD.md')
      .then(res => res.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        navigator.clipboard.writeText('Documento disponível em /docs/ANALISE_ENGENHARIA_REVERSA_TALKBUD.md');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const sections = [
    { id: 'sec1', title: '1. Descrição Funcional do Produto' },
    { id: 'sec2', title: '2. Mapa dos Fluxos de Usuário' },
    { id: 'sec3', title: '3. Matriz de Funcionalidades & Evidências' },
    { id: 'sec4', title: '4. Catálogo de Casos de Teste' },
    { id: 'sec5', title: '5. Registro de Hipóteses Técnicas' },
    { id: 'sec6', title: '6. Requisitos Funcionais & Não Funcionais' },
    { id: 'sec7', title: '7. Proposta de Arquitetura Própria' },
    { id: 'sec8', title: '8. Plano de MVP (RICE)' },
    { id: 'sec9', title: '9. Critérios de Avaliação Pedagógica' },
    { id: 'sec10', title: '10. Sabemos, Suspeitamos e Próximos Testes' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                Auditoria Oficial de Engenharia Reversa
              </span>
              <span className="text-xs text-slate-400">Target: talkbud.app</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Análise de Engenharia Reversa Funcional — TalkBud
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Auditoria sistemática baseada em evidências, catálogo de fluxos, matriz de hipóteses e blueprint completo para desenvolvimento de um tutor de idiomas independente com IA.
            </p>
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 self-start md:self-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-slate-200 text-xs font-semibold shadow-sm transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
            {copied ? 'Markdown Copiado!' : 'Copiar Relatório Markdown'}
          </button>
        </div>

        {/* Methodological Rules Badge Strip */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-700/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Baseado em Evidências:</strong> Fatos observados x hipóteses declaradas.</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-700/30">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Anti-Alucinação:</strong> Sem suposições de stack sem teste empírico.</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-700/30">
            <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0" />
            <span><strong>Foco Prático:</strong> Requisitos prontos para implementação própria.</span>
          </div>
        </div>
      </div>

      {/* Main Layout with Sticky Navigation Menu and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Index */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sticky top-24 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              Sumário Executivo
            </h3>
            <nav className="space-y-1">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={() => setActiveSection(sec.id)}
                  className={`block text-xs px-3 py-2 rounded-lg transition-colors ${
                    activeSection === sec.id
                      ? 'bg-emerald-500/15 text-emerald-300 font-semibold border-l-2 border-emerald-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {sec.title}
                </a>
              ))}
            </nav>

            <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
              Arquivo salvo em: <br />
              <code className="text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded text-[10px]">
                /docs/ANALISE_ENGENHARIA_REVERSA_TALKBUD.md
              </code>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="lg:col-span-3 space-y-8 text-slate-200">
          {/* Section 1 */}
          <section id="sec1" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4" />
              Seção 01
            </div>
            <h2 className="text-xl font-bold text-white mb-3">1. Descrição Funcional do Produto</h2>
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              <p>
                O <strong>TalkBud</strong> (talkbud.app) é um serviço de aprendizado e tutoria prática de idiomas que opera centralmente através do <strong>WhatsApp</strong>, eliminando o atrito de instalação de novos aplicativos nativos. Seu foco central é destravar a conversação ativa de falantes que já compreendem a língua passivamente mas travam ao falar.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                  <h4 className="font-semibold text-emerald-400 text-xs uppercase mb-1">A Persona "Iris"</h4>
                  <p className="text-xs text-slate-300">
                    Tutora virtual paciente, sem postura intimidadora ou acadêmica rígida. Faz perguntas de acompanhamento, valida tentativas e corrige com suavidade.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                  <h4 className="font-semibold text-emerald-400 text-xs uppercase mb-1">Formato Dual (Áudio + Texto)</h4>
                  <p className="text-xs text-slate-300">
                    O usuário envia áudios curtos ou texto pelo WhatsApp; Iris devolve uma nota de voz sintetizada com prosódia natural e texto de apoio com dicas.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="sec2" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              Seção 02
            </div>
            <h2 className="text-xl font-bold text-white mb-3">2. Mapa dos Fluxos de Usuário</h2>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              A arquitetura do fluxo divide-se em 3 momentos críticos: Onboarding com geração de handshake, Ciclo Conversacional Turno-a-Turno (STT + LLM + TTS), e Mecanismo de Reengajamento Ativo.
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
              [Veja a aba interativa '2. Mapas de Fluxo' para explorar os diagramas de sequência em tempo real!]
            </div>
          </section>

          {/* Section 3 */}
          <section id="sec3" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Check className="w-4 h-4" />
              Seção 03
            </div>
            <h2 className="text-xl font-bold text-white mb-3">3. Matriz de Funcionalidades e Evidências</h2>
            <p className="text-sm text-slate-300 mb-4">
              Cada funcionalidade é categorizada estritamente com base no rigor metodológico exigido:
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-emerald-500/30 flex items-start gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 shrink-0">Fato Observado</span>
                <p className="text-xs text-slate-300">
                  Comportamentos verificados em testes reais: canal WhatsApp, áudios sintetizados em notas de voz, feedback corretivo e suporte em português.
                </p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-sky-500/30 flex items-start gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 shrink-0">Anunciado Publicamente</span>
                <p className="text-xs text-slate-300">
                  Afirmações da landing page e mídias sociais: retenção de memória de longo prazo, calibração dinâmica por CEFR (A1 a C2).
                </p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-amber-500/30 flex items-start gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 shrink-0">Hipótese Técnica</span>
                <p className="text-xs text-slate-300">
                  Provedores específicos de STT (Whisper/Deepgram), TTS (ElevenLabs/Cartesia), orquestração de filas com Redis e extração estruturada de entidades.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="sec4" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              Seção 04
            </div>
            <h2 className="text-xl font-bold text-white mb-3">4. Catálogo de Casos de Teste (Test Suite)</h2>
            <p className="text-sm text-slate-300 mb-3">
              Criamos 8 cenários canônicos para auditar qualquer tutor com IA:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
              <li className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50"><strong>TC-01:</strong> Erro de preposição ("in the airport")</li>
              <li className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50"><strong>TC-02:</strong> Falso cognato ("pretend" vs "intend")</li>
              <li className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50"><strong>TC-03:</strong> Áudio ruidoso com som ambiente (15dB SNR)</li>
              <li className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50"><strong>TC-04:</strong> Bloqueio psicológico / Aluno iniciante A1</li>
              <li className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50"><strong>TC-05:</strong> Dúvida gramatical direta explicada em PT-BR</li>
              <li className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50"><strong>TC-06:</strong> Prompt Injection & Quebra de Personagem</li>
              <li className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50"><strong>TC-07:</strong> Memória conversacional entre múltiplos turnos</li>
              <li className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50"><strong>TC-08:</strong> Fonética de pares mínimos (/iː/ vs /ɪ/)</li>
            </ul>
          </section>

          {/* Section 6 & 7 Summary */}
          <section id="sec6" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Cpu className="w-4 h-4" />
              Seção 06 & 07
            </div>
            <h2 className="text-xl font-bold text-white mb-3">6 & 7. Requisitos e Arquitetura Própria</h2>
            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Para construir um produto independente equivalente ao TalkBud com margem saudável:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <h4 className="font-bold text-slate-100 mb-1">Custo Unitário por Turno</h4>
                  <p className="text-slate-400">
                    Com STT ($0.004/min) + Gemini 2.5 Flash ($0.075/1M tokens) + Cartesia Sonic ($0.015/1k chars), o custo por turno fica em <strong>$0.0028 USD</strong>.
                  </p>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <h4 className="font-bold text-slate-100 mb-1">Margem Operacional</h4>
                  <p className="text-slate-400">
                    Um usuário fazendo 20 turnos/dia consome ~$1.72/mês. Com planos entre R$ 39 e R$ 79 (~$8 a $15 USD), a margem bruta supera <strong>78%</strong>.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
