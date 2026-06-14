import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Sparkles, AlertCircle, Loader, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [innerError, setInnerError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setInnerError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      // Error is also saved in AuthContext, but we can set local state if we want to bypass default message or show standard error
      if (err?.message && !err.message.includes('auth/popup-closed-by-user')) {
        setInnerError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const activeError = innerError || authError;

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans select-none px-4 text-slate-100">
      {/* Decorative subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
      
      {/* Animated abstract light glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
        
        {/* Brand identity */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex items-center justify-center text-cyan-400 group hover:border-cyan-500 transition-all duration-300">
            <Shield className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Cosibella <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">LLM Generation Hub</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xs font-mono">
            Centrum Analityki & Pozycjonowania LLM dla zespołu Cosibella Sp. z o.o.
          </p>
        </div>

        {/* glassmorphic card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 relative">
          <div className="absolute top-0 right-0 p-4 shrink-0 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-white">Wymagana autoryzacja</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Dostęp do panelu SEO/SEM, audytów Serper AI oraz predykcji widoczności w modelach językowych (LLM visibility score) jest zastrzeżony wyłącznie dla autoryzowanych pracowników.
            </p>
          </div>

          {/* Error and restrictions warning box */}
          {activeError && (
            <div className="bg-red-950/45 border-l-4 border-red-500 rounded-xl p-4 flex gap-3 text-red-300 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <div className="flex flex-col gap-1 text-xs font-mono">
                <span className="font-semibold text-white">Odmowa dostępu!</span>
                <p className="leading-snug text-red-200/95">{activeError}</p>
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold py-3.5 px-5 rounded-2xl shadow-lg ring-1 ring-cyan-300/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm group"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin text-slate-950" />
                <span>Uwierzytelnianie...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1 text-slate-950 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.61 4.5 1.725l2.435-2.435C17.393 1.616 14.935 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.795 0 10.254-4.074 10.254-10.24 0-.695-.08-1.355-.22-1.955H12.24z"/>
                </svg>
                <span>Zaloguj się przez konto Google</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="mt-2 text-center text-[10px] text-slate-500 font-mono flex flex-col gap-1 items-center">
            <span>Kompatybilne z Google Workspace</span>
            <span className="text-[9px] text-sky-500/60 break-all select-all">Dozwolone domeny: @cosibella.pl</span>
          </div>
        </div>

        {/* Footer info box */}
        <p className="text-center text-[11px] text-slate-600 leading-snug font-mono px-4">
          W razie problemów technicznych poproś administratora o dodanie Twojego aliasu do grupy użytkowników.
        </p>
      </div>
    </div>
  );
};
