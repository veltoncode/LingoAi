import React from 'react';
import { 
  Bot, 
  BookOpen, 
  Brain, 
  BarChart3, 
  Settings, 
  FileText, 
  PlayCircle,
  Sparkles,
  User,
  LogOut,
  MessageCircle,
  Key
} from 'lucide-react';
import { User as UserType } from '../services/api';

export type MainAppTab = 
  | 'chat' 
  | 'simulator'
  | 'vocabulary' 
  | 'memory' 
  | 'progress' 
  | 'settings' 
  | 'dossier'
  | 'testcases';

interface HeaderProps {
  activeTab: MainAppTab;
  setActiveTab: (tab: MainAppTab) => void;
  user: UserType | null;
  onOpenOnboarding: () => void;
  onOpenApiKeyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenOnboarding,
  onOpenApiKeyModal,
}) => {
  const tabs = [
    { id: 'chat', label: 'Conversa & Voz (Web)', icon: Bot, highlight: true },
    { id: 'simulator', label: 'Simulador WhatsApp (Iris)', icon: MessageCircle, badge: 'WhatsApp' },
    { id: 'vocabulary', label: 'Caderno SRS', icon: BookOpen, badge: 'Flashcards' },
    { id: 'memory', label: 'Memória Persistente', icon: Brain },
    { id: 'progress', label: 'Progresso & Fluência', icon: BarChart3 },
    { id: 'settings', label: 'Configurações & Modelos', icon: Settings },
    { id: 'testcases', label: 'Bateria de Testes', icon: PlayCircle, badge: '8 testes' },
    { id: 'dossier', label: 'Dossiê REA TalkBud', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold text-xl">
              LN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-100 tracking-tight text-lg">
                  LingoNova AI
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Tutor Ativo
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tutor de Idiomas com IA Independente • Engenharia Reversa Funcional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold transition-colors"
              title="Configurar chave do Google Gemini"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">Chave IA (Gemini)</span>
              <span className="xs:hidden">IA</span>
            </button>

            <button
              onClick={onOpenOnboarding}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ajustar Perfil & Nível</span>
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-800 text-xs text-slate-300">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-xs">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden md:inline font-semibold">{user?.name || 'Alexandre Silva'}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MainAppTab)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                    : tab.highlight
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : tab.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-900'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
