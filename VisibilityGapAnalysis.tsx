import React, { useState, useEffect } from 'react';
import { GapAnalysisRow } from '../types';
import { BookOpen, Flame, Target, Globe } from 'lucide-react';
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
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        text: t.gaps.priorityHigh,
        icon: <Flame className="w-3 h-3 text-rose-500" />
      };
    }
    return {
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      text: t.gaps.priorityMed,
      icon: <Target className="w-3 h-3 text-amber-500" />
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
    <div id="ai-gap-analysis-dashboard" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-rose-500" />
          {t.gaps.title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {t.gaps.desc}
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-slate-100 rounded-lg"></div>
          <div className="h-20 bg-slate-100 rounded-lg"></div>
          <div className="h-20 bg-slate-100 rounded-lg"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {gaps.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-100 rounded-xl">
              <span className="text-xs text-slate-400">{t.gaps.resolvedText}</span>
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
                    className="border border-slate-101 hover:border-slate-200 rounded-xl p-5 hover:bg-slate-55/10 transition duration-150 flex flex-col md:flex-row md:items-start justify-between gap-6"
                  >
                    {/* Left portion: query details */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800 font-mono select-all">
                          &ldquo;{gap.query}&rdquo;
                        </span>
                        <span className="flex items-center gap-1 bg-slate-50 border border-slate-150 text-slate-650 font-medium text-[10px] px-2 py-0.5 rounded-full select-none">
                          <Globe className="w-2.5 h-2.5" />
                          {getFlagEmoji(gap.country)} {gap.country}
                        </span>
                        <span className="bg-indigo-50 text-indigo-750 font-medium text-[10px] px-2 py-0.5 rounded-full mt-0.5 select-none uppercase font-mono">
                          {categoryLabel}
                        </span>
                      </div>

                      {/* Dominated by */}
                      <div className="text-xs flex flex-wrap items-center gap-1.5 text-slate-650">
                        <span>{t.gaps.visibleCompetitors}:</span>
                        {gap.competitorsVisible.map((comp, cIdx) => (
                          <span
                            key={cIdx}
                            className="bg-rose-50/70 text-rose-800 border border-rose-100 font-semibold px-2 py-0.5 rounded-sm text-[10px]"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>

                      {/* Action Plan highlight */}
                      <div className="bg-indigo-50/40 border-l-2 border-indigo-500 p-3 rounded-r-lg space-y-1">
                        <span className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider block">
                          {t.gaps.actionPlan}
                        </span>
                        <p className="text-xs text-slate-755 leading-relaxed font-sans">
                          {getLocalizedActionPlan(index % 3, gap.actionPlan)}
                        </p>
                      </div>
                    </div>

                    {/* Right portion: priorities, factors, CTA */}
                    <div className="md:w-64 space-y-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5 select-none">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono font-semibold text-slate-400">{lang === 'pl' ? 'Wpływ rynkowy' : 'Impact Metric'}</span>
                        <div className={`flex items-center gap-1 px-2 py-0.5 border rounded-full text-[10px] font-semibold ${priority.badge}`}>
                          {priority.icon}
                          {priority.text} ({gap.impactScore}/10)
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                          {t.gaps.recommendingFactors}
                        </span>
                        <ul className="space-y-1">
                          {gap.recommendingFactors.map((factor, fIdx) => (
                            <li key={fIdx} className="text-[11px] text-slate-500 flex items-start gap-1">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span className="leading-tight">{getLocalizedFactor(factor)}</span>
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
