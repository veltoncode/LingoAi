import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  RotateCw, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Volume2, 
  Check, 
  X,
  Layers
} from 'lucide-react';
import { VocabularyItem, api } from '../services/api';
import { speakText } from '../utils/tutorEngine';

export const VocabularyNotebook: React.FC = () => {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [activeReviewIndex, setActiveReviewIndex] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newTerm, setNewTerm] = useState<string>('');
  const [newTranslation, setNewTranslation] = useState<string>('');
  const [newExample, setNewExample] = useState<string>('');
  const [filterCefr, setFilterCefr] = useState<string>('all');

  useEffect(() => {
    loadVocab();
  }, []);

  const loadVocab = async () => {
    try {
      const { vocabulary } = await api.getVocabulary();
      setItems(vocabulary);
    } catch (err) {
      console.error('Error loading vocabulary:', err);
    }
  };

  const handleReviewGrade = async (grade: 'again' | 'hard' | 'good' | 'easy') => {
    if (activeReviewIndex === null) return;
    const currentItem = items[activeReviewIndex];
    try {
      await api.reviewVocabulary(currentItem.id, grade);
      setShowAnswer(false);
      if (activeReviewIndex + 1 < items.length) {
        setActiveReviewIndex(activeReviewIndex + 1);
      } else {
        setActiveReviewIndex(null);
      }
      loadVocab();
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const handleAddCustomWord = async () => {
    if (!newTerm.trim() || !newTranslation.trim()) return;
    // Add via API or direct
    await fetch('/api/vocabulary/custom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': localStorage.getItem('lingonova_user_id') || 'user-demo',
      },
      body: JSON.stringify({
        term: newTerm,
        translation: newTranslation,
        exampleSentence: newExample || `Example using ${newTerm}.`,
      }),
    });
    setNewTerm('');
    setNewTranslation('');
    setNewExample('');
    setIsAddingNew(false);
    loadVocab();
  };

  const filteredItems = items.filter((item) => {
    return filterCefr === 'all' || item.cefr === filterCefr;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              Repetição Espaçada & Retenção
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Caderno de Vocabulário Inteligente (SRS)
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Palavras e expressões extraídas automaticamente das suas conversas com agendamento científico de revisão (SuperMemo SM-2).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveReviewIndex(0);
                setShowAnswer(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              <RotateCw className="w-4 h-4" />
              Revisar Flashcards Agora
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Filtrar por Nível:</span>
            {['all', 'A1', 'A2', 'B1', 'B2', 'C1'].map((c) => (
              <button
                key={c}
                onClick={() => setFilterCefr(c)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterCefr === c
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {c === 'all' ? 'Todos' : c}
              </button>
            ))}
          </div>

          <span className="text-slate-400 font-medium">
            Total de Palavras: <strong className="text-emerald-400">{items.length}</strong>
          </span>
        </div>
      </div>

      {/* SRS Flashcard Review Modal/Area */}
      {activeReviewIndex !== null && items[activeReviewIndex] && (
        <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-6">
            <div className="text-xs text-emerald-400 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Sessão de Revisão • Card {activeReviewIndex + 1} de {items.length}
            </div>
            <button
              onClick={() => setActiveReviewIndex(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Fechar Revisão
            </button>
          </div>

          <div className="max-w-md mx-auto text-center space-y-4 py-4">
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-950 text-emerald-400 rounded-full border border-slate-700">
              {items[activeReviewIndex].cefr || 'B1'}
            </span>

            <div className="flex items-center justify-center gap-3">
              <h3 className="text-3xl font-extrabold text-white">
                {items[activeReviewIndex].term}
              </h3>
              <button
                onClick={() => speakText(items[activeReviewIndex].term)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-200 transition-colors"
                title="Ouvir Pronúncia"
              >
                <Volume2 className="w-5 h-5 text-emerald-400" />
              </button>
            </div>

            {showAnswer ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-left space-y-2">
                  <div className="text-sm font-semibold text-emerald-300">
                    Tradução: {items[activeReviewIndex].translation}
                  </div>
                  <div className="text-xs text-slate-300 italic border-t border-slate-800 pt-2">
                    "{items[activeReviewIndex].exampleSentence}"
                  </div>
                </div>

                {/* Grade evaluation buttons (SM-2) */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-xs">
                  <button
                    onClick={() => handleReviewGrade('again')}
                    className="p-3 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold rounded-xl border border-rose-500/30 transition-all"
                  >
                    Errei (1d)
                  </button>
                  <button
                    onClick={() => handleReviewGrade('hard')}
                    className="p-3 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white font-bold rounded-xl border border-amber-500/30 transition-all"
                  >
                    Difícil (2d)
                  </button>
                  <button
                    onClick={() => handleReviewGrade('good')}
                    className="p-3 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white font-bold rounded-xl border border-sky-500/30 transition-all"
                  >
                    Bom (4d)
                  </button>
                  <button
                    onClick={() => handleReviewGrade('easy')}
                    className="p-3 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white font-bold rounded-xl border border-emerald-500/30 transition-all"
                  >
                    Fácil (7d)
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAnswer(true)}
                className="mt-4 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-slate-100 text-xs font-bold transition-all shadow-md"
              >
                Revelar Significado & Exemplo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Vocabulary Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800">
                  {item.cefr}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  Próxima: {new Date(item.dueDate).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center justify-between mt-1 mb-2">
                <h4 className="text-lg font-bold text-white">{item.term}</h4>
                <button
                  onClick={() => speakText(item.term)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                  title="Ouvir"
                >
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                </button>
              </div>

              <p className="text-xs font-medium text-emerald-300 mb-2">
                {item.translation}
              </p>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 italic">
                "{item.exampleSentence}"
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Repetições: <strong className="text-slate-200">{item.repetitions}x</strong></span>
              <span>Intervalo: <strong className="text-emerald-400">{item.interval} dias</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
