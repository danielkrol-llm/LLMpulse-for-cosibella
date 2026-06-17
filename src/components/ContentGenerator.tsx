import React, { useState } from 'react';
import {
  Sparkles, Copy, Download, FileText, Loader2, AlertCircle,
  CheckCircle, ChevronDown, Zap, BookOpen, Settings,
} from 'lucide-react';

interface ContentGeneratorProps {
  lang: 'pl' | 'en';
  onAddLogMessage: (msg: string) => void;
}

const CONTENT_TYPES = {
  pl: [
    { value: 'blog',     label: 'Artykuł blogowy' },
    { value: 'category', label: 'Opis kategorii' },
    { value: 'product',  label: 'Opis produktu' },
    { value: 'faq',      label: 'FAQ' },
    { value: 'guide',    label: 'Poradnik' },
  ],
  en: [
    { value: 'blog',     label: 'Blog article' },
    { value: 'category', label: 'Category description' },
    { value: 'product',  label: 'Product description' },
    { value: 'faq',      label: 'FAQ' },
    { value: 'guide',    label: 'How-to guide' },
  ],
};

const TARGET_LANGS = [
  { value: 'Polish',     label: 'Polski' },
  { value: 'Ukrainian',  label: 'Ukraiński' },
  { value: 'Czech',      label: 'Czeski' },
  { value: 'Slovak',     label: 'Słowacki' },
  { value: 'Hungarian',  label: 'Węgierski' },
  { value: 'Romanian',   label: 'Rumuński' },
  { value: 'German',     label: 'Niemiecki' },
];

const LENGTH_OPTIONS = {
  pl: [
    { value: '500',  label: 'Krótki ~500 słów',      tokens: 1024 },
    { value: '1000', label: 'Standardowy ~1000 słów', tokens: 2048 },
    { value: '2000', label: 'Długi ~2000 słów',       tokens: 4096 },
  ],
  en: [
    { value: '500',  label: 'Short ~500 words',    tokens: 1024 },
    { value: '1000', label: 'Standard ~1000 words', tokens: 2048 },
    { value: '2000', label: 'Long ~2000 words',     tokens: 4096 },
  ],
};

