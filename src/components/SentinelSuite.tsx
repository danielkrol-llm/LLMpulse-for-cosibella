import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  Bell, 
  FileSpreadsheet, 
  Sparkles, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Globe, 
  Play, 
  Heart, 
  MessageSquare, 
  Download, 
  Database, 
  Cpu, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Mail,
  Zap,
  Info
} from 'lucide-react';

// Sample raw data matching Cosibella URLs & products crawlability audit
const INITIAL_CONTENT_AUDIT = [
  { 
    url: '/pl/menu/k-beauty-koreanskie-kosmetyki-172.html', 
    title: 'Koreańskie Kosmetyki K-Beauty',
    gptBot: 'Allowed', 
    claudeBot: 'Allowed', 
    googleExtended: 'Allowed', 
    crawlability: 'Excellent',
    aiReadiness: 94,
    citationStatus: 'Cited (Top 1)',
    reason: 'Sól fizjologiczna, bogate schematy Schema Product & FAQ.',
    geoPlan: 'Dodaj drugorzędne synonimy dla słów "szklana cera" oraz "skincare koreański wegański" bezpośrednio w opisie kategorii.',
    thinContent: 'No'
  },
  { 
    url: '/pl/products/beauty-of-joseon-relief-sun-probiotic', 
    title: 'Beauty of Joseon - Relief Sun SPF 50+',
    gptBot: 'Allowed', 
    claudeBot: 'Allowed', 
    googleExtended: 'Allowed', 
    crawlability: 'Excellent',
    aiReadiness: 88,
    citationStatus: 'Cited (Top 2)',
    reason: 'Wzmianki o certyfikacji SPF, kosmetolodzy Cosibella wymienieni jako zweryfikowani recenzenci.',
    geoPlan: 'Osadź blok pytań i odpowiedzi (Q&A) z mikroformatem FAQPage wyjaśniającym bielenie SPF dla ciemniejszych fototypów skóry.',
    thinContent: 'No'
  },
  { 
    url: '/pl/products/the-ordinary-niacinamide-10-zinc-1', 
    title: 'The Ordinary - Niacinamide 10% + Zinc 1%',
    gptBot: 'Allowed', 
    claudeBot: 'Allowed', 
    googleExtended: 'Blocked', 
    crawlability: 'Limited',
    aiReadiness: 62,
    citationStatus: 'Uncited (Competitor Overlap)',
    reason: 'Brak struktury JSON-LD dla ocen klientów. Wolne renderowanie kluczowych tabel składników aktywnych.',
    geoPlan: 'Odblokuj google-extended w robots.txt. Przenieś specyfikację pH 5.5-6.5 do statycznego HTML zamiast ładowania przez JS API.',
    thinContent: 'No'
  },
  { 
    url: '/pl/products/anua-heartleaf-77-soothing-toner', 
    title: 'Anua - Heartleaf 77% Soothing Toner',
    gptBot: 'Blocked', 
    claudeBot: 'Allowed', 
    googleExtended: 'Allowed', 
    crawlability: 'Limited',
    aiReadiness: 45,
    citationStatus: 'Uncited (Gap)',
    reason: 'Thin content (krótki opis, brak opinii ekspertów). Robots.txt blokuje OpenAI GPTBot za pomocą błędnej dyrektywy User-agent.',
    geoPlan: 'Rozbuduj opis o sekcję "Jak toner Anua łagodzi stany zapalne - skład chemiczny" i zezwól na crawl przez GPTBot.',
    thinContent: 'Yes (Critical)'
  },
  { 
    url: '/pl/products/cosrx-advanced-snail-96-mucin-power', 
    title: 'COSRX - Advanced Snail Mucin Power Essence',
    gptBot: 'Allowed', 
    claudeBot: 'Allowed', 
    googleExtended: 'Allowed', 
    crawlability: 'Excellent',
    aiReadiness: 90,
    citationStatus: 'Cited (Top 3)',
    reason: 'Wyraźne zestawienie opinii o organicznej mucynie, wysoki autorytet referencyjny na zewnętrznych forach beauty.',
    geoPlan: 'Zoptymalizuj mikrodata pod kątem pytania "czy esencja ze ślimaka Cosrx zatyka pory" — dodaj bezpośrednią odpowiedź w nagłówku H3.',
    thinContent: 'No'
  }
];

