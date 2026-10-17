import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Bot, 
  Headphones, 
  Brain, 
  Zap
} from 'lucide-react';
import { api, User, UserProfile } from '../services/api';

interface AuthScreenProps {
  onLoginSuccess: (user: User, profile?: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const calculatePasswordStrength = (pwd: string): { label: string; color: string; percent: number } => {
    if (!pwd) return { label: '', color: '', percent: 0 };
    if (pwd.length < 5) return { label: 'Fraca', color: 'bg-rose-500', percent: 25 };
    if (pwd.length < 8) return { label: 'Média', color: 'bg-amber-500', percent: 60 };
    return { label: 'Forte', color: 'bg-emerald-500', percent: 100 };
  };

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    if (!password) {
      setError('Por favor, digite sua senha.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Por favor, informe seu nome completo.');
        return;
      }
      if (password.length < 4) {
        setError('A senha deve ter no mínimo 4 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas digitadas não coincidem.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const data = mode === 'login'
        ? await api.login(trimmedEmail, password)
        : await api.register(name.trim() || trimmedEmail.split('@')[0], trimmedEmail, password);

      onLoginSuccess(data.user, data.profile);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar autenticação. Verifique os dados informados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background glowing ambiance */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl relative z-10">
        {/* Left Side: Brand & Value Proposition */}
        <div className="lg:col-span-6 p-8 sm:p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between">
          <div>
            {/* Header / Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-2xl">
                LN
              </div>
              <div>
                <span className="font-extrabold text-white text-xl tracking-tight block">
                  LingoNova AI
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Ambiente Protegido & Seguro
                </span>
              </div>
            </div>

            {/* Main Catchphrase */}
            <div className="space-y-3 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Engenharia Reversa Funcional do TalkBud
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Domine a conversação com sua tutora pessoal de IA.
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pratique inglês sem julgamentos. Feedback corretivo sutil em tempo real, explicações em português quando travar e memória entre sessões.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <span><strong>Voz e Áudio Nativo:</strong> Converse por voz ou texto e ouça a pronúncia natural.</span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <span><strong>Sandwich Feedback:</strong> Reformulação elegante sem interromper o fluxo da sua fala.</span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <span><strong>Memória Persistente:</strong> Aria lembra dos seus interesses, metas e dificuldades.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span>© 2026 LingoNova AI Tutor</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Lock className="w-3 h-3 text-emerald-400" /> Criptografia de Ponta
            </span>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center">
          {/* Mode Switch Tabs */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta no LingoNova'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login'
                ? 'Insira seus dados para continuar sua jornada de fluência.'
                : 'Leva menos de 1 minuto para começar a praticar com sua tutora.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-300 font-semibold">
                  Senha
                </label>
                {mode === 'register' && strength.label && (
                  <span className={`text-[10px] font-bold ${
                    strength.label === 'Forte' ? 'text-emerald-400' : strength.label === 'Média' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    Força: {strength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter bar (Register mode only) */}
              {mode === 'register' && password && (
                <div className="mt-1.5 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.percent}%` }}
                  ></div>
                </div>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Entrar no LingoNova' : 'Criar minha Conta'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-slate-500 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Acesso protegido • Apenas usuários autenticados</span>
          </div>
        </div>
      </div>
    </div>
  );
};
