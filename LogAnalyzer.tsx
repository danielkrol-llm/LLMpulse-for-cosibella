import React, { useState } from 'react';
import { Terminal, Shield, RefreshCw, BarChart3, HelpCircle, Activity, Globe, CheckCircle } from 'lucide-react';

interface LogAnalyzerProps {
  onAddLogMessage?: (msg: string) => void;
  lang?: 'pl' | 'en';
}

interface ParsedBotStats {
  botName: string;
  count: number;
  color: string;
}

interface ParsedPathStats {
  path: string;
  count: number;
}

const SAMPLE_LOGS = `127.0.0.1 - - [12/Jun/2026:01:10:22 +0000] "GET /sklep/koreańskie-kosmetyki HTTP/1.1" 200 45260 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)"
127.0.0.1 - - [12/Jun/2026:02:15:33 +0000] "GET /blog/konsultacje-kosmetologiczne-online HTTP/1.1" 200 35120 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)"
127.0.0.1 - - [12/Jun/2026:03:40:12 +0005] "GET /sklep/kremy-z-retinolem HTTP/1.1" 200 18240 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://www.perplexity.ai/bot)"
127.0.0.1 - - [12/Jun/2026:04:12:00 +0000] "GET /sklep/koreańskie-kosmetyki HTTP/1.1" 200 45260 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)"
127.0.0.1 - - [12/Jun/2026:05:01:45 +0000] "GET /sklep/serum-z-witamina-c HTTP/1.1" 200 29900 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
127.0.0.1 - - [12/Jun/2026:07:22:15 +0000] "GET /blog/kwas-salicylowy-jak-stosowac HTTP/1.1" 200 12400 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://www.perplexity.ai/bot)"
127.0.0.1 - - [12/Jun/2026:08:45:00 +0000] "GET /sklep/koreańskie-kosmetyki HTTP/1.1" 200 45260 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)"
127.0.0.1 - - [12/Jun/2026:10:10:02 +0000] "GET /blog/konsultacje-kosmetologiczne-online HTTP/1.1" 200 35120 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)"
127.0.0.1 - - [12/Jun/2026:11:34:50 +0000] "GET / HTTP/1.1" 200 52020 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)"
127.0.0.1 - - [13/Jun/2026:12:05:11 +0000] "GET /blog/pielegnacja-cery-tradzikowej HTTP/1.1" 200 31200 "-" "Mozilla/5.0 (compatible; Google-Extended; +http://www.google.com/generator_extended.html)"
127.0.0.1 - - [13/Jun/2026:13:55:04 +0000] "GET /sklep/pielegnacja-poregeneracyjna HTTP/1.1" 200 22110 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)"
127.0.0.1 - - [13/Jun/2026:15:30:22 +0000] "GET /blog/konsultacje-kosmetologiczne-online HTTP/1.1" 200 35120 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)"
127.0.0.1 - - [13/Jun/2026:17:15:15 +0000] "GET /sklep/kremy-z-retinolem HTTP/1.1" 200 18240 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://www.perplexity.ai/bot)"
127.0.0.1 - - [13/Jun/2026:19:44:30 +0000] "GET /sklep/koreańskie-kosmetyki HTTP/1.1" 200 45260 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)"
127.0.0.1 - - [13/Jun/2026:21:05:40 +0000] "GET /blog/kwas-salicylowy-jak-stosowac HTTP/1.1" 200 12400 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://www.perplexity.ai/bot)"`;

