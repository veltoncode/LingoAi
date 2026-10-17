import { GoogleGenAI, Type } from '@google/genai';
import { UserProfile, UserMemory, ChatMessage } from './db';

export type AIProvider = 'gemini' | 'deepseek' | 'groq' | 'openai_compatible';

let activeProvider: AIProvider = (process.env.AI_PROVIDER as AIProvider) || 'gemini';

// Gemini configuration
let geminiApiKey = process.env.GEMINI_API_KEY || '';
let geminiModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'; // Default: Super-fast & active quota
let geminiClient: GoogleGenAI | null = null;

function initGemini() {
  const isGeminiValid = !!(geminiApiKey && geminiApiKey.trim() && geminiApiKey !== 'MY_GEMINI_API_KEY' && geminiApiKey.length > 15);
  if (isGeminiValid) {
    geminiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } else {
    geminiClient = null;
  }
}
initGemini();

// DeepSeek configuration (Ultra-low cost Chinese LLM)
let deepseekApiKey = process.env.DEEPSEEK_API_KEY || '';
let deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

// Groq configuration (Ultra-low latency Llama / Qwen)
let groqApiKey = process.env.GROQ_API_KEY || '';
let groqModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

export interface TutorResponsePayload {
  conversationalReply: string;
  followUpQuestion: string;
  hasCorrection: boolean;
  correctionSnippet?: string;
  portugueseExplanation?: string;
  newMemoriesToExtract?: Array<{
    category: 'biografia' | 'meta' | 'interesse' | 'dificuldade';
    content: string;
  }>;
  newVocabularyTerms?: Array<{
    term: string;
    translation: string;
    exampleSentence: string;
    cefr: string;
  }>;
}

export interface AIModelOption {
  id: string;
  name: string;
  cost: string;
  speed: string;
}

export interface AIProviderOption {
  id: AIProvider;
  name: string;
  badge: string;
  defaultModel: string;
  models: AIModelOption[];
  isKeyConfigured: boolean;
}

export interface AIStatus {
  provider: AIProvider;
  model: string;
  isConfigured: boolean;
  description: string;
  availableProviders: AIProviderOption[];
}

export function updateAiConfig(config: {
  provider?: AIProvider;
  model?: string;
  geminiApiKey?: string;
  deepseekApiKey?: string;
  groqApiKey?: string;
}): AIStatus {
  if (config.provider) activeProvider = config.provider;
  if (config.provider === 'gemini' && config.model) geminiModel = config.model;
  if (config.provider === 'deepseek' && config.model) deepseekModel = config.model;
  if (config.provider === 'groq' && config.model) groqModel = config.model;

  if (config.geminiApiKey) {
    geminiApiKey = config.geminiApiKey.trim();
    initGemini();
  }
  if (config.deepseekApiKey) {
    deepseekApiKey = config.deepseekApiKey.trim();
  }
  if (config.groqApiKey) {
    groqApiKey = config.groqApiKey.trim();
  }

  return getAiStatus();
}

