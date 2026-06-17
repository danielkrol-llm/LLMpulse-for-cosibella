import React, { useState } from 'react';
import { Clock, Sparkles, Loader2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import ContentBriefModal from './ContentBriefModal';

interface TrendCalendarProps {
  lang: 'pl' | 'en';
  onAddLogMessage: (msg: string) => void;
}

// ─── Heatmap data ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'SPF / Ochrona UV',      data: [1,1,2,3,5,5,5,4,3,2,1,1] },
  { label: 'Retinol',               data: [4,4,3,2,1,1,1,2,3,5,5,4] },
  { label: 'Kwas AHA/BHA',          data: [3,3,3,2,2,1,1,2,3,4,4,3] },
  { label: 'Ceramidy',              data: [5,5,4,2,1,1,1,1,2,4,5,5] },
  { label: 'Sheet Masks',           data: [3,3,3,4,4,3,3,3,3,3,3,3] },
  { label: 'Serum z niacynamidem',  data: [3,3,3,4,4,4,4,4,4,4,3,3] },
  { label: 'Peelingi',              data: [4,4,3,2,2,1,1,2,2,4,4,4] },
  { label: 'Nawilżenie',            data: [5,5,4,3,2,2,2,2,3,4,5,5] },
  { label: 'Zestawy prezentowe',    data: [1,1,1,1,1,1,1,1,2,4,5,5] },
];

const MONTHS = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];

function cellBg(v: number): string {
  if (v === 1) return '#1e2a38';
  if (v === 2) return '#164e63';
  if (v === 3) return '#0e7490';
  if (v === 4) return '#06b6d4';
  return '#22d3ee';
}

// ─── Trend windows ─────────────────────────────────────────────────────────────
const now = new Date();

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

const WINDOWS = [
  { name: 'Sezon SPF',               start: new Date(now.getFullYear(), 3, 15), end: new Date(now.getFullYear(), 7, 31), color: 'text-amber-400', bar: 'bg-amber-500' },
  { name: 'Back to school skincare', start: new Date(now.getFullYear(), 7, 1),  end: new Date(now.getFullYear(), 8, 15), color: 'text-indigo-400', bar: 'bg-indigo-500' },
  { name: 'Pielęgnacja jesienna',    start: new Date(now.getFullYear(), 8, 1),  end: new Date(now.getFullYear(), 10, 30), color: 'text-orange-400', bar: 'bg-orange-500' },
];

interface CalendarWeek {
  week: number;
  dates: string;
  mainTopic: string;
  contentType: string;
  targetKeyword: string;
  whyNow: string;
  platform: string[];
}

const CONTENT_TYPE_BADGE: Record<string, string> = {
  'Artykuł':  'bg-cyan-950/40 text-cyan-400 border-cyan-800/40',
  'Social':   'bg-pink-950/40 text-pink-400 border-pink-800/40',
  'Email':    'bg-indigo-950/40 text-indigo-400 border-indigo-800/40',
  'Reklamy':  'bg-amber-950/40 text-amber-400 border-amber-800/40',
  'Article':  'bg-cyan-950/40 text-cyan-400 border-cyan-800/40',
  'Ads':      'bg-amber-950/40 text-amber-400 border-amber-800/40',
};

const PLATFORM_ICON: Record<string, string> = {
  'TikTok': '♪', 'Instagram': '📷', 'Blog': '✍️', 'Email': '📧', 'Facebook': 'f', 'Meta Ads': 'M',
};

// Mock GEO brief data for ContentBriefModal
const MOCK_BRIEF_RATING = { declarativeAnswers: 18, factualDensity: 20, citationTriggers: 17, keywordRetrievalStructure: 19 };

