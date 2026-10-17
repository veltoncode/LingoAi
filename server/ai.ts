import { GoogleGenAI, Type } from '@google/genai';
import { UserProfile, UserMemory, ChatMessage } from './db';

export type AIProvider = 'gemini' | 'deepseek' | 'groq' | 'openai_compatible';

let activeProvider: AIProvider = (process.env.AI_PROVIDER as AIProvider) || 'gemini';

// Gemini configuration
let geminiApiKey = process.env.GEMINI_API_KEY || '';
let geminiModel = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'; // Default: Ultra-economical & fast
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
      defaultModel: 'gemini-3.1-flash-lite',
      models: [
        { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', cost: '$0.075 / 1M tokens (Ultra-barato)', speed: '~300ms' },
        { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', cost: '$0.35 / 1M tokens (Alta capacidade)', speed: '~600ms' },
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
  sessionTopic: string = 'Geral'
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

  // 3. Check Gemini provider (Default: gemini-3.1-flash-lite)
  if (geminiClient) {
    try {
      const formattedHistory = recentHistory.slice(-8).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      formattedHistory.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const response = await geminiClient.models.generateContent({
        model: geminiModel,
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
      return parsed;
    } catch (err) {
      console.error('Gemini API call failed, using graceful pedagogical fallback:', err);
    }
  }

  // 4. Graceful Local Pedagogical Fallback Engine (Runs when offline or without API key)
  return generateLocalFallback(userMessage, profile, sessionTopic);
}

function buildSystemPrompt(profile: UserProfile, relevantMemories: UserMemory[], sessionTopic: string): string {
  return `
You are "Aria", an empathetic, intelligent, and highly supportive AI language tutor partner for learners of ${profile.targetLanguage} whose native language is ${profile.nativeLanguage}.

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
2. If the user asks in ${profile.nativeLanguage} or expresses confusion ("não entendi", "como diz", "por que"), explain politely in Portuguese, then provide the ${profile.targetLanguage} example and encourage them to try.
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
  const lower = userInput.toLowerCase();
  let hasCorrection = false;
  let correctionSnippet: string | undefined;
  let portugueseExplanation: string | undefined;
  const newMemories: Array<{ category: 'biografia' | 'meta' | 'interesse' | 'dificuldade'; content: string }> = [];
  const newVocab: Array<{ term: string; translation: string; exampleSentence: string; cefr: string }> = [];

  // 1. Classical interference checks
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

  // Check if user is asking for explanation in Portuguese
  if (lower.includes('por que') || lower.includes('porque') || lower.includes('não entendi') || lower.includes('como diz')) {
    portugueseExplanation = 'Sempre que tiver dúvidas sobre estruturas da língua, me pergunte! O importante é focar no uso prático do dia a dia.';
  }

  // Detect personal facts
  if (lower.includes('i work as') || lower.includes('my job is') || lower.includes('sou')) {
    newMemories.push({
      category: 'biografia',
      content: `Mencionou sua profissão ou ocupação: "${userInput.slice(0, 80)}"`,
    });
  }

  // Conversational response
  let conversationalReply = '';
  let followUpQuestion = '';

  if (profile.cefrLevel === 'A1' || profile.cefrLevel === 'A2') {
    conversationalReply = "I understand you very well! You are doing a fantastic job expressing yourself. Don't worry about small mistakes, practicing every day is the real secret.";
    followUpQuestion = topic === 'Cafeteria'
      ? "Do you like drinking coffee in the morning or in the afternoon?"
      : "What did you enjoy doing today?";
  } else {
    conversationalReply = "That makes total sense! Communicating clearly is all about getting your ideas across smoothly, and you did that with confidence.";
    followUpQuestion = topic === 'Entrevista'
      ? "What is a professional achievement you feel most proud of?"
      : topic === 'Viagem'
      ? "What is the next destination on your travel wishlist and why?"
      : "How do you usually like to practice new vocabulary in your daily routine?";
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
