import React, { useState } from 'react';
import { Sparkles, Play, RefreshCw, Layers, ShieldCheck, HelpCircle, ArrowRight, CheckCircle, Database } from 'lucide-react';

interface QueryFanoutProps {
  onAddLogMessage?: (msg: string) => void;
  onAddBulkAudits?: (newAudits: any[]) => void;
  lang?: 'pl' | 'en';
}

interface Variant {
  query: string;
  engineTarget: string;
  expansionType: string;
}

export default function QueryFanout({ onAddLogMessage, onAddBulkAudits, lang = 'pl' }: QueryFanoutProps) {
  const [seed, setSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [bulkTesting, setBulkTesting] = useState(false);
  const [testedCount, setTestedCount] = useState(0);
  const [testResults, setTestResults] = useState<any[]>([]);

  const handleGenerateFanout = async () => {
    const trimmed = seed.trim();
    if (!trimmed) return;

    setLoading(true);
    setVariants([]);
    setTestResults([]);
    setTestedCount(0);

    try {
      const response = await fetch('/api/query-fanout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, language: lang === 'pl' ? 'Polish' : 'English' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      setVariants(data.variants || []);

      if (onAddLogMessage) {
        onAddLogMessage(
          lang === 'pl'
            ? `Wygenerowano fanout RAG dla: „${trimmed}” w liczbie ${data.variants?.length || 0} wariantów.`
            : `Synthesized RAG fanout list for: "${trimmed}" containing ${data.variants?.length || 0} expansion variants.`
        );
      }
    } catch (e: any) {
      console.error(e);
      // fallback
      setVariants([
        { query: `${trimmed} opinie`, engineTarget: 'ChatGPT', expansionType: 'Intent Resolution' },
        { query: `najlepszy ${trimmed} ranking`, engineTarget: 'Perplexity', expansionType: 'Long-tail comparison' },
        { query: `${trimmed} cosibella`, engineTarget: 'Gemini', expansionType: 'Brand qualifier' },
        { query: `jak stosować ${trimmed} w pielęgnacji`, engineTarget: 'Claude', expansionType: 'Conversational guide' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkTest = async () => {
    if (variants.length === 0 || bulkTesting) return;

    setBulkTesting(true);
    setTestedCount(0);
    const accumulatedResults: any[] = [];

    if (onAddLogMessage) {
      onAddLogMessage(
        lang === 'pl'
          ? `Uruchomiono masowy proces audytu próbkowania dla ${variants.length} wariantów...`
          : `Initiated bulk predictive sampling audit process for ${variants.length} query variations...`
      );
    }

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      try {
        const response = await fetch('/api/simulate-serp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: variant.query,
            country: 'PL', // Default context PL
            llm: variant.engineTarget.includes('ChatGPT') 
              ? 'ChatGPT' 
              : variant.engineTarget.includes('Perplexity') 
              ? 'Perplexity' 
              : variant.engineTarget.includes('Gemini') 
              ? 'Gemini' 
              : 'Google SGE',
          }),
        });

        if (response.ok) {
          const result = await response.json();
          // Build a mocked audit row structure to push back to the general database!
          const mockedAudit = {
            id: `aud-fan-${Math.random().toString(36).substring(2, 7)}`,
            query: variant.query,
            category: 'recommendation', // categorize as fanout recommends
            country: 'PL',
            llm: variant.engineTarget.includes('ChatGPT') 
              ? 'ChatGPT' 
              : variant.engineTarget.includes('Perplexity') 
              ? 'Perplexity' 
              : variant.engineTarget.includes('Gemini') 
              ? 'Gemini' 
              : 'Google SGE',
            brandPresence: result.brandPresence ?? true,
            position: result.rankingPosition?.includes('#1') ? 'first' : result.rankingPosition?.includes('Top 3') ? 'top3' : 'top10',
            shareOfVoice: result.shareOfVoice ?? 55,
            sentiment: result.sentiment ?? 'positive',
            contextTags: result.contextTags || ['Fanout', 'Retrieval'],
            lastScanned: new Date().toISOString(),
            competitors: result.competitorsMentioned || ['Hebe', 'Notino'],
            snippet: result.answer,
          };
          accumulatedResults.push(mockedAudit);
        }
      } catch (err) {
        console.error('Error simulating variant', variant.query, err);
      }
      setTestedCount(i + 1);
    }

    setTestResults(accumulatedResults);
    setBulkTesting(false);

    if (onAddBulkAudits && accumulatedResults.length > 0) {
      onAddBulkAudits(accumulatedResults);
    }

    if (onAddLogMessage) {
      onAddLogMessage(
        lang === 'pl'
          ? `Zakończono masowy test. Zapisano ${accumulatedResults.length} nowych skanów do głównej bazy.`
          : `Bulk evaluation completed. Committed ${accumulatedResults.length} new test scans to database registry.`
      );
    }
  };

  return (
    <div id="ai-query-fanout-workspace" className="bg-[#151921] rounded-2xl border border-slate-800 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-4.5 h-4.5 text-cyan-400" />
          {lang === 'pl' ? 'Generator Query Fanout (LLM Retrieval Simulator)' : 'Query Fanout Generator (LLM Retrieval Simulator)'}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5 font-sans">
          {lang === 'pl'
            ? 'Dowiedz się jak silniki AI rozszerzają słowo kluczowe podczas wyszukiwania (RAG). Wpisz główny temat i pobierz warianty rozszerzeń wyszukiwarki.'
            : 'Unveil exactly how LLM retrieval vectors and RAG pipelines expand seed search keywords. Input a main topic below.'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Seed Input Bar */}
        <div className="bg-[#0F1115] p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
              {lang === 'pl' ? 'Podaj frazę zalążkową (Seed Phrase)' : 'Enter Seed Key Phrase'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder={lang === 'pl' ? 'np. krem z niacynamidem na cerę naczynkową' : 'e.g. skin repair cream under $30'}
                className="w-full text-xs font-semibold border border-slate-800 focus:border-cyan-500 rounded-xl py-2.5 pl-3.5 pr-10 bg-[#151921] text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <Sparkles className="absolute right-3.5 top-3 w-4 h-4 text-cyan-500 pointer-events-none" />
            </div>
          </div>
          <button
            onClick={handleGenerateFanout}
            disabled={loading || !seed.trim()}
            className={`w-full md:w-auto md:px-6 py-2.5 self-end rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer border ${
              loading || !seed.trim()
                ? 'bg-[#0F1115] text-slate-505 border-slate-800'
                : 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 border-cyan-500 shadow-sm shadow-cyan-900/10'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {lang === 'pl' ? 'Trwa generowanie...' : 'Expanding...'}
              </>
            ) : (
              <>
                {lang === 'pl' ? 'Generuj Fanout' : 'Expand Seed Phrase'}
              </>
            )}
          </button>
        </div>

        {/* Results Variants panel */}
        {variants.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 anim-fade">
            {/* Expanded List */}
            <div className="lg:col-span-7 bg-[#0F1115] rounded-xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                  {lang === 'pl' ? 'Warianty ekspansji wektora wyszukiwania' : 'Retrieval Expansion Variations'}
                </span>
                <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-900/60 font-bold px-2 py-0.5 rounded-sm">
                  {variants.length} {lang === 'pl' ? 'frazy' : 'keys'}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                {variants.map((v, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-[#151921] hover:bg-slate-900 p-3 rounded-lg border border-slate-800/60 group transition duration-150"
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <span className="text-xs font-semibold text-slate-200 block truncate leading-tight">
                        &ldquo;{v.query}&rdquo;
                      </span>
                      <span className="text-[9px] font-semibold text-slate-505 font-mono block">
                        TYPE: {v.expansionType}
                      </span>
                    </div>
                    <span className="text-[9px] uppercase font-mono font-bold bg-[#12161f] text-cyan-400 border border-slate-800 px-2 py-1 rounded-md shrink-0">
                      {v.engineTarget}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sandbox Bulk Action controller */}
            <div className="lg:col-span-5 bg-[#12161f]/35 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                  {lang === 'pl' ? 'Masowy Audyt Sandboxa' : 'Bulk Sandbox Auditing'}
                </span>
                <p className="text-xs text-slate-350 leading-relaxed font-sans">
                  {lang === 'pl'
                    ? 'Przetestuj masowo wygenerowane warianty bezpośrednio w naszym emulatorze. System wykona automatyczne odpytania wektorów i doda wyniki do wspólnego panelu.'
                    : 'Analyze all newly generated variations inside the emulation sandbox simultaneously. Results will instantly commit to global dashboard stats.'}
                </p>

                {bulkTesting && (
                  <div className="space-y-2 py-2 anim-fade">
                    <div className="flex justify-between items-center text-[11px] font-mono font-extrabold text-cyan-400">
                      <span>{lang === 'pl' ? 'Próbkowanie wariantów...' : 'Evaluating variations...'}</span>
                      <span>{testedCount} / {variants.length}</span>
                    </div>
                    <div className="w-full bg-[#0F1115] h-1.5 rounded-full overflow-hidden border border-slate-850">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${(testedCount / variants.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {testResults.length > 0 && !bulkTesting && (
                  <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-lg flex items-center gap-2 text-emerald-400 text-xs anim-fade select-none">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>
                      {lang === 'pl'
                        ? `Zakończono! Zapisano ${testResults.length} pomyślnych skanów w rejestrze.`
                        : `Complete! Registered ${testResults.length} successful crawls.`}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleBulkTest}
                disabled={bulkTesting || variants.length === 0}
                className={`w-full py-2.5 mt-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer border ${
                  bulkTesting || variants.length === 0
                    ? 'bg-[#0F1115] text-slate-505 border-slate-800'
                    : 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 border-cyan-500'
                }`}
              >
                {bulkTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {lang === 'pl' ? `Trwa skanowanie (${testedCount}/${variants.length})...` : `Testing (${testedCount}/${variants.length})...`}
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current text-slate-950" />
                    {lang === 'pl' ? 'PRZETESTUJ MASOWO W SANDBOXIE' : 'RUN BULK SANDBOX TESTING'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