export default function TrendCalendar({ lang, onAddLogMessage }: TrendCalendarProps) {
  const [isGenerating, setIsGenerating]     = useState(false);
  const [calendarPlan, setCalendarPlan]     = useState<CalendarWeek[]>([]);
  const [calError, setCalError]             = useState('');
  const [briefModal, setBriefModal]         = useState<CalendarWeek | null>(null);
  const [hoveredCell, setHoveredCell]       = useState<{ row: number; col: number } | null>(null);

  const currentMonth = now.getMonth(); // 0-based
  const lbl = (pl: string, en: string) => lang === 'pl' ? pl : en;

  const handleGenerate = async () => {
    const apiKey = (JSON.parse(localStorage.getItem('llm-auditor-keys') ?? '{}') as { anthropic?: string }).anthropic ?? '';
    if (!apiKey) {
      setCalError(lbl('Brak klucza Anthropic API. Wejdź w Ustawienia → API Keys.', 'No Anthropic API key. Go to Settings → API Keys.'));
      return;
    }
    setIsGenerating(true);
    setCalError('');
    setCalendarPlan([]);
    onAddLogMessage(lbl('TrendCalendar: generuję plan 90 dni…', 'TrendCalendar: generating 90-day plan…'));

    const today = now.toISOString().slice(0, 10);
    const systemPrompt = `You are a content calendar strategist for Cosibella.pl K-Beauty store in Poland/CEE. Today is ${today}.`;
    const userMsg = `Generate a 12-week content calendar starting today. For each week return: { "week": number, "dates": string, "mainTopic": string, "contentType": string, "targetKeyword": string, "whyNow": string, "platform": string[] }. contentType must be one of: Artykuł|Social|Email|Reklamy. platform must be from: TikTok|Instagram|Blog|Email|Facebook. Return JSON array of 12 objects only, no explanation.`;

    try {
      let plan: CalendarWeek[] = [];

      try {
        const r = await fetch('/api/content-calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentMonth: now.getMonth(), lang }),
          signal: AbortSignal.timeout(6000),
        });
        if (r.ok) {
          const d = await r.json();
          plan = d.plan ?? [];
        }
      } catch { /* fallback */ }

      if (!plan.length) {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 3000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMsg }],
          }),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json() as { content?: { text: string }[] };
        const raw = d.content?.[0]?.text ?? '[]';
        const match = raw.match(/\[[\s\S]*\]/);
        plan = match ? JSON.parse(match[0]) : [];
      }

      setCalendarPlan(plan);
      onAddLogMessage(lbl(`TrendCalendar: wygenerowano ${plan.length} tygodni`, `TrendCalendar: generated ${plan.length} weeks`));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCalError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* ─── SECTION 1: Heatmap ─── */}
      <section className="bg-[#0d1017] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">
            {lbl('Sezonowość zapytań AI', 'AI Query Seasonality')}
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {lbl(
            'Intensywność wyszukiwań AI dla kategorii produktowych — zaplanuj treści z wyprzedzeniem.',
            'AI search intensity by product category — plan content in advance.',
          )}
        </p>

        <div className="overflow-x-auto">
          <table className="text-[10px] font-mono border-collapse">
            <thead>
              <tr>
                <th className="text-left pr-6 py-1 text-slate-500 font-bold" style={{ minWidth: 160 }}>{lbl('Kategoria', 'Category')}</th>
                {MONTHS.map((m, mi) => (
                  <th key={m} style={{ width: 36 }}
                    className={`text-center px-0.5 py-1 font-bold ${mi === currentMonth ? 'text-cyan-400' : 'text-slate-600'}`}>
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat, ri) => (
                <tr key={cat.label}>
                  <td className="text-slate-300 pr-6 py-0.5 text-[9px] font-bold whitespace-nowrap">{cat.label}</td>
                  {cat.data.map((v, mi) => {
                    const isHovered = hoveredCell?.row === ri && hoveredCell?.col === mi;
                    return (
                      <td key={mi} className="px-0.5 py-0.5 relative">
                        <div
                          style={{ backgroundColor: cellBg(v), width: 30, height: 20, borderRadius: 4 }}
                          className={`cursor-default transition-all ${mi === currentMonth ? 'ring-1 ring-cyan-400' : ''} ${isHovered ? 'opacity-80 scale-105' : ''}`}
                          onMouseEnter={() => setHoveredCell({ row: ri, col: mi })}
                          onMouseLeave={() => setHoveredCell(null)}
                          title={v >= 4
                            ? lbl('Wysoki sezon — zaplanuj treść 6 tyg. wcześniej', 'Peak season — plan content 6 weeks ahead')
                            : lbl('Niski sezon', 'Low season')}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500 flex-wrap">
          <span>{lbl('Intensywność:', 'Intensity:')}</span>
          {[1,2,3,4,5].map(v => (
            <span key={v} className="flex items-center gap-1">
              <span style={{ backgroundColor: cellBg(v), width: 18, height: 12, display: 'inline-block', borderRadius: 2 }} />
              {v === 1 ? lbl('niska', 'low') : v === 5 ? lbl('szczyt', 'peak') : v}
            </span>
          ))}
          <span className="flex items-center gap-1 ml-3">
            <span className="w-4 h-3 inline-block rounded ring-1 ring-cyan-400" style={{ backgroundColor: '#0e7490' }} />
            {lbl('bieżący miesiąc', 'current month')}
          </span>
        </div>
      </section>

      {/* ─── SECTION 2: 90-day plan ─── */}
      <section className="bg-[#0d1017] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              {lbl('Sugestie kalendarza na 90 dni', '90-day content calendar suggestions')}
            </h3>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {isGenerating
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{lbl('Generuję…', 'Generating…')}</>
              : <><Sparkles className="w-3.5 h-3.5" />{lbl('Generuj plan na 90 dni ↗', 'Generate 90-day plan ↗')}</>}
          </button>
        </div>

        {calError && (
          <div className="flex items-start gap-2 p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl text-[11px] text-rose-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {calError}
          </div>
        )}

        {!calendarPlan.length && !isGenerating && !calError && (
          <div className="text-center py-10 text-xs text-slate-500">
            {lbl('Kliknij "Generuj plan na 90 dni ↗" aby wygenerować kalendarz z Claude.', 'Click "Generate 90-day plan ↗" to generate a calendar with Claude.')}
          </div>
        )}

        {calendarPlan.length > 0 && (
          <div className="space-y-3">
            {calendarPlan.map((week) => {
              const badgeCls = CONTENT_TYPE_BADGE[week.contentType] ?? 'bg-slate-800 text-slate-400 border-slate-700';
              return (
                <div key={week.week} className="flex flex-col sm:flex-row gap-3 bg-[#0a0c11] border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-950/40 border border-indigo-900/40 shrink-0">
                    <span className="text-xs font-black text-indigo-400 font-mono">W{week.week}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-start gap-2">
                      <span className="text-xs font-bold text-white">{week.mainTopic}</span>
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${badgeCls}`}>
                        {week.contentType}
                      </span>
                      <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-cyan-400 px-2 py-0.5 rounded">
                        {week.targetKeyword}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">{week.dates} — {week.whyNow}</p>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex gap-1.5">
                        {(week.platform ?? []).map(p => (
                          <span key={p} className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            {PLATFORM_ICON[p] ?? ''} {p}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => setBriefModal(week)}
                        className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {lbl('Utwórz brief ↗', 'Create brief ↗')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── SECTION 3: Active trend windows ─── */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-400" />
          {lbl('Aktywne okna trendów (CEE)', 'Active trend windows (CEE)')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {WINDOWS.map((w) => {
            const total = daysBetween(w.start, w.end);
            const elapsed = Math.max(0, Math.min(total, daysBetween(w.start, now)));
            const pct = Math.round((elapsed / total) * 100);
            const isActive = now >= w.start && now <= w.end;
            const startStr = w.start.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
            const endStr   = w.end.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
            return (
              <div key={w.name} className={`bg-[#0d1017] border rounded-2xl p-4 space-y-3 ${isActive ? 'border-orange-800/50' : 'border-slate-800'}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-xs font-bold ${w.color}`}>{w.name}</span>
                  {isActive && (
                    <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-1.5 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">{startStr} → {endStr}</div>
                <div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${w.bar} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[9px] text-slate-600 font-mono mt-1">{pct}% {lbl('ukończone', 'elapsed')}</div>
                </div>
                <button
                  onClick={() => onAddLogMessage(lbl(`Otwarto generator dla: ${w.name}`, `Opened generator for: ${w.name}`))}
                  className="text-[10px] font-bold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {lbl('Napisz teraz ↗', 'Write now ↗')}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ContentBriefModal for calendar weeks */}
      {briefModal && (
        <ContentBriefModal
          lang={lang}
          brief={{
            title: briefModal.mainTopic,
            geoScore: 74,
            query: briefModal.targetKeyword,
            optimizedPassage: `${briefModal.mainTopic} — ${briefModal.whyNow}`,
            strengths: ['Temat sezonowy z wysokim popytem', 'Słowo kluczowe z intencją zakupową', 'Platforma: ' + (briefModal.platform ?? []).join(', ')],
            weaknesses: ['Wymaga rozbudowania o dane produktowe', 'Dodaj konkretne nazwy marek'],
            rating: MOCK_BRIEF_RATING,
            targetMarket: 'PL',
          }}
          onClose={() => setBriefModal(null)}
        />
      )}
    </div>
  );
}