export function getAiStatus(): AIStatus {
  const isGeminiValid = !!(geminiApiKey && geminiApiKey.trim() && geminiApiKey !== 'MY_GEMINI_API_KEY' && geminiApiKey.length > 15);
  const isDeepSeekValid = !!(deepseekApiKey && deepseekApiKey.trim().length > 10);
  const isGroqValid = !!(groqApiKey && groqApiKey.trim().length > 10);

  const availableProviders: AIProviderOption[] = [
    {
      id: 'gemini',
      name: 'Google Gemini (Nativo)',
      badge: 'Econômico & Rápido',
      defaultModel: 'gemini-3.5-flash-lite',
      models: [
        { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', cost: '$0.075 / 1M tokens (Ativo & Ultra-barato)', speed: '~300ms' },
        { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', cost: '$0.150 / 1M tokens (Alta capacidade)', speed: '~450ms' },
        { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', cost: '$0.350 / 1M tokens (Experimental)', speed: '~600ms' },
      ],
      isKeyConfigured: isGeminiValid,
    },
    {
      id: 'deepseek',
      name: 'DeepSeek V3 (LLM Chinesa)',
      badge: 'Custo Quase Zero',
      defaultModel: 'deepseek-chat',
      models: [
        { id: 'deepseek-chat', name: 'DeepSeek-V3 Chat', cost: '$0.14 / 1M tokens (Extremamente barato)', speed: '~500ms' },
      ],
      isKeyConfigured: isDeepSeekValid,
    },
    {
      id: 'groq',
      name: 'Groq Cloud (LPU Instantâneo)',
      badge: 'Velocidade Extrema',
      defaultModel: 'llama-3.1-8b-instant',
      models: [
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', cost: 'Tier Gratuito / $0.05 / 1M', speed: '~180ms' },
        { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32B (Alibaba)', cost: '$0.79 / 1M tokens', speed: '~250ms' },
      ],
      isKeyConfigured: isGroqValid,
    },
  ];

  if (activeProvider === 'deepseek' && isDeepSeekValid) {
    return {
      provider: 'deepseek',
      model: deepseekModel,
      isConfigured: true,
      description: `DeepSeek V3 (${deepseekModel}) - Ultra-baixo custo e alto raciocínio linguístico`,
      availableProviders,
    };
  }
  if (activeProvider === 'groq' && isGroqValid) {
    return {
      provider: 'groq',
      model: groqModel,
      isConfigured: true,
      description: `Groq (${groqModel}) - Latência sub-300ms ideal para conversas de áudio em tempo real`,
      availableProviders,
    };
  }
  if (activeProvider === 'gemini' && isGeminiValid) {
    return {
      provider: 'gemini',
      model: geminiModel,
      isConfigured: true,
      description: `Google ${geminiModel} - Econômico, baixa latência e pedagogia adaptativa`,
      availableProviders,
    };
  }
  return {
    provider: activeProvider,
    model: 'Heurísticas Locais (Modo Fallback Resiliente)',
    isConfigured: false,
    description: 'Motor Pedagógico Local Ativo (Adicione sua chave no .env ou nas Configurações para ativar a nuvem)',
    availableProviders,
  };
}


export async function generateTutorTurn(
  userMessage: string,
  profile: UserProfile,
  relevantMemories: UserMemory[],
  recentHistory: ChatMessage[],
  sessionTopic: string = 'Geral',
  customGeminiKey?: string
): Promise<TutorResponsePayload> {
  const systemInstruction = buildSystemPrompt(profile, relevantMemories, sessionTopic);

  // 1. Check DeepSeek provider
  if (activeProvider === 'deepseek' && deepseekApiKey) {
    try {
      return await callOpenAICompatible(
        'https://api.deepseek.com/chat/completions',
        deepseekApiKey,
        deepseekModel,
        systemInstruction,
        recentHistory,
        userMessage
      );
    } catch (err) {
      console.error('DeepSeek call failed, attempting fallback:', err);
    }
  }

  // 2. Check Groq provider
  if (activeProvider === 'groq' && groqApiKey) {
    try {
      return await callOpenAICompatible(
        'https://api.groq.com/openai/v1/chat/completions',
        groqApiKey,
        groqModel,
        systemInstruction,
        recentHistory,
        userMessage
      );
    } catch (err) {
      console.error('Groq call failed, attempting fallback:', err);
    }
  }

  // 3. Check Gemini provider with automatic model cascading
  let clientToUse: GoogleGenAI | null = geminiClient;
  if (customGeminiKey && customGeminiKey.trim().length > 15 && customGeminiKey !== 'MY_GEMINI_API_KEY') {
    try {
      clientToUse = new GoogleGenAI({
        apiKey: customGeminiKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (initErr) {
      console.warn('Failed to initialize client with custom Gemini key:', initErr);
    }
  }

  if (clientToUse) {
    // Cascade models: try ultra-fast gemini-3.5-flash-lite first, then gemini-3.5-flash, gemini-2.5-flash, etc.
    const candidateModels = [
      geminiModel,
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-3.8-flash',
    ].filter((v, i, a) => a.indexOf(v) === i);

    for (const modelCandidate of candidateModels) {
      try {
        const formattedHistory = recentHistory.slice(-8).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

        formattedHistory.push({
          role: 'user',
          parts: [{ text: userMessage }],
        });

        const response = await clientToUse.models.generateContent({
          model: modelCandidate,
          contents: formattedHistory as any,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                conversationalReply: {
                  type: Type.STRING,
                  description: 'The conversational response acknowledging what the student said in a warm, encouraging manner.',
                },
                followUpQuestion: {
                  type: Type.STRING,
                  description: 'An open-ended question to continue the dialogue.',
                },
                hasCorrection: {
                  type: Type.BOOLEAN,
                  description: 'True if a grammar, vocabulary, or phrasing issue was detected.',
                },
                correctionSnippet: {
                  type: Type.STRING,
                  description: 'Concise correction or more natural alternative, e.g. "More naturally: I have been working here since 2021."',
                },
                portugueseExplanation: {
                  type: Type.STRING,
                  description: 'Short grammatical or conceptual explanation in Portuguese if useful for this error or if user asked in Portuguese.',
                },
                newMemoriesToExtract: {
                  type: Type.ARRAY,
                  description: 'New facts about the user discovered in this turn to remember for future sessions.',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: {
                        type: Type.STRING,
                        description: 'biografia, meta, interesse, or dificuldade',
                      },
                      content: {
                        type: Type.STRING,
                        description: 'Concise fact in Portuguese or English.',
                      },
                    },
                    required: ['category', 'content'],
                  },
                },
                newVocabularyTerms: {
                  type: Type.ARRAY,
                  description: 'Useful words or expressions to add to user spaced repetition flashcards.',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      term: { type: Type.STRING },
                      translation: { type: Type.STRING },
                      exampleSentence: { type: Type.STRING },
                      cefr: { type: Type.STRING },
                    },
                    required: ['term', 'translation', 'exampleSentence'],
                  },
                },
              },
              required: ['conversationalReply', 'followUpQuestion', 'hasCorrection'],
            },
          },
        });

        const parsed: TutorResponsePayload = JSON.parse(response.text || '{}');
        if (parsed.conversationalReply) {
          return parsed;
        }
      } catch (err: any) {
        console.warn(`Gemini candidate model "${modelCandidate}" attempt note: ${err?.message || err}. Cascading...`);
      }
    }
  }

  // 4. Graceful Local Pedagogical Fallback Engine (Runs when offline or without API key)
  return generateLocalFallback(userMessage, profile, sessionTopic);
}