export default function LogAnalyzer({ onAddLogMessage, lang = 'pl' }: LogAnalyzerProps) {
  const [logText, setLogText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [linesCount, setLinesCount] = useState(0);
  const [botHitsCount, setBotHitsCount] = useState(0);
  const [botBreakup, setBotBreakup] = useState<ParsedBotStats[]>([]);
  const [topPaths, setTopPaths] = useState<ParsedPathStats[]>([]);
  const [timeline, setTimeline] = useState<{ dateStr: string; count: number }[]>([]);

  const handleInsertSample = () => {
    setLogText(SAMPLE_LOGS);
    if (onAddLogMessage) {
      onAddLogMessage(lang === 'pl' ? 'Wczytano przykładowe logi serwera access.log' : 'Loaded sample access.log dataset');
    }
  };

  const handleParseLogs = () => {
    if (!logText.trim()) return;

    setParsing(true);
    // Simulate real heavy CPU thread parsing response
    setTimeout(() => {
      const lines = logText.trim().split('\n');
      const totalLines = lines.length;

      let gptCount = 0;
      let claudeCount = 0;
      let perplexityCount = 0;
      let googleCount = 0;
      let otherAIBotCount = 0;

      const pathCounts: Record<string, number> = {};
      const dateCounts: Record<string, number> = {};

      lines.forEach((line) => {
        const lowerLine = line.toLowerCase();
        let isAIBot = false;
        let detectedBot = '';

        if (lowerLine.includes('gptbot')) {
          gptCount++;
          isAIBot = true;
          detectedBot = 'GPTBot';
        } else if (lowerLine.includes('claudebot')) {
          claudeCount++;
          isAIBot = true;
          detectedBot = 'ClaudeBot';
        } else if (lowerLine.includes('perplexitybot')) {
          perplexityCount++;
          isAIBot = true;
          detectedBot = 'PerplexityBot';
        } else if (lowerLine.includes('google-extended')) {
          googleCount++;
          isAIBot = true;
          detectedBot = 'Google-Extended';
        } else if (lowerLine.includes('cohere') || lowerLine.includes('oai-searchbot') || lowerLine.includes('facebookexternalhit')) {
          otherAIBotCount++;
          isAIBot = true;
          detectedBot = 'Other AI Crawler';
        }

        if (isAIBot) {
          // Extract Path (GET /some-url HTTP/1.1)
          const matchPath = line.match(/"(GET|POST|HEAD) ([^\s?]+)/);
          if (matchPath && matchPath[2]) {
            const path = matchPath[2];
            pathCounts[path] = (pathCounts[path] || 0) + 1;
          }

          // Extract Date ([12/Jun/2026:...)
          const matchDate = line.match(/\[([0-9a-zA-Z/]+)/);
          if (matchDate && matchDate[1]) {
            const dateStr = matchDate[1]; // e.g. "12/Jun/2026"
            dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
          }
        }
      });

      const totalBotHits = gptCount + claudeCount + perplexityCount + googleCount + otherAIBotCount;

      const breakup: ParsedBotStats[] = [
        { botName: 'GPTBot (OpenAI)', count: gptCount, color: 'bg-cyan-500' },
        { botName: 'ClaudeBot (Anthropic)', count: claudeCount, color: 'bg-amber-500' },
        { botName: 'PerplexityBot (Perplexity)', count: perplexityCount, color: 'bg-indigo-500' },
        { botName: 'Google-Extended (Gemini)', count: googleCount, color: 'bg-red-500' },
        { botName: 'Other AI Crawlers', count: otherAIBotCount, color: 'bg-slate-500' },
      ].filter((x) => x.count > 0);

      const paths = Object.entries(pathCounts)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const times = Object.entries(dateCounts)
        .map(([dateStr, count]) => ({ dateStr, count }))
        .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

      setLinesCount(totalLines);
      setBotHitsCount(totalBotHits);
      setBotBreakup(breakup);
      setTopPaths(paths);
      setTimeline(times);
      setParsing(false);

      if (onAddLogMessage) {
        onAddLogMessage(
          lang === 'pl'
            ? `Przeanalizowano ${totalLines} linii logs. Wykryto ${totalBotHits} hitów botów AI.`
            : `Parsed ${totalLines} lines. Detected ${totalBotHits} generative AI bot crawls.`
        );
      }
    }, 850);
  };

  return (
    <div id="saas-server-log-analyzer" className="bg-[#151921] rounded-2xl border border-slate-800 p-6 shadow-sm">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-4.5 h-4.5 text-cyan-400" />
            {lang === 'pl' ? 'Analizator Logów Serwera AI (Crawler Sentinel)' : 'AI Server Log Bot Analyzer (Crawler Sentinel)'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            {lang === 'pl'
              ? 'Wklej fragment pliku access.log, aby wykryć częstotliwość i zachowanie botów trenujących LLM (GPTBot, ClaudeBot, Perplexity).'
              : 'Paste a slice of your server access.log to parse and index active crawling frequencies by LLM trainers.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInsertSample}
            type="button"
            className="text-[11px] font-bold text-slate-350 bg-[#12161f] border border-slate-800 hover:bg-slate-800 hover:text-white px-3 py-2 rounded-xl transition cursor-pointer"
          >
            {lang === 'pl' ? 'Wgraj przykładowe logi' : 'Insert Sample Logs'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Console */}
        <div className="lg:col-span- così-5 lg:col-span-5 space-y-4">
          <div className="bg-[#0F1115] rounded-xl border border-slate-800 p-4 space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
              Raw access.log snippet
            </label>
            <textarea
              className="w-full h-64 bg-[#12161f] border border-slate-800/80 rounded-lg p-3 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500 placeholder-slate-600 focus:ring-1 focus:ring-cyan-500 custom-scrollbar"
              placeholder={
                lang === 'pl'
                  ? 'Wklej linie z nginx/apache access.log tutaj...'
                  : 'Paste lines from nginx/apache access.log here...'
              }
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
            />
            <button
              onClick={handleParseLogs}
              disabled={parsing || !logText.trim()}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer border ${
                parsing || !logText.trim()
                  ? 'bg-[#0F1115] text-slate-505 border-slate-800'
                  : 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 border-cyan-500'
              }`}
            >
              {parsing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {lang === 'pl' ? 'Analizowanie wzorców botów...' : 'Analyzing Bot Patterns...'}
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5" />
                  {lang === 'pl' ? 'Analizuj Logi AI' : 'Parse AI Log Lines'}
                </>
              )}
            </button>
          </div>

          <div className="bg-[#12161f]/40 p-4 rounded-xl border border-slate-800/60 text-xs text-slate-300 leading-relaxed font-sans space-y-2">
            <span className="text-[10px] font-extrabold font-mono text-cyan-400 tracking-widest block uppercase">
              {lang === 'pl' ? 'Podręcznik Zabezpieczania Robots.txt' : 'Crawler Protection Guide'}
            </span>
            <p className="text-[11px] text-slate-400">
              {lang === 'pl'
                ? 'Aby zablokować bezprawne trenowanie LLM na kontencie Cosibella.pl, rozważ zaktualizowanie pliku robots.txt o dyrektywy:'
                : 'To block unlicensed machine learning pre-training on Cosibella.pl catalog, configure robots.txt:'}
            </p>
            <div className="bg-[#0F1115] border border-slate-800 p-2 text-[10px] rounded-lg text-rose-400/90 font-mono space-y-1 select-all">
              <div>User-agent: GPTBot</div>
              <div>Disallow: /</div>
              <div className="mt-1">User-agent: ClaudeBot</div>
              <div>Disallow: /</div>
              <div className="mt-1">User-agent: PerplexityBot</div>
              <div>Disallow: /</div>
            </div>
          </div>
        </div>

        {/* Right Output Graphs Dashboard */}
        <div className="lg:col-span-7 border border-slate-800 bg-[#0F1115]/50 rounded-xl p-5 flex flex-col justify-center min-h-[350px]">
          {linesCount === 0 ? (
            <div className="text-center py-12 space-y-3 font-sans">
              <div className="mx-auto w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center">
                <Terminal className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-300">
                  {lang === 'pl' ? 'Oczekiwanie na analizę logów' : 'Waiting for log dataset'}
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  {lang === 'pl'
                    ? 'Wklej linie logu po lewej stronie lub kliknij "Wgraj przykładowe logi", aby wygenerować intuicyjne statystyki AI Botów.'
                    : 'Paste access logs or click "Insert Sample Logs" to view bot share distributions and crawling trends immediately.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Core parsing metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#151921] border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-500 block mb-0.5">
                    {lang === 'pl' ? 'Linii ogółem' : 'Total Lines'}
                  </span>
                  <span className="text-sm font-black text-white font-mono block">
                    {linesCount}
                  </span>
                </div>
                <div className="bg-[#151921] border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-500 block mb-0.5">
                    {lang === 'pl' ? 'AI Bot Crawls' : 'AI Bot Crawls'}
                  </span>
                  <span className="text-sm font-black text-cyan-400 font-mono block">
                    {botHitsCount}
                  </span>
                </div>
                <div className="bg-[#151921] border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-500 block mb-0.5">
                    {lang === 'pl' ? 'AI Traffic %' : 'AI Traffic %'}
                  </span>
                  <span className="text-sm font-black text-rose-500 font-mono block">
                    {((botHitsCount / linesCount) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Graphical bot breakup */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block pb-1 border-b border-slate-800/80">
                  {lang === 'pl' ? 'Udział poszczególnych robotów AI w crawlowaniu' : 'AI Bot Crawl Distribution Share'}
                </span>
                <div className="space-y-2.5">
                  {botBreakup.map((bot, idx) => {
                    const percent = ((bot.count / botHitsCount) * 100).toFixed(1);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-200">{bot.botName}</span>
                          <span className="font-mono text-slate-400 text-[11px]">
                            {bot.count} hits ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#12161f] h-2 rounded-full overflow-hidden border border-slate-850">
                          <div className={`h-full ${bot.color} rounded-full`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Path and timeline analysis bento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Most target URLs */}
                <div className="bg-[#151921] p-4 rounded-xl border border-slate-800/80 space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-450 block">
                    {lang === 'pl' ? 'Najczęściej odwiedzane URL' : 'Most Crawled Resource Paths'}
                  </span>
                  <div className="space-y-2 text-[11px] font-mono">
                    {topPaths.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-[#0F1115] px-2.5 py-1.5 rounded-lg border border-slate-800/40">
                        <span className="text-slate-300 truncate max-w-[150px]">{p.path}</span>
                        <span className="text-cyan-400 font-black">{p.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline frequency */}
                <div className="bg-[#151921] p-4 rounded-xl border border-slate-800/80 space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-450 block">
                    {lang === 'pl' ? 'Częstotliwość w czasie (Skany dziennie)' : 'Crawling Timeline Frequency'}
                  </span>
                  <div className="space-y-2 text-[11px] font-mono">
                    {timeline.length === 0 ? (
                      <span className="text-slate-500 block text-center py-4">-</span>
                    ) : (
                      timeline.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-[#0F1115] px-2.5 py-1.5 rounded-lg border border-slate-800/40">
                          <span className="text-slate-300">{t.dateStr.replace(/^[0-9]+:/, '')}</span>
                          <span className="text-amber-500 font-black">{t.count} hits</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sentinel Shield status check */}
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-emerald-400 font-mono text-[10px] font-bold select-none">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>SENTINEL CRAWL AUDITING ENGINE OPERATIONAL (100% OK)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
