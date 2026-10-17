import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Filter, 
  HelpCircle, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';
import { EVIDENCE_ITEMS, EvidenceItem } from '../data/reverseEngineeringData';

export const EvidenceMatrixView: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = EVIDENCE_ITEMS.filter((item) => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesQuery = 
      item.feature.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.evidence.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.validationTest.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-4 h-4" />
              Rigor Científico & Auditoria
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Matriz de Funcionalidades, Fatos e Hipóteses
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Distinção categórica entre o que foi <strong>observado empiricamente</strong>, o que foi apenas <strong>anunciado em marketing</strong>, e quais são as <strong>hipóteses de arquitetura interna</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-semibold rounded-lg border border-emerald-500/30">
              6 Fatos Observados
            </span>
            <span className="px-2.5 py-1 bg-sky-500/20 text-sky-400 font-semibold rounded-lg border border-sky-500/30">
              2 Anúncios
            </span>
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-semibold rounded-lg border border-amber-500/30">
              4 Hipóteses
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Todos ({EVIDENCE_ITEMS.length})
            </button>
            <button
              onClick={() => setFilterCategory('Fato Observado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === 'Fato Observado'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Fatos Observados (6)
            </button>
            <button
              onClick={() => setFilterCategory('Anunciado Publicamente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === 'Anunciado Publicamente'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Anúncios Públicos (2)
            </button>
            <button
              onClick={() => setFilterCategory('Hipótese Técnica')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === 'Hipótese Técnica'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Hipóteses Técnicas (4)
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar funcionalidade ou evidência..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>
      </div>

      {/* Grid of Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isFact = item.category === 'Fato Observado';
          const isAnnounced = item.category === 'Anunciado Publicamente';
          const isHypothesis = item.category === 'Hipótese Técnica';

          return (
            <div
              key={item.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {item.id}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${
                      isFact
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : isAnnounced
                        ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{item.feature}</h3>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 font-semibold block mb-0.5">Evidência / Fonte:</span>
                    <p className="text-slate-200">{item.evidence}</p>
                  </div>

                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 font-semibold block mb-0.5">Teste de Validação / Refutação:</span>
                    <p className="text-slate-300">{item.validationTest}</p>
                  </div>
                </div>
              </div>

              {/* Confidence Progress Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Nível de Confiança:</span>
                  <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.confidence >= 90
                          ? 'bg-emerald-400'
                          : item.confidence >= 75
                          ? 'bg-sky-400'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${item.confidence}%` }}
                    ></div>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-300">{item.confidence}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
