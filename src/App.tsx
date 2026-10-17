import React, { useState, useEffect } from 'react';
import { Header, MainAppTab } from './components/Header';
import { ActiveChatView } from './components/ActiveChatView';
import { IrisSimulator } from './components/IrisSimulator';
import { VocabularyNotebook } from './components/VocabularyNotebook';
import { MemoryManager } from './components/MemoryManager';
import { ProgressView } from './components/ProgressView';
import { SettingsPrivacyView } from './components/SettingsPrivacyView';
import { DossierView } from './components/DossierView';
import { TestCaseRunner } from './components/TestCaseRunner';
import { OnboardingModal } from './components/OnboardingModal';
import { User, UserProfile, api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainAppTab>('chat');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);

      // Prompt onboarding if not yet completed
      if (!data.profile?.onboardingCompleted) {
        setIsOnboardingOpen(true);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 animate-pulse flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
            LN
          </div>
          <span className="text-xs text-slate-400 font-mono">Iniciando motor LingoNova...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'chat' && (
          <ActiveChatView
            profile={profile}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        )}
        {activeTab === 'simulator' && <IrisSimulator />}
        {activeTab === 'vocabulary' && <VocabularyNotebook />}
        {activeTab === 'memory' && <MemoryManager />}
        {activeTab === 'progress' && <ProgressView />}
        {activeTab === 'settings' && (
          <SettingsPrivacyView
            profile={profile}
            onProfileUpdated={(updated) => setProfile(updated)}
          />
        )}
        {activeTab === 'testcases' && <TestCaseRunner />}
        {activeTab === 'dossier' && <DossierView />}
      </main>

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        currentProfile={profile}
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSaved={(updated) => setProfile(updated)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>LingoNova AI • Tutor de Idiomas Funcional (REA TalkBud)</span>
          </div>
          <div className="text-slate-400">
            Backend Full-Stack Express • Multi-LLM (Gemini / DeepSeek / Groq) • Memória Semântica & SRS
          </div>
        </div>
      </footer>
    </div>
  );
}