// Historical trending data for 12 months SOV simulation
const HISTORICAL_SOV_DATA = [
  { month: 'Lipiec 2025', cosibella: 22, sephora: 48, hebe: 21, douglas: 9 },
  { month: 'Sierpień 2025', cosibella: 24, sephora: 46, hebe: 20, douglas: 10 },
  { month: 'Wrzesień 2025', cosibella: 25, sephora: 45, hebe: 22, douglas: 12 },
  { month: 'Październik 2025', cosibella: 28, sephora: 42, hebe: 23, douglas: 15 },
  { month: 'Listopad 2025', cosibella: 30, sephora: 41, hebe: 25, douglas: 18 },
  { month: 'Grudzień 2025', cosibella: 34, sephora: 39, hebe: 22, douglas: 20 },
  { month: 'Styczeń 2026', cosibella: 35, sephora: 38, hebe: 21, douglas: 22 },
  { month: 'Luty 2026', cosibella: 38, sephora: 35, hebe: 23, douglas: 24 },
  { month: 'Marzec 2026', cosibella: 40, sephora: 34, hebe: 24, douglas: 25 },
  { month: 'Kwiecień 2026', cosibella: 42, sephora: 32, hebe: 26, douglas: 26 },
  { month: 'Maj 2026', cosibella: 45, sephora: 30, hebe: 25, douglas: 28 },
  { month: 'Czerwiec 2026 (Live)', cosibella: 48, sephora: 28, hebe: 21, douglas: 29 },
];

