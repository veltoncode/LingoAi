import fs from 'fs';
import path from 'path';

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
  cefrLevel: string; // 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  goal: string; // 'conversation' | 'career' | 'travel' | 'fluency'
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
  interval: number; // in days (SM-2 SRS)
  repetitions: number;
  easeFactor: number;
  dueDate: string; // ISO string
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

interface DatabaseSchema {
  users: User[];
  profiles: UserProfile[];
  sessions: ChatSession[];
  messages: ChatMessage[];
  memories: UserMemory[];
  vocabulary: VocabularyItem[];
  progress: ProgressSummary[];
}

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', '.data')
  : path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists safely
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create data dir, using in-memory store:', e);
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading database, initializing fresh store:', err);
  }

  // Initial Seed Database
  const initialDb: DatabaseSchema = {
    users: [
      {
        id: 'user-demo',
        name: 'Alexandre Silva',
        email: 'alexandre@example.com',
        createdAt: new Date().toISOString(),
      },
    ],
    profiles: [
      {
        userId: 'user-demo',
        nativeLanguage: 'Português',
        targetLanguage: 'Inglês',
        cefrLevel: 'B1',
        goal: 'conversation',
        interests: ['Tecnologia', 'Viagens', 'Carreira Internacional'],
        correctionStyle: 'subtle',
        explanationLang: 'pt',
        pace: 'normal',
        onboardingCompleted: true,
      },
    ],
    sessions: [
      {
        id: 'sess-demo-1',
        userId: 'user-demo',
        title: 'Primeira conversa sobre objetivos e rotina',
        topic: 'Geral',
        cefrLevel: 'B1',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    messages: [
      {
        id: 'msg-demo-1',
        sessionId: 'sess-demo-1',
        userId: 'user-demo',
        sender: 'tutor',
        text: "Hi Alexandre! I'm Aria, your English practice partner. 🌟 I'm here to help you unlock your speaking confidence. How was your day?",
        isAudio: true,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'msg-demo-2',
        sessionId: 'sess-demo-1',
        userId: 'user-demo',
        sender: 'user',
        text: 'I worked a lot today and now I am resting.',
        isAudio: false,
        timestamp: new Date(Date.now() - 3600000 * 2 + 60000).toISOString(),
      },
      {
        id: 'msg-demo-3',
        sessionId: 'sess-demo-1',
        userId: 'user-demo',
        sender: 'tutor',
        text: "You definitely deserve some rest! Relaxing after a busy day is essential. What do you like to do to unwind? Watch movies, listen to music, or read?",
        correctionSnippet: 'Your sentence was 100% natural and clear! Great job.',
        isAudio: true,
        timestamp: new Date(Date.now() - 3600000 * 2 + 120000).toISOString(),
      },
    ],
    memories: [
      {
        id: 'mem-1',
        userId: 'user-demo',
        category: 'interesse',
        content: 'Trabalha com tecnologia e pretende aplicar para vagas remotas no exterior.',
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
    ],
    vocabulary: [
      {
        id: 'voc-1',
        userId: 'user-demo',
        term: 'Unwind',
        translation: 'Relaxar / descontrair após esforço',
        exampleSentence: 'What do you like to do to unwind after work?',
        context: 'Conversa sobre rotina e descanso',
        cefr: 'B1',
        interval: 1,
        repetitions: 1,
        easeFactor: 2.5,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'voc-2',
        userId: 'user-demo',
        term: 'Intend to',
        translation: 'Pretender / ter a intenção de (cuidado com falso cognato "pretend")',
        exampleSentence: 'I intend to apply for remote positions in Canada.',
        context: 'Planos profissionais',
        cefr: 'B1',
        interval: 3,
        repetitions: 2,
        easeFactor: 2.6,
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ],
    progress: [
      {
        userId: 'user-demo',
        totalMinutes: 42,
        totalSessions: 3,
        totalTurns: 18,
        correctionsLearned: 5,
        streakDays: 4,
        lastActiveDate: new Date().toISOString(),
        estimatedCefr: 'B1 (Intermediário em consolidação)',
      },
    ],
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

// In-memory cache synced with disk
let dbCache: DatabaseSchema = loadDatabase();

export const db = {
  // Users
  getUserById(id: string): User | undefined {
    return dbCache.users.find((u) => u.id === id);
  },
  getUserByEmail(email: string): User | undefined {
    return dbCache.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  createUser(name: string, email: string): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      createdAt: new Date().toISOString(),
    };
    dbCache.users.push(newUser);
    
    // Create default profile
    const newProfile: UserProfile = {
      userId: newUser.id,
      nativeLanguage: 'Português',
      targetLanguage: 'Inglês',
      cefrLevel: 'B1',
      goal: 'conversation',
      interests: ['Cotidiano', 'Trabalho'],
      correctionStyle: 'subtle',
      explanationLang: 'pt',
      pace: 'normal',
      onboardingCompleted: false,
    };
    dbCache.profiles.push(newProfile);

    // Create default progress
    dbCache.progress.push({
      userId: newUser.id,
      totalMinutes: 5,
      totalSessions: 1,
      totalTurns: 1,
      correctionsLearned: 0,
      streakDays: 1,
      lastActiveDate: new Date().toISOString(),
      estimatedCefr: 'B1',
    });

    saveDatabase(dbCache);
    return newUser;
  },

  // Profiles
  getProfile(userId: string): UserProfile {
    let p = dbCache.profiles.find((item) => item.userId === userId);
    if (!p) {
      p = {
        userId,
        nativeLanguage: 'Português',
        targetLanguage: 'Inglês',
        cefrLevel: 'B1',
        goal: 'conversation',
        interests: ['Geral'],
        correctionStyle: 'subtle',
        explanationLang: 'pt',
        pace: 'normal',
        onboardingCompleted: false,
      };
      dbCache.profiles.push(p);
      saveDatabase(dbCache);
    }
    return p;
  },
  updateProfile(userId: string, partial: Partial<UserProfile>): UserProfile {
    const index = dbCache.profiles.findIndex((p) => p.userId === userId);
    if (index >= 0) {
      dbCache.profiles[index] = { ...dbCache.profiles[index], ...partial };
    } else {
      dbCache.profiles.push({
        userId,
        nativeLanguage: 'Português',
        targetLanguage: 'Inglês',
        cefrLevel: 'B1',
        goal: 'conversation',
        interests: ['Geral'],
        correctionStyle: 'subtle',
        explanationLang: 'pt',
        pace: 'normal',
        onboardingCompleted: true,
        ...partial,
      });
    }
    saveDatabase(dbCache);
    return this.getProfile(userId);
  },

  // Sessions
  getSessions(userId: string): ChatSession[] {
    return dbCache.sessions
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },
  getSessionById(userId: string, sessionId: string): ChatSession | undefined {
    return dbCache.sessions.find((s) => s.id === sessionId && s.userId === userId);
  },
  createSession(userId: string, title: string, topic: string = 'Geral', cefrLevel: string = 'B1'): ChatSession {
    const session: ChatSession = {
      id: `sess-${Date.now()}`,
      userId,
      title: title || `Conversa sobre ${topic}`,
      topic,
      cefrLevel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dbCache.sessions.unshift(session);
    saveDatabase(dbCache);
    return session;
  },
  deleteSession(userId: string, sessionId: string): boolean {
    const prevLen = dbCache.sessions.length;
    dbCache.sessions = dbCache.sessions.filter((s) => !(s.id === sessionId && s.userId === userId));
    dbCache.messages = dbCache.messages.filter((m) => !(m.sessionId === sessionId && m.userId === userId));
    saveDatabase(dbCache);
    return dbCache.sessions.length < prevLen;
  },

  // Messages
  getMessages(userId: string, sessionId: string): ChatMessage[] {
    return dbCache.messages
      .filter((m) => m.userId === userId && m.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  addMessage(
    userId: string,
    sessionId: string,
    sender: 'user' | 'tutor',
    text: string,
    isAudio: boolean = false,
    correctionSnippet?: string,
    portugueseExplanation?: string
  ): ChatMessage {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sessionId,
      userId,
      sender,
      text,
      isAudio,
      correctionSnippet,
      portugueseExplanation,
      timestamp: new Date().toISOString(),
    };
    dbCache.messages.push(msg);

    // Update session updatedAt timestamp
    const sess = dbCache.sessions.find((s) => s.id === sessionId);
    if (sess) {
      sess.updatedAt = msg.timestamp;
    }

    // Update progress stats
    this.incrementProgress(userId, 1, 1);

    saveDatabase(dbCache);
    return msg;
  },

  // Memories
  getMemories(userId: string): UserMemory[] {
    return dbCache.memories.filter((m) => m.userId === userId);
  },
  addMemory(userId: string, category: 'biografia' | 'meta' | 'interesse' | 'dificuldade', content: string, confidence: number = 85): UserMemory {
    // Avoid duplicate memories with similar text
    const existing = dbCache.memories.find(
      (m) => m.userId === userId && m.content.toLowerCase().trim() === content.toLowerCase().trim()
    );
    if (existing) {
      existing.updatedAt = new Date().toISOString();
      saveDatabase(dbCache);
      return existing;
    }

    const mem: UserMemory = {
      id: `mem-${Date.now()}`,
      userId,
      category,
      content,
      confidence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dbCache.memories.push(mem);
    saveDatabase(dbCache);
    return mem;
  },
  updateMemory(userId: string, memoryId: string, content: string): UserMemory | null {
    const mem = dbCache.memories.find((m) => m.id === memoryId && m.userId === userId);
    if (mem) {
      mem.content = content;
      mem.updatedAt = new Date().toISOString();
      saveDatabase(dbCache);
      return mem;
    }
    return null;
  },
  deleteMemory(userId: string, memoryId: string): boolean {
    const prevLen = dbCache.memories.length;
    dbCache.memories = dbCache.memories.filter((m) => !(m.id === memoryId && m.userId === userId));
    saveDatabase(dbCache);
    return dbCache.memories.length < prevLen;
  },

  // Vocabulary & Spaced Repetition (SRS)
  getVocabulary(userId: string): VocabularyItem[] {
    return dbCache.vocabulary.filter((v) => v.userId === userId);
  },
  addVocabulary(
    userId: string,
    term: string,
    translation: string,
    exampleSentence: string,
    context: string = '',
    cefr: string = 'B1'
  ): VocabularyItem {
    const existing = dbCache.vocabulary.find(
      (v) => v.userId === userId && v.term.toLowerCase().trim() === term.toLowerCase().trim()
    );
    if (existing) {
      return existing;
    }

    const item: VocabularyItem = {
      id: `voc-${Date.now()}`,
      userId,
      term,
      translation,
      exampleSentence,
      context,
      cefr,
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    dbCache.vocabulary.push(item);
    saveDatabase(dbCache);
    return item;
  },
  reviewVocabulary(userId: string, vocabularyId: string, grade: 'again' | 'hard' | 'good' | 'easy'): VocabularyItem | null {
    const item = dbCache.vocabulary.find((v) => v.id === vocabularyId && v.userId === userId);
    if (!item) return null;

    // SuperMemo 2 (SM-2) Spaced Repetition calculation
    if (grade === 'again') {
      item.repetitions = 0;
      item.interval = 1;
    } else {
      if (item.repetitions === 0) {
        item.interval = 1;
      } else if (item.repetitions === 1) {
        item.interval = 3;
      } else {
        const factor = grade === 'easy' ? 1.3 : grade === 'good' ? 1.0 : 0.8;
        item.interval = Math.round(item.interval * item.easeFactor * factor);
      }
      item.repetitions += 1;
      if (grade === 'easy') item.easeFactor = Math.min(item.easeFactor + 0.15, 3.0);
      if (grade === 'hard') item.easeFactor = Math.max(item.easeFactor - 0.15, 1.3);
    }

    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + item.interval);
    item.dueDate = nextDue.toISOString();

    saveDatabase(dbCache);
    return item;
  },

  // Progress
  getProgress(userId: string): ProgressSummary {
    let p = dbCache.progress.find((item) => item.userId === userId);
    if (!p) {
      p = {
        userId,
        totalMinutes: 10,
        totalSessions: 1,
        totalTurns: 4,
        correctionsLearned: 1,
        streakDays: 1,
        lastActiveDate: new Date().toISOString(),
        estimatedCefr: 'B1',
      };
      dbCache.progress.push(p);
      saveDatabase(dbCache);
    }
    return p;
  },
  incrementProgress(userId: string, turnsDelta: number = 1, minutesDelta: number = 1) {
    const p = this.getProgress(userId);
    p.totalTurns += turnsDelta;
    p.totalMinutes += minutesDelta;
    p.lastActiveDate = new Date().toISOString();
    saveDatabase(dbCache);
  },

  // LGPD / GDPR Complete Data Erasure
  eraseAllUserData(userId: string): boolean {
    dbCache.users = dbCache.users.filter((u) => u.id !== userId);
    dbCache.profiles = dbCache.profiles.filter((p) => p.userId !== userId);
    dbCache.sessions = dbCache.sessions.filter((s) => s.userId !== userId);
    dbCache.messages = dbCache.messages.filter((m) => m.userId !== userId);
    dbCache.memories = dbCache.memories.filter((m) => m.userId !== userId);
    dbCache.vocabulary = dbCache.vocabulary.filter((v) => v.userId !== userId);
    dbCache.progress = dbCache.progress.filter((p) => p.userId !== userId);
    saveDatabase(dbCache);
    return true;
  },
};
