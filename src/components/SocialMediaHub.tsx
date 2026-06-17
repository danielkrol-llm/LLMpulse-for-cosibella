import React, { useState } from 'react';
import {
  Heart, Sparkles, TrendingUp, MessageCircle, Copy, Star,
  CheckCircle, AlertCircle, Loader2, ChevronDown, Filter,
  Instagram, Facebook, Info,
} from 'lucide-react';

interface SocialMediaHubProps {
  lang: 'pl' | 'en';
  onAddLogMessage: (msg: string) => void;
}

type SocialSubTab = 'COPY' | 'TRENDS' | 'SENTIMENT';

// ─── Platform config ─────────────────────────────────────────────────────────
const PLATFORMS = ['TikTok', 'Instagram Reels', 'Instagram Feed', 'Facebook Feed', 'Facebook Ads', 'Meta Ads (Advantage+)'];
const GOALS_PL = ['Sprzedaż', 'Świadomość marki', 'Zaangażowanie', 'Ruch na stronę', 'Pozyskanie leadów'];
const GOALS_EN = ['Sales', 'Brand awareness', 'Engagement', 'Traffic', 'Lead generation'];
const TONES_PL = ['Ekspercki', 'Przyjacielski', 'Inspirujący', 'Pilność (FOMO)', 'Humorystyczny'];
const TONES_EN = ['Expert', 'Friendly', 'Inspirational', 'Urgency (FOMO)', 'Humorous'];

const CHAR_LIMITS: Record<string, number> = {
  'TikTok': 2200,
  'Instagram Reels': 2200,
  'Instagram Feed': 2200,
  'Facebook Feed': 63206,
  'Facebook Ads': 125,
  'Meta Ads (Advantage+)': 125,
};

const PLATFORM_BADGE: Record<string, string> = {
  'TikTok': 'bg-pink-950/40 text-pink-400 border-pink-800/50',
  'Instagram Reels': 'bg-purple-950/40 text-purple-400 border-purple-800/50',
  'Instagram Feed': 'bg-purple-950/40 text-purple-400 border-purple-800/50',
  'Facebook Feed': 'bg-blue-950/40 text-blue-400 border-blue-800/50',
  'Facebook Ads': 'bg-blue-950/40 text-blue-400 border-blue-800/50',
  'Meta Ads (Advantage+)': 'bg-blue-950/40 text-blue-400 border-blue-800/50',
};

// ─── Trend Radar data ─────────────────────────────────────────────────────────
const TRENDS = [
  { name: 'Glass skin routine',          score: 92, platforms: ['TikTok', 'Instagram'],        category: 'K-Beauty routine' },
  { name: 'Gentle cleansing duet',       score: 87, platforms: ['TikTok'],                      category: 'Cleansers' },
  { name: 'Niacinamide + SPF combo',     score: 84, platforms: ['Instagram', 'Facebook'],       category: 'Sun protection' },
  { name: 'Ceramide barrier repair',     score: 79, platforms: ['Instagram'],                   category: 'Moisturizers' },
  { name: 'Slugging trend',              score: 76, platforms: ['TikTok'],                      category: 'Overnight care' },
  { name: 'Dermatologist-tested claims', score: 71, platforms: ['Facebook', 'Meta Ads'],        category: 'Trust signals' },
];

// Seasonal data [Jan..Dec] intensity 1-5
const SEASONAL: { label: string; data: number[] }[] = [
  { label: 'SPF',          data: [1,1,2,3,5,5,5,4,3,2,1,1] },
  { label: 'Retinol',      data: [4,4,3,2,1,1,1,2,3,5,5,4] },
  { label: 'AHA/BHA',      data: [3,3,3,2,2,1,1,2,3,4,4,3] },
  { label: 'Ceramidy',     data: [5,5,4,2,1,1,1,1,2,4,5,5] },
  { label: 'Sheet Masks',  data: [3,3,3,4,4,3,3,3,3,3,3,3] },
  { label: 'Niacinamide',  data: [3,3,3,4,4,4,4,4,4,4,3,3] },
  { label: 'Peelingi',     data: [4,4,3,2,2,1,1,2,2,4,4,4] },
  { label: 'Nawilżenie',   data: [5,5,4,3,2,2,2,2,3,4,5,5] },
  { label: 'Zestawy',      data: [1,1,1,1,1,1,1,1,2,4,5,5] },
];

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function intensityColor(v: number): string {
  if (v === 1) return '#1e293b';
  if (v === 2) return '#164e63';
  if (v === 3) return '#0e7490';
  if (v === 4) return '#06b6d4';
  return '#22d3ee';
}

