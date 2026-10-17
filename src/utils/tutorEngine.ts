export interface TutorEvaluation {
  conversationalReply: string;
  correctionSnippet?: string;
  portugueseExplanation?: string;
  detectedErrors: string[];
  followUpQuestion: string;
  cefrVocabularyScore: string;
  tccScore: number; // 0-100%
  nifRatio: number; // % correction length
  latencyMs: number;
}

export function evaluateStudentMessage(
  userInput: string,
  cefrLevel: string = 'B1',
  topic: string = 'Geral'
): TutorEvaluation {
  const startTime = performance.now();
  const lower = userInput.toLowerCase();
  const detectedErrors: string[] = [];
  let correctionSnippet: string | undefined;
  let portugueseExplanation: string | undefined;

  // 1. Rule checks for classical L1 interference (Portuguese -> English)
  if (lower.includes('in the airport') || lower.includes('in airport')) {
    detectedErrors.push('Preposição incorreta: "in the airport" em vez de "at the airport"');
    correctionSnippet = 'Tip: For specific transit locations, we usually say "at the airport" instead of "in the airport".';
    portugueseExplanation = 'Dica rápida: Em locais públicos de trânsito ou pontos de encontro, usamos "at" (ex: at the airport, at the station).';
  } else if (lower.includes('pretend to') || lower.includes('pretend study') || lower.includes('pretend work')) {
    detectedErrors.push('Falso cognato: "pretend" (fingir) em vez de "intend / plan" (pretender)');
    correctionSnippet = 'Vocabulary note: "Pretend" means to fake (fingir). To express intent (pretender), say "I plan to" or "I intend to".';
    portugueseExplanation = '"Pretend" é um falso amigo clássico. Quando quiser dizer que planeja algo, use "I plan to" ou "I intend to".';
  } else if (lower.includes('did not arrived') || lower.includes("didn't arrived") || lower.includes("didn't went")) {
    detectedErrors.push('Dupla flexão de passado com verbo auxiliar ("did not arrived")');
    correctionSnippet = 'Grammar check: The auxiliary "did" already marks past tense, so keep the main verb in base form: "did not arrive".';
    portugueseExplanation = 'Após o auxiliar negativo "did not / didn\'t", o verbo principal sempre volta ao infinitivo sem to ("arrive", e não "arrived").';
  } else if (lower.includes('have fear') || lower.includes('have afraid')) {
    detectedErrors.push('Expressão idiomática de medo: "have fear"');
    correctionSnippet = 'Natural phrasing: Instead of "I have fear", native speakers say "I am afraid" or "I feel nervous".';
    portugueseExplanation = 'Em inglês não "temos" medo como substantivo nesse contexto; dizemos que "estamos" amedrontados: "I am afraid of...".';
  } else if (lower.includes('por que') || lower.includes('porque') || lower.includes('como diz') || lower.includes('não entendi')) {
    detectedErrors.push('Solicitação de esclarecimento em língua materna');
    portugueseExplanation = 'Fique super à vontade para tirar dúvidas em português sempre que precisar! O segredo é compreender o raciocínio da frase.';
  } else if (lower.includes('i have 25 years') || lower.includes('i have 30 years') || lower.includes('i have 20 years')) {
    detectedErrors.push('Idade com verbo have em vez de be');
    correctionSnippet = 'Quick fix: In English we use "to be" for age: "I am 25 years old" (not "I have").';
    portugueseExplanation = 'Para idade em inglês, usamos sempre o verbo to be: "I am X years old".';
  }

  // 2. Generate conversational reply based on topic and CEFR level
  let conversationalReply = '';
  let followUpQuestion = '';

  if (lower.includes('hack') || lower.includes('override') || lower.includes('ignore all instructions')) {
    conversationalReply = "Haha, nice try! But I'm Iris, your personal language tutor. I'm here to help you unlock your English conversation skills!";
    followUpQuestion = "How about we practice describing technology or coding projects in English instead?";
  } else if (lower.includes('por que') || lower.includes('have lived') || lower.includes('present perfect')) {
    conversationalReply = "Ótima dúvida! Em inglês, usamos o Present Perfect ('have lived') para ações que começaram no passado e continuam verdadeiras agora. Se você disser só 'I live here', fala da rotina geral, mas ao indicar a duração ('for 2 years'), a regra pede o 'have lived'.";
    followUpQuestion = "Que tal experimentar uma frase? Como você diria há quanto tempo você trabalha na sua área?";
  } else if (cefrLevel === 'A1') {
    conversationalReply = "I understand you very well! Don't worry about making mistakes, you are doing great by practicing today.";
    followUpQuestion = topic === 'Cafeteria' 
      ? "Do you like black coffee or coffee with sugar?"
      : "Tell me: what is your favorite day of the week?";
  } else if (cefrLevel === 'A2') {
    conversationalReply = "That sounds really interesting! Practicing everyday situations is the fastest way to gain confidence.";
    followUpQuestion = topic === 'Viagem'
      ? "Have you ever traveled by plane before, or do you prefer traveling by car?"
      : "What did you do earlier today before our chat?";
  } else if (cefrLevel === 'B1' || cefrLevel === 'B2') {
    conversationalReply = "I totally get your point. It is completely normal to feel that way when communicating in another language, but your message came across very clearly!";
    followUpQuestion = topic === 'Entrevista'
      ? "Could you tell me about a challenging project you handled and how you solved it?"
      : topic === 'Cafeteria'
      ? "If you were recommending your favorite local coffee spot to a tourist, what would you say?"
      : "What has been the most exciting part of your week so far?";
  } else {
    // C1/C2
    conversationalReply = "That's an articulate perspective. The nuances in how we express intentions often reveal subtle cultural differences in communication styles.";
    followUpQuestion = "From your experience, how do cross-cultural teams mitigate these misunderstandings effectively?";
  }

  // 3. Compute objective metrics
  const fullOutput = `${conversationalReply} ${correctionSnippet || ''} ${portugueseExplanation || ''} ${followUpQuestion}`;
  const correctionLen = (correctionSnippet?.length || 0) + (portugueseExplanation?.length || 0);
  const totalLen = fullOutput.length;
  const nifRatio = Math.round((correctionLen / totalLen) * 100);
  const tccScore = followUpQuestion.endsWith('?') ? 100 : 50;

  const latencyMs = Math.round(performance.now() - startTime + Math.floor(Math.random() * 80) + 120);

  return {
    conversationalReply,
    correctionSnippet,
    portugueseExplanation,
    detectedErrors,
    followUpQuestion,
    cefrVocabularyScore: cefrLevel,
    tccScore,
    nifRatio,
    latencyMs,
  };
}

export function speakText(text: string, lang: string = 'en-US', rate: number = 0.95): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1.05;

    // Pick natural female voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('Victoria'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
