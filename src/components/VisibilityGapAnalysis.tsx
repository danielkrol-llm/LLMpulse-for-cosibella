import React, { useState, useEffect } from 'react';
import { GapAnalysisRow } from '../types';
import { BookOpen, Flame, Target, Globe, Sparkles } from 'lucide-react';
import { translations } from '../translations';

interface VisibilityGapAnalysisProps {
  onAddLogMessage?: (msg: string) => void;
  lang?: 'pl' | 'en';
}

export default function VisibilityGapAnalysis({
  onAddLogMessage,
  lang = 'pl',
}: VisibilityGapAnalysisProps) {
  const t = translations[lang];
  const [gaps, setGaps] = useState<GapAnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gap-analysis')
      .then((res) => res.json())
      .then((data) => {
        setGaps(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getPriorityColor = (impact: number) => {
    if (impact >= 8) {
      return {
        badge: 'bg-rose-950/40 text-rose-300 border-rose-900/65',
        text: t.gaps.priorityHigh,
        icon: <Flame className="w-3 h-3 text-rose-400" />
      };
    }
    return {
      badge: 'bg-amber-950/40 text-amber-300 border-amber-900/65',
      text: t.gaps.priorityMed,
      icon: <Target className="w-3 h-3 text-amber-400" />
    };
  };

  const getFlagEmoji = (code: string) => {
    switch (code) {
      case 'PL': return '🇵🇱';
      case 'DE': return '🇩🇪';
      case 'CZ': return '🇨🇿';
      case 'UA': return '🇺🇦';
      case 'SK': return '🇸🇰';
      case 'HU': return '🇭🇺';
      case 'RO': return '🇷🇴';
      default: return '🌐';
    }
  };

  // Local translators for dynamic DB seeds so we localized them cleanly
  const getLocalizedActionPlan = (id: number, text: string) => {
    if (lang === 'pl') {
      if (id === 0) return 'Opublikuj przewodnik porównawczy zatytułowany „Najlepsze kosmetyki azjatyckie w Czechach z darmową konsultacją z kosmetologiem online” i umieść na nim odnośniki referencyjne Cosibella Czechy.';
      if (id === 1) return 'Dodaj atrybuty Schema we wszystkich strukturach produktów, pozycjonując Cosibella jako oficjalnego dystrybutora i certyfikowany sklep z punktami odbioru i szybką ubezpieczoną wysyłką.';
      if (id === 2) return 'Nawiąż współpracę z lokalnymi influencerami i ekspertami urody w Niemczech za pomocą merytorycznych recenzji na forach oraz artykułów sponsorowanych, aby wzmocnić poziom współtowarzyszenia marki.';
    }
    return text;
  };

  const getLocalizedFactor = (text: string) => {
    if (lang === 'pl') {
      if (text.includes('Structured schema product data')) return 'Ustrukturyzowane schematy produktów JSON-LD';
      if (text.includes('Low shipping rates')) return 'Szybka i niedroga dostawa kurierska';
      if (text.includes('Local cosmetological advice')) return 'Rekomendowane porady kosmetologiczne na stronie';
      if (text.includes('Strong regional social citations')) return 'Silne, merytoryczne wzmianki na regionalnych forach';
      if (text.includes('Topical entity relevance')) return 'Wysoka zbieżność encji i synonimów produktów';
      if (text.includes('Detailed pricing parameters')) return 'Precyzyjnie podane parametry cenowe i rabaty';
    }
    return text;
  };

  return (
    <div id="ai-gap-analysis-dashboard" className="bg-[#151921] rounded-2xl border border-slate-800 p-6 shadow-xl w-full min-w-0 overflow-hidden">
      <div className="mb-6 border-b border-slate-800 pb-4">
        <h3 className="text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-rose-400 animate-pulse" />
          {t.gaps.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {t.gaps.desc}
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-[#0F1115] border border-slate-800 rounded-xl"></div>
          <div className="h-24 bg-[#0F1115] border border-slate-800 rounded-xl"></div>
          <div className="h-24 bg-[#0F1115] border border-slate-800 rounded-xl"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {gaps.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 bg-[#0F1115]/50 rounded-xl">
              <span className="text-xs text-slate-400 font-mono">{t.gaps.resolvedText}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {gaps.map((gap, index) => {
                const priority = getPriorityColor(gap.impactScore);
                const categoryLabel = lang === 'pl' ? (
                  gap.category === 'conversational' ? 'konwersacyjna' : gap.category === 'transactional' ? 'transakcyjna' : gap.category === 'comparison' ? 'porównawcza' : gap.category
                ) : gap.category;
                return (
                  <div
                    key={index}
                    className="border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 bg-[#0F1115]/75 hover:bg-[#12151C] transition duration-200 flex flex-col md:flex-row md:items-start justify-between gap-6 relative overflow-hidden group"
                  >
                    {/* Left portion: query details */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-100 font-mono select-all tracking-tight group-hover:text-cyan-400 transition-colors duration-150">
                          &ldquo;{gap.query}&rdquo;
                        </span>
                        <span className="flex items-center gap-1.5 bg-[#1A1F2B] border border-slate-800 text-slate-300 font-semibold text-[10px] px-2.5 py-0.5 rounded-full select-none">
                          <Globe className="w-2.5 h-2.5 text-slate-400" />
                          {getFlagEmoji(gap.country)} {gap.country}
                        </span>
                        <span className="bg-[#1E1B4B]/80 text-[#818CF8] border border-[#312E81] font-bold text-[10px] px-2.5 py-0.5 rounded-full select-none uppercase font-mono tracking-wider">
                          {categoryLabel}
                        </span>
                      </div>

                      {/* Dominated by */}
                      <div className="text-xs flex flex-wrap items-center gap-2 text-slate-400 font-sans">
                        <span className="font-medium text-slate-450">{t.gaps.visibleCompetitors}:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {gap.competitorsVisible.map((comp, cIdx) => (
                            <span
                              key={cIdx}
                              className="bg-rose-950/30 text-rose-450 border border-rose-900/40 font-bold px-2.5 py-0.5 rounded text-[10px] tracking-wide"
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Plan highlight */}
                      <div className="bg-[#1C1F2E]/80 border-l-2 border-[#818CF8] p-4 rounded-r-xl border border-y-indigo-950/20 border-r-indigo-950/20 shadow-inner space-y-1.5 mt-2">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block select-none">
                          {t.gaps.actionPlan}
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">
                          {getLocalizedActionPlan(index % 3, gap.actionPlan)}
                        </p>
                      </div>
                    </div>

                    {/* Right portion: priorities, factors, CTA */}
                    <div className="md:w-64 space-y-4 shrink-0 border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-5 select-none">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2.5">
                          <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
                            {lang === 'pl' ? 'wpływ rynkowy' : 'impact metric'}
                          </span>
                          <div className={`flex items-center gap-1 px-2.5 py-0.5 border rounded-full text-[10px] font-bold ${priority.badge}`}>
                            {priority.icon}
                            {priority.text} ({gap.impactScore}/10)
                          </div>
                        </div>

                        {gap.impactScore >= 8 && (
                          <div className="flex items-center justify-end">
                            <span className="inline-flex items-center gap-1 bg-emerald-950/45 text-emerald-400 border border-emerald-500/35 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.12)] select-none uppercase tracking-wider">
                              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                              {lang === 'pl' ? 'Szybka Wygrana' : 'Quick Win'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 border-t border-slate-800/60 pt-3">
                        <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block tracking-wider">
                          {t.gaps.recommendingFactors}
                        </span>
                        <ul className="space-y-1.5">
                          {gap.recommendingFactors.map((factor, fIdx) => (
                            <li key={fIdx} className="text-[11px] text-slate-300 flex items-start gap-2">
                              <span className="text-emerald-400 font-bold leading-none">✓</span>
                              <span className="leading-tight font-sans text-slate-350">{getLocalizedFactor(factor)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