// ─── Mock sentiment mentions ──────────────────────────────────────────────────
const MENTIONS = [
  { id: 1, platform: 'Instagram', user: '@kbeauty_polska',   text: 'Właśnie dostałam paczkę z Cosibella i jestem zachwycona! Shipping był błyskawiczny.', sentiment: 'positive', date: '2026-06-16', lang: 'pl' },
  { id: 2, platform: 'TikTok',    user: '@skincareczech',    text: 'Srovnávám Cosibella vs Notino – Cosibella má lepší výběr K-beauty, Notino lepší ceny parfémů.', sentiment: 'neutral',  date: '2026-06-15', lang: 'cz' },
  { id: 3, platform: 'Facebook',  user: 'Marta K.',          text: 'Kupiłam w Hebe i w Cosibella ten sam krem. Cosibella ma oryginalne koreańskie produkty, zdecydowanie polecam!', sentiment: 'positive', date: '2026-06-15', lang: 'pl' },
  { id: 4, platform: 'Instagram', user: '@slovensky_skin',   text: 'Objednávam z Cosibella, pretože Douglas nemá kórejskú kozmetiku vôbec.', sentiment: 'positive', date: '2026-06-14', lang: 'sk' },
  { id: 5, platform: 'TikTok',    user: '@glasskin_pl',      text: 'Mój morning routine z produktami z Cosibella 🌸 COSRX, Beauty of Joseon i inne', sentiment: 'positive', date: '2026-06-14', lang: 'pl' },
  { id: 6, platform: 'Facebook',  user: 'Anna B.',           text: 'Cosibella trochę drożej niż Notino, ale jakość i wybór koreańskich kosmetyków jest nieporównywalny.', sentiment: 'neutral',  date: '2026-06-13', lang: 'pl' },
  { id: 7, platform: 'Instagram', user: '@retinolqueen_cz',  text: 'Zklamání z Douglas – žádný K-beauty. Přešla jsem na Cosibella a nemůžu si stěžovat!', sentiment: 'positive', date: '2026-06-13', lang: 'cz' },
  { id: 8, platform: 'TikTok',    user: '@hebebeauty_fan',   text: 'W Hebe nie ma połowy tych marek co w Cosibella. Niestety dostawa trwała 5 dni.', sentiment: 'negative', date: '2026-06-12', lang: 'pl' },
  { id: 9, platform: 'Facebook',  user: 'Zuzanna W.',        text: 'Polecam Cosibella każdemu kto szuka koreańskich kosmetyków w Polsce – szybka wysyłka i dobra obsługa.', sentiment: 'positive', date: '2026-06-12', lang: 'pl' },
  { id: 10,platform: 'Instagram', user: '@beautyCEE',        text: 'Douglas i Notino wciąż bez porządnego K-beauty. Na szczęście Cosibella działa 🙌', sentiment: 'positive', date: '2026-06-11', lang: 'pl' },
];

const COMPETITORS = ['Hebe', 'Notino', 'Douglas'];

function highlightMention(text: string) {
  const parts = text.split(/(Cosibella|Hebe|Notino|Douglas)/g);
  return parts.map((p, i) => {
    if (p === 'Cosibella') return <mark key={i} className="bg-transparent text-emerald-400 font-bold not-italic">{p}</mark>;
    if (COMPETITORS.includes(p)) return <mark key={i} className="bg-transparent text-amber-400 font-bold not-italic">{p}</mark>;
    return p;
  });
}

