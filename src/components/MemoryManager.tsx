import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Trash2, 
  Edit3, 
  Plus, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { UserMemory, api } from '../services/api';

export const MemoryManager: React.FC = () => {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<'biografia' | 'meta' | 'interesse' | 'dificuldade'>('interesse');
  const [newContent, setNewContent] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      const { memories } = await api.getMemories();
      setMemories(memories);
    } catch (err) {
      console.error('Error loading memories:', err);
    }
  };

  const handleStartEdit = (mem: UserMemory) => {
    setEditingId(mem.id);
    setEditingContent(mem.content);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingContent.trim()) return;
    try {
      await api.updateMemory(id, editingContent.trim());
      setEditingId(null);
      loadMemories();
    } catch (err) {
      console.error('Error updating memory:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir esta memória permanente? A IA deixará de considerar este fato nas próximas conversas.')) {
      try {
        await api.deleteMemory(id);
        loadMemories();
      } catch (err) {
        console.error('Error deleting memory:', err);
      }
    }
  };

  const handleCreate = async () => {
    if (!newContent.trim()) return;
    try {
      await api.addMemory(newCategory, newContent.trim());
      setNewContent('');
      setIsAdding(false);
      loadMemories();
    } catch (err) {
      console.error('Error adding memory:', err);
    }
  };

  const filtered = memories.filter((m) => {
    return activeCategoryFilter === 'all' || m.category === activeCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Brain className="w-4 h-4" />
              Memória Semântica de Longo Prazo
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              O Que a IA Lembra Sobre Você
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Fatos biográficos, interesses e dificuldades gramaticais extraídos das conversas para personalizar cada novo turno.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Adicionar Memória Manual
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Todas as Memórias' },
              { id: 'biografia', label: 'Biografia & Trabalho' },
              { id: 'interesse', label: 'Interesses & Hobbies' },
              { id: 'dificuldade', label: 'Dificuldades Gramaticais' },
              { id: 'meta', label: 'Metas Pessoais' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeCategoryFilter === cat.id
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="text-slate-400 font-medium">
            Registros Ativos: <strong className="text-emerald-400">{memories.length}</strong>
          </span>
        </div>
      </div>

      {/* Manual Add Card Form */}
      {isAdding && (
        <div className="p-5 bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm">Adicionar Fato à Memória do Tutor</h4>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Categoria</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="interesse">Interesse</option>
                <option value="biografia">Biografia</option>
                <option value="dificuldade">Dificuldade</option>
                <option value="meta">Meta</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="text-slate-400 block mb-1 font-semibold">Descrição do Fato</label>
              <input
                type="text"
                placeholder="Ex: Trabalho como engenheiro de software e pretendo fazer intercâmbio em Vancouver."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20"
            >
              Salvar Memória
            </button>
          </div>
        </div>
      )}

      {/* Grid of Memories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((mem) => {
          const isDifficulty = mem.category === 'dificuldade';
          const isInterest = mem.category === 'interesse';
          const isBio = mem.category === 'biografia';

          return (
            <div
              key={mem.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                      isDifficulty
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : isInterest
                        ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                        : isBio
                        ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {mem.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStartEdit(mem)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(mem.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {editingId === mem.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-emerald-500 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit(mem.id)}
                        className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {mem.content}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Confiança da IA: <strong className="text-emerald-400">{mem.confidence}%</strong></span>
                <span>Atualizado: {new Date(mem.updatedAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
