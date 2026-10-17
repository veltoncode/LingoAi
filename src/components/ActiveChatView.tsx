import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  Sparkles, 
  Lightbulb, 
  HelpCircle, 
  Headphones, 
  MessageSquare,
  Flame,
  ChevronDown
} from 'lucide-react';
import { ChatSession, ChatMessage, UserProfile, api } from '../services/api';
import { speakText, stopSpeaking } from '../utils/tutorEngine';

interface ActiveChatViewProps {
  profile: UserProfile;
  onOpenOnboarding: () => void;
}

export const ActiveChatView: React.FC<ActiveChatViewProps> = ({ profile, onOpenOnboarding }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<{ provider: string; model: string; isConfigured: boolean; description: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user sessions and AI status on mount
  useEffect(() => {
    loadSessions();
    api.getAiStatus().then(setAiStatus);
  }, []);

  const loadSessions = async () => {
    try {
      const { sessions } = await api.getSessions();
      setSessions(sessions);
      if (sessions.length > 0) {
        selectSession(sessions[0]);
      } else {
        // Create initial default session
        const { session } = await api.createSession('Conversa de Apresentação', 'Geral', profile.cefrLevel);
        setSessions([session]);
        selectSession(session);
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  const selectSession = async (sess: ChatSession) => {
    setActiveSession(sess);
    stopSpeaking();
    setPlayingAudioId(null);
    try {
      const { messages } = await api.getMessages(sess.id);
      setMessages(messages);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleCreateSession = async (topic: string = 'Geral') => {
    try {
      const { session } = await api.createSession(`Conversa sobre ${topic}`, topic, profile.cefrLevel);
      setSessions((prev) => [session, ...prev]);
      selectSession(session);
    } catch (err) {
      console.error('Error creating session:', err);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja excluir esta conversa do seu histórico?')) {
      await api.deleteSession(sessionId);
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setSessions(remaining);
      if (activeSession?.id === sessionId) {
        if (remaining.length > 0) {
          selectSession(remaining[0]);
        } else {
          handleCreateSession('Geral');
        }
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string, wasAudioInput?: boolean) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activeSession || isLoading) return;

    const isAudioMsg = wasAudioInput !== undefined ? wasAudioInput : isRecording;

    setInputText('');
    setIsRecording(false);
    setIsLoading(true);

    // Optimistic user message render
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: activeSession.id,
      userId: profile.userId,
      sender: 'user',
      text,
      isAudio: isAudioMsg,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.sendChatMessage(activeSession.id, text, isAudioMsg);
      
      // Replace optimistic message and append real tutor response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.userMessage,
        res.tutorMessage,
      ]);

      // Automatically speak Aria's voice note
      handlePlayVoice(res.tutorMessage.id, res.tutorMessage.text);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVoice = (id: string, text: string) => {
    if (playingAudioId === id) {
      stopSpeaking();
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      speakText(text, 'en-US', profile.pace === 'relaxed' ? 0.85 : 0.95).then(() => {
        setPlayingAudioId(null);
      });
    }
  };

  const handleToggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      handleSendMessage('I arrived in the airport yesterday and lost my luggage.', true);
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
        handleSendMessage(transcript, true);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };


  const presetMistakes = [
    { label: 'Preposição In/At', text: 'I arrived in the airport at 9 PM yesterday.' },
    { label: 'Falso Amigo (Pretend)', text: 'I pretend to study medicine next year.' },
    { label: 'Present Perfect', text: 'I am working at this company since 2021.' },
    { label: 'Medo de Falar', text: 'I have fear to speak English with native people.' },
    { label: 'Dúvida em PT', text: 'Por que se usa "have lived" em vez de "live" aqui?' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
      {/* Sessions Sidebar (Left Col) */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Suas Sessões
            </span>
            <button
              onClick={() => handleCreateSession('Geral')}
              className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors"
              title="Nova Sessão"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick topic buttons */}
          <div className="mb-3 flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            {['Cafeteria', 'Entrevista', 'Viagem', 'Trabalho'].map((top) => (
              <button
                key={top}
                onClick={() => handleCreateSession(top)}
                className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-md border border-slate-800 whitespace-nowrap"
              >
                +{top}
              </button>
            ))}
          </div>

          {/* Session List */}
          <div className="space-y-1.5 overflow-y-auto max-h-[400px] pr-1">
            {sessions.map((s) => {
              const isSelected = activeSession?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => selectSession(s)}
                  className={`group p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate mr-2">
                    <div className="text-xs font-semibold truncate">{s.title}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{s.topic}</span>
                      <span>•</span>
                      <span>{new Date(s.updatedAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                    title="Excluir sessão"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Card Footer */}
        <div className="pt-3 border-t border-slate-800 text-xs">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-[11px] flex items-center gap-1">
                <span>{profile.nativeLanguage} ➔ {profile.targetLanguage}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded">
                  {profile.cefrLevel}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                Estilo: {profile.correctionStyle}
              </div>
            </div>
            <button
              onClick={onOpenOnboarding}
              className="text-[10px] text-emerald-400 hover:underline font-semibold"
            >
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Interface (Right Col) */}
      <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-xl overflow-hidden">
        {/* Chat Header */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 shadow-md">
                A
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                Aria • AI Language Partner
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.2 rounded-full font-semibold border border-emerald-500/30">
                  Prática Ativa
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tópico: <strong>{activeSession?.topic || 'Geral'}</strong> • Nível calibrado: <strong>{profile.cefrLevel}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {aiStatus && (
              <div 
                className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg text-[11px]"
                title={aiStatus.description}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-white">{aiStatus.model}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                  aiStatus.isConfigured 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {aiStatus.isConfigured ? 'Nuvem' : 'Local'}
                </span>
              </div>
            )}
            <span className="hidden sm:flex items-center gap-1.5 text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px]">
              <Headphones className="w-3.5 h-3.5 text-emerald-400" />
              <span>Voz Nativa</span>
            </span>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/40">
          {messages.map((msg) => {
            const isTutor = msg.sender === 'tutor';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isTutor ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-md ${
                    isTutor
                      ? 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-sm'
                      : 'bg-emerald-600 text-white rounded-tr-sm'
                  }`}
                >
                  {/* User audio indicator pill */}
                  {!isTutor && msg.isAudio && (
                    <div className="mb-2.5 flex items-center justify-between text-[11px] font-medium text-emerald-100 bg-emerald-700/70 px-2.5 py-1 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Áudio gravado por voz</span>
                      </div>
                      <button
                        onClick={() => handlePlayVoice(`user-${msg.id}`, msg.text)}
                        className="p-1 hover:bg-emerald-600 rounded transition-colors"
                        title="Ouvir pronúncia"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-100" />
                      </button>
                    </div>
                  )}

                  {/* Audio player card for tutor voice notes */}
                  {isTutor && (
                    <div className="mb-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handlePlayVoice(msg.id, msg.text)}
                          className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-md transition-all shrink-0"
                        >
                          {playingAudioId === msg.id ? (
                            <VolumeX className="w-4 h-4 text-slate-950" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-slate-950" />
                          )}
                        </button>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                            Nota de Voz da Aria
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {playingAudioId === msg.id ? 'Reproduzindo voz...' : 'Ouvir pronúncia nativa'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <span className={`w-1 h-3 rounded-full ${playingAudioId === msg.id ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`}></span>
                        <span className={`w-1 h-5 rounded-full ${playingAudioId === msg.id ? 'bg-emerald-400 animate-pulse delay-75' : 'bg-slate-700'}`}></span>
                        <span className={`w-1 h-2 rounded-full ${playingAudioId === msg.id ? 'bg-emerald-400 animate-pulse delay-150' : 'bg-slate-700'}`}></span>
                        <span className={`w-1 h-4 rounded-full ${playingAudioId === msg.id ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`}></span>
                      </div>
                    </div>
                  )}

                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>

                  {/* Sandwich Feedback: Reformulação Sutil / Better phrasing */}
                  {msg.correctionSnippet && (
                    <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-100 shadow-inner">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1.5">
                        <Lightbulb className="w-4 h-4 text-emerald-400" />
                        <span>Better phrasing • Como um nativo diria:</span>
                      </div>
                      <p className="leading-relaxed font-medium">{msg.correctionSnippet}</p>
                    </div>
                  )}

                  {/* Sandwich Feedback: Explicação em Português */}
                  {msg.portugueseExplanation && (
                    <div className="mt-2.5 p-3 bg-sky-950/60 border border-sky-500/40 rounded-xl text-xs text-sky-100 shadow-inner">
                      <div className="flex items-center gap-1.5 font-bold text-sky-300 mb-1.5">
                        <HelpCircle className="w-4 h-4 text-sky-400" />
                        <span>Explicação pedagógica em Português:</span>
                      </div>
                      <p className="leading-relaxed">{msg.portugueseExplanation}</p>
                    </div>
                  )}

                  <div className="mt-2 text-[10px] text-slate-400 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}


          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs p-3 bg-slate-900/60 rounded-xl border border-slate-800 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Aria está formulando a resposta e analisando a fala...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="bg-slate-950/90 px-4 py-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
            Sugestões Rápidas:
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
            placeholder={isRecording ? 'Ouvindo sua voz... fale agora em inglês!' : 'Digite sua mensagem ou clique no microfone para falar...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 disabled:opacity-50"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
