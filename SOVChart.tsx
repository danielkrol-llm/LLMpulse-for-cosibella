import React from 'react';
import { KeyLLM } from '../types';
import { Award, ListFilter, CheckCircle, TrendingUp } from 'lucide-react';
import { translations } from '../translations';

interface SOVChartProps {
  aiShareOfVoice: Record<string, number>;
  rankingDistribution: {
    firstRecommend: number;
    top3: number;
    top10: number;
    notMentioned: number;
  };
  weeklyTrends: Array<{
    week: string;
    glvs: number;
    competitorAvg: number;
  }>;
  selectedLLMFilter: KeyLLM | 'ALL';
  onSelectLLMFilter: (llm: KeyLLM | 'ALL') => void;
  lang?: 'pl' | 'en';
}

export default function SOVChart({
  aiShareOfVoice,
  rankingDistribution,
  weeklyTrends,
  selectedLLMFilter,
  onSelectLLMFilter,
  lang = 'pl',
}: SOVChartProps) {
  const t = translations[lang];

  const [isExpanded, setIsExpanded] = React.useState(false);

  // Sort Share of voice descending
  const sortedSOV = Object.entries(aiShareOfVoice)
    .map(([brand, score]) => ({ brand, score }))
    .sort((a, b) => b.score - a.score);

  const shownSOV = isExpanded ? sortedSOV : sortedSOV.slice(0, 5);

  const engines: Array<KeyLLM | 'ALL'> = [
    'ALL',
    'ChatGPT',
    'Google SGE',
    'Gemini',
    'Perplexity',
    'Claude',
  ];

  // SVG dimensions for trend chart
  const weekCount = weeklyTrends.length;
  const width = 460;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;

  // Compute points for W1-W12 glvs
  const maxVal = 100;
  const minVal = 0;

  const getPoints = (dataKey: 'glvs' | 'competitorAvg') => {
    return weeklyTrends
      .map((t, idx) => {
        const x = paddingX + (idx / (weekCount - 1)) * (width - 2 * paddingX);
        const y = height - paddingY - ((t[dataKey] - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
        return `${x},${y}`;
      })
      .join(' ');
  };

  const glvsPoints = getPoints('glvs');
  const compPoints = getPoints('competitorAvg');

  // Generate SVG area fill points for Cosibella score (glvs)
  const glvsFillPoints = `${paddingX},${height - paddingY} ${glvsPoints} ${width - paddingX},${height - paddingY}`;

  return (
    <div id="sov-and-trends-analytics-bento" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Share of Voice Chart (AI-SOV Leaderboard) */}
      <div className="bg-[#151921] rounded-2xl border border-slate-800 p-6 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                {t.dashboard.sovTitle}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.dashboard.sovDesc}
              </p>
            </div>

            {/* Quick LLM filter for calculations */}
            <div className="flex items-center gap-1.5 shrink-0">
              <ListFilter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedLLMFilter}
                onChange={(e) => onSelectLLMFilter(e.target.value as any)}
                className="text-[11px] border border-slate-800 rounded-lg py-1 px-2 bg-[#0F1115] text-slate-300 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {engines.map((name) => (
                  <option key={name} value={name}>
                    {name === 'ALL' ? t.dashboard.allLlms : name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bar gauges representing rankings */}
          <div className="space-y-3.5 pt-2">
            {shownSOV.map((item, index) => {
              const actualRank = sortedSOV.findIndex((x) => x.brand === item.brand) + 1;
              const isCosibella = item.brand.toLowerCase().includes('cosibella');
              return (
                <div key={index} className="space-y-1 group">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={`flex items-center gap-1 leading-none ${isCosibella ? 'text-cyan-400 font-extrabold animate-pulse' : 'text-slate-300 font-medium'}`}>
                      {actualRank}. {item.brand}
                      {isCosibella && (
                        <span className="text-[9px] uppercase font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-900/40 px-1 rounded-sm font-semibold shrink-0">
                          {lang === 'pl' ? 'Marka Główna (Polska)' : 'Primary Brand (Polish)'}
                        </span>
                      )}
                    </span>
                    <span className={isCosibella ? 'text-cyan-400 font-bold' : 'text-slate-400 font-medium'}>
                      {item.score}% SOV
                    </span>
                  </div>
                  {/* Gauge bar container */}
                  <div className="w-full bg-[#0F1115] border border-slate-800/80 rounded-full h-2 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCosibella
                          ? 'bg-cyan-500 group-hover:bg-cyan-400'
                          : 'bg-slate-700/60 group-hover:bg-slate-600'
                      }`}
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {sortedSOV.length > 5 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3.5 w-full py-2 bg-[#0F1115] hover:bg-[#12161f] border border-slate-800/85 hover:border-slate-750 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>
                {isExpanded
                  ? (lang === 'pl' ? 'Ukryj pełną listę' : 'Hide full competitor list')
                  : (lang === 'pl' ? `Pokaż pełną listę (+${sortedSOV.length - 5} marek)` : `Show full competitor list (+${sortedSOV.length - 5} brands)`)
                }
              </span>
              <span className="text-[9px] text-slate-500">
                {isExpanded ? '▲' : '▼'}
              </span>
            </button>
          )}
        </div>

        <div className="border-t border-slate-800/80 pt-3 mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            {lang === 'pl' ? 'Wyniki zoptymalizowane pod kątem lokalnych wskaźników urody' : 'Scores updated relative to local beauty indexes'}
          </span>
          <span className="font-mono text-slate-500 font-[500]">{lang === 'pl' ? 'n=185 skanów zapytań' : 'n=185 query scans'}</span>
        </div>
      </div>

      {/* 2. SVG-drawn Weekly Trend Curve */}
      <div className="bg-[#151921] rounded-2xl border border-slate-800 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                {t.dashboard.trendTitle}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.dashboard.trendDesc}
              </p>
            </div>
            
            {/* Legend indicators */}
            <div className="flex items-center gap-3 text-[10px] select-none font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-cyan-400 block"></span>
                <span className="text-slate-200">{t.dashboard.trendsLegendMe}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 border-t border-dashed border-slate-600 block"></span>
                <span className="text-slate-400">{t.dashboard.trendsLegendComp}</span>
              </span>
            </div>
          </div>

          {/* Inline SVG Chart */}
          <div className="relative w-full overflow-x-auto select-none pt-2 h-[180px]">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full min-w-[420px]"
              aria-label="Weekly brand visibility trend chart"
            >
              {/* Grid guide horizontal lines */}
              <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#334155" strokeWidth={1} />
              <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#1e293b" strokeWidth={1} strokeDasharray="3 3" />
              <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#1e293b" strokeWidth={1} />

              <text x={paddingX - 12} y={paddingY + 4} fontSize="9" fill="#64748b" fontFamily="monospace" textAnchor="end">100</text>
              <text x={paddingX - 12} y={height / 2 + 3} fontSize="9" fill="#64748b" fontFamily="monospace" textAnchor="end">50</text>
              <text x={paddingX - 12} y={height - paddingY + 3} fontSize="9" fill="#64748b" fontFamily="monospace" textAnchor="end">0</text>

              {/* Area fill for Cosibella */}
              <polygon points={glvsFillPoints} fill="url(#cyanGrad)" className="opacity-[0.25]" />

              {/* Competitor trend line */}
              <polyline points={compPoints} fill="none" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" />

              {/* Cosibella trend line */}
              <polyline points={glvsPoints} fill="none" stroke="#06b6d4" strokeWidth={3} strokeLinecap="round" />

              {/* Dot nodes for current and previous checkpoints */}
              {weeklyTrends.map((tPoint, idx) => {
                const x = paddingX + (idx / (weekCount - 1)) * (width - 2 * paddingX);
                const y = height - paddingY - ((tPoint.glvs - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
                const isLast = idx === weekCount - 1;

                return (
                  <g key={idx}>
                    {/* Tick label on X-axis */}
                    <text x={x} y={height - 2} fontSize="9" fill="#64748b" textAnchor="middle" fontFamily="monospace">
                      {tPoint.week}
                    </text>
                    {isLast && (
                      <circle cx={x} cy={y} r="5" fill="#06b6d4" stroke="#151921" strokeWidth="2" className="animate-pulse" />
                    )}
                  </g>
                );
              })}

              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#151921" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="text-[11px] text-slate-300 bg-cyan-950/20 rounded-xl p-3 border border-cyan-900/40 mt-4 flex items-center gap-1.5 leading-tight">
          <span className="font-bold text-cyan-400 shrink-0">{lang === 'pl' ? 'Prognoza Trendów AI:' : 'AI Trend Forecast:'}</span>
          <span>
            {lang === 'pl' 
              ? <span>Przewidujemy wzmocnienie autorytetu o <strong>+4.5%</strong> w następnym skanowaniu dzięki silnej optymalizacji znaczników na Cosibella.pl.</span>
              : <span>A <strong>+4.5% authority gain</strong> predicted next scan cycle due to strong SEO schema alignments on Cosibella.pl.</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
