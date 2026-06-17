import React, { useState, useEffect } from 'react';
import {
  Layers,
  MonitorPlay,
  ShieldAlert,
  Database,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
  Zap,
} from 'lucide-react';

const STORAGE_KEY = 'llmpulse_onboarded_v1';

interface Step {
  icon: React.ReactNode;
  badge: string;
  title: string;
  description: string;
  hint: string;
  accentColor: string;
}

function buildSteps(lang: 'pl' | 'en'): Step[] {
  if (lang === 'pl') {
    return [
      {
        icon: <Zap className="w-7 h-7" />,
        badge: 'Witaj',
        title: 'LLMpulse — Silnik Widoczności AI Cosibella',
        description:
          'Monitoruj i optymalizuj to, jak ChatGPT, Gemini, Perplexity i Claude rekomendują produkty Cosibella.pl konsumentom w Polsce i całym regionie CEE.',
        hint: 'Ten przewodnik zajmie Ci mniej niż 2 minuty.',
        accentColor: 'from-cyan-500 to-blue-600',
      },
      {
        icon: <Layers className="w-7 h-7" />,
        badge: 'Krok 1 / 4',
        title: 'Globalny Panel Analiz',
        description:
          'Twój punkt startowy. Sprawdzasz tu GLVS (wynik widoczności AI), udział w głosie AI (SOV) vs. Notino czy Douglas, geograficzną mapę dominacji oraz tabelę surowych skanów z każdego rynku CEE.',
        hint: 'Kliknij "Globalny panel analiz" w lewym menu.',
        accentColor: 'from-cyan-500 to-cyan-600',
      },
      {
        icon: <MonitorPlay className="w-7 h-7" />,
        badge: 'Krok 2 / 4',
        title: 'Emulator SERP AI',
        description:
          'Zadaj dowolne zapytanie i sprawdź jak ChatGPT, Claude, Gemini lub Perplexity odpowiadają "na żywo". Możesz testować zapytania w języku polskim, ukraińskim, słowackim i innych językach CEE.',
        hint: 'Kliknij "Emulator SERP AI" w lewym menu lub użyj przycisku "Uruchom Emulator AI" na stronie głównej.',
        accentColor: 'from-indigo-500 to-indigo-600',
      },
      {
        icon: <ShieldAlert className="w-7 h-7" />,
        badge: 'Krok 3 / 4',
        title: 'Sentinel Suite — Audyt Produktów',
        description:
          'Sprawdź, które URL-e Cosibella.pl są blokowane przez robots.txt dla botów AI (GPTBot, Google-Extended, ClaudeBot). Każdy produkt dostaje dynamiczny Plan GEO Zmian wyprowadzony z aktualnego stanu audytu.',
        hint: 'Kliknij "Sentinel Suite" w lewym menu.',
        accentColor: 'from-violet-500 to-violet-600',
      },
      {
        icon: <Database className="w-7 h-7" />,
        badge: 'Krok 4 / 4',
        title: 'GSC & GA4 Sync — Dane Google',
        description:
          'Import słów kluczowych z Google Search Console i śledzenie ruchu z modeli AI (ChatGPT, Perplexity, Claude) bezpośrednio z Google Analytics 4. Porównaj widoczność organiczną z cytowaniami AI.',
        hint: 'Kliknij "GSC & GA4 Sync" w lewym menu. Ikona LIVE oznacza aktywne połączenie z Google.',
        accentColor: 'from-purple-500 to-purple-600',
      },
    ];
  }

  return [
    {
      icon: <Zap className="w-7 h-7" />,
      badge: 'Welcome',
      title: 'LLMpulse — Cosibella AI Visibility Engine',
      description:
        'Monitor and optimize how ChatGPT, Gemini, Perplexity and Claude recommend Cosibella.pl products to consumers in Poland and across the CEE region.',
      hint: 'This guide takes less than 2 minutes.',
      accentColor: 'from-cyan-500 to-blue-600',
    },
    {
      icon: <Layers className="w-7 h-7" />,
      badge: 'Step 1 / 4',
      title: 'Global Analytics Dashboard',
      description:
        'Your starting point. Check GLVS (AI visibility score), AI Share of Voice vs. Notino or Douglas, geographic dominance map, and raw scan table from every CEE market.',
      hint: 'Click "Globalny panel analiz" in the left menu.',
      accentColor: 'from-cyan-500 to-cyan-600',
    },
    {
      icon: <MonitorPlay className="w-7 h-7" />,
      badge: 'Step 2 / 4',
      title: 'AI SERP Emulator',
      description:
        'Run any query and see how ChatGPT, Claude, Gemini or Perplexity respond in real time. Supports Polish, Ukrainian, Slovak and other CEE languages.',
      hint: 'Click "Emulator SERP AI" in the left menu or use the "Run AI Emulator" button on the main page.',
      accentColor: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: <ShieldAlert className="w-7 h-7" />,
      badge: 'Step 3 / 4',
      title: 'Sentinel Suite — Product Audit',
      description:
        'See which Cosibella.pl URLs are blocked in robots.txt for AI crawlers (GPTBot, Google-Extended, ClaudeBot). Each product gets a dynamic GEO Action Plan derived from its live audit state.',
      hint: 'Click "Sentinel Suite" in the left menu.',
      accentColor: 'from-violet-500 to-violet-600',
    },
    {
      icon: <Database className="w-7 h-7" />,
      badge: 'Step 4 / 4',
      title: 'GSC & GA4 Sync — Google Data',
      description:
        'Import keywords from Google Search Console and track AI-sourced traffic (ChatGPT, Perplexity, Claude) directly from Google Analytics 4. Compare organic visibility with AI citations.',
      hint: 'Click "GSC & GA4 Sync" in the left menu. The LIVE badge means an active Google connection.',
      accentColor: 'from-purple-500 to-purple-600',
    },
  ];
}

