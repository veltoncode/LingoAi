import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Flame, 
  RotateCcw, 
  Lightbulb, 
  HelpCircle,
  Headphones,
  Check
} from 'lucide-react';
import { evaluateStudentMessage, speakText, stopSpeaking } from '../utils/tutorEngine';

interface ChatMessage {
  id: string;
  sender: 'user' | 'iris';
  text: string;
  isAudio?: boolean;
  correctionSnippet?: string;
  portugueseExplanation?: string;
  timestamp: string;
}

export const IrisSimulator: React.FC = () => {
  const [cefrLevel, setCefrLevel] = useState<string>('B1');
  const [topic, setTopic] = useState<string>('Geral');
  const [inputText, setInputText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null);
  const [streakDays, setStreakDays] = useState<number>(4);
  const [turnsCount, setTurnsCount] = useState<number>(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'iris',
      text: "Hey there! I'm Iris, your English practice partner. 🌟 I'm super excited to chat with you today! Don't worry about being perfect — the goal is just to get comfortable speaking. How was your day so far?",
      isAudio: true,
      timestamp: '17:00',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      isAudio: isRecording,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsRecording(false);
    setTurnsCount((prev) => prev + 1);

    // Simulate tutor response with realistic latency
    setTimeout(() => {
      const evaluation = evaluateStudentMessage(text, cefrLevel, topic);
      const combinedText = `${evaluation.conversationalReply} ${evaluation.followUpQuestion}`;

      const irisMsg: ChatMessage = {
        id: `iris-${Date.now()}`,
        sender: 'iris',
        text: combinedText,
        isAudio: true,
        correctionSnippet: evaluation.correctionSnippet,
        portugueseExplanation: evaluation.portugueseExplanation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, irisMsg]);
      
      // Auto-speak Iris's response
      handlePlayAudio(irisMsg.id, irisMsg.text);
    }, 800);
  };

  const handlePlayAudio = (id: string, text: string) => {
    if (isPlayingVoice === id) {
      stopSpeaking();
      setIsPlayingVoice(null);
    } else {
      setIsPlayingVoice(id);
      speakText(text).then(() => {
        setIsPlayingVoice(null);
      });
    }
  };

  const handleToggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Fallback simulation for unsupported browsers
      setInputText('I arrived in the airport yesterday and lost my bag.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsRecording(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
      setInputText('Can you help me practice English today?');
    }
  };

  const resetChat = () => {
    stopSpeaking();
    setIsPlayingVoice(null);
    setMessages([
      {
        id: 'msg-0',
        sender: 'iris',
        text: "Hey! Ready for another quick practice round? What topic would you like to explore together?",
        isAudio: true,
        timestamp: '17:00',
      },
    ]);
  };

  const presetMistakes = [
    { label: 'Erro Preposição', text: 'I arrived in the airport at 9 PM yesterday.' },
    { label: 'Falso Amigo', text: 'I pretend to study medicine in Canada next year.' },
    { label: 'Passado Duplo', text: 'I did not arrived on time for my appointment.' },
    { label: 'Ansiedade / A1', text: 'I am afraid to speak because my English is bad.' },
    { label: 'Dúvida em PT', text: 'Por que usamos have lived em vez de live aqui?' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Bot className="w-4 h-4" />
              Simulador Interativo
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Simulador de Conversação — Tutor Iris
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Experimente a dinâmica de conversação do TalkBud: notas de voz sintetizadas, correção pedagógica "sanduíche" e suporte bilíngue.
            </p>
          </div>

          {/* Gamification / Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>Streak: {streakDays} dias</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Turnos: {turnsCount}</span>
            </div>
            <button
              onClick={resetChat}
              title="Reiniciar Conversa"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Level and Scenario Selectors */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Nível CEFR:</span>
            {['A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setCefrLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  cefrLevel === lvl
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Cenário:</span>
            {['Geral', 'Cafeteria', 'Entrevista', 'Viagem'].map((scn) => (
              <button
                key={scn}
                onClick={() => setTopic(scn)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  topic === scn
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {scn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Window Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[560px]">
        {/* WhatsApp-like Topbar */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 shadow-md">
                I
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                Iris • TalkBud AI
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
                  Online 24/7
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tutor de Prática Diária ({cefrLevel}) • Cenário: {topic}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            <Headphones className="w-3.5 h-3.5 text-emerald-400" />
            <span>Áudio com Voz Nativa Ativado</span>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/50">
          {messages.map((msg) => {
            const isIris = msg.sender === 'iris';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isIris ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-md ${
                    isIris
                      ? 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-sm'
                      : 'bg-emerald-600 text-white rounded-tr-sm'
                  }`}
                >
                  {/* Audio Player Bar if it's Iris voice note */}
                  {isIris && msg.isAudio && (
                    <div className="mb-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePlayAudio(msg.id, msg.text)}
                          className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-md transition-all shrink-0"
                        >
                          {isPlayingVoice === msg.id ? (
                            <VolumeX className="w-4 h-4 text-slate-950" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-slate-950" />
                          )}
                        </button>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                            Nota de Voz da Iris
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {isPlayingVoice === msg.id ? 'Reproduzindo voz...' : 'Clique para ouvir'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <span className={`w-1 h-3 rounded-full ${isPlayingVoice === msg.id ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`}></span>
                        <span className={`w-1 h-5 rounded-full ${isPlayingVoice === msg.id ? 'bg-emerald-400 animate-pulse delay-75' : 'bg-slate-700'}`}></span>
                        <span className={`w-1 h-2 rounded-full ${isPlayingVoice === msg.id ? 'bg-emerald-400 animate-pulse delay-150' : 'bg-slate-700'}`}></span>
                        <span className={`w-1 h-4 rounded-full ${isPlayingVoice === msg.id ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`}></span>
                      </div>
                    </div>
                  )}

                  {/* Message Main Text */}
                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>

                  {/* Sandwich Feedback: Reformulação Sutil */}
                  {msg.correctionSnippet && (
                    <div className="mt-3 p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                        <Lightbulb className="w-3.5 h-3.5" />
                        Better phrasing / Dica de pronúncia:
                      </div>
                      <p className="leading-snug">{msg.correctionSnippet}</p>
                    </div>
                  )}

                  {/* Sandwich Feedback: Explicação em Português para travas */}
                  {msg.portugueseExplanation && (
                    <div className="mt-2.5 p-2.5 bg-sky-950/40 border border-sky-500/30 rounded-xl text-xs text-sky-200">
                      <div className="flex items-center gap-1.5 font-bold text-sky-400 mb-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Explicação em Português:
                      </div>
                      <p className="leading-snug">{msg.portugueseExplanation}</p>
                    </div>
                  )}

                  <div className="mt-2 text-[10px] text-slate-400 text-right">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick injection chips */}
        <div className="bg-slate-950/90 px-4 py-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
            Testar Erro Típico:
          </span>
          {presetMistakes.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(preset.text)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg whitespace-nowrap text-[11px] transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={handleToggleVoiceInput}
            title={isRecording ? 'Parar gravação' : 'Gravar áudio com microfone'}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
          </button>

          <input
            type="text"
            placeholder={isRecording ? 'Gravando sua voz... fale agora em inglês!' : 'Digite sua mensagem ou clique no microfone...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