function SentimentBadge({ s }: { s: string }) {
  if (s === 'positive') return <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/40">POZYTYWNY</span>;
  if (s === 'negative') return <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-400 border border-rose-900/40">NEGATYWNY</span>;
  return <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">NEUTRALNY</span>;
}

interface CopyVariant {
  hook: string;
  body: string;
  hashtags: string[];
  headline?: string;
  primaryText?: string;
  description?: string;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SocialMediaHub({ lang, onAddLogMessage }: SocialMediaHubProps) {
  const [subTab, setSubTab] = useState<SocialSubTab>('COPY');

  // Copy Generator state
  const [platform, setPlatform]       = useState('TikTok');
  const [goal, setGoal]               = useState(lang === 'pl' ? GOALS_PL[0] : GOALS_EN[0]);
  const [product, setProduct]         = useState('Beauty of Joseon Relief Sun SPF50+');
  const [usp, setUsp]                 = useState('jedyny koreański filtr z niacynamidem w Polsce');
  const [tone, setTone]               = useState(lang === 'pl' ? TONES_PL[0] : TONES_EN[0]);
  const [cta, setCta]                 = useState('Sprawdź w Cosibella.pl');
  const [variants, setVariants]       = useState(3);
  const [useLlmData, setUseLlmData]   = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyError, setCopyError]     = useState('');
  const [copyResults, setCopyResults] = useState<CopyVariant[]>([]);
  const [savedVariants, setSavedVariants] = useState<Set<number>>(new Set());
  const [copiedIdx, setCopiedIdx]     = useState<number | null>(null);

  // Sentiment Feed state
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [platformFilter, setPlatformFilter]   = useState<'all' | string>('all');

  const goals   = lang === 'pl' ? GOALS_PL  : GOALS_EN;
  const tones   = lang === 'pl' ? TONES_PL  : TONES_EN;
  const lbl     = (pl: string, en: string) => lang === 'pl' ? pl : en;
  const selectCls = 'w-full text-xs font-mono border border-slate-800 bg-[#151921] py-2 px-3 rounded-xl text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none';
  const inputCls  = 'w-full text-xs font-mono border border-slate-800 bg-[#151921] py-2 px-3 rounded-xl text-slate-300 focus:outline-none focus:border-cyan-500 placeholder-slate-600';
  const labelCls  = 'text-[10px] uppercase tracking-widest font-mono font-bold text-slate-500 block mb-1.5';