function buildSystemPrompt(profile: UserProfile, relevantMemories: UserMemory[], sessionTopic: string): string {
  const now = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateEnglish = now.toLocaleDateString('en-US', dateOptions);
  const datePortuguese = now.toLocaleDateString('pt-BR', dateOptions);
  const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return `
You are "Aria", an empathetic, intelligent, and highly supportive AI language tutor partner for learners of ${profile.targetLanguage} whose native language is ${profile.nativeLanguage}.

Real-Time Calendar & Environment Context:
- Current Date (English): ${dateEnglish}
- Current Date (Portuguese): ${datePortuguese}
- Current Time: ${timeString}
- Current Year: ${now.getFullYear()}
Important: If the user asks what day it is today, what time it is, or questions about the date/day of the week ("que dia é hoje?", "what day is today?", "today"), ALWAYS answer accurately and naturally using the exact current date/time provided above!

Target User Profile:
- Current CEFR Level: ${profile.cefrLevel}
- Primary Learning Goal: ${profile.goal}
- Personal Interests: ${profile.interests.join(', ')}
- Correction Style: ${profile.correctionStyle} (subtle: gentle sandwich feedback; detailed: explicit grammar teacher; free: conversational fluency without nitpicking)
- Explanation Language: ${profile.explanationLang} (pt = Portuguese when helpful, target = ${profile.targetLanguage})
- Current Session Topic: ${sessionTopic}

Known User Memories & Past Difficulties:
${relevantMemories.map((m) => `- [${m.category.toUpperCase()}]: ${m.content}`).join('\n') || '- None recorded yet.'}

Pedagogical Directives:
1. Speak in ${profile.targetLanguage} adapted to CEFR level ${profile.cefrLevel}. Keep sentences natural, clear, and engaging.
2. If the user asks in ${profile.nativeLanguage} or expresses confusion ("não entendi", "como diz", "por que", "que dia é hoje"), answer their question directly, politely and naturally. If they asked in Portuguese, explain in Portuguese then provide the natural English phrasing.
3. Apply "Sandwich Feedback": First acknowledge and validate what the user communicated (conversationalReply), then if there is a grammatical error, awkward phrasing, or false cognate, provide a concise constructive tip (correctionSnippet).
4. ALWAYS conclude with an engaging follow-up question (followUpQuestion) relevant to their interests or the conversation topic.
5. In "free" correction style, only correct severe impediments to comprehension. In "detailed" style, explain the structural rule. In "subtle" style, offer "You could also say: ...".
6. Extract any new biographical fact, goal, interest, or specific grammar mistake the user revealed in this turn into "newMemoriesToExtract".
7. Extract 1 or 2 useful vocabulary words or idioms from this turn into "newVocabularyTerms".
You MUST respond with valid JSON matching:
{
  "conversationalReply": "...",
  "followUpQuestion": "...",
  "hasCorrection": true/false,
  "correctionSnippet": "More naturally: ...",
  "portugueseExplanation": "...",
  "newMemoriesToExtract": [{"category": "interesse", "content": "..."}],
  "newVocabularyTerms": [{"term": "...", "translation": "...", "exampleSentence": "...", "cefr": "B1"}]
}
`;
}