// ─── Client-side GEO heuristic ─────────────────────────────────────────────
function calcGeoScore(text: string, keywords: string): number {
  if (!text.trim()) return 0;
  let score = 0;

  // 1. Declarative first sentence (0-20)
  const first = text.split(/[.!?]/)[0]?.trim() ?? '';
  if (first.length > 20 && first.length < 250) score += 10;
  if (/\d+|najlep|poleca|recommended|best|top\s*\d/i.test(first)) score += 10;

  // 2. Cosibella brand mentions (0-20)
  score += Math.min(20, ((text.match(/cosibella/gi) ?? []).length) * 5);

  // 3. Measurable facts (0-20)
  score += Math.min(20, ((text.match(/\d+[.,]?\d*\s*(%|mg|ml|\bg\b|pH|SPF)/gi) ?? []).length) * 4);

  // 4. Structured H2/H3 headers (0-20)
  score += Math.min(20, ((text.match(/^#{1,3}\s.+/gm) ?? []).length) * 4);

  // 5. GEO keyword coverage (0-20)
  const kws = keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
  if (kws.length > 0) {
    const tl = text.toLowerCase();
    score += Math.min(20, Math.round((kws.filter(k => tl.includes(k)).length / kws.length) * 20));
  } else {
    score += 10;
  }

  return Math.min(100, score);
}

// ─── Minimal Markdown → HTML (no external deps) ────────────────────────────
function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-slate-800 mt-5 mb-1.5">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-slate-900 mt-6 mb-2 border-b border-slate-100 pb-1">$1</h2>')
    .replace(/^# (.+)$/gm,  '<h1 class="text-lg font-extrabold text-slate-900 mt-6 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc leading-snug">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-5 list-decimal leading-snug">$1</li>')
    .replace(/(<li[^>]*>[\s\S]*?<\/li>(?:\n|$))+/g, m => `<ul class="my-2 space-y-1">${m}</ul>`)
    .replace(/\n\n+/g, '</p><p class="mb-3 leading-relaxed">')
    .replace(/^(?!<[hup])(.+)$/gm, '<p class="mb-3 leading-relaxed">$1</p>');
}

// ─── Extract H2/H3 brief skeleton ──────────────────────────────────────────
function extractBrief(text: string): string {
  const lines = text.split('\n');
  const out = lines.filter(l => /^#{1,3}\s/.test(l) || /^- /.test(l));
  return out.length ? out.join('\n') : text.substring(0, 400) + '…';
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function ContentGenerator({ lang, onAddLogMessage }: ContentGeneratorProps) {
  const [topic, setTopic]           = useState(lang === 'pl' ? 'Koreańskie kosmetyki do oczyszczania twarzy' : 'Korean face cleansing cosmetics');
  const [contentType, setContentType] = useState('blog');
  const [targetLang, setTargetLang] = useState('Polish');
  const [geoKeywords, setGeoKeywords] = useState('koreańskie kosmetyki, oczyszczanie twarzy k-beauty, pianka COSRX');
  const [competitors, setCompetitors] = useState('Hebe, Notino, Douglas');
  const [length, setLength]         = useState('1000');

  const [output, setOutput]         = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');
  const [copied, setCopied]         = useState<'full' | 'brief' | null>(null);

  const ctypes = CONTENT_TYPES[lang];
  const lopts  = LENGTH_OPTIONS[lang];

  const wordCount = output ? output.split(/\s+/).filter(Boolean).length : 0;
  const geoScore  = calcGeoScore(output, geoKeywords);

  const scoreStyle =
    geoScore >= 70 ? 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40' :
    geoScore >= 45 ? 'text-amber-400  bg-amber-950/30  border-amber-900/40'  :
                     'text-rose-400   bg-rose-950/30   border-rose-900/40';
  const scoreLabel =
    geoScore >= 70 ? (lang === 'pl' ? 'Wysoki' : 'High')   :
    geoScore >= 45 ? (lang === 'pl' ? 'Średni' : 'Medium') :
                     (lang === 'pl' ? 'Niski'  : 'Low');

  // ── API call ──────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    const apiKey = (JSON.parse(localStorage.getItem('llm-auditor-keys') ?? '{}') as { anthropic?: string }).anthropic ?? '';
    if (!apiKey) {
      setError(lang === 'pl'
        ? 'Brak klucza Anthropic API. Wejdź w Ustawienia (ikona zębatki) i wpisz swój klucz.'
        : 'No Anthropic API key. Open Settings (gear icon) and enter your key.');
      return;
    }
    if (!topic.trim()) return;

    setIsLoading(true);
    setError('');
    setOutput('');

    const typeLabel   = ctypes.find(c => c.value === contentType)?.label ?? contentType;
    const lengthOpt   = lopts.find(l => l.value === length) ?? lopts[1];
    const maxTokens   = lengthOpt.tokens;

    const systemPrompt =
`You are an expert e-commerce content writer for Cosibella.pl, a Polish K-Beauty and skincare specialist store operating in CEE markets (PL, UA, CZ, SK, HU, RO, DE).
Write content that is optimized for Generative Engine Optimization (GEO) — meaning:
1. First sentence must directly answer the most likely user question
2. Include specific product names, ingredients, and brand names as entities
3. Use declarative factual statements that AI search engines can extract as snippets
4. Structure with clear H2/H3 headers that match common search queries
5. Include comparison context (vs competitors) where natural
6. End with a clear recommendation mentioning Cosibella
Write in ${targetLang}. Length: ${lengthOpt.label}.`;

    const userMessage =
`Write ${typeLabel} about: ${topic}. Must mention these GEO keywords: ${geoKeywords || 'K-Beauty, Cosibella'}. Position Cosibella better than: ${competitors || 'Hebe, Notino, Douglas'}.`;

    onAddLogMessage(lang === 'pl'
      ? `ContentGen: generuję "${typeLabel}" — "${topic}" (${targetLang})`
      : `ContentGen: generating "${typeLabel}" — "${topic}" (${targetLang})`);

    try {
      // 1. Try dev server endpoint (works when running locally via npm run dev)
      let text = '';
      try {
        const r = await fetch('/api/generate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, contentType, targetLang, geoKeywords, competitors, length, lang }),
          signal: AbortSignal.timeout(6000),
        });
        if (r.ok) {
          const d = await r.json();
          text = d.content ?? '';
        }
      } catch {
        // Falls through to direct browser call (GitHub Pages / static hosting)
      }

      // 2. Direct Anthropic browser call (GitHub Pages)
      if (!text) {
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
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
          }),
        });
        if (!r.ok) {
          const e = await r.json().catch(() => ({})) as { error?: { message?: string } };
          throw new Error(e?.error?.message ?? `HTTP ${r.status}`);
        }
        const d = await r.json() as { content?: { text: string }[] };
        text = d.content?.[0]?.text ?? '';
      }

      setOutput(text);
      const ws = text.split(/\s+/).filter(Boolean).length;
      const gs = calcGeoScore(text, geoKeywords);
      onAddLogMessage(lang === 'pl'
        ? `ContentGen: wygenerowano ${ws} słów | GEO Score: ${gs}%`
        : `ContentGen: generated ${ws} words | GEO Score: ${gs}%`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      onAddLogMessage(`ContentGen ERROR: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Clipboard / download ──────────────────────────────────────────────────
  const handleCopy = async (mode: 'full' | 'brief') => {
    await navigator.clipboard.writeText(mode === 'brief' ? extractBrief(output) : output);
    setCopied(mode);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `cosibella-${topic.slice(0, 28).replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── CSS shorthand helpers ─────────────────────────────────────────────────
  const labelCls  = 'text-[10px] uppercase tracking-widest font-mono font-bold text-slate-500 block mb-1.5';
  const inputCls  = 'w-full text-xs font-mono border border-slate-800 bg-[#151921] py-2 px-3 rounded-xl text-slate-300 focus:outline-none focus:border-cyan-500 placeholder-slate-600';
  const selectCls = 'w-full text-xs font-semibold border border-slate-800 bg-[#151921] py-2 px-3 rounded-xl text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none';

  return (
    <div className="space-y-6 animate-linear duration-200">

      {/* ── Header banner ── */}
      <div className="bg-gradient-to-r from-[#0F1115] via-[#151921] to-[#0F1115] rounded-2xl border border-slate-800 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden select-none">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
              {lang === 'pl' ? 'Generator Treści AI' : 'AI Content Generator'}
            </span>
          </div>
          <h2 className="text-xl font-black text-white">
            {lang === 'pl' ? 'Napisz z AI — GEO-Optimized Content' : 'Write with AI — GEO-Optimized Content'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            {lang === 'pl'
              ? 'Generuj treści zoptymalizowane pod ChatGPT, Gemini i Perplexity dla rynków CEE. Wymagany klucz Anthropic API (Ustawienia → API Keys).'
              : 'Generate content optimized for ChatGPT, Gemini & Perplexity for CEE markets. Requires Anthropic API key (Settings → API Keys).'}
          </p>
        </div>
        <div className="absolute top-1/2 right-16 -translate-y-1/2 w-36 h-36 bg-cyan-500 rounded-full blur-3xl opacity-[0.06] pointer-events-none" />
      </div>

      {/* ── 3-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── LEFT: inputs ── */}
        <div className="lg:col-span-1 bg-[#0F1115] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'pl' ? 'Parametry treści' : 'Content parameters'}
            </span>
          </div>

          {/* Topic */}
          <div>
            <label className={labelCls}>{lang === 'pl' ? 'Temat artykułu' : 'Article topic'}</label>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              rows={2}
              className={inputCls + ' resize-none'}
              placeholder={lang === 'pl' ? 'np. Koreańskie kosmetyki do oczyszczania twarzy' : 'e.g. Korean face cleansing cosmetics'}
            />
          </div>

          {/* Content type */}
          <div>
            <label className={labelCls}>{lang === 'pl' ? 'Typ treści' : 'Content type'}</label>
            <div className="relative">
              <select value={contentType} onChange={e => setContentType(e.target.value)} className={selectCls}>
                {ctypes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Target language */}
          <div>
            <label className={labelCls}>{lang === 'pl' ? 'Język docelowy' : 'Target language'}</label>
            <div className="relative">
              <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className={selectCls}>
                {TARGET_LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* GEO keywords */}
          <div>
            <label className={labelCls}>{lang === 'pl' ? 'Słowa kluczowe GEO (po przecinku)' : 'GEO keywords (comma-separated)'}</label>
            <input type="text" value={geoKeywords} onChange={e => setGeoKeywords(e.target.value)}
              className={inputCls} placeholder="koreańskie kosmetyki, COSRX, oczyszczanie" />
          </div>

          {/* Competitors */}
          <div>
            <label className={labelCls}>{lang === 'pl' ? 'Konkurenci do pobicia' : 'Competitors to outrank'}</label>
            <input type="text" value={competitors} onChange={e => setCompetitors(e.target.value)}
              className={inputCls} placeholder="Hebe, Notino, Douglas" />
          </div>

          {/* Length */}
          <div>
            <label className={labelCls}>{lang === 'pl' ? 'Długość treści' : 'Content length'}</label>
            <div className="relative">
              <select value={length} onChange={e => setLength(e.target.value)} className={selectCls}>
                {lopts.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-cyan-950/30"
          >
            {isLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" />{lang === 'pl' ? 'Generuję…' : 'Generating…'}</>
              : <><Sparkles className="w-4 h-4" />{lang === 'pl' ? 'Generuj treść ↗' : 'Generate content ↗'}</>
            }
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl text-[11px] text-rose-400 leading-relaxed">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Settings hint */}
          <div className="flex items-start gap-2 p-3 bg-slate-900/50 border border-slate-800/80 rounded-xl text-[10px] text-slate-500 leading-snug">
            <Settings className="w-3 h-3 shrink-0 mt-0.5 text-slate-600" />
            <span>
              {lang === 'pl'
                ? 'Klucz API Anthropic → Ustawienia → API Keys. Bezpłatne konto na console.anthropic.com.'
                : 'Anthropic API key → Settings → API Keys. Free account at console.anthropic.com.'}
            </span>
          </div>
        </div>

        {/* ── RIGHT: output ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Stats bar */}
          {output && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0F1115] border border-slate-800 rounded-2xl px-5 py-3 select-none">
              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                <span><span className="text-white font-bold">{wordCount}</span> {lang === 'pl' ? 'słów' : 'words'}</span>
                <span className="text-slate-700">|</span>
                <span>~{Math.ceil(wordCount / 200)} min {lang === 'pl' ? 'czytania' : 'read'}</span>
              </div>
              <div className={`flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border ${scoreStyle}`}>
                <Zap className="w-3 h-3" />
                GEO Score: {geoScore}%
                <span className="text-[9px] opacity-60 ml-0.5">({scoreLabel})</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {output && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleCopy('full')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold bg-[#151921] hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition cursor-pointer">
                {copied === 'full' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {lang === 'pl' ? 'Kopiuj do schowka' : 'Copy to clipboard'}
              </button>
              <button onClick={() => handleCopy('brief')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold bg-[#151921] hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition cursor-pointer">
                {copied === 'brief' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <BookOpen className="w-3.5 h-3.5" />}
                {lang === 'pl' ? 'Kopiuj jako brief' : 'Copy as brief'}
              </button>
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold bg-[#151921] hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                {lang === 'pl' ? 'Pobierz .txt' : 'Download .txt'}
              </button>
            </div>
          )}

          {/* Output card */}
          <div className="bg-white rounded-2xl border border-slate-200 min-h-[440px] relative overflow-hidden shadow-sm">
            {!output && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 select-none pointer-events-none">
                <Sparkles className="w-10 h-10 text-slate-200" />
                <p className="text-sm text-slate-300 text-center px-10 leading-relaxed">
                  {lang === 'pl'
                    ? 'Wypełnij parametry po lewej i kliknij "Generuj treść ↗"'
                    : 'Fill in the parameters on the left and click "Generate content ↗"'}
                </p>
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/95 z-10">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                <p className="text-sm text-slate-400 font-mono">
                  {lang === 'pl' ? 'Generuję treść przez Claude…' : 'Generating content via Claude…'}
                </p>
              </div>
            )}
            {output && (
              <div
                className="p-8 text-[14px] leading-7 text-slate-800 font-serif"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
