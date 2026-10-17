import { Router, Request, Response } from 'express';
import { db } from './db';
import { generateTutorTurn, getAiStatus, updateAiConfig } from './ai';

export const apiRouter = Router();

// AI Diagnostic & Active Model status
apiRouter.get('/ai/status', (req: Request, res: Response) => {
  res.json(getAiStatus());
});

// Configure active AI provider, model, or keys dynamically
apiRouter.post('/ai/config', (req: Request, res: Response) => {
  const { provider, model, geminiApiKey, deepseekApiKey, groqApiKey } = req.body;
  const status = updateAiConfig({
    provider,
    model,
    geminiApiKey,
    deepseekApiKey,
    groqApiKey,
  });
  res.json(status);
});

// Helper to extract authenticated userId from header
function getAuthUserId(req: Request): string {
  const headerUserId = req.headers['x-user-id'] as string;
  if (headerUserId && headerUserId.trim()) {
    return headerUserId.trim();
  }
  // Default to demo user if not logged in
  return 'user-demo';
}

// 1. Auth routes
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.json({ user: existing, isExisting: true });
  }

  const user = db.createUser(name, email);
  res.json({ user, isExisting: false });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório.' });
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    // Convenient auto-create on login for frictionless onboarding
    user = db.createUser(email.split('@')[0], email);
  }

  res.json({ user });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = db.getUserById(userId) || db.getUserById('user-demo');
  const profile = db.getProfile(userId);
  res.json({ user, profile });
});

// 2. Onboarding & Profile routes
apiRouter.get('/profile', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const profile = db.getProfile(userId);
  res.json({ profile });
});

apiRouter.post('/profile', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const updated = db.updateProfile(userId, req.body);
  res.json({ profile: updated });
});

// 3. Sessions routes
apiRouter.get('/sessions', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const sessions = db.getSessions(userId);
  res.json({ sessions });
});

apiRouter.post('/sessions', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { title, topic, cefrLevel } = req.body;
  const session = db.createSession(userId, title, topic || 'Geral', cefrLevel || 'B1');

  // Insert welcome greeting message from Aria
  const profile = db.getProfile(userId);
  db.addMessage(
    userId,
    session.id,
    'tutor',
    `Hey there! I'm Aria, your language tutor. 🌟 Today we can explore "${session.topic}". How are you feeling today, and what would you like to practice?`,
    true
  );

  res.json({ session });
});

apiRouter.delete('/sessions/:id', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const success = db.deleteSession(userId, req.params.id);
  res.json({ success });
});

// 4. Messages & AI Turn-Taking
apiRouter.get('/sessions/:id/messages', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const messages = db.getMessages(userId, req.params.id);
  res.json({ messages });
});

apiRouter.post('/tutor/chat', async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { sessionId, text, isAudio } = req.body;

  if (!sessionId || !text || !text.trim()) {
    return res.status(400).json({ error: 'sessionId e text são obrigatórios.' });
  }

  const session = db.getSessionById(userId, sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Sessão de conversa não encontrada.' });
  }

  const profile = db.getProfile(userId);

  // 1. Save user's incoming message
  const userMsg = db.addMessage(userId, sessionId, 'user', text.trim(), !!isAudio);

  // 2. Fetch relevant context: memories + recent messages
  const memories = db.getMemories(userId);
  const recentHistory = db.getMessages(userId, sessionId);

  // 3. Generate tutor turn with Gemini or fallback
  const aiTurn = await generateTutorTurn(
    text.trim(),
    profile,
    memories,
    recentHistory,
    session.topic
  );

  const tutorFullText = `${aiTurn.conversationalReply} ${aiTurn.followUpQuestion}`;

  // 4. Save tutor's response message
  const tutorMsg = db.addMessage(
    userId,
    sessionId,
    'tutor',
    tutorFullText,
    true, // always provide audio capability
    aiTurn.correctionSnippet,
    aiTurn.portugueseExplanation
  );

  // 5. Asynchronously persist extracted memories
  if (aiTurn.newMemoriesToExtract && aiTurn.newMemoriesToExtract.length > 0) {
    for (const mem of aiTurn.newMemoriesToExtract) {
      if (mem.content && mem.content.length > 5) {
        db.addMemory(userId, mem.category, mem.content);
      }
    }
  }

  // 6. Asynchronously persist new vocabulary terms to SRS
  if (aiTurn.newVocabularyTerms && aiTurn.newVocabularyTerms.length > 0) {
    for (const voc of aiTurn.newVocabularyTerms) {
      if (voc.term && voc.translation) {
        db.addVocabulary(userId, voc.term, voc.translation, voc.exampleSentence, session.topic, voc.cefr || profile.cefrLevel);
      }
    }
  }

  res.json({
    userMessage: userMsg,
    tutorMessage: tutorMsg,
    correction: aiTurn.hasCorrection
      ? {
          snippet: aiTurn.correctionSnippet,
          explanation: aiTurn.portugueseExplanation,
        }
      : null,
  });
});

// 5. Long-term Memories
apiRouter.get('/memories', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const memories = db.getMemories(userId);
  res.json({ memories });
});

apiRouter.post('/memories', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { category, content } = req.body;
  if (!content) return res.status(400).json({ error: 'Conteúdo obrigatório.' });
  const mem = db.addMemory(userId, category || 'interesse', content);
  res.json({ memory: mem });
});

apiRouter.put('/memories/:id', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { content } = req.body;
  const updated = db.updateMemory(userId, req.params.id, content);
  if (!updated) return res.status(404).json({ error: 'Memória não encontrada.' });
  res.json({ memory: updated });
});

apiRouter.delete('/memories/:id', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const success = db.deleteMemory(userId, req.params.id);
  res.json({ success });
});

// 6. Vocabulary & SRS (Spaced Repetition)
apiRouter.get('/vocabulary', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const vocabulary = db.getVocabulary(userId);
  res.json({ vocabulary });
});

apiRouter.post('/vocabulary/review', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { vocabularyId, grade } = req.body;
  const updated = db.reviewVocabulary(userId, vocabularyId, grade || 'good');
  res.json({ vocabulary: updated });
});

// 7. Progress & Analytics
apiRouter.get('/progress', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const progress = db.getProgress(userId);
  const vocabulary = db.getVocabulary(userId);
  const memories = db.getMemories(userId);
  const sessions = db.getSessions(userId);

  res.json({
    progress,
    totalVocab: vocabulary.length,
    totalMemories: memories.length,
    totalSessions: sessions.length,
  });
});

// 8. Privacy & Data Erasure (LGPD / GDPR)
apiRouter.delete('/privacy/erase', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  db.eraseAllUserData(userId);
  res.json({ message: 'Todos os seus dados foram apagados permanentemente de acordo com as regras de privacidade.' });
});

// 9. Automated Audit Test Suite Runner
apiRouter.get('/tests/run', async (req: Request, res: Response) => {
  const { runAllTests } = await import('../tests/runTests');
  const results = await runAllTests();
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  res.json({
    summary: {
      total: results.length,
      passed,
      failed,
      passRate: `${Math.round((passed / results.length) * 100)}%`,
    },
    results,
  });
});