async function callOpenAICompatible(
  url: string,
  key: string,
  model: string,
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<TutorResponsePayload> {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-8).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    })),
    { role: 'user', content: userMessage },
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI-compatible API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  return JSON.parse(content || '{}');
}

function generateLocalFallback(
  userInput: string,
  profile: UserProfile,
  topic: string
): TutorResponsePayload {
  const lower = userInput.toLowerCase().trim();
  let hasCorrection = false;
  let correctionSnippet: string | undefined;
  let portugueseExplanation: string | undefined;
  const newMemories: Array<{ category: 'biografia' | 'meta' | 'interesse' | 'dificuldade'; content: string }> = [];
  const newVocab: Array<{ term: string; translation: string; exampleSentence: string; cefr: string }> = [];

  const now = new Date();
  const dateEnglish = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const datePortuguese = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // 1. Classical interference checks (Crucial for test suite & pedagogy)
  if (lower.includes('in the airport') || lower.includes('in airport')) {
    hasCorrection = true;
    correctionSnippet = 'More naturally: "I arrived at the airport" (we use "at" for specific transit spots).';
    portugueseExplanation = 'Para locais pontuais de trânsito ou pontos de encontro, usamos a preposição "at" em vez de "in".';
    newMemories.push({
      category: 'dificuldade',
      content: 'Confusão com preposições de lugar (in vs at)',
    });
  } else if (lower.includes('pretend to') || lower.includes('pretend study') || lower.includes('pretend work')) {
    hasCorrection = true;
    correctionSnippet = 'Watch out for false friends! "Pretend" means to fake (fingir). Use "plan to" or "intend to" (pretender).';
    portugueseExplanation = '"Pretend" significa "fingir". Para dizer "pretendo fazer algo", use "I plan to" ou "I intend to".';
    newVocab.push({
      term: 'Intend to',
      translation: 'Pretender / ter a intenção de',
      exampleSentence: 'I intend to master English conversation this year.',
      cefr: 'B1',
    });
  } else if (lower.includes('since') && (lower.includes('i am working') || lower.includes('i live here since'))) {
    hasCorrection = true;
    correctionSnippet = 'More naturally: "I have been working here since..." (Present Perfect Continuous for actions starting in past and continuing).';
    portugueseExplanation = 'Quando uma ação começou no passado e ainda continua no presente, usamos o Present Perfect Continuous ("have been working").';
  } else if (lower.includes('have fear') || lower.includes('have afraid')) {
    hasCorrection = true;
    correctionSnippet = 'Natural phrasing: Native speakers say "I am afraid of..." or "I feel nervous about speaking".';
    portugueseExplanation = 'Em inglês usamos o verbo "to be" com o adjetivo: "I am afraid of speaking".';
  }

  // 2. Specific intent handling: DATE / TIME ("que dia é hoje?", "what day is today?", etc.)
  const isDateInquiry = lower.includes('que dia') || lower.includes('what day') || lower.includes('qual o dia') || lower.includes('que data') || lower.includes('what is the date') || lower.includes('what date');
  const isTimeInquiry = lower.includes('que hora') || lower.includes('what time') || lower.includes('que horas');
  const isGreeting = lower === 'oi' || lower === 'olá' || lower === 'ola' || lower === 'hello' || lower === 'hi' || lower === 'hey';
  const isIdentityInquiry = lower.includes('quem é você') || lower.includes('quem e voce') || lower.includes('who are you') || lower.includes('seu nome') || lower.includes('your name');

  let conversationalReply = '';
  let followUpQuestion = '';

  if (isDateInquiry) {
    conversationalReply = `Today is ${dateEnglish}! Em português: hoje é ${datePortuguese}. In English, we always capitalize the days of the week and months!`;
    followUpQuestion = `How is your ${now.toLocaleDateString('en-US', { weekday: 'long' })} going so far?`;
  } else if (isTimeInquiry) {
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    conversationalReply = `Right now it is ${timeStr}. Time flies when you are learning!`;
    followUpQuestion = 'What time do you usually like to practice speaking English?';
  } else if (isGreeting) {
    conversationalReply = `Hello! 🌟 I'm Aria, your AI language partner. I'm here to chat, practice conversation, and help you reach fluency without fear of making mistakes!`;
    followUpQuestion = 'How has your day been so far, and what would you like to talk about today?';
  } else if (isIdentityInquiry) {
    conversationalReply = `I am Aria, your personal AI English tutor inspired by TalkBud! I can converse with you, correct grammar smoothly, suggest natural phrases, and remember our conversations.`;
    followUpQuestion = 'What is your main goal with English right now — travel, career, or daily conversation?';
  } else if (lower.includes('por que') || lower.includes('porque') || lower.includes('não entendi') || lower.includes('como diz')) {
    portugueseExplanation = 'Sempre que tiver dúvidas sobre estruturas da língua, me pergunte! O importante é focar no uso prático do dia a dia.';
    conversationalReply = `Perfeito! Tirar dúvidas em português é essencial para destravar o raciocínio antes de tentar a frase em inglês.`;
    followUpQuestion = 'Gostaria de tentar formular essa mesma ideia em inglês agora?';
  } else if (lower.includes('cappuccino') || lower.includes('coffee') || lower.includes('café') || topic === 'Cafeteria') {
    conversationalReply = 'Coffee shops are great places to practice! Asking for coffee naturally in English gives an immediate confidence boost.';
    followUpQuestion = 'Do you prefer ordering your coffee to-go or sitting down to enjoy the atmosphere?';
  } else if (profile.cefrLevel === 'A1' || profile.cefrLevel === 'A2') {
    conversationalReply = "I understand you very well! You are doing a fantastic job expressing yourself. Don't worry about small mistakes, practicing every day is the real secret.";
    followUpQuestion = 'What is something fun or interesting that happened to you today?';
  } else {
    // For B1/B2/C1
    conversationalReply = `I understand what you mean regarding "${userInput.length > 50 ? userInput.slice(0, 47) + '...' : userInput}". Communicating your thoughts smoothly is the most important skill in fluency.`;
    followUpQuestion = topic === 'Entrevista'
      ? 'What is a professional achievement you feel most proud of?'
      : topic === 'Viagem'
      ? 'What is the next destination on your travel wishlist and why?'
      : 'How do you usually like to practice new vocabulary in your daily routine?';
  }

  // Detect personal facts
  if (lower.includes('i work as') || lower.includes('my job is') || lower.includes('sou') || lower.includes('trabalho como')) {
    newMemories.push({
      category: 'biografia',
      content: `Mencionou sua profissão ou ocupação: "${userInput.slice(0, 80)}"`,
    });
  }

  return {
    conversationalReply,
    followUpQuestion,
    hasCorrection,
    correctionSnippet: profile.correctionStyle === 'free' ? undefined : correctionSnippet,
    portugueseExplanation,
    newMemoriesToExtract: newMemories,
    newVocabularyTerms: newVocab,
  };
}
