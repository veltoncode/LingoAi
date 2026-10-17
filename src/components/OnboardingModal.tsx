import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Globe2, 
  Target, 
  Heart, 
  Sliders, 
  HelpCircle,
  X
} from 'lucide-react';
import { UserProfile, api } from '../services/api';

interface OnboardingModalProps {
  currentProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  currentProfile,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [step, setStep] = useState<number>(1);
  const [nativeLanguage, setNativeLanguage] = useState<string>(currentProfile.nativeLanguage || 'Português');
  const [targetLanguage, setTargetLanguage] = useState<string>(currentProfile.targetLanguage || 'Inglês');
  const [cefrLevel, setCefrLevel] = useState<string>(currentProfile.cefrLevel || 'B1');
  const [goal, setGoal] = useState<string>(currentProfile.goal || 'conversation');
  const [interests, setInterests] = useState<string[]>(
    currentProfile.interests?.length ? currentProfile.interests : ['Tecnologia', 'Cotidiano', 'Viagens']
  );
  const [correctionStyle, setCorrectionStyle] = useState<'subtle' | 'detailed' | 'free'>(
    currentProfile.correctionStyle || 'subtle'
  );
  const [explanationLang, setExplanationLang] = useState<'pt' | 'target' | 'both'>(
    currentProfile.explanationLang || 'pt'
  );
  const [pace, setPace] = useState<'relaxed' | 'normal' | 'fast'>(currentProfile.pace || 'normal');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { profile } = await api.updateProfile({
        nativeLanguage,
        targetLanguage,
        cefrLevel,
        goal,
        interests,
        correctionStyle,
        explanationLang,
        pace,
        onboardingCompleted: true,
      });
      onSaved(profile);
      onClose();
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const availableInterests = [
    'Tecnologia & Programação',
    'Carreira Internacional',
    'Viagens & Turismo',
    'Filmes & Séries',
    'Negócios & Startups',
    'Cotidiano & Família',
    'Música & Arte',
    'Gastronomia',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Step indicator */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
              {step}/3
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                {step === 1 && '1. Seus Idiomas & Nível Atual'}
                {step === 2 && '2. Seu Objetivo & Interesses'}
                {step === 3 && '3. Estilo de Correção & Ritmo'}
              </h3>
              <p className="text-xs text-slate-400">Personalize a IA para o seu momento de aprendizado</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Languages & Level */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Seu Idioma Nativo</label>
                <select
                  value={nativeLanguage}
                  onChange={(e) => setNativeLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="Português">Português (Brasil)</option>
                  <option value="Espanhol">Espanhol</option>
                  <option value="Inglês">Inglês</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Idioma que Deseja Aprender</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-bold text-emerald-400"
                >
                  <option value="Inglês">Inglês (Global)</option>
                  <option value="Espanhol">Espanhol</option>
                  <option value="Francês">Francês</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-2">
                Nível de Proficiência Estimado (CEFR):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'A1', title: 'Iniciante (A1)', desc: 'Conheço poucas palavras soltas e tenho medo de falar.' },
                  { id: 'A2', title: 'Básico (A2)', desc: 'Entendo frases curtas e consigo pedir informações simples.' },
                  { id: 'B1', title: 'Intermediário (B1)', desc: 'Entendo bem, mas travo na hora de responder e falar com fluidez.' },
                  { id: 'B2', title: 'Avançado (B2/C1)', desc: 'Já converso e busco refinar vocabulário, nuances e sotaque.' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setCefrLevel(lvl.id)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      cefrLevel === lvl.id
                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs">{lvl.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Goal & Interests */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-2">Qual é o seu foco principal?</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'conversation', label: 'Conversação Cotidiana', desc: 'Perder a vergonha e destravar no dia a dia.' },
                  { id: 'career', label: 'Trabalho & Entrevistas', desc: 'Reuniões, apresentações e vagas internacionais.' },
                  { id: 'travel', label: 'Viagens & Turismo', desc: 'Aeroporto, restaurantes, hotéis e emergências.' },
                  { id: 'fluency', label: 'Fluência Geral', desc: 'Vocabulário rico, expressões e naturalidade total.' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      goal === g.id
                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold">{g.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-2">
                Seus assuntos de interesse (A tutora usará para puxar assunto):
              </label>
              <div className="flex flex-wrap gap-2">
                {availableInterests.map((item) => {
                  const selected = interests.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleInterest(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Pedagogical Style */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-2">Modo de Correção Preferido:</label>
              <div className="space-y-2">
                {[
                  {
                    id: 'subtle',
                    title: 'Correção Sutil / Sanduíche (Recomendado)',
                    desc: 'A IA valida o que você falou e sugere a forma mais natural sem frear o diálogo.',
                  },
                  {
                    id: 'detailed',
                    title: 'Modo Professor Detalhado',
                    desc: 'Explica a regra gramatical a fundo sempre que houver desvio morfológico.',
                  },
                  {
                    id: 'free',
                    title: 'Conversação Livre (Zero Interrupção)',
                    desc: 'Foco puro na comunicação e confiança, apenas corrigindo se for ininteligível.',
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setCorrectionStyle(m.id as any)}
                    className={`w-full p-3 rounded-xl text-left border transition-all ${
                      correctionStyle === m.id
                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold">{m.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Idioma das Explicações:</label>
                <select
                  value={explanationLang}
                  onChange={(e) => setExplanationLang(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="pt">Em Português (Didático)</option>
                  <option value="target">100% no Idioma Alvo</option>
                  <option value="both">Híbrido</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Ritmo & Pacing da Conversa:</label>
                <select
                  value={pace}
                  onChange={(e) => setPace(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="relaxed">Pausado e Acolhedor</option>
                  <option value="normal">Normal / Cotidiano</option>
                  <option value="fast">Dinâmico e Rápido</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Voltar
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Concluir & Iniciar Prática'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