interface OnboardingTourProps {
  lang: 'pl' | 'en';
  /** If true, shows the tour even if user has already seen it (for "replay" from settings) */
  forceShow?: boolean;
  onClose?: () => void;
}

export default function OnboardingTour({ lang, forceShow, onClose }: OnboardingTourProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const steps = buildSteps(lang);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  useEffect(() => {
    if (forceShow) {
      setStep(0);
      setVisible(true);
      return;
    }
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Small delay so the dashboard loads first — better UX
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  const dismiss = (markSeen = true) => {
    if (markSeen) localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(7,9,14,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div className="relative w-full max-w-lg bg-[#0F1115] border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in duration-300">

        {/* Top accent gradient bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${current.accentColor}`} />

        {/* Close button */}
        <button
          onClick={() => dismiss()}
          className="absolute top-4 right-4 w-7 h-7 rounded-full border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          aria-label="Zamknij"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Body */}
        <div className="p-7 pt-6 space-y-5">

          {/* Icon + badge */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${current.accentColor} flex items-center justify-center text-white shadow-lg`}>
              {current.icon}
            </div>
            <div>
              <span className={`text-[10px] font-mono font-extrabold uppercase tracking-widest bg-gradient-to-r ${current.accentColor} bg-clip-text text-transparent`}>
                {current.badge}
              </span>
              <h2 className="text-base font-bold text-white leading-snug mt-0.5">
                {current.title}
              </h2>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed">
            {current.description}
          </p>

          {/* Hint chip */}
          <div className="flex items-start gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span className="text-[11px] text-slate-400 leading-relaxed">{current.hint}</span>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all duration-200 cursor-pointer ${
                  i === step
                    ? 'w-5 h-1.5 bg-cyan-400'
                    : 'w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => dismiss(false)}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition cursor-pointer"
            >
              {lang === 'pl' ? 'Pomiń przewodnik' : 'Skip guide'}
            </button>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {lang === 'pl' ? 'Wstecz' : 'Back'}
                </button>
              )}

              {isLast ? (
                <button
                  onClick={() => dismiss()}
                  className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold text-white bg-gradient-to-r ${current.accentColor} rounded-xl shadow-md transition hover:opacity-95 cursor-pointer`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {lang === 'pl' ? 'Zaczynamy!' : "Let's go!"}
                </button>
              ) : (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold text-white bg-gradient-to-r ${current.accentColor} rounded-xl shadow-md transition hover:opacity-95 cursor-pointer`}
                >
                  {lang === 'pl' ? 'Dalej' : 'Next'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small trigger button for settings/sidebar — replays the tour */
export function OnboardingReplayButton({ lang, onClick }: { lang: 'pl' | 'en'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-cyan-400 hover:bg-[#151921]/60 px-3 py-2 rounded-xl transition cursor-pointer border border-transparent hover:border-slate-800"
    >
      <Sparkles className="w-3.5 h-3.5" />
      {lang === 'pl' ? 'Pokaż przewodnik ponownie' : 'Replay quick-start guide'}
    </button>
  );
}
