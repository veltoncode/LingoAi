export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  nativeLanguage: string;
  targetLanguage: string;
  cefrLevel: string;
  goal: string;
  interests: string[];
  correctionStyle: 'subtle' | 'detailed' | 'free';
  explanationLang: 'pt' | 'target' | 'both';
  pace: 'relaxed' | 'normal' | 'fast';
  onboardingCompleted: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  topic: string;
  cefrLevel: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  sender: 'user' | 'tutor';
  text: string;
  isAudio?: boolean;
  correctionSnippet?: string;
  portugueseExplanation?: string;
  timestamp: string;
}

export interface UserMemory {
  id: string;
  userId: string;
  category: 'biografia' | 'meta' | 'interesse' | 'dificuldade';
  content: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyItem {
  id: string;
  userId: string;
  term: string;
  translation: string;
  exampleSentence: string;
  context: string;
  cefr: string;
  interval: number;
  repetitions: number;
  easeFactor: number;
  dueDate: string;
  createdAt: string;
}

export interface ProgressSummary {
  userId: string;
  totalMinutes: number;
  totalSessions: number;
  totalTurns: number;
  correctionsLearned: number;
  streakDays: number;
  lastActiveDate: string;
  estimatedCefr: string;
}

// Default fallback data for bulletproof offline / client-only mode
const DEFAULT_USER: User = {
  id: 'user-demo',
  name: 'Alexandre Silva',
  email: 'alexandre@example.com',
  createdAt: new Date().toISOString(),
};

const DEFAULT_PROFILE: UserProfile = {
  userId: 'user-demo',
  nativeLanguage: 'Português',
  targetLanguage: 'Inglês',
  cefrLevel: 'B1',
  goal: 'conversation',
  interests: ['Tecnologia & Programação', 'Viagens & Turismo', 'Carreira Internacional'],
  correctionStyle: 'subtle',
  explanationLang: 'pt',
  pace: 'normal',
  onboardingCompleted: true,
};

let localSessions: ChatSession[] = [
  {
    id: 'sess-default-1',
    userId: 'user-demo',
    title: 'Conversa Inicial sobre Objetivos',
    topic: 'Geral',
    cefrLevel: 'B1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let localMessages: Record<string, ChatMessage[]> = {
  'sess-default-1': [
    {
      id: 'msg-init-1',
      sessionId: 'sess-default-1',
      userId: 'user-demo',
      sender: 'tutor',
      text: "Hi Alexandre! I'm Aria, your English practice partner. 🌟 I'm here to help you unlock your speaking confidence without fear of making mistakes. How was your day so far?",
      isAudio: true,
      timestamp: new Date().toISOString(),
    },
  ],
};

let localMemories: UserMemory[] = [
  {
    id: 'mem-1',
    userId: 'user-demo',
    category: 'interesse',
    content: 'Trabalha com tecnologia e planeja aplicar para vagas remotas internacionais.',
    confidence: 90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    userId: 'user-demo',
    category: 'dificuldade',
    content: 'Tende a usar preposição "in" para locais de trânsito em vez de "at" (ex: at the airport).',
    confidence: 85,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let localVocabulary: VocabularyItem[] = [
  {
    id: 'voc-1',
    userId: 'user-demo',
    term: 'Unwind',
    translation: 'Relaxar / descontrair após esforço',
    exampleSentence: 'What do you like to do to unwind after work?',
    context: 'Conversa sobre rotina e descanso',
    cefr: 'B1',
    interval: 2,
    repetitions: 1,
    easeFactor: 2.5,
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'voc-2',
    userId: 'user-demo',
    term: 'Intend to',
    translation: 'Pretender / planejar (falso amigo "pretend")',
    exampleSentence: 'I intend to study software engineering in Canada.',
    context: 'Planos profissionais',
    cefr: 'B1',
    interval: 3,
    repetitions: 2,
    easeFactor: 2.6,
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

let localProgress: ProgressSummary = {
  userId: 'user-demo',
  totalMinutes: 45,
  totalSessions: 3,
  totalTurns: 19,
  correctionsLearned: 5,
  streakDays: 4,
  lastActiveDate: new Date().toISOString(),
  estimatedCefr: 'B1 (Intermediário em consolidação)',
};

function getAuthHeader(): Record<string, string> {
  const storedId = typeof window !== 'undefined' ? localStorage.getItem('lingonova_user_id') || '' : '';
  const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('lingonova_gemini_api_key') || '' : '';
  return {
    'Content-Type': 'application/json',
    ...(storedId ? { 'x-user-id': storedId } : {}),
    ...(geminiKey ? { 'x-gemini-key': geminiKey } : {}),
  };
}

export const api = {
  // Auth
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('lingonova_user_id');
  },

  async login(email: string, password?: string): Promise<{ user: User; profile?: UserProfile }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user?.id) {
          localStorage.setItem('lingonova_user_id', data.user.id);
          localStorage.setItem('lingonova_user_email', data.user.email);
          localStorage.setItem('lingonova_user_name', data.user.name);
          if (data.token) localStorage.setItem('lingonova_auth_token', data.token);
        }
        return data;
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Credenciais inválidas.');
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      // Offline fallback
      const user = { ...DEFAULT_USER, email, name: email.split('@')[0] };
      localStorage.setItem('lingonova_user_id', user.id);
      localStorage.setItem('lingonova_user_email', user.email);
      localStorage.setItem('lingonova_user_name', user.name);
      return { user, profile: DEFAULT_PROFILE };
    }
  },

  async register(name: string, email: string, password?: string): Promise<{ user: User; profile?: UserProfile }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user?.id) {
          localStorage.setItem('lingonova_user_id', data.user.id);
          localStorage.setItem('lingonova_user_email', data.user.email);
          localStorage.setItem('lingonova_user_name', data.user.name);
          if (data.token) localStorage.setItem('lingonova_auth_token', data.token);
        }
        return data;
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao criar conta.');
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      // Offline fallback
      const user = { ...DEFAULT_USER, name, email };
      localStorage.setItem('lingonova_user_id', user.id);
      localStorage.setItem('lingonova_user_email', user.email);
      localStorage.setItem('lingonova_user_name', user.name);
      return { user, profile: DEFAULT_PROFILE };
    }
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lingonova_user_id');
      localStorage.removeItem('lingonova_auth_token');
      localStorage.removeItem('lingonova_user_name');
      localStorage.removeItem('lingonova_user_email');
    }
  },

  async getMe(): Promise<{ user: User; profile: UserProfile } | null> {
    if (typeof window !== 'undefined' && !localStorage.getItem('lingonova_user_id')) {
      return null;
    }
    try {
      const res = await fetch('/api/auth/me', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.profile) return data;
      }
    } catch {}

    const storedId = localStorage.getItem('lingonova_user_id');
    if (!storedId) return null;

    const savedName = localStorage.getItem('lingonova_user_name') || 'Estudante';
    const savedEmail = localStorage.getItem('lingonova_user_email') || 'user@example.com';
    return {
      user: { ...DEFAULT_USER, id: storedId, name: savedName, email: savedEmail },
      profile: { ...DEFAULT_PROFILE, userId: storedId },
    };
  },

  // Profile & Onboarding
  async getProfile(): Promise<{ profile: UserProfile }> {
    try {
      const res = await fetch('/api/profile', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) return data;
      }
    } catch {}
    return { profile: DEFAULT_PROFILE };
  },

  async updateProfile(partial: Partial<UserProfile>): Promise<{ profile: UserProfile }> {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(partial),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) return data;
      }
    } catch {}
    Object.assign(DEFAULT_PROFILE, partial);
    return { profile: DEFAULT_PROFILE };
  },

  // Sessions
  async getSessions(): Promise<{ sessions: ChatSession[] }> {
    try {
      const res = await fetch('/api/sessions', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        if (data.sessions) return data;
      }
    } catch {}
    return { sessions: localSessions };
  },

  async createSession(title: string, topic: string = 'Geral', cefrLevel: string = 'B1'): Promise<{ session: ChatSession }> {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ title, topic, cefrLevel }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session) return data;
      }
    } catch {}
    const newSess: ChatSession = {
      id: `sess-${Date.now()}`,
      userId: 'user-demo',
      title: title || `Conversa sobre ${topic}`,
      topic,
      cefrLevel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localSessions.unshift(newSess);
    localMessages[newSess.id] = [
      {
        id: `msg-${Date.now()}`,
        sessionId: newSess.id,
        userId: 'user-demo',
        sender: 'tutor',
        text: `Hey there! I'm Aria. Let's practice speaking about "${topic}". How are you doing today?`,
        isAudio: true,
        timestamp: new Date().toISOString(),
      },
    ];
    return { session: newSess };
  },

  async deleteSession(sessionId: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (res.ok) return res.json();
    } catch {}
    localSessions = localSessions.filter((s) => s.id !== sessionId);
    delete localMessages[sessionId];
    return { success: true };
  },

  // Messages & Chat
  async getMessages(sessionId: string): Promise<{ messages: ChatMessage[] }> {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.messages) return data;
      }
    } catch {}
    return { messages: localMessages[sessionId] || [] };
  },

  async sendChatMessage(sessionId: string, text: string, isAudio: boolean = false): Promise<{
    userMessage: ChatMessage;
    tutorMessage: ChatMessage;
    correction: { snippet?: string; explanation?: string } | null;
  }> {
    const geminiKey = localStorage.getItem('lingonova_gemini_api_key') || '';
    try {
      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ sessionId, text, isAudio, geminiApiKey: geminiKey }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.userMessage && data.tutorMessage) return data;
      }
    } catch {}

    // Resilient intelligent local evaluation fallback
    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sessionId,
      userId: 'user-demo',
      sender: 'user',
      text,
      isAudio,
      timestamp: new Date().toISOString(),
    };

    let correctionSnippet: string | undefined;
    let ptExplanation: string | undefined;
    const lower = text.toLowerCase().trim();

    const now = new Date();
    const dateEnglish = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const datePortuguese = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (lower.includes('in the airport') || lower.includes('in airport')) {
      correctionSnippet = 'More naturally: "I arrived at the airport" (use "at" for transit locations).';
      ptExplanation = 'Para locais pontuais de trânsito ou pontos de encontro, usamos "at" em vez de "in".';
    } else if (lower.includes('pretend to') || lower.includes('pretend study')) {
      correctionSnippet = 'Watch out for false friends! "Pretend" means to fake (fingir). Say "I plan to" or "I intend to".';
      ptExplanation = '"Pretend" significa "fingir". Para dizer "pretendo", use "I plan to" ou "I intend to".';
    }

    // Dynamic contextual response
    let replyText = '';
    const isDateInquiry = lower.includes('que dia') || lower.includes('what day') || lower.includes('qual o dia') || lower.includes('que data') || lower.includes('what is the date') || lower.includes('what date');
    const isGreeting = lower === 'oi' || lower === 'olá' || lower === 'ola' || lower === 'hello' || lower === 'hi' || lower === 'hey';

    if (isDateInquiry) {
      replyText = `Today is ${dateEnglish}! Em português: hoje é ${datePortuguese}. How is your ${now.toLocaleDateString('en-US', { weekday: 'long' })} going so far?`;
    } else if (isGreeting) {
      replyText = `Hello! 🌟 I'm Aria, your AI English practice partner. I'm here to chat, correct grammar gently, and help you speak with confidence. What would you like to talk about today?`;
    } else if (lower.includes('como diz') || lower.includes('não entendi') || lower.includes('por que')) {
      replyText = `Excelente pergunta! Fique à vontade para perguntar em português sempre que tiver dúvidas sobre estruturas gramaticais. Como você gostaria de expressar essa ideia em inglês?`;
    } else {
      replyText = `I understand what you mean regarding "${text.length > 50 ? text.slice(0, 47) + '...' : text}"! Practicing consistently is the best way to get comfortable. What other thoughts or questions do you have on this topic?`;
    }

    const tutorMsg: ChatMessage = {
      id: `msg-t-${Date.now()}`,
      sessionId,
      userId: 'user-demo',
      sender: 'tutor',
      text: replyText,
      isAudio: true,
      correctionSnippet,
      portugueseExplanation: ptExplanation,
      timestamp: new Date().toISOString(),
    };

    if (!localMessages[sessionId]) localMessages[sessionId] = [];
    localMessages[sessionId].push(userMsg, tutorMsg);
    localProgress.totalTurns += 1;

    return {
      userMessage: userMsg,
      tutorMessage: tutorMsg,
      correction: correctionSnippet ? { snippet: correctionSnippet, explanation: ptExplanation } : null,
    };
  },

  // Memories
  async getMemories(): Promise<{ memories: UserMemory[] }> {
    try {
      const res = await fetch('/api/memories', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        if (data.memories) return data;
      }
    } catch {}
    return { memories: localMemories };
  },

  async addMemory(category: string, content: string): Promise<{ memory: UserMemory }> {
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ category, content }),
      });
      if (res.ok) return res.json();
    } catch {}
    const mem: UserMemory = {
      id: `mem-${Date.now()}`,
      userId: 'user-demo',
      category: category as any,
      content,
      confidence: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localMemories.push(mem);
    return { memory: mem };
  },

  async updateMemory(id: string, content: string): Promise<{ memory: UserMemory }> {
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ content }),
      });
      if (res.ok) return res.json();
    } catch {}
    const m = localMemories.find((item) => item.id === id);
    if (m) {
      m.content = content;
      m.updatedAt = new Date().toISOString();
      return { memory: m };
    }
    return { memory: localMemories[0] };
  },

  async deleteMemory(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (res.ok) return res.json();
    } catch {}
    localMemories = localMemories.filter((m) => m.id !== id);
    return { success: true };
  },

  // Vocabulary & SRS
  async getVocabulary(): Promise<{ vocabulary: VocabularyItem[] }> {
    try {
      const res = await fetch('/api/vocabulary', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        if (data.vocabulary) return data;
      }
    } catch {}
    return { vocabulary: localVocabulary };
  },

  async reviewVocabulary(vocabularyId: string, grade: 'again' | 'hard' | 'good' | 'easy'): Promise<{ vocabulary: VocabularyItem }> {
    try {
      const res = await fetch('/api/vocabulary/review', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ vocabularyId, grade }),
      });
      if (res.ok) return res.json();
    } catch {}
    const v = localVocabulary.find((item) => item.id === vocabularyId);
    if (v) {
      v.repetitions += 1;
      v.interval = grade === 'again' ? 1 : v.interval * 2;
      return { vocabulary: v };
    }
    return { vocabulary: localVocabulary[0] };
  },

  // Progress
  async getProgress(): Promise<{
    progress: ProgressSummary;
    totalVocab: number;
    totalMemories: number;
    totalSessions: number;
  }> {
    try {
      const res = await fetch('/api/progress', { headers: getAuthHeader() });
      if (res.ok) return res.json();
    } catch {}
    return {
      progress: localProgress,
      totalVocab: localVocabulary.length,
      totalMemories: localMemories.length,
      totalSessions: localSessions.length,
    };
  },

  // Privacy & Erase
  async eraseUserData(): Promise<{ message: string }> {
    try {
      const res = await fetch('/api/privacy/erase', {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (res.ok) return res.json();
    } catch {}
    localSessions = [];
    localMessages = {};
    localMemories = [];
    localVocabulary = [];
    localProgress.totalTurns = 0;
    localProgress.totalMinutes = 0;
    return { message: 'Dados apagados permanentemente com sucesso.' };
  },

  // AI Diagnostic Status & Providers
  async getAiStatus(): Promise<{
    provider: string;
    model: string;
    isConfigured: boolean;
    description: string;
    availableProviders?: Array<{
      id: string;
      name: string;
      badge: string;
      defaultModel: string;
      models: Array<{ id: string; name: string; cost: string; speed: string }>;
      isKeyConfigured: boolean;
    }>;
  }> {
    const localKey = typeof window !== 'undefined' ? localStorage.getItem('lingonova_gemini_api_key') : null;
    try {
      const res = await fetch('/api/ai/status', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        if (localKey && localKey.length > 15) {
          data.isConfigured = true;
        }
        return data;
      }
    } catch {}
    return {
      provider: 'gemini',
      model: 'gemini-3.5-flash-lite',
      isConfigured: !!(localKey && localKey.length > 15),
      description: 'Google gemini-3.5-flash-lite (Econômico & Super-rápido)',
      availableProviders: [],
    };
  },

  async updateAiConfig(config: {
    provider?: string;
    model?: string;
    geminiApiKey?: string;
    deepseekApiKey?: string;
    groqApiKey?: string;
  }): Promise<{
    provider: string;
    model: string;
    isConfigured: boolean;
    description: string;
    availableProviders?: any[];
  }> {
    if (config.geminiApiKey && typeof window !== 'undefined') {
      localStorage.setItem('lingonova_gemini_api_key', config.geminiApiKey.trim());
    }
    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(config),
      });
      if (res.ok) return res.json();
    } catch {}
    return this.getAiStatus();
  },
};

