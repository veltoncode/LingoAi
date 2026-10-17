import { Router, Request, Response } from 'express';
import { db, hashPassword } from './db';
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
  const { name, email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = db.getUserByEmail(normalizedEmail);
  if (user) {
    if (password) {
      user.passwordHash = hashPassword(password);
    }
    if (name) {
      user.name = name.trim();
    }
  } else {
    user = db.createUser(name ? name.trim() : normalizedEmail.split('@')[0], normalizedEmail, password);
  }

  const profile = db.getProfile(user.id);
  const token = `ln_token_${user.id}_${Date.now()}`;
  res.json({ user, profile, token, isExisting: false });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = db.getUserByEmail(normalizedEmail);

  if (!user) {
    // Seamless account creation on login so users are never blocked
    const defaultName = normalizedEmail.split('@')[0];
    user = db.createUser(defaultName, normalizedEmail, password);
  } else if (password && user.passwordHash) {
    const isValid = db.validatePassword(user, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Senha incorreta para esta conta. Verifique sua senha.' });
    }
  }

  const profile = db.getProfile(user.id);
  const token = `ln_token_${user.id}_${Date.now()}`;
  res.json({ user, profile, token });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const headerUserId = req.headers['x-user-id'] as string;
  if (!headerUserId || !headerUserId.trim()) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  const user = db.getUserById(headerUserId.trim());
  if (!user) {
    return res.status(401).json({ error: 'Usuário não encontrado' });
  }
  const profile = db.getProfile(user.id);
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

  // 3. Extract custom Gemini key from headers or request body if supplied
  const customGeminiKey = (req.headers['x-gemini-key'] as string) || req.body.geminiApiKey;

  // 4. Generate tutor turn with Gemini or fallback
  const aiTurn = await generateTutorTurn(
    text.trim(),
    profile,
    memories,
    recentHistory,
    session.topic,
    customGeminiKey
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

// 10. WhatsApp Cloud API Webhook Handshake (Meta Verification)
apiRouter.get('/whatsapp/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'lingonova_whatsapp_webhook_token';

  if (mode === 'subscribe' && token === expectedToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// 11. WhatsApp Inbound Message Handler (Meta Cloud API Webhook)
apiRouter.post('/whatsapp/webhook', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account' || body.entry) {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const message = changes?.value?.messages?.[0];
      const from = message?.from || 'whatsapp-demo';

      if (message) {
        const text = message.text?.body || message.caption || 'Hello Iris!';
        const isAudio = message.type === 'audio';

        let user = db.getUserByEmail(`${from}@whatsapp.lingonova.internal`);
        if (!user) {
          user = db.createUser(`Aluno WhatsApp (${from.slice(-4)})`, `${from}@whatsapp.lingonova.internal`);
        }

        const profile = db.getProfile(user.id);
        const memories = db.getMemories(user.id);
        const recentHistory = db.getRecentMessages(user.id, 8);

        const aiTurn = await generateTutorTurn(text, profile, memories, recentHistory, 'WhatsApp Chat');
        const replyText = `${aiTurn.conversationalReply} ${aiTurn.followUpQuestion}`;

        let session = db.getSessions(user.id)[0];
        if (!session) {
          session = db.createSession(user.id, 'Conversa WhatsApp', 'Geral', profile.cefrLevel);
        }

        db.addMessage(user.id, session.id, 'user', text, isAudio);
        db.addMessage(user.id, session.id, 'tutor', replyText, true, aiTurn.correctionSnippet, aiTurn.portugueseExplanation);

        return res.status(200).json({
          status: 'dispatched',
          to: from,
          text: replyText,
          correction: aiTurn.correctionSnippet,
          portugueseExplanation: aiTurn.portugueseExplanation,
        });
      }
    }

    return res.status(200).json({ status: 'acknowledged' });
  } catch (err) {
    console.error('WhatsApp webhook error:', err);
    return res.status(500).json({ error: 'Webhook processing failed.' });
  }
});

// 12. WhatsApp Simulator Dispatch Endpoint
apiRouter.post('/whatsapp/simulate', async (req: Request, res: Response) => {
  const { message, from = '5511999998888', isAudio = false, topic = 'Geral' } = req.body;
  const userId = getAuthUserId(req);

  const profile = db.getProfile(userId);
  const memories = db.getMemories(userId);
  const recentHistory = db.getRecentMessages(userId, 6);

  const aiTurn = await generateTutorTurn(message, profile, memories, recentHistory, topic);
  const combinedText = `${aiTurn.conversationalReply} ${aiTurn.followUpQuestion}`;

  res.json({
    recipient: from,
    messageType: isAudio ? 'audio/ogg' : 'text',
    irisResponse: {
      conversationalReply: aiTurn.conversationalReply,
      followUpQuestion: aiTurn.followUpQuestion,
      fullText: combinedText,
      hasCorrection: aiTurn.hasCorrection,
      correctionSnippet: aiTurn.correctionSnippet,
      portugueseExplanation: aiTurn.portugueseExplanation,
    },
    metaDispatchPayload: {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: from,
      type: 'text',
      text: { body: combinedText },
    },
  });
});

// 13. Daily Engagement Scheduler & Streak Preservation (RF-06 & Seção 2.3)
apiRouter.get('/scheduler/status', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const progress = db.getProgress(userId);
  const profile = db.getProfile(userId);

  res.json({
    currentStreakDays: progress.streakDays,
    lastActiveDate: progress.lastActiveDate,
    needsReminder: true,
    recommendedHook: `Hey! Are you ready for a quick 3-minute chat about ${profile.interests[0] || 'your day'}? Let's keep your ${progress.streakDays}-day streak alive! 🔥`,
  });
});

apiRouter.post('/scheduler/trigger-reminders', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const profile = db.getProfile(userId);
  const progress = db.getProgress(userId);

  const hookMessage = `Good morning! ☕ How is your coffee today? Aria is ready for your 3-minute speaking practice to protect your ${progress.streakDays}-day streak!`;

  res.json({
    status: 'triggered',
    userId,
    channel: 'whatsapp_push',
    message: hookMessage,
    scheduledAt: new Date().toISOString(),
  });
});