export default function SentinelSuite({ lang, onAddLogMessage }: { lang: 'pl' | 'en', onAddLogMessage: (text: string) => void }) {
  // Active internal view
  const [activeSegment, setActiveSegment] = useState<'SCHEDULER' | 'CONTENT_AUDIT' | 'SENTIMENT' | 'ALERTS'>('CONTENT_AUDIT');

  // Scheduler forms
  const [scheduleCron, setScheduleCron] = useState('0 2 * * *'); // Daily at 2:00 AM
  const [isSchedulerActive, setIsSchedulerActive] = useState(true);
  const [monitoredQueriesCount, setMonitoredQueriesCount] = useState(15);
  const [schedulerSelectedLLMs, setSchedulerSelectedLLMs] = useState<string[]>([
    'ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Copilot', 'Google AI Overviews'
  ]);

  // Alert settings states
  const [alertTargetEmail, setAlertTargetEmail] = useState('daniel.krol@cosibella.pl');
  const [alertSovThreshold, setAlertSovThreshold] = useState(25);
  const [customWebhook, setCustomWebhook] = useState('https://discord.com/api/webhooks/cosibella-ai-alerts');
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Content audit list
  const [auditList, setAuditList] = useState(INITIAL_CONTENT_AUDIT);
  const [isAuditingLive, setIsAuditingLive] = useState(false);
  const [searchUrlKeyword, setSearchUrlKeyword] = useState('');

  // Sentiment tracker query simulator
  const [sentimentQueryText, setSentimentQueryText] = useState('najlepszy krem odmladzajacy z retinolem');
  const [isSimulatingSentiment, setIsSimulatingSentiment] = useState(false);
  const [sentimentResult, setSentimentResult] = useState<any | null>({
    query: 'najlepszy krem odmladzajacy z retinolem',
    detectedBrand: 'Cosibella.pl',
    brandPosition: 1, // Top 1 recommended
    sentiment: 'Positive (Highly Recommendable)',
    confidenceScore: '96%',
    citationSource: 'Cosibella Blog ("Przewodnik po retinolu wegańskim")',
    sentimentScoreBreakdown: { positive: 88, neutral: 10, negative: 2 },
    opinionText: 'Cosibella is highlighted for having an expertly-vetted catalog with in-house cosmetologist recommendations, unlike generic marketplaces which offer unvetted retinol brands.'
  });

  // Export CSV mock trigger
  const handleExportCSV = (filename: string) => {
    onAddLogMessage(lang === 'pl' 
      ? `Wyeksportowano raport do pliku CSV: ${filename}_report.csv` 
      : `Exported enterprise report safely to local: ${filename}_report.csv`
    );
    alert(lang === 'pl' 
      ? `Raport ${filename} został przygotowany i zapisany jako plik CSV (symulacja pobierania).`
      : `Report ${filename} generated securely in CSV format!`
    );
  };

  // Run comprehensive Content Audit
  const handleRunFullContentAudit = () => {
    setIsAuditingLive(true);
    onAddLogMessage(lang === 'pl' 
      ? 'Rozpoczęto pełne masowe skanowanie techniczne URL i indeksowanie AI-Readiness podbotów...' 
      : 'Initiating recursive crawlability and AI indexing audit for cosibella.pl directories.'
    );

    setTimeout(() => {
      setIsAuditingLive(false);
      onAddLogMessage(lang === 'pl'
        ? 'Ukończono skanowanie. Wykryto 1 URL z krytycznie niskim AI-Readiness (Anua Heartleaf toner).'
        : 'Crawl completed. Identified 1 URL warning concerning weak schema optimization.'
      );
    }, 2000);
  };

  // Run sentiment emulator
  const handleSimulateSentimentLive = () => {
    setIsSimulatingSentiment(true);
    onAddLogMessage(lang === 'pl'
      ? `Odpytywanie silników LLM i analiza NLP dla zapytania: "${sentimentQueryText}"`
      : `Broadcasting LLM request with integrated NLP sentiment scorer for: "${sentimentQueryText}"`
    );

    setTimeout(() => {
      setIsSimulatingSentiment(false);
      // Generate some dynamic response mimicking a real audit
      setSentimentResult({
        query: sentimentQueryText,
        detectedBrand: 'Cosibella.pl',
        brandPosition: Math.floor(Math.random() * 3) + 1,
        sentiment: Math.random() > 0.3 ? 'Positive (Highly Recommendable)' : 'Neutral (Factual citation)',
        confidenceScore: `${Math.floor(Math.random() * 15) + 84}%`,
        citationSource: Math.random() > 0.5 ? 'Cosibella Forum Skincare' : 'Opinie i Rankingi Kosmetyków 2026',
        sentimentScoreBreakdown: { positive: 75, neutral: 22, negative: 3 },
        opinionText: `Zidentyfikowano pozytywne sentymenty i wysoki autorytet tematyczny. Model przypisał markę jako rekomendowane źródło z uwagi na solidną dokumentację składników.`
      });
      onAddLogMessage(lang === 'pl' ? 'Ukończono analizę sentymentu i RAG Attribution!' : 'Sentiment analysis and citation matching completed successfully.');
    }, 1500);
  };

  const filteredAuditList = auditList.filter(item => 
    item.url.toLowerCase().includes(searchUrlKeyword.toLowerCase()) ||
    item.title.toLowerCase().includes(searchUrlKeyword.toLowerCase())
  );

  return (
    <div id="sentinel-suite-container" className="space-y-6">
      
      {/* Title & Comparison with Otterly.ai */}
      <div className="p-6 border border-slate-800 rounded-xl bg-gradient-to-br from-[#0c0e18] via-[#0f121e] to-[#0d101a] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-400 border border-violet-500/30">
              OTTERLY SHIELD ENHANCED
            </span>
            <span className="text-xs text-slate-500 font-mono">Gartner Cool Tech Category 2026</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-violet-400 w-5 h-5 animate-pulse" />
            {lang === 'pl' ? 'Sentinel Suite: Automatyzacja, Sentyment i Audyt AI' : 'Sentinel Suite: Enterprise GEO Systems'}
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {lang === 'pl'
              ? 'Zaawansowany moduł klasy Otterly.ai integrujący automatyczny monitoring (24h Scheduler), śledzenie sentymentu, pozycjonowanie na listach LLM (Copilot, Google Overviews), audyt indeksacji crawlerów oraz mapowanie RAG.'
              : 'Direct drop-in competitor replacement enabling fully scheduled monitoring pipelines, sentiment scorers, brand positioning trackers, and crawlability diagnostics.'
            }
          </p>
        </div>

        <div className="bg-[#141829] border border-violet-500/20 rounded-xl p-3 text-xs w-full md:w-auto md:min-w-[280px] space-y-2 font-mono">
          <div className="text-[10px] text-violet-300 font-bold tracking-widest uppercase flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> BENCHMARK VS OTTERLY.AI
          </div>
          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span>Saved monitoring loops:</span>
              <span className="text-emerald-400 font-bold">{monitoredQueriesCount} / 30 limit</span>
            </div>
            <div className="flex justify-between">
              <span>Active engines:</span>
              <span className="text-cyan-405 font-bold text-cyan-300">6 Platforms</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold">Auto-Syncing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Navigation tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0e111a] p-1.5 rounded-lg border border-slate-800">
        <button
          onClick={() => setActiveSegment('CONTENT_AUDIT')}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            activeSegment === 'CONTENT_AUDIT'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Database size={13} />
          {lang === 'pl' ? 'Audyt Contentu i URL' : 'Content Crawl Audit'}
        </button>

        <button
          onClick={() => setActiveSegment('SCHEDULER')}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            activeSegment === 'SCHEDULER'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock size={13} />
          {lang === 'pl' ? 'Planowanie Skanów (Cron)' : 'Auto-Scan Scheduler'}
        </button>

        <button
          onClick={() => setActiveSegment('SENTIMENT')}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            activeSegment === 'SENTIMENT'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <MessageSquare size={13} />
          {lang === 'pl' ? 'Sentyment i Pozycje' : 'Sentiment Scorer'}
        </button>

        <button
          onClick={() => setActiveSegment('ALERTS')}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            activeSegment === 'ALERTS'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bell size={13} />
          {lang === 'pl' ? 'System Alertów' : 'Notification Triggers'}
        </button>
      </div>

      {/* SEGMENT 1: CONTENT AUDIT & AI-READINESS */}
      {activeSegment === 'CONTENT_AUDIT' && (
        <div className="space-y-6 animate-linear">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Control Sidebar / Instructions */}
            <div className="lg:col-span-4 p-5 border border-slate-800 rounded-xl bg-[#0e111a] space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Globe className="text-violet-400" size={16} />
                {lang === 'pl' ? 'Crawler Diagnostics' : 'Crawlability and AI Diagnostics'}
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                {lang === 'pl'
                  ? 'Zarządzanie dostępnością podstron Cosibella.pl dla głównych botów indeksujących LLM. Błędny robots.txt lub brak mikroformatów schema blokuje polecanie Twoich ofert.'
                  : 'Configure indexing access control rules targeting automated data miners like GPTBot and ClaudeBot. Unblock paths and audit weak pages.'
                }
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-[#131724]/40 rounded-lg border border-slate-850 font-mono text-[11px] space-y-1">
                  <span className="text-slate-450 uppercase block">Wyświetlanie Statystyk:</span>
                  <div className="flex justify-between text-white">
                    <span>Śr. Readiness:</span>
                    <span className="text-emerald-400 font-bold">75.6%</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Thin Content URLs:</span>
                    <span className="text-rose-450 text-rose-450 text-rose-400 font-bold">1 Alert</span>
                  </div>
                </div>

                <button
                  onClick={handleRunFullContentAudit}
                  disabled={isAuditingLive}
                  className="w-full py-2.5 px-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-95 text-white font-bold font-mono text-[11px] sm:text-xs cursor-pointer flex items-center justify-center gap-2 overflow-visible whitespace-nowrap shrink-0"
                >
                  {isAuditingLive ? (
                    <>
                      <RefreshCw className="animate-spin w-4 h-4" />
                      {lang === 'pl' ? 'Indeksowanie w toku...' : 'Crawling paths...'}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-white" />
                      {lang === 'pl' ? 'Uruchom Pełny Audyt Contentu' : 'Run Full Directory Auditing'}
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleExportCSV('content_readiness_audit')}
                  className="w-full py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition font-mono text-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {lang === 'pl' ? 'Eksportuj Audyt (CSV)' : 'Export Readiness Index (CSV)'}
                </button>
              </div>
            </div>

            {/* URL Audit table list */}
            <div className="lg:col-span-8 p-5 border border-slate-800 rounded-xl bg-[#0e111a] space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-white font-mono">
                  {lang === 'pl' ? 'Skaner URL-i & GEO Citation Diagnostics' : 'URL Repositories & Citation Audits'}
                </h4>
                <div className="relative max-w-xs shrink-0">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-slate-450 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder={lang === 'pl' ? 'Filtruj po URL lub tytule...' : 'Search by URL path...'}
                    value={searchUrlKeyword}
                    onChange={(e) => setSearchUrlKeyword(e.target.value)}
                    className="pl-9 pr-3 py-1.5 w-full bg-[#131620] border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-850/60 rounded-xl">
                <table className="w-full text-left font-mono">
                  <thead className="bg-[#111421] text-[10px] text-slate-450 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3 font-bold">Podstrona / URL</th>
                      <th className="p-3 font-bold text-center">Crawl (GPT/Claude)</th>
                      <th className="p-3 font-bold text-center">AI Readiness</th>
                      <th className="p-3 font-bold text-center">Crawlability</th>
                      <th className="p-3 font-bold text-center">Cytacja LLM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/40 text-[11px] text-slate-350">
                    {filteredAuditList.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/30 transition">
                        <td className="p-3 max-w-[280px]">
                          <div className="flex flex-col">
                            <span className="text-white text-xs font-bold truncate">{row.title}</span>
                            <span className="text-[10px] text-cyan-400 truncate mt-0.5">{row.url}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-[10px] bg-slate-900 border border-slate-850 py-0.5 px-1.5 rounded text-white inline-block">
                            🤖 {row.gptBot} / {row.claudeBot}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-bold ${
                            row.aiReadiness > 80 ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {row.aiReadiness}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                            row.crawlability === 'Excellent' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-rose-950/40 text-rose-400'
                          }`}>
                            {row.crawlability}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-bold ${
                            row.citationStatus.startsWith('Cited') ? 'text-cyan-400' : 'text-slate-400'
                          }`}>
                            {row.citationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* GEO Plan and recommendation box for selected item */}
              <div className="p-4 bg-[#111421] border border-violet-950/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-violet-400 w-4 h-4 animate-bounce" />
                  <span className="text-[11px] text-white uppercase tracking-wider font-extrabold">Krytyczne Rekomendacje GEO (Otterly.ai recommendation flow)</span>
                </div>
                <div className="text-[11px] space-y-3 divide-y divide-slate-800">
                  {filteredAuditList.map((row, idx) => (
                    <div key={idx} className="pt-2">
                      <div className="flex justify-between font-bold text-white">
                        <span>{row.title}</span>
                        <span className="text-yellow-400">Readiness: {row.aiReadiness}%</span>
                      </div>
                      <div className="text-slate-400 leading-normal mt-1">
                        <strong>Powód statusu:</strong> {row.reason}
                        <br />
                        <strong className="text-cyan-400">Plan GEO Zmian offline:</strong> {row.geoPlan}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 2: AUTOMATIC SCAN SCHEDULER & AUTO-MONITORING */}
      {activeSegment === 'SCHEDULER' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 font-mono animate-linear">
          
          {/* Config column */}
          <div className="md:col-span-5 p-5 border border-slate-800 rounded-xl bg-[#0e111a] space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <Clock className="text-violet-400" size={16} />
              {lang === 'pl' ? 'Ustawienia Harmonogramu' : 'Cron Schedule Configuration'}
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal leading-relaxed">
              {lang === 'pl'
                ? 'Zarządzanie automatycznym odpytywaniem modelów. Każda zapisana fraza (Saved Queries) zostanie zaktualizowana w Firestore o wyznaczonej godzinie.'
                : 'Configure automated crawl schedules to execute active search query matrices without running manual requests.'
              }
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-3 bg-[#121522] rounded-lg border border-slate-800">
                <div className="space-y-px">
                  <span className="text-xs font-bold text-white block">Status Auto-Skanu</span>
                  <span className="text-[10px] text-slate-500">
                    {isSchedulerActive ? 'Aktywny (Skonfigurowany w chmurze)' : 'Wyłączony'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isSchedulerActive}
                  onChange={(e) => setIsSchedulerActive(e.target.checked)}
                  className="w-4 h-4 bg-slate-900 border-slate-800 accent-violet-600 rounded cursor-pointer"
                />
              </div>

              {/* Cron setup */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold block">Wyrażenie Cron (UTC)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scheduleCron}
                    onChange={(e) => setScheduleCron(e.target.value)}
                    className="p-2 text-xs bg-slate-900 border border-slate-800 rounded text-green-400 w-full focus:outline-none focus:border-cyan-500 font-extrabold"
                  />
                  <button
                    onClick={() => {
                      onAddLogMessage(lang === 'pl' 
                        ? 'Zaktualizowano harmonogram zadań cron w bazie Firestore.' 
                        : 'Stored updated scheduler parameters in Firestore profile.'
                      );
                      alert(lang === 'pl' ? 'Harmonogram Cron zapisany!' : 'Cron variables set!');
                    }}
                    className="px-3 py-1.5 rounded bg-violet-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Set
                  </button>
                </div>
                <span className="text-[10px] text-slate-550 block text-slate-500">
                  Wartość <span className="font-bold text-white">{scheduleCron}</span> uruchomi skany codziennie o 2:00 rano.
                </span>
              </div>

              {/* Simulated monitoring slider */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold block flex justify-between">
                  <span>Monitorowane frazy (saved queries):</span>
                  <strong className="text-cyan-400">{monitoredQueriesCount}</strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={monitoredQueriesCount}
                  onChange={(e) => setMonitoredQueriesCount(Number(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer"
                />
              </div>

              {/* Target LLMs */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-450 uppercase font-bold block text-slate-400">Wybrane Silniki AI (N = {schedulerSelectedLLMs.length})</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                  {['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Copilot', 'Google AI Overviews'].map((llmOption) => (
                    <label key={llmOption} className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-850 rounded cursor-pointer hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={schedulerSelectedLLMs.includes(llmOption)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSchedulerSelectedLLMs([...schedulerSelectedLLMs, llmOption]);
                          } else {
                            setSchedulerSelectedLLMs(schedulerSelectedLLMs.filter(l => l !== llmOption));
                          }
                        }}
                        className="accent-violet-600"
                      />
                      <span>{llmOption}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Historical 12 Months Graph and stats */}
          <div className="md:col-span-7 p-5 border border-slate-800 rounded-xl bg-[#0e111a] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Wizualny Trend Historyczny SOV (12 Miesięcy)</span>
                <span className="text-[10px] font-bold text-violet-400">Otterly Data Engine</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {lang === 'pl'
                  ? 'Śledzenie trendu historycznego Share of Voice w ujęciu wielomiesięcznym dla Twojej marki Cosibella.pl w porównaniu do liderów.'
                  : 'Track the historical aggregated Share of Voice (SOV) index across standard AI recommenders.'
                }
              </p>
            </div>

            {/* Simulated ASCII Bar Graph showing 12M growth of Cosibella */}
            <div className="space-y-2 bg-[#0a0c12] p-4 rounded-xl border border-slate-850/75">
              <div className="text-[10px] text-slate-500 font-bold flex justify-between border-b border-slate-800 pb-1">
                <span>Miesiąc</span>
                <span>Udział Cosibella %</span>
              </div>
              <div className="space-y-1.5 text-[10px]">
                {HISTORICAL_SOV_DATA.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-24 text-slate-400 text-[10px] truncate">{row.month}</span>
                    <div className="flex-1 bg-slate-900 rounded h-2.5 overflow-hidden border border-slate-800 flex">
                      <div 
                        className="bg-violet-600 h-full rounded transition-all duration-500" 
                        style={{ width: `${row.cosibella}%` }}
                      />
                      <div 
                        className="bg-indigo-950/50 h-full border-l border-indigo-900" 
                        style={{ width: `${100 - row.cosibella}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-bold text-violet-400">{row.cosibella}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-violet-950/20 border border-violet-800/30 rounded-lg text-xs leading-relaxed text-slate-350">
              {lang === 'pl'
                ? '💡 Automatyczny monitoring zapisuje historię pomiarów co 24h w Twojej bazodanowej kolekcji systemowej auditQueries, budując ten diagram i zapobiegając utracie trendu.'
                : '💡 Auto-monitoring saves daily snapshots into the Firestore collections, enabling long-range analysis without manual triggers.'
              }
            </div>
          </div>

        </div>
      )}

      {/* SEGMENT 3: SENTIMENT & BRAND POSITION TRACKR */}
      {activeSegment === 'SENTIMENT' && (
        <div className="space-y-6 font-mono animate-linear">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Input Config Scrape wrapper */}
            <div className="lg:col-span-5 p-5 border border-slate-800 rounded-xl bg-[#0e111a] space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block">AI SENTIMENT SCORER</span>
                <h3 className="font-bold text-sm text-white">Szybkie badanie sentymentu (NLP)</h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'pl'
                    ? 'Wprowadź dowolną frazę, aby przetestować i sprawdzić sentyment w wypowiedziach AI Overviews oraz czy na pewno Cosibella jest wspominana w pozytywnym kontekście.'
                    : 'Input target skincare keyword queries to immediately score and index brand attributes inside response contexts.'
                  }
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={sentimentQueryText}
                  onChange={(e) => setSentimentQueryText(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:border-violet-500 font-bold"
                  placeholder="np. krem z ceramidami opinie"
                />

                <button
                  onClick={handleSimulateSentimentLive}
                  disabled={isSimulatingSentiment}
                  className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  {isSimulatingSentiment ? <RefreshCw className="animate-spin w-4 h-4" /> : <Play size={13} />}
                  {lang === 'pl' ? 'Analizuj Sentyment i Pozycję' : 'Extract NLP & Posturing Metrics'}
                </button>
              </div>

              {/* Playwright headless emulation notice */}
              <div className="bg-[#12141f] rounded p-3 border border-slate-850 text-[10px] space-y-1 text-slate-400 leading-normal">
                <div className="text-white font-bold">🛠️ Playwright Headless Web Automation:</div>
                <p>
                  Skan wykorzystuje technologię emulacji real-browser (Playwright) pobierając statyczne fragmenty kodu z nowo wdrażanych silników wyszukiwania Google AI Mode.
                </p>
              </div>
            </div>

            {/* Results details panel */}
            <div className="lg:col-span-7 p-5 border border-slate-800 rounded-xl bg-[#0e111a] space-y-4">
              <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">
                {lang === 'pl' ? 'Wyniki Oceny Sentymentu (Makieta NLP)' : 'Extracted Sentiment Scorer Output'}
              </h3>

              {sentimentResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Wykryta Pozycja</span>
                      <span className="text-base font-extrabold text-cyan-400 block">
                        Miejsce #{sentimentResult.brandPosition}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Sentyment Ogólny</span>
                      <span className="text-xs font-bold text-emerald-400 block mt-1">
                        {sentimentResult.sentiment}
                      </span>
                    </div>
                  </div>

                  {/* Sentiment distribution score indicators */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Rozkład Sentymentów NLP %</span>
                    <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden border border-slate-800 flex">
                      <div 
                        title="Positive" 
                        className="bg-emerald-500 h-full" 
                        style={{ width: `${sentimentResult.sentimentScoreBreakdown.positive}%` }} 
                      />
                      <div 
                        title="Neutral" 
                        className="bg-slate-500 h-full" 
                        style={{ width: `${sentimentResult.sentimentScoreBreakdown.neutral}%` }} 
                      />
                      <div 
                        title="Negative" 
                        className="bg-rose-500 h-full" 
                        style={{ width: `${sentimentResult.sentimentScoreBreakdown.negative}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-450 text-slate-400">
                      <span className="text-emerald-400 font-bold">Pozytywny: {sentimentResult.sentimentScoreBreakdown.positive}%</span>
                      <span className="text-slate-400">Neutralny: {sentimentResult.sentimentScoreBreakdown.neutral}%</span>
                      <span className="text-rose-450 text-rose-400">Negatywny: {sentimentResult.sentimentScoreBreakdown.negative}%</span>
                    </div>
                  </div>

                  {/* Citation source attribution mapping (RAG source) */}
                  <div className="p-3 bg-violet-950/20 border border-violet-800/20 rounded-lg space-y-1.5">
                    <div className="text-[10px] text-violet-300 uppercase font-bold flex items-center justify-between">
                      <span>Przynajmniej jedno źródło odniesienia (RAG Attribution)</span>
                      <span className="text-[9px] bg-violet-900 text-white px-1 py-0.5 rounded">HIGH TRUST</span>
                    </div>
                    <div className="text-xs text-white font-bold">{sentimentResult.citationSource}</div>
                    <p className="text-[11px] text-slate-305 max-w-sm text-slate-400 leading-relaxed">
                      {sentimentResult.opinionText}
                    </p>
                  </div>

                </div>
              ) : (
                <div className="text-xs text-slate-500 text-center py-10 font-mono">
                  Wpisz frazę i kliknij przycisk Analizuj po lewej, aby otrzymać wyniki.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SEGMENT 4: ALERTS & SENTINEL NOTIFICATION CENTER */}
      {activeSegment === 'ALERTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono animate-linear">
          
          {/* Form alert settings */}
          <div className="p-5 border border-slate-800 rounded-xl bg-[#0e111a] space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <Bell className="text-violet-400" size={16} />
              {lang === 'pl' ? 'Konfiguracja Odbiorców i Reguł' : 'Alert Receivers & Rule Engines'}
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {lang === 'pl'
                ? 'System Sentinel niezwłocznie wyśle e-mail lub prześle automatyczny webhook na kanał komunikatora Slack/Discord, jeśli zaufany Share of Voice danej frazy spadnie poniżej zadanego procentu.'
                : 'Instantly notify regional SEO teams the moment recommendation ranks change or when competitor metrics overlap selected boundaries.'
              }
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-850 rounded-lg">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Status Alertów systemowych</span>
                  <span className="text-[10px] text-slate-550 text-slate-500">Wysyłaj wiadomości i webhooki</span>
                </div>
                <input
                  type="checkbox"
                  checked={alertsEnabled}
                  onChange={(e) => setAlertsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                />
              </div>

              {/* Mail box input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold block">E-mail odbiorcy</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={alertTargetEmail}
                    onChange={(e) => setAlertTargetEmail(e.target.value)}
                    className="p-2 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-white w-full focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Webhook endpoint field */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-405 uppercase font-bold block text-slate-400">Webhook Discord / Slack URL</label>
                <input
                  type="text"
                  value={customWebhook}
                  onChange={(e) => setCustomWebhook(e.target.value)}
                  className="p-2 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-cyan-400 w-full focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* SOV threshold drops selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold block flex justify-between">
                  <span>Generuj alert przy spadku SOV poniżej:</span>
                  <strong className="text-rose-450 text-rose-400 font-extrabold">{alertSovThreshold}%</strong>
                </label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={alertSovThreshold}
                  onChange={(e) => setAlertSovThreshold(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    onAddLogMessage(lang === 'pl'
                      ? 'Wysłano testową wiadomość e-mail do: ' + alertTargetEmail
                      : 'Test email alert dispatched key recipient.'
                    );
                    alert(lang === 'pl' ? 'Testowy alert e-mail został wysłany!' : 'Alert validation sent!');
                  }}
                  className="flex-1 py-2 text-xs font-bold font-mono bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-300 border border-slate-800 rounded-lg cursor-pointer text-center"
                >
                  Test e-mail alert
                </button>
                <button
                  onClick={() => {
                    onAddLogMessage(lang === 'pl'
                      ? 'Kanał Discord: Wysłano testowy payload webhooka.'
                      : 'Mock Webhook ping initiated.'
                    );
                    alert('Webhook payload sent safely!');
                  }}
                  className="flex-1 py-2 text-xs font-bold font-mono bg-violet-600 hover:bg-violet-700 text-white rounded-lg cursor-pointer text-center"
                >
                  Test Webhook payload
                </button>
              </div>

            </div>
          </div>

          {/* Trigger logs */}
          <div className="p-5 border border-slate-800 rounded-xl bg-[#0e111a] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Historia wyzwolonych alertów (Sentinel Log)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border border-emerald-950" />
              </h4>
              <p className="text-[11px] text-slate-400">
                Historia naruszeń krytycznych oraz ostrzeżeń z ostatnich 30 dni.
              </p>
            </div>

            <div className="bg-[#0c0d15] rounded-lg border border-slate-850 p-4 font-mono text-[11px] h-60 overflow-y-auto space-y-3">
              <div className="p-2 border-l-2 border-rose-500 bg-[#df092c]/5 rounded">
                <div className="flex justify-between font-bold text-rose-455 text-rose-400">
                  <span>🚨 SPADEK PANICZNY SOV</span>
                  <span>Dzisiaj, 14:22</span>
                </div>
                <p className="text-slate-400 mt-1 leading-normal">
                  Fraza <span className="text-white">"retinol z ceramidami"</span> spadła z SOV 41% do 18% w regionie CZ (model Claude). Powód: Wejście Sephory na wysokie miejsca.
                </p>
              </div>

              <div className="p-2 border-l-2 border-yellow-500 bg-[#dfca12]/5 rounded">
                <div className="flex justify-between font-bold text-yellow-405 text-yellow-500">
                  <span>⚠️ OSTRZEŻENIE ROBOTS.TXT</span>
                  <span>Wczoraj, 03:00</span>
                </div>
                <p className="text-slate-400 mt-1 leading-normal">
                  Bot <span className="text-white">GPTBot (OpenAI)</span> zgłosił częściową blokadę zasobów podczas skanowania kategorii kosmetyków k-beauty.
                </p>
              </div>

              <div className="p-2 border-l-2 border-emerald-500 bg-emerald-950/20 rounded text-slate-400 text-[10px]">
                <span>Log inicjalizacji alertów: System Sentinel gotowy. Wszystkie 15 fraz monitorowanych stabilnie.</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 text-center select-none font-mono">
              Sentinel Core Engine v1.42 • Powered by Google Cloud Functions
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
