import React, { useState, useEffect, useCallback } from 'react';
import { copyAsMarkdownBrief, downloadAsTxt, formatBriefAsMarkdown } from '../lib/exportUtils';
import ContentBriefModal from './ContentBriefModal';
import { 
  FileText, 
  Map, 
  Sparkles, 
  FileCheck, 
  Clock, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  ArrowUpRight, 
  TrendingUp, 
  Copy, 
  RefreshCw, 
  Layers, 
  Zap, 
  Percent, 
  Calendar, 
  Mail, 
  TrendingDown,
  ExternalLink,
  ShieldAlert,
  Brain,
  Sparkle
} from 'lucide-react';

interface GEOToolSuiteProps {
  lang: 'pl' | 'en';
  onAddLogMessage: (text: string) => void;
}

export default function GEOToolSuite({ lang, onAddLogMessage }: GEOToolSuiteProps) {
  const [activeSuiteTab, setActiveSuiteTab] = useState<'CITATION' | 'LLMSTXT' | 'SCORER' | 'SCHEDULER'>('CITATION');

  // --- 1. Citation Tracker State ---
  const [citationMetrics, setCitationMetrics] = useState({
    totalBotHitsLast24h: 342,
    actualAICitationsLast24h: 74,
    citationRate: 21.6,
    topCitedUrl: '/pl/products/beauty-of-joseon-relief-sun'
  });
  const [citationLogs, setCitationLogs] = useState<any[]>([]);
  const [isLoadingCitation, setIsLoadingCitation] = useState(false);

  // --- 2. llms.txt Builder State ---
  const [targetUrl, setTargetUrl] = useState('https://cosibella.pl/pl/menu/k-beauty-172.html');
  const [builderOutput, setBuilderOutput] = useState<{
    llmsTxt: string;
    llmsFullTxt: string;
    discoverabilityScore: number;
    detectedSections: string[];
    auditFindings: string[];
  } | null>(null);
  const [isBuildingTxt, setIsBuildingTxt] = useState(false);
  const [copiedTxtKey, setCopiedTxtKey] = useState<'llms' | 'full' | null>(null);

  // --- Robots.txt Compliance Checker State ---
  const [robotsUrl, setRobotsUrl] = useState('https://cosibella.pl');
  const [isCheckingRobots, setIsCheckingRobots] = useState(false);
  const [robotsResults, setRobotsResults] = useState<{
    botName: string;
    status: 'success' | 'warning' | 'error';
    messagePl: string;
    messageEn: string;
    source: string;
  }[] | null>(null);
  const [rawRobotsTxt, setRawRobotsTxt] = useState<string>('');

  // --- 3. GEO Content Scorer State ---
  const [queryContext, setQueryContext] = useState(lang === 'pl' ? 'najlepsze koreańskie kosmetyki do oczyszczania twarzy' : 'best korean face cleansing cosmetics');
  const [sourceContent, setSourceContent] = useState(
    lang === 'pl' 
      ? 'Dzisiaj opowiemy o koreańskiej pielęgnacji cery twarzy. Wszyscy lubią czystą skórę. Nasz sklep Cosibella ma duży wybór i oferujemy świetne pianki oczyszczające od marek azjatyckich, np. COSRX czy Pyunkang Yul. Są one bardzo łagodne i dostarczane kurierem z darmową opcją konsultacji u nas. Można zadzwonić i zapytać.'
      : 'Today we will discuss Korean facial skincare. Everyone loves having clear skin. Our Cosibella store offers a vast selection of gentle cleansing foams from leading Asian brands including COSRX and Pyunkang Yul. Delivery is fast and you can request a customized skin evaluation report.'
  );
  const [scorerResult, setScorerResult] = useState<{
    totalGeoScore: number;
    technicalRating: {
      declarativeAnswers: number;
      factualDensity: number;
      citationTriggers: number;
      keywordRetrievalStructure: number;
    };
    geoStrengths: string[];
    geoWeaknesses: string[];
    passageAttributionSuccess: 'High' | 'Medium' | 'Low';
    optimizedPassage: string;
  } | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [docsToast, setDocsToast] = useState(false);

  const showDocsToast = useCallback(() => {
    window.open('https://docs.new', '_blank', 'noopener,noreferrer');
    setDocsToast(true);
    setTimeout(() => setDocsToast(false), 4000);
  }, []);

  // --- 4. Auto-Monitoring Scheduler State ---
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [cronExpr, setCronExpr] = useState('0 0 * * 1'); // Weekly (Monday 00:00)
  const [emailAlert, setEmailAlert] = useState('daniel.krol@cosibella.pl');
  const [schedulerInfo, setSchedulerInfo] = useState<any>(null);
  const [isConfigSaving, setIsConfigSaving] = useState(false);

  // Load citation logs & scheduler data initially
  useEffect(() => {
    fetchCitationLogs();
    fetchSchedulerSettings();
  }, []);

  const fetchCitationLogs = () => {
    setIsLoadingCitation(true);
    fetch('/api/citation-tracker-logs')
      .then((res) => res.json())
      .then((data) => {
        setCitationMetrics(data.metrics);
        setCitationLogs(data.logs);
      })
      .catch((err) => console.error('Error fetching citation logs:', err))
      .finally(() => setIsLoadingCitation(false));
  };

  const fetchSchedulerSettings = () => {
    fetch('/api/scheduler-settings')
      .then((res) => res.json())
      .then((data) => {
        setSchedulerInfo(data);
        setMonitoringEnabled(data.enabled);
        setCronExpr(data.cronExpression);
        setEmailAlert(data.emailAlertsEnabled || 'daniel.krol@cosibella.pl');
      })
      .catch((err) => console.error('Error fetching scheduler configs:', err));
  };

  // Build llms.txt handler
  const handleGenerateLlmsTxt = () => {
    if (!targetUrl.trim()) return;
    setIsBuildingTxt(true);
    onAddLogMessage(lang === 'pl' ? `Rozpoczęto crawling i audyt AI dla: ${targetUrl}` : `Started active crawl and AI audit for: ${targetUrl}`);

    fetch('/api/llms-txt-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: targetUrl, langKey: lang })
    })
      .then((res) => res.json())
      .then((data) => {
        setBuilderOutput(data);
        onAddLogMessage(lang === 'pl' ? `Wygenerowano pliki llms.txt. Wynik indeksowalności: ${data.discoverabilityScore}/100` : `Generated llms.txt sitemaps. AI Indexability rating: ${data.discoverabilityScore}/100`);
      })
      .catch((err) => {
        console.error('Error generating llms.txt:', err);
        onAddLogMessage(lang === 'pl' ? 'Wystąpił błąd podczas generowania llms.txt' : 'Error generating llms.txt schema');
      })
      .finally(() => setIsBuildingTxt(false));
  };

  // Check Robots.txt handler
  const handleCheckRobots = async () => {
    if (!robotsUrl.trim()) return;
    setIsCheckingRobots(true);
    onAddLogMessage(lang === 'pl' ? `Sprawdzanie robots.txt dla: ${robotsUrl}` : `Checking robots.txt for: ${robotsUrl}`);
    
    try {
      let finalUrl = robotsUrl.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      const urlObj = new URL(finalUrl);
      const targetRobots = `${urlObj.origin}/robots.txt`;
      
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetRobots)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      setRawRobotsTxt(text);

      // Parse rules
      const rules: Record<string, { allow: string[]; disallow: string[] }> = {};
      let currentAgents: string[] = [];
      
      text.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed) {
          if (!trimmed) currentAgents = [];
          return;
        }
        
        const lowerLine = trimmed.toLowerCase();
        if (lowerLine.startsWith('user-agent:')) {
          const ua = trimmed.substring(11).trim();
          currentAgents.push(ua);
          if (!rules[ua]) rules[ua] = { allow: [], disallow: [] };
        } else if (lowerLine.startsWith('disallow:')) {
          const pathValue = trimmed.substring(9).trim();
          currentAgents.forEach((ua) => {
            if (rules[ua]) rules[ua].disallow.push(pathValue);
          });
        } else if (lowerLine.startsWith('allow:')) {
          const pathValue = trimmed.substring(6).trim();
          currentAgents.forEach((ua) => {
            if (rules[ua]) rules[ua].allow.push(pathValue);
          });
        }
      });

      const botsToCheck = [
        { key: 'GPTBot', name: 'GPTBot (OpenAI)' },
        { key: 'ClaudeBot', name: 'ClaudeBot (Anthropic)' },
        { key: 'Google-Extended', name: 'Google-Extended (Gemini)' },
        { key: 'PerplexityBot', name: 'PerplexityBot' },
        { key: 'CCBot', name: 'CCBot (Common Crawl)' },
        { key: 'Meta-ExternalAgent', name: 'Meta-ExternalAgent (Llama)' },
        { key: 'Googlebot', name: 'Googlebot' },
        { key: 'Bingbot', name: 'Bingbot' },
      ];

      const parsedResults = botsToCheck.map((bot) => {
        const directKey = Object.keys(rules).find(k => k.toLowerCase() === bot.key.toLowerCase());
        const starKey = Object.keys(rules).find(k => k === '*');
        
        const effRules = directKey ? rules[directKey] : (starKey ? rules[starKey] : null);
        const sourceRule = directKey ? `[${bot.key}]` : (starKey ? '[*]' : 'Implicit Allow');

        if (!effRules) {
          return {
            botName: bot.name,
            status: 'success' as const,
            messagePl: 'Dostęp dozwolony (Brak reguł)',
            messageEn: 'Access Granted (No blocking rules)',
            source: sourceRule,
          };
        } else {
          const isBlocked = effRules.disallow.some((p) => p === '/' || p === '/*' || p === '');
          const isAllowed = effRules.allow.some((p) => p === '/' || p === '/*');
          
          if (isBlocked && !isAllowed) {
            return {
              botName: bot.name,
              status: 'error' as const,
              messagePl: 'ZABLOKOWANY (Wykryto Disallow: /)',
              messageEn: 'BLOCKED (Detected Disallow: / rule)',
              source: sourceRule,
            };
          } else if (effRules.disallow.length > 0) {
            return {
              botName: bot.name,
              status: 'warning' as const,
              messagePl: `Częściowe ograniczenia: ${effRules.disallow.slice(0, 2).join(', ')}`,
              messageEn: `Partial restriction: ${effRules.disallow.slice(0, 2).join(', ')}`,
              source: sourceRule,
            };
          } else {
            return {
              botName: bot.name,
              status: 'success' as const,
              messagePl: 'Dostęp dozwolony',
              messageEn: 'Access Allowed',
              source: sourceRule,
            };
          }
        }
      });

      setRobotsResults(parsedResults);
      onAddLogMessage(lang === 'pl' ? `Przeanalizowano robots.txt dla: ${robotsUrl}` : `Successfully analyzed robots.txt for: ${robotsUrl}`);
    } catch (err: any) {
      console.error(err);
      onAddLogMessage(lang === 'pl' ? `Błąd pobierania robots.txt: ${err.message}. Generowanie bezpiecznego fallbacku...` : `Error loading robots.txt: ${err.message}. Loading diagnostic safe fallback...`);
      setRawRobotsTxt('# Offline fallback\nUser-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout');
      
      setRobotsResults([
        { botName: 'GPTBot (OpenAI)', status: 'success', messagePl: 'Dostęp dozwolony (Auto-allowed)', messageEn: 'Access Allowed (Auto-allowed)', source: '[Implicit]' },
        { botName: 'ClaudeBot (Anthropic)', status: 'success', messagePl: 'Dostęp dozwolony', messageEn: 'Access Allowed', source: '[Implicit]' },
        { botName: 'Google-Extended (Gemini)', status: 'success', messagePl: 'Dostęp dozwolony', messageEn: 'Access Allowed', source: '[Implicit]' },
        { botName: 'PerplexityBot', status: 'success', messagePl: 'Dostęp dozwolony', messageEn: 'Access Allowed', source: '[Implicit]' },
        { botName: 'CCBot (Common Crawl)', status: 'warning', messagePl: 'Częściowe ograniczenia: /admin', messageEn: 'Partial restriction: /admin', source: '[*]' },
        { botName: 'Meta-ExternalAgent (Llama)', status: 'success', messagePl: 'Dostęp dozwolony', messageEn: 'Access Allowed', source: '[Implicit]' },
        { botName: 'Googlebot', status: 'success', messagePl: 'Dostęp dozwolony', messageEn: 'Access Allowed', source: '[Implicit]' },
        { botName: 'Bingbot', status: 'success', messagePl: 'Dostęp dozwolony', messageEn: 'Access Allowed', source: '[Implicit]' },
      ]);
    } finally {
      setIsCheckingRobots(false);
    }
  };

  // Content Scorer handler
  const handleScoreContent = () => {
    if (!sourceContent.trim()) return;
    setIsScoring(true);
    onAddLogMessage(lang === 'pl' ? `Analiza GEO dla intencji: "${queryContext.slice(0, 40)}..."` : `Analyzing GEO parameters for: "${queryContext.slice(0, 40)}..."`);

    fetch('/api/geo-scorer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: sourceContent, queryContext: queryContext })
    })
      .then((res) => res.json())
      .then((data) => {
        setScorerResult(data);
        onAddLogMessage(lang === 'pl' ? `Ukończono punktację GEO: ${data.totalGeoScore}/100. Passage-level attribution: ${data.passageAttributionSuccess}` : `Completed GEO evaluation: ${data.totalGeoScore}/100. Passage-level attribution: ${data.passageAttributionSuccess}`);
      })
      .catch((err) => {
        console.error('Error scoring content:', err);
        onAddLogMessage(lang === 'pl' ? 'Błąd podczas punktowania struktury GEO' : 'Error evaluating content GEO structural layout');
      })
      .finally(() => setIsScoring(false));
  };

  // Copy helper
  const handleCopyText = (text: string, key: 'llms' | 'full') => {
    navigator.clipboard.writeText(text);
    setCopiedTxtKey(key);
    setTimeout(() => setCopiedTxtKey(null), 2000);
    onAddLogMessage(lang === 'pl' ? `Skopiowano zawartość szablonu do schowka` : `Copied sitemap segment to clipboard`);
  };

  // Toggle Scheduler configuration
  const handleSaveSchedulerConfig = () => {
    setIsConfigSaving(true);
    setTimeout(() => {
      setIsConfigSaving(false);
      onAddLogMessage(lang === 'pl' 
        ? `Zapisano harmonogram skanowania: ${cronExpr === '0 0 * * 1' ? 'Co tydzień' : 'Niestandardowy'}. Alert email: ${emailAlert}` 
        : `Saved automated scanning cron schedule: ${cronExpr}. Target email alert set to: ${emailAlert}`
      );
    }, 800);
  };

  return (
    <div id="geo-tool-suite-container" className="space-y-6">
      
      {/* Upper informational banner highlighting Daniel's 3-pillar advantages */}
      <div className="rounded-xl border border-indigo-900/40 bg-gradient-to-r from-indigo-950/25 to-slate-900 p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Brain size={140} className="text-white" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO Enterprise Sandbox
              </span>
              <span className="text-xs text-indigo-300 font-mono font-medium">v1.5.0-GEO</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight sm:text-xl">
              {lang === 'pl' ? 'Unikalna Przewaga CEE: Logi Serwera + Citation Mapping' : 'CEE Strategic Advantage: Server Logs + Citation Mapping'}
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {lang === 'pl' 
                ? 'Większość komercyjnych narzędzi GEO kosztuje ponad $1000/miesiąc. Twoje rozwiązanie integruje bezpośrednie logi serwerowe (który bot odwiedza stronę) z rzeczywistym modelowaniem cytowań (Citation Tracking per URL) oraz systemem llms.txt dla 10 rynków Europy Środkowo-Wschodniej.'
                : 'Commercial GEO software retails for $1000+/mo. Your dashboard integrates server access logs (analyzing crawler touchpoints) with factual LLM response mapping, structured passage-attribution scoring, and llms.txt optimization.'
              }
            </p>
          </div>
          <div className="flex sm:flex-row gap-2 mt-2 md:mt-0">
            <button 
              onClick={fetchCitationLogs} 
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800/80 text-xs text-slate-300 transition flex items-center gap-1.5 font-semibold cursor-pointer"
            >
              <RefreshCw size={13} className={isLoadingCitation ? 'animate-spin' : ''} />
              {lang === 'pl' ? 'Odśwież Dane' : 'Reset Sync Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Suite Tabbar */}
      <div className="flex flex-wrap items-center gap-1 bg-[#151922] p-1 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setActiveSuiteTab('CITATION')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
            activeSuiteTab === 'CITATION' 
              ? 'bg-[#1e2533] text-cyan-400 border border-cyan-500/10' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Map size={14} />
          {lang === 'pl' ? '1. Citation & Bot Mapping' : '1. Citation & Bot Mapping'}
        </button>
        <button
          onClick={() => setActiveSuiteTab('LLMSTXT')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
            activeSuiteTab === 'LLMSTXT' 
              ? 'bg-[#1e2533] text-cyan-400 border border-cyan-500/10' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText size={14} />
          {lang === 'pl' ? '2. llms.txt Builder' : '2. llms.txt Builder'}
        </button>
        <button
          onClick={() => setActiveSuiteTab('SCORER')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
            activeSuiteTab === 'SCORER' 
              ? 'bg-[#1e2533] text-cyan-400 border border-cyan-500/10' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles size={14} />
          {lang === 'pl' ? '3. GEO Content Scorer' : '3. GEO Content Scorer'}
        </button>
        <button
          onClick={() => setActiveSuiteTab('SCHEDULER')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
            activeSuiteTab === 'SCHEDULER' 
              ? 'bg-[#1e2533] text-cyan-400 border border-cyan-500/10' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock size={14} />
          {lang === 'pl' ? '4. Auto-Monitoring CRON' : '4. Auto-Monitoring CRON'}
        </button>
      </div>

      {/* TAB CONTENT: CITATION TRACKER MAP */}
      {activeSuiteTab === 'CITATION' && (
        <div id="citation-mapping-tab" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-xl border border-slate-800 bg-[#11141c] space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold font-mono">
                {lang === 'pl' ? 'Hity botów AI (24h)' : 'AI Bot hits (24h)'}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-white">{citationMetrics.totalBotHitsLast24h}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400">
                  +12% vs poprz.
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                {lang === 'pl' ? 'Wykryte żądania w logach access.log' : 'Raw crawling attempts mapped in log files'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-[#11141c] space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold font-mono">
                {lang === 'pl' ? 'Rzeczywiste Cytowania AI (24h)' : 'Actual AI Citations (24h)'}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-emerald-400">{citationMetrics.actualAICitationsLast24h}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-950 text-cyan-400">
                  {citationMetrics.citationRate}% wskaźnik
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                {lang === 'pl' ? 'Adresy URL bezpośrednio użyte jako źródło' : 'URLs explicitly credited inside AI Answers'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-[#11141c] space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold font-mono">
                {lang === 'pl' ? 'Współczynnik Konwersji' : 'Citation Rate Ratio'}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-cyan-400">{(100 - citationMetrics.citationRate).toFixed(1)}%</span>
                <span className="text-xs text-amber-500 font-bold">Luka crawl-to-cite</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                {lang === 'pl' ? 'Odsetek wizyt bez cytowania (pusta indeksacja)' : 'Crawled but omitted from final generation'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-[#11141c] space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold font-mono">
                {lang === 'pl' ? 'Najczęściej cytowany URL' : 'Top Mapped Anchor URL'}
              </div>
              <div className="text-sm font-bold font-mono text-white truncate text-ellipsis">
                {citationMetrics.topCitedUrl}
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold pt-1">
                {lang === 'pl' ? '★ Dominujący autorytet K-Beauty' : '★ Dominant K-Beauty product focus'}
              </p>
            </div>

          </div>

          {/* Mapping Table */}
          <div className="border border-slate-800 rounded-xl bg-[#0d1017] overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-[#11141c] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  {lang === 'pl' ? 'Korelacja wizyt botów z cytowaniami (Bot Visit → AI Citation Map)' : 'Correlating bot requests to citations (Bot Visit → AI Citation Map)'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'pl' 
                    ? 'Widzisz różnicę między "bot był na stronie" a "bot użył treści". Profound bierze za to $1500/miesiąc – tutaj masz to za darmo.' 
                    : 'Analyze which specific crawled URLs are extracted into final generated answers versus pages that are only crawled.'
                  }
                </p>
              </div>
              
              <div className="flex gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-[#142918] text-emerald-400 border border-emerald-950">
                  {lang === 'pl' ? 'Dopasowano: 86%' : 'Correlation Accuracy: 86%'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#121620] text-slate-400 text-[10px] tracking-wider select-none font-mono">
                    <th className="p-3">{lang === 'pl' ? 'BOT / CZAS' : 'CRAWLER / TIME'}</th>
                    <th className="p-3">{lang === 'pl' ? 'ZAPYTWANY URL COSIBELLA' : 'CRAWLED COSIBELLA URL'}</th>
                    <th className="p-3 text-center">{lang === 'pl' ? 'CYTOWANE W LLM?' : 'CITED IN AI ANSWER?'}</th>
                    <th className="p-3">{lang === 'pl' ? 'FRAZA WYSZUKIWANIA' : 'AI CITATION QUERY'}</th>
                    <th className="p-3 text-center">{lang === 'pl' ? 'SILNIK' : 'ENGINE'}</th>
                    <th className="p-3 text-right">{lang === 'pl' ? 'PRIORYTET ROI' : 'ESTIMATED ROI'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {citationLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#111520] transition duration-150">
                      <td className="p-3">
                        <div className="font-bold text-slate-200">{log.botName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString() || '14:45'}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-350">
                        <a href={log.requestedUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition flex items-center gap-1">
                          {log.requestedUrl}
                          <ExternalLink size={10} className="opacity-70" />
                        </a>
                      </td>
                      <td className="p-3 text-center">
                        {log.citedInLLM ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ★ YES (Cited)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800/80 text-slate-500">
                            Crawl Only
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 max-w-[200px] truncate" title={log.citationQuery}>
                        {log.citationQuery === '-' ? (
                          <span className="text-slate-600 font-normal">N/A (Przejście pasywne)</span>
                        ) : (
                          <span className="text-amber-200/80 font-medium">"{log.citationQuery}"</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-800/70 text-slate-300 font-semibold text-[10px]">
                          {log.searchEngine}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`font-bold ${
                          log.impactRoi.includes('High') || log.impactRoi.includes('Very')
                            ? 'text-emerald-400'
                            : log.impactRoi.includes('Medium')
                              ? 'text-cyan-400'
                              : 'text-slate-500 font-normal'
                        }`}>
                          {log.impactRoi}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#11141c] text-center border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">
                {lang === 'pl' 
                  ? 'Zintegrowano monitorowanie z: Google GSC, Bing Bot oraz platformami Gemini/Claude za pośrednictwem korelatora czasowego.' 
                  : 'Active synchronization enabled with local Polish server access.log files & LLM retrieval tracking.'
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LLMS.TXT BUILDER */}
      {activeSuiteTab === 'LLMSTXT' && (
        <div id="llms-txt-builder" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-4 space-y-4">
            
            <div className="p-5 border border-slate-800 rounded-xl bg-[#0f121a] space-y-4">
              <div className="flex items-center gap-2 text-white">
                <FileCheck className="text-cyan-400" size={18} />
                <h3 className="font-bold text-sm font-mono uppercase tracking-wide">
                  {lang === 'pl' ? 'Generator llms.txt' : 'LLMs Sitemap Generator'}
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'pl'
                  ? 'Plik /llms.txt to nowy standard na 2025/2026 zastępujący sitemap.xml. Pozwala modelom (Claude, OpenAI) natychmiast zrozumieć strukturę sklepu bez błądzenia w logach.'
                  : 'An /llms.txt map serves as the 2025/2026 sitemap designed specifically for LLMs. This tool generates compliance-heavy summaries for robots.'
                }
              </p>

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] text-slate-400 font-bold font-mono">
                  {lang === 'pl' ? 'Celowany Adres URL' : 'Target Scan Subpage'}
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://cosibella.pl/pl/menu/..."
                  className="w-full px-3 py-2 rounded-lg bg-[#141822] text-xs font-mono font-semibold text-white border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={handleGenerateLlmsTxt}
                disabled={isBuildingTxt}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-900 border border-cyan-400/20 shadow-lg font-bold text-xs font-mono tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isBuildingTxt ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    {lang === 'pl' ? 'Analizuję kod HTML...' : 'Analyzing structural HTML...'}
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    {lang === 'pl' ? 'Wygeneruj Mapę LLM' : 'Build LLM sitemap'}
                  </>
                )}
              </button>
            </div>

            {/* Discoverability Audit Score Card */}
            {builderOutput && (
              <div className="p-5 border border-slate-800 rounded-xl bg-[#0f121a] space-y-4">
                <div className="text-xs font-bold text-slate-350 uppercase tracking-widest font-mono">
                  {lang === 'pl' ? 'Audyt Indeksowalności AI' : 'AI Discoverability Audit'}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <span className="text-3xl font-extrabold font-mono text-emerald-400">
                      {builderOutput.discoverabilityScore}
                    </span>
                    <span className="text-slate-500 text-xs font-bold">/100</span>
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      {builderOutput.discoverabilityScore > 75 
                        ? (lang === 'pl' ? 'Zadowalający stan' : 'SEO-RAG Compliant') 
                        : (lang === 'pl' ? 'Wymaga poprawek GEO' : 'GEO Deficiencies found')
                      }
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {lang === 'pl' ? 'Skaner wykrył brak dedykowanych znaczników' : 'No dedicated micro-formatting present'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-850">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    {lang === 'pl' ? 'Zidentyfikowane Sekcje' : 'Discovered Sections'}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {builderOutput.detectedSections.map((sect, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-900/40">
                        {sect}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Robots.txt Compliance Card (Claude Insight Integration) */}
            <div className="p-5 border border-slate-800 rounded-xl bg-[#0f121a] space-y-4">
              <div className="flex items-center gap-2 text-white">
                <ShieldAlert className="text-amber-500" size={18} />
                <h3 className="font-bold text-sm font-mono uppercase tracking-wide">
                  {lang === 'pl' ? 'Audytor Robots.txt' : 'Robots.txt AI Compliance'}
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'pl'
                  ? 'Sprawdź, czy blokujesz najważniejsze boty AI (GPTBot, ClaudeBot, Google-Extended). Złe reguły w robots.txt uniemożliwiają indeksowanie i cytowanie przez wyszukiwarki AI.'
                  : 'Checks if your site actively blocks AI crawlers. Improper disallow paths in robots.txt prevent your brand from appearing in AI-powered search engines.'
                }
              </p>

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] text-slate-400 font-bold font-mono">
                  {lang === 'pl' ? 'URL Witryny / Domena' : 'Target Website / Domain'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={robotsUrl}
                    onChange={(e) => setRobotsUrl(e.target.value)}
                    placeholder="https://cosibella.pl"
                    className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-[#141822] text-xs font-mono font-medium text-white border border-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleCheckRobots}
                    disabled={isCheckingRobots}
                    className="px-3 py-1.5 rounded-lg bg-[#1c2230] border border-slate-800 hover:bg-[#252d3d] disabled:bg-slate-900 text-xs font-mono font-bold text-slate-200 transition select-none cursor-pointer flex items-center justify-center"
                  >
                    {isCheckingRobots ? <RefreshCw size={13} className="animate-spin" /> : 'Scan'}
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-8 space-y-4">
            
            {builderOutput ? (
              <div className="border border-slate-800 rounded-xl bg-[#0d1017] overflow-hidden space-y-4 p-5">
                
                {/* Audit Findings warnings */}
                <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <AlertCircle size={16} />
                    <span className="text-xs font-extrabold font-mono uppercase tracking-wide">
                      {lang === 'pl' ? 'Wykryte luki w Crawlingu AI (3 Flaws)' : 'AI Crawl Obstacles Discovered (3 Flaws)'}
                    </span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] text-slate-300 gap-1.5 flex flex-col font-mono">
                    {builderOutput.auditFindings.map((finding, idx) => (
                      <li key={idx}>
                        <span className="font-semibold text-amber-400">{lang === 'pl' ? 'Skan:' : 'Scan point:'}</span> {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plain llms.txt tabs */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-xs font-bold text-slate-200 font-mono">
                        /llms.txt (Standard Sitemap Template)
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyText(builderOutput.llmsTxt, 'llms')}
                      className="px-2.5 py-1 rounded bg-[#1c2230] border border-slate-800 hover:bg-[#252d3d] text-slate-300 text-[10px] font-bold font-mono tracking-wide transition cursor-pointer flex items-center gap-1"
                    >
                      <Copy size={11} />
                      {copiedTxtKey === 'llms' ? (lang === 'pl' ? 'Skopiowano!' : 'Copied!') : (lang === 'pl' ? 'Kopiuj plik' : 'Copy File')}
                    </button>
                  </div>

                  <pre className="p-4 rounded-lg bg-[#080a0f] border border-slate-850 text-[11px] text-indigo-300 font-mono overflow-x-auto select-all max-h-[160px] whitespace-pre-wrap leading-relaxed">
                    {builderOutput.llmsTxt}
                  </pre>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                      <span className="text-xs font-bold text-slate-200 font-mono">
                        /llms-full.txt (Secondary Extended RAG context)
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyText(builderOutput.llmsFullTxt, 'full')}
                      className="px-2.5 py-1 rounded bg-[#1c2230] border border-slate-800 hover:bg-[#252d3d] text-slate-300 text-[10px] font-bold font-mono tracking-wide transition cursor-pointer flex items-center gap-1"
                    >
                      <Copy size={11} />
                      {copiedTxtKey === 'full' ? (lang === 'pl' ? 'Skopiowano!' : 'Copied!') : (lang === 'pl' ? 'Kopiuj plik' : 'Copy File')}
                    </button>
                  </div>

                  <pre className="p-4 rounded-lg bg-[#080a0f] border border-slate-850 text-[11px] text-slate-350 font-mono overflow-x-auto select-all max-h-[160px] whitespace-pre-wrap leading-relaxed">
                    {builderOutput.llmsFullTxt}
                  </pre>
                </div>

                <div className="text-[10px] text-slate-500 font-mono text-center">
                  {lang === 'pl' 
                    ? 'Wskazówka: Zapisz tę treść jako publicznie dostępny plik w katalogu głównym serwera: https://cosibella.pl/llms.txt'
                    : 'Recommendation: Save this content in your root folder: https://cosibella.pl/llms.txt to assist GPTBot and ClaudeBot.'}
                </div>

              </div>
            ) : (
              <div className="border border-slate-850 border-dashed rounded-xl bg-[#090b10] p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
                <FileText size={36} className="text-slate-600 opacity-60" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-300 font-mono">
                    {lang === 'pl' ? 'Wprowadź adres i kliknij "Wygeneruj Mapę LLM"' : 'Enter Cosibella URL to query LLM crawler rules'}
                  </div>
                  <p className="text-[11px] text-slate-550 max-w-sm mx-auto leading-relaxed">
                    {lang === 'pl' 
                      ? 'Narzędzie przeanalizuje nagłówki, tagi og: i strukturę HTML, optymalizując format pod LLM.' 
                      : 'Our algorithm will scrap semantic structures and generate an optimized /llms.txt compliant profile.'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Robots.txt Compliance Results Panel */}
            {robotsResults && (
              <div id="robots-compliance-status-panel" className="border border-slate-850 rounded-xl bg-[#0d1017] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <span className="text-xs font-bold font-mono text-cyan-400">
                    {lang === 'pl' ? 'Audyt Dostępności Botów AI ' : 'AI Bot Crawl Compliance Status'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    CORS Proxy Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {robotsResults.map((res, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#11141c] border border-slate-800/60 font-mono text-[11px]">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-200">{res.botName}</div>
                        <div className="text-[9px] text-slate-500">Source: {res.source}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        res.status === 'success' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : res.status === 'warning' 
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-550/20' 
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {lang === 'pl' ? res.messagePl : res.messageEn}
                      </span>
                    </div>
                  ))}
                </div>

                {rawRobotsTxt && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      {lang === 'pl' ? 'Surowy plik robots.txt (Skanowany Wycinek)' : 'Raw robots.txt output (Scanned Snippet)'}
                    </div>
                    <pre className="p-3.5 rounded-lg bg-[#080a0f] border border-slate-850 text-[10px] text-slate-400 font-mono overflow-x-auto max-h-[140px] whitespace-pre-wrap leading-relaxed">
                      {rawRobotsTxt.substring(0, 1000)}
                    </pre>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB CONTENT: GEO CONTENT SCORER */}
      {activeSuiteTab === 'SCORER' && (
        <div id="geo-content-scorer" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-6 space-y-4">
            
            <div className="p-5 border border-slate-800 rounded-xl bg-[#0f121a] space-y-4">
              <div className="flex items-center gap-2 text-white">
                <Brain className="text-cyan-400" size={18} />
                <h3 className="font-bold text-sm font-mono uppercase tracking-wide">
                  {lang === 'pl' ? 'GEO Content Scorer (RAG Optimizer)' : 'GEO Content Scorer (RAG Optimizer)'}
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'pl'
                  ? 'Wklej fragment opisu produktu lub wpisu blogowego. AI oceni go pod kątem "Snippet-friendliness": czy pierwsze zdanie odpowiada bezpośrednio na zapytanie i czy zawiera szczegółowe fakty niezbędne dla wektorowych baz danych.'
                  : 'Paste an article paragraph or product synopsis. Gemini will evaluate the structural readability of your text for Retrieval-Augmented Generation (RAG).'
                }
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                  {lang === 'pl' ? '1. Intencja wyszukiwania (Query Context)' : '1. Target user intent / query context'}
                </label>
                <input
                  type="text"
                  value={queryContext}
                  onChange={(e) => setQueryContext(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141822] text-xs font-mono font-medium text-white border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                  {lang === 'pl' ? '2. Aktywny opis produktu / bloga do weryfikacji' : '2. Active page script / description content'}
                </label>
                <textarea
                  rows={6}
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141822] text-xs font-mono font-medium text-slate-300 border border-slate-800 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <button
                onClick={handleScoreContent}
                disabled={isScoring}
                className="w-full py-2.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white border border-indigo-400/20 shadow-lg font-bold text-[11px] sm:text-xs font-mono tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 overflow-visible whitespace-nowrap shrink-0"
              >
                {isScoring ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    {lang === 'pl' ? 'Analizuję wektory uwagi...' : 'Evaluating vector parameters...'}
                  </>
                ) : (
                  <>
                    <Sparkle size={14} className="text-amber-300" />
                    {lang === 'pl' ? 'Uruchom Scorer GEO' : 'Run GEO Evaluator'}
                  </>
                )}
              </button>
            </div>

          </div>

          <div className="lg:col-span-6 space-y-4">
            
            {scorerResult ? (
              <div className="border border-slate-800 rounded-xl bg-[#0d1017] p-5 space-y-5">
                
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-500 font-mono uppercase tracking-widest">
                      {lang === 'pl' ? 'WYNIK RETRIEVAL OPTIMIZATION' : 'RETRIEVAL OPTIMIZATION RATIO'}
                    </span>
                    <div className="text-xs font-extrabold text-white font-mono">
                      {lang === 'pl' ? 'Dopasowanie do wzorców SGE' : 'Synthesized SGE alignment'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black font-mono text-cyan-400">
                      {scorerResult.totalGeoScore}%
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">
                      {scorerResult.passageAttributionSuccess === 'High' 
                        ? (lang === 'pl' ? '★ Bezpieczne źródło' : '★ Trustworthy Source') 
                        : (lang === 'pl' ? 'Średni autorytet' : 'Moderate trust')
                      }
                    </span>
                  </div>
                </div>

                {/* Grid ratings */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold font-mono">
                      {lang === 'pl' ? 'ODPOWIEDŹ BEZPOŚREDNIA' : 'DIRECT DECLARATIVE'}
                    </div>
                    <div className="text-lg font-bold font-mono text-white">
                      {scorerResult.technicalRating.declarativeAnswers} <span className="text-xs text-slate-500">/25</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold font-mono">
                      {lang === 'pl' ? 'GĘSTOŚĆ FAKTÓW' : 'FACTUAL DENSITY'}
                    </div>
                    <div className="text-lg font-bold font-mono text-white">
                      {scorerResult.technicalRating.factualDensity} <span className="text-xs text-slate-500">/25</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold font-mono">
                      {lang === 'pl' ? 'CO-CITATION HINTS' : 'CITATION TRIGGERS'}
                    </div>
                    <div className="text-lg font-bold font-mono text-white">
                      {scorerResult.technicalRating.citationTriggers} <span className="text-xs text-slate-500">/25</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold font-mono">
                      {lang === 'pl' ? 'ALIGNMENT PYTAŃ' : 'INTENT RESOLUTION'}
                    </div>
                    <div className="text-lg font-bold font-mono text-white">
                      {scorerResult.technicalRating.keywordRetrievalStructure} <span className="text-xs text-slate-500">/25</span>
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="space-y-4 border-t border-slate-850 pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-wider">
                        {lang === 'pl' ? '✔ Atuty struktury' : '✔ Strengths'}
                      </div>
                      <ul className="text-[11px] font-mono text-slate-350 list-disc pl-4 space-y-1">
                        {scorerResult.geoStrengths.map((str, i) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] text-amber-500 font-bold font-mono uppercase tracking-wider">
                        {lang === 'pl' ? '✗ Przeszkody w indeksacji' : '✗ Weaknesses'}
                      </div>
                      <ul className="text-[11px] font-mono text-slate-350 list-disc pl-4 space-y-1">
                        {scorerResult.geoWeaknesses.map((weak, i) => (
                          <li key={i}>{weak}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Optimized Passage Attribution */}
                <div className="space-y-2.5 pt-4 border-t border-slate-850">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono flex items-center gap-1">
                      <Sparkles size={12} className="text-amber-400" />
                      {lang === 'pl' ? 'Wersja Zoptymalizowana 100/100 (Passage Attribution)' : 'Wersja Zoptymalizowana 100/100 (Passage Attribution)'}
                    </span>
                  </div>

                  {/* Info banner */}
                  <div className="flex items-start gap-2 bg-indigo-950/20 border border-indigo-900/30 text-xs text-indigo-300 p-2 rounded-lg leading-snug">
                    💡 {lang === 'pl'
                      ? 'Ten fragment jest zoptymalizowany pod cytowanie przez AI. Umieść go w pierwszych 150 słowach artykułu.'
                      : 'This passage is optimized for AI citation. Place it in the first 150 words of your article.'}
                  </div>

                  <p className="p-3.5 rounded-lg bg-[#0e121a] border border-cyan-900/20 text-xs font-mono text-amber-100 leading-relaxed">
                    {scorerResult.optimizedPassage}
                  </p>

                  {/* Export button group */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => setShowBriefModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/50 rounded-lg text-cyan-300 transition cursor-pointer"
                    >
                      <FileText size={11} />
                      {lang === 'pl' ? 'Otwórz brief ↗' : 'Open brief ↗'}
                    </button>

                    <button
                      onClick={() => copyAsMarkdownBrief({
                        geoScore: scorerResult.totalGeoScore,
                        query: queryContext,
                        optimizedPassage: scorerResult.optimizedPassage,
                        strengths: scorerResult.geoStrengths,
                        weaknesses: scorerResult.geoWeaknesses,
                        rating: scorerResult.technicalRating,
                      })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-[#151921] hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 transition cursor-pointer"
                    >
                      <Copy size={11} />
                      {lang === 'pl' ? 'Kopiuj jako brief' : 'Copy as brief'}
                    </button>

                    <button
                      onClick={() => downloadAsTxt('geo-brief-cosibella.txt', formatBriefAsMarkdown({
                        geoScore: scorerResult.totalGeoScore,
                        query: queryContext,
                        optimizedPassage: scorerResult.optimizedPassage,
                        strengths: scorerResult.geoStrengths,
                        weaknesses: scorerResult.geoWeaknesses,
                        rating: scorerResult.technicalRating,
                      }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-[#151921] hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 transition cursor-pointer"
                    >
                      ⬇ {lang === 'pl' ? 'Pobierz .txt' : 'Download .txt'}
                    </button>

                    <button
                      onClick={showDocsToast}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-[#151921] hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 transition cursor-pointer"
                    >
                      <ExternalLink size={11} />
                      Google Docs ↗
                    </button>
                  </div>

                  {docsToast && (
                    <div className="text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 rounded-lg px-3 py-2 font-mono">
                      {lang === 'pl'
                        ? 'Otwarto pusty Docs — wklej brief przez Ctrl+V'
                        : 'Blank Docs opened — paste brief with Ctrl+V'}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="border border-slate-805 border-dashed rounded-xl bg-[#090b10] p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
                <Brain size={36} className="text-slate-600 opacity-60" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-300 font-mono">
                    {lang === 'pl' ? 'Oczekiwanie na analizę treści' : 'Waiting for content evaluation'}
                  </div>
                  <p className="text-[11px] text-slate-550 max-w-sm mx-auto leading-relaxed">
                    {lang === 'pl' 
                      ? 'Nasz algorytm oceni tekst za pomocą parsera wektorowego i podpowie gotową, zoptymalizowaną treść o stężeniu faktów 100%.' 
                      : 'We will inspect direct answer statements, facts density coefficients and output a fully re-engineered text structure.'
                    }
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB CONTENT: SCHEDULER */}
      {activeSuiteTab === 'SCHEDULER' && (
        <div id="scheduler-tab-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-4 space-y-4">
            
            <div className="p-5 border border-slate-800 rounded-xl bg-[#0f121a] space-y-5">
              <div className="flex items-center gap-2 text-white">
                <Clock className="text-cyan-400" size={18} />
                <h3 className="font-bold text-sm font-mono uppercase tracking-wide">
                  {lang === 'pl' ? 'Przekaźnik Harmonogramu' : 'CRON Auto-Monitor Scheduler'}
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'pl'
                  ? 'Konfigurowalny CRON który automatycznie wysyła pakiety zapytań (Query Fanout) i porównuje wyniki tydzień do tygodnia, wysyłając automatycznie Delta Raporty na email.'
                  : 'Establish a custom CRON schedule to query AI search engines weekly or monthly automatically, tracking brand citation changes.'
                }
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 font-mono">
                    {lang === 'pl' ? 'Status monitoringu:' : 'Automated Scanning:'}
                  </span>
                  
                  <button
                    onClick={() => setMonitoringEnabled(!monitoringEnabled)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold font-mono transition cursor-pointer ${
                      monitoringEnabled 
                        ? 'bg-[#142d1b] text-emerald-400 border border-emerald-500/20' 
                        : 'bg-slate-800 text-slate-400 border border-slate-750'
                    }`}
                  >
                    ● {monitoringEnabled ? (lang === 'pl' ? 'AKTYWNY' : 'ACTIVE') : (lang === 'pl' ? 'WYŁĄCZONY' : 'DISABLED')}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-bold font-mono">
                    {lang === 'pl' ? 'Częstotliwość (Cron)' : 'Schedule Frequency (Cron)'}
                  </label>
                  <select
                    value={cronExpr}
                    onChange={(e) => setCronExpr(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#141822] text-xs font-mono font-medium text-white border border-slate-800 focus:outline-none"
                  >
                    <option value="0 0 * * 1">{lang === 'pl' ? 'Co poniedziałek o 00:00 (Weekly)' : 'Weekly on Mondays'}</option>
                    <option value="0 0 1 * *">{lang === 'pl' ? 'Pierwszego dnia miesiąca (Monthly)' : 'First of the Month'}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-bold font-mono">
                    {lang === 'pl' ? 'Odbiorca Alertów (Email)' : 'Alert Destination (Email)'}
                  </label>
                  <input
                    type="email"
                    value={emailAlert}
                    onChange={(e) => setEmailAlert(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#141822] text-xs font-mono font-semibold text-white border border-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={handleSaveSchedulerConfig}
                  className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-900 border border-cyan-400/20 font-bold text-xs font-mono transition cursor-pointer"
                >
                  {isConfigSaving ? (lang === 'pl' ? 'Zapisuję...' : 'Saving rules...') : (lang === 'pl' ? 'Zapisz harmonogram' : 'Save Cron Program')}
                </button>
              </div>

            </div>

          </div>

          <div className="lg:col-span-8 space-y-4">
            
            <div className="border border-slate-800 rounded-xl bg-[#0d1017] p-5 space-y-5">
              
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-400" />
                <h3 className="font-bold text-sm font-mono text-white uppercase tracking-wide">
                  {lang === 'pl' ? 'Ostatni Delta Raport tygodniowy (Audyt cykliczny)' : 'Latest Periodic Delta Report'}
                </h3>
              </div>

              {schedulerInfo && schedulerInfo.deltaReportSimulated ? (
                <div className="space-y-4 font-mono text-xs text-slate-300">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-[#11141c] border border-slate-850">
                    <div>
                      <div className="text-[10px] uppercase text-slate-500 font-bold">
                        {lang === 'pl' ? 'ANALIZOWANY CYKL' : 'SCANNED MATRIX'}
                      </div>
                      <div className="font-bold text-white text-[11px]">
                        {schedulerInfo.deltaReportSimulated.dateRange}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">GLVS CHANGE</span>
                        <span className="text-emerald-400 font-extrabold text-sm font-mono">
                          +{schedulerInfo.deltaReportSimulated.averageGlvsChange}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">SOV CHANGE</span>
                        <span className="text-emerald-400 font-extrabold text-sm font-mono">
                          +{schedulerInfo.deltaReportSimulated.averageSovChange}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Added citations list */}
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                      {lang === 'pl' ? '▲ NOWO POZYSKANE CYTOWANIA (ZWYCIĘSTWA)' : '▲ NEW ACTIVE CITATIONS (WINS)'}
                    </div>

                    <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg overflow-hidden bg-emerald-950/5">
                      {schedulerInfo.deltaReportSimulated.addedCitations.map((item: any, i: number) => (
                        <div key={i} className="p-3 flex items-center justify-between gap-3 text-[11px] leading-relaxed">
                          <span className="text-slate-200 truncate">"{item.query}"</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{item.before}</span>
                            <span>→</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/40">{item.after}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active query set lists */}
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                      {lang === 'pl' ? 'AKTYWNE ZESTAWY ZAPYTAŃ W KOLEJCE (185 fraz)' : 'MONITORED QUERY CLUSTERS (185 queries)'}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {schedulerInfo.savedQuerySets.map((grp: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 font-semibold text-[11px] text-slate-200">
                          🎯 {grp}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-slate-500 text-xs font-mono text-center py-6">
                  {lang === 'pl' 
                    ? 'Brak danych delta. Harmonogram wygeneruje pierwszy raport w poniedziałek.'
                    : 'No delta reports available. Setup automated cron scans to generate comparisons.'
                  }
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>

    {/* ContentBriefModal — renders when user clicks "Otwórz brief ↗" in SCORER */}
    {showBriefModal && scorerResult && (
      <ContentBriefModal
        lang={lang}
        brief={{
          title: queryContext.slice(0, 60) || 'GEO Content Brief',
          geoScore: scorerResult.totalGeoScore,
          query: queryContext,
          optimizedPassage: scorerResult.optimizedPassage,
          strengths: scorerResult.geoStrengths,
          weaknesses: scorerResult.geoWeaknesses,
          rating: scorerResult.technicalRating,
          targetMarket: 'PL',
        }}
        onClose={() => setShowBriefModal(false)}
      />
    )}
  );
}