  // ── Copy Generator API call ────────────────────────────────────────────────
  const handleGenerate = async () => {
    const apiKey = (JSON.parse(localStorage.getItem('llm-auditor-keys') ?? '{}') as { anthropic?: string }).anthropic ?? '';
    if (!apiKey) {
      setCopyError(lbl(
        'Brak klucza Anthropic API. Wejdź w Ustawienia → API Keys.',
        'No Anthropic API key. Go to Settings → API Keys.',
      ));
      return;
    }
    setIsGenerating(true);
    setCopyError('');
    setCopyResults([]);

    let llmContext = '';
    if (useLlmData) {
      try {
        const hist = JSON.parse(localStorage.getItem('llm-auditor-history') ?? '[]');
        const last = hist[0];
        if (last) llmContext = `Brand sentiment: ${last.sentiment ?? 'positive'}. Competitor context: ${(last.competitors ?? []).join(', ')}.`;
      } catch { /* silent */ }
    }

    const systemPrompt = `You are a senior social media copywriter specializing in beauty and skincare brands in Central Eastern Europe. You write for Cosibella.pl — a K-Beauty and dermocosmetics specialist store.
Platform: ${platform}. Goal: ${goal}. Tone: ${tone}.
Rules:
- Hook must stop the scroll in first 3 words
- Use sensory language specific to skincare (texture, feel, scent, skin transformation)
- Include social proof signals where natural (bestseller, 5-star, dermatologist-tested)
- CTA must create urgency or curiosity without being spammy
- For TikTok/Reels: write as if it's a script with [VISUAL] stage directions in brackets
- For Meta Ads: separate Headline (max 40 chars) | Primary Text (max 125 chars) | Description (max 30 chars)
${llmContext ? 'Brand context from AI search data: ' + llmContext : ''}
Return JSON array of ${variants} objects: [{"hook":"...","body":"...","hashtags":["..."],"headline":"...","primaryText":"...","description":"..."}]`;

    const userMsg = `Write ${variants} ad copy variants for platform: ${platform}, goal: ${goal}.
Product: ${product}.
USP: ${usp}.
CTA: ${cta}.
Return only valid JSON array, no extra text.`;

    onAddLogMessage(lbl(
      `SocialHub: generuję ${variants} wariantów copy dla ${platform}`,
      `SocialHub: generating ${variants} copy variants for ${platform}`,
    ));

    try {
      let result: CopyVariant[] = [];

      // Try dev server first
      try {
        const r = await fetch('/api/social-copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform, goal, product, usp, tone, cta, variantsCount: variants, llmContext, lang }),
          signal: AbortSignal.timeout(6000),
        });
        if (r.ok) {
          const d = await r.json();
          result = d.variants ?? [];
        }
      } catch { /* fallback to direct */ }

      // Direct Anthropic call (GitHub Pages)
      if (!result.length) {
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
            max_tokens: 2048,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMsg }],
          }),
        });
        if (!r.ok) {
          const e = await r.json().catch(() => ({})) as { error?: { message?: string } };
          throw new Error((e as any)?.error?.message ?? `HTTP ${r.status}`);
        }
        const d = await r.json() as { content?: { text: string }[] };
        const raw = d.content?.[0]?.text ?? '[]';
        const match = raw.match(/\[[\s\S]*\]/);
        result = match ? JSON.parse(match[0]) : [];
      }

      setCopyResults(result);
      onAddLogMessage(lbl(
        `SocialHub: wygenerowano ${result.length} wariantów copy`,
        `SocialHub: generated ${result.length} copy variants`,
      ));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCopyError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyVariant = (idx: number, v: CopyVariant) => {
    const text = [v.hook, v.body, ...(v.hashtags ?? [])].join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSave = (idx: number) => {
    setSavedVariants(prev => new Set([...prev, idx]));
  };

  const currentMonth = new Date().getMonth(); // 0-based

  const filteredMentions = MENTIONS.filter(m => {
    const matchSentiment = sentimentFilter === 'all' || m.sentiment === sentimentFilter;
    const matchPlatform  = platformFilter === 'all'  || m.platform === platformFilter;
    return matchSentiment && matchPlatform;
  });

  const positiveCount = MENTIONS.filter(m => m.sentiment === 'positive').length;
  const negativeCount = MENTIONS.filter(m => m.sentiment === 'negative').length;
  const neutralCount  = MENTIONS.filter(m => m.sentiment === 'neutral').length;

  // ── Tab navigation ─────────────────────────────────────────────────────────
  const tabBtn = (key: SocialSubTab, label: string) => (
    <button
      onClick={() => setSubTab(key)}
      className={`px-4 py-2.5 text-xs font-bold font-mono transition rounded-lg cursor-pointer ${
        subTab === key ? 'bg-[#1e2533] text-pink-400 border border-pink-500/20' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F1115] via-[#151921] to-[#0F1115] rounded-2xl border border-slate-800 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-pink-400">
              {lbl('Social Media Hub', 'Social Media Hub')}
            </span>
          </div>
          <h2 className="text-xl font-black text-white">{lbl('Social & Ads Intelligence', 'Social & Ads Intelligence')}</h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            {lbl(
              'Generuj copy, śledź trendy i monitoruj sentyment dla Cosibella.pl w regionie CEE.',
              'Generate copy, track trends and monitor sentiment for Cosibella.pl across CEE.',
            )}
          </p>
        </div>
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-32 h-32 bg-pink-500 rounded-full blur-3xl opacity-[0.05] pointer-events-none" />
      </div>

      {/* Sub-tab bar */}
      <div className="flex gap-1 border-b border-slate-800 pb-1">
        {tabBtn('COPY',      lbl('Copy Generator', 'Copy Generator'))}
        {tabBtn('TRENDS',    lbl('Trend Radar', 'Trend Radar'))}
        {tabBtn('SENTIMENT', lbl('Sentiment Feed', 'Sentiment Feed'))}
      </div>

      {/* ═══════════════════════════ SUB-TAB 1: COPY GENERATOR ═══════════════════════════ */}
      {subTab === 'COPY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left: inputs */}
          <div className="lg:col-span-1 bg-[#0F1115] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {lbl('Parametry copy', 'Copy parameters')}
              </span>
            </div>

            {/* Platform */}
            <div>
              <label className={labelCls}>{lbl('Platforma', 'Platform')}</label>
              <div className="relative">
                <select value={platform} onChange={e => setPlatform(e.target.value)} className={selectCls}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className={labelCls}>{lbl('Cel kampanii', 'Campaign goal')}</label>
              <div className="relative">
                <select value={goal} onChange={e => setGoal(e.target.value)} className={selectCls}>
                  {goals.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Product */}
            <div>
              <label className={labelCls}>{lbl('Produkt / Temat', 'Product / Topic')}</label>
              <textarea value={product} onChange={e => setProduct(e.target.value)} rows={2}
                className={inputCls + ' resize-none'}
                placeholder="Beauty of Joseon Relief Sun SPF50+" />
            </div>

            {/* USP */}
            <div>
              <label className={labelCls}>{lbl('USP (unikalna cecha)', 'USP (unique selling point)')}</label>
              <input type="text" value={usp} onChange={e => setUsp(e.target.value)}
                className={inputCls} placeholder="np. jedyny koreański filtr z niacynamidem" />
            </div>

            {/* Tone */}
            <div>
              <label className={labelCls}>{lbl('Ton', 'Tone')}</label>
              <div className="relative">
                <select value={tone} onChange={e => setTone(e.target.value)} className={selectCls}>
                  {tones.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* CTA */}
            <div>
              <label className={labelCls}>CTA</label>
              <input type="text" value={cta} onChange={e => setCta(e.target.value)}
                className={inputCls} placeholder="Sprawdź w Cosibella.pl" />
            </div>

            {/* Variants slider */}
            <div>
              <label className={labelCls}>{lbl(`Liczba wariantów: ${variants}`, `Variants: ${variants}`)}</label>
              <input type="range" min={1} max={5} value={variants} onChange={e => setVariants(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer" />
              <div className="flex justify-between text-[9px] text-slate-600 font-mono mt-0.5">
                {[1,2,3,4,5].map(n => <span key={n}>{n}</span>)}
              </div>
            </div>

            {/* LLM data checkbox */}
            <label className="flex items-start gap-2 cursor-pointer group">
              <input type="checkbox" checked={useLlmData} onChange={e => setUseLlmData(e.target.checked)}
                className="mt-0.5 accent-pink-500 cursor-pointer" />
              <span className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-snug">
                {lbl('Użyj danych z LLM Audytora (sentyment + kontekst konkurencji)', 'Use LLM Auditor data (sentiment + competitor context)')}
              </span>
            </label>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !product.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              {isGenerating
                ? <><Loader2 className="w-4 h-4 animate-spin" />{lbl('Generuję…', 'Generating…')}</>
                : <><Sparkles className="w-4 h-4" />{lbl('Generuj copy ↗', 'Generate copy ↗')}</>}
            </button>

            {copyError && (
              <div className="flex items-start gap-2 p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl text-[11px] text-rose-400 leading-relaxed">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {copyError}
              </div>
            )}
          </div>

          {/* Right: output variants */}
          <div className="lg:col-span-2 space-y-4">
            {!copyResults.length && !isGenerating && (
              <div className="flex flex-col items-center justify-center min-h-[320px] border border-dashed border-slate-800 rounded-2xl bg-[#0a0c10] text-center gap-3">
                <Heart className="w-10 h-10 text-slate-700" />
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  {lbl('Uzupełnij parametry i kliknij "Generuj copy ↗" aby zobaczyć warianty.', 'Fill in parameters and click "Generate copy ↗" to see variants.')}
                </p>
              </div>
            )}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center min-h-[320px] border border-slate-800 rounded-2xl bg-[#0a0c10]">
                <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                <p className="text-xs text-slate-400 mt-3 font-mono">{lbl('Claude pisze copy…', 'Claude is writing copy…')}</p>
              </div>
            )}
            {copyResults.map((v, idx) => {
              const limit = CHAR_LIMITS[platform] ?? 2200;
              const charCount = (v.body?.length ?? 0) + (v.hook?.length ?? 0);
              const isOver = charCount > limit;
              const badgeCls = PLATFORM_BADGE[platform] ?? 'bg-slate-800 text-slate-400 border-slate-700';
              return (
                <div key={idx} className="bg-[#0F1115] border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${badgeCls}`}>
                        {platform.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${isOver ? 'bg-rose-950/30 text-rose-400 border-rose-900/40' : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40'}`}>
                      {charCount}/{limit} znaków
                    </span>
                  </div>

                  {/* Hook */}
                  <p className="text-sm font-extrabold text-white leading-snug">{v.hook}</p>

                  {/* Body */}
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{v.body}</p>

                  {/* Meta Ads extra fields */}
                  {v.headline && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 space-y-1 text-[11px] font-mono">
                      <div><span className="text-slate-500">Headline: </span><span className="text-white font-bold">{v.headline}</span></div>
                      {v.primaryText && <div><span className="text-slate-500">Primary text: </span><span className="text-slate-300">{v.primaryText}</span></div>}
                      {v.description && <div><span className="text-slate-500">Description: </span><span className="text-slate-400">{v.description}</span></div>}
                    </div>
                  )}

                  {/* Hashtags */}
                  {v.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {v.hashtags.map((h, hi) => (
                        <span key={hi} className="text-[10px] font-mono text-pink-400 bg-pink-950/20 border border-pink-900/30 px-2 py-0.5 rounded-full">
                          {h.startsWith('#') ? h : '#' + h}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleCopyVariant(idx, v)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-[#151921] hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 transition cursor-pointer">
                      {copiedIdx === idx ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {lbl('Kopiuj', 'Copy')}
                    </button>
                    <button onClick={() => handleSave(idx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold border rounded-lg transition cursor-pointer ${savedVariants.has(idx) ? 'bg-amber-950/30 border-amber-800/50 text-amber-400' : 'bg-[#151921] hover:bg-slate-800 border-slate-700 text-slate-300'}`}>
                      <Star className="w-3.5 h-3.5" />
                      {savedVariants.has(idx) ? lbl('Zapisano ✓', 'Saved ✓') : lbl('⭐ Zapisz wariant', '⭐ Save variant')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════ SUB-TAB 2: TREND RADAR ═══════════════════════════ */}
      {subTab === 'TRENDS' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              {lbl('Trending now in CEE beauty', 'Trending now in CEE beauty')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRENDS.map((trend, i) => (
                <div key={i} className="bg-[#0F1115] border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-white">{trend.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{trend.category}</p>
                    </div>
                    <span className="text-sm font-black font-mono text-pink-400 shrink-0">{trend.score}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all"
                      style={{ width: `${trend.score}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {trend.platforms.map(p => (
                        <span key={p} className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border bg-slate-900 text-slate-400 border-slate-700">
                          {p === 'TikTok' ? '♪' : p === 'Instagram' ? '📷' : p === 'Facebook' ? 'f' : 'M'} {p}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => { setSubTab('COPY'); setProduct(trend.name); }}
                      className="text-[10px] font-bold text-pink-400 hover:text-pink-300 transition cursor-pointer">
                      {lbl('Napisz post ↗', 'Write post ↗')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seasonal heatmap */}
          <div className="bg-[#0F1115] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                {lbl('Sezonowość kategorii produktowych', 'Product category seasonality')}
              </span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] font-mono border-collapse">
                <thead>
                  <tr>
                    <th className="text-left pr-4 py-1 text-slate-500 font-bold w-32">{lbl('Kategoria', 'Category')}</th>
                    {MONTHS_SHORT.map((m, mi) => (
                      <th key={m} className={`text-center px-1 py-1 font-bold ${mi === currentMonth ? 'text-cyan-400' : 'text-slate-600'}`}>
                        {m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SEASONAL.map(row => (
                    <tr key={row.label}>
                      <td className="text-slate-400 pr-4 py-0.5 font-bold text-[9px]">{row.label}</td>
                      {row.data.map((v, mi) => (
                        <td key={mi} className="px-0.5 py-0.5">
                          <div
                            style={{ backgroundColor: intensityColor(v), width: 28, height: 18, borderRadius: 3 }}
                            title={v >= 4 ? lbl('Wysoki sezon — zaplanuj treść 6 tyg. wcześniej', 'Peak season — plan content 6 weeks ahead') : lbl('Niski sezon', 'Low season')}
                            className={`${mi === currentMonth ? 'ring-1 ring-cyan-400' : ''} cursor-default`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 mt-4 text-[9px] font-mono text-slate-500">
              <span>{lbl('Intensywność:', 'Intensity:')}</span>
              {[1,2,3,4,5].map(v => (
                <span key={v} className="flex items-center gap-1">
                  <span style={{ backgroundColor: intensityColor(v), width: 16, height: 10, display: 'inline-block', borderRadius: 2 }} />
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════ SUB-TAB 3: SENTIMENT FEED ═══════════════════════════ */}
      {subTab === 'SENTIMENT' && (
        <div className="space-y-5">
          {/* Info banner */}
          <div className="flex items-start gap-3 bg-cyan-950/20 border border-cyan-900/30 rounded-xl p-3 text-xs text-cyan-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {lbl(
                'Pełny monitoring social wymaga integracji z Brand24 lub Sprout Social API — skontaktuj się z administratorem systemu.',
                'Full social monitoring requires Brand24 or Sprout Social API integration — contact system administrator.',
              )}
            </span>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {Math.round((positiveCount / MENTIONS.length) * 100)}%
              </div>
              <div className="text-[10px] text-emerald-500 font-mono uppercase tracking-wider mt-1">
                {lbl('Pozytywne', 'Positive')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{positiveCount} wzmianek</div>
            </div>
            <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-rose-400 font-mono">
                {Math.round((negativeCount / MENTIONS.length) * 100)}%
              </div>
              <div className="text-[10px] text-rose-500 font-mono uppercase tracking-wider mt-1">
                {lbl('Negatywne', 'Negative')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{negativeCount} wzmiank{negativeCount === 1 ? 'a' : 'i'}</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-slate-300 font-mono">
                {Math.round((neutralCount / MENTIONS.length) * 100)}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-1">
                {lbl('Neutralne', 'Neutral')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{neutralCount} wzmianek</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            {(['all','positive','negative','neutral'] as const).map(s => (
              <button key={s} onClick={() => setSentimentFilter(s)}
                className={`px-3 py-1 text-[10px] font-bold font-mono rounded-lg border cursor-pointer transition ${
                  sentimentFilter === s ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-800 text-slate-500 hover:text-slate-300'
                }`}>
                {s === 'all' ? lbl('Wszystkie', 'All') : s === 'positive' ? lbl('Pozytywne', 'Positive') : s === 'negative' ? lbl('Negatywne', 'Negative') : lbl('Neutralne', 'Neutral')}
              </button>
            ))}
            <span className="text-slate-700">|</span>
            {(['all','TikTok','Instagram','Facebook'] as const).map(p => (
              <button key={p} onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1 text-[10px] font-bold font-mono rounded-lg border cursor-pointer transition ${
                  platformFilter === p ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-800 text-slate-500 hover:text-slate-300'
                }`}>
                {p === 'all' ? lbl('Platf.', 'Platform') : p}
              </button>
            ))}
          </div>

          {/* Mentions feed */}
          <div className="space-y-3">
            {filteredMentions.map(m => (
              <div key={m.id} className="bg-[#0F1115] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                      {m.platform}
                    </span>
                    <span className="text-[11px] font-bold text-slate-300">{m.user}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SentimentBadge s={m.sentiment} />
                    <span className="text-[9px] text-slate-600 font-mono">{m.date}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  „{highlightMention(m.text)}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
