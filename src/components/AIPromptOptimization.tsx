import React, { useState, useEffect } from 'react';
import { PromptOptimizationStrategy } from '../types';
import { Lightbulb, CheckCircle2, ShieldAlert, Sparkles, Filter, Copy, Check } from 'lucide-react';
import { translations } from '../translations';

interface AIPromptOptimizationProps {
  onAddLogMessage?: (msg: string) => void;
  lang?: 'pl' | 'en';
}

export default function AIPromptOptimization({
  onAddLogMessage,
  lang = 'pl',
}: AIPromptOptimizationProps) {
  const t = translations[lang];
  const [optimizations, setOptimizations] = useState<PromptOptimizationStrategy[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/prompt-optimizations')
      .then((res) => res.json())
      .then((data) => {
        setOptimizations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onAddLogMessage) {
      onAddLogMessage(lang === 'pl' 
        ? `Skopiowano strategię optymalizacji treści do schowka: ${id}` 
        : `Copied Prompt Optimization Strategy to Clipboard: ${id}`);
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  const platformsFilterOptions = ['ALL', 'Google SGE / AI Overviews', 'Perplexity AI / ChatGPT Search', 'Gemini / Claude'];

  const filteredOptimizations = selectedFilter === 'ALL'
    ? optimizations
    : optimizations.filter((opt) => opt.targetLLM === selectedFilter);

  // Local translations for dynamic DB seeds so we localized them cleanly
  const getLocalizedPriority = (priority: string) => {
    if (priority === 'High') return lang === 'pl' ? 'Wysoki' : 'High';
    return lang === 'pl' ? 'Średni' : 'Medium';
  };

  return (
    <div id="ai-prompt-optimization-engine" className="bg-[#151921] rounded-2xl border border-slate-800 p-6 shadow-xl w-full min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            {t.optimizer.title}
          </h3>
          <p className="text-xs text-slate-450 mt-1 leading-relaxed">
            {t.optimizer.desc}
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 self-start sm:self-center select-none">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="text-xs border border-slate-800 rounded-lg py-1.5 px-2.5 bg-[#0F1115] text-slate-300 font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
          >
            {platformsFilterOptions.map((opt, idx) => (
              <option key={idx} value={opt} className="bg-[#0F1115] text-slate-300">
                {opt === 'ALL' ? t.optimizer.allPlatformsOption : opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#0F1115] border border-slate-800 rounded-lg w-full"></div>
          <div className="h-24 bg-[#0F1115] border border-slate-800 rounded-lg w-full"></div>
          <div className="h-24 bg-[#0F1115] border border-slate-800 rounded-lg w-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List representing strategies */}
          <div className="lg:col-span-2 space-y-4">
            {filteredOptimizations.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-800 bg-[#0F1115]/50 rounded-xl">
                <p className="text-xs text-slate-400 font-mono">{t.optimizer.noResults}</p>
              </div>
            ) : (
              filteredOptimizations.map((opt) => (
                <div
                  key={opt.id}
                  className="border border-slate-805 border-slate-800/80 rounded-2xl p-5 bg-[#0F1115]/75 hover:bg-[#12151C] hover:border-slate-700/80 transition-all duration-200 cursor-default group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 px-2 py-0.5 rounded-sm">
                          {lang === 'pl' && opt.category === 'schema' ? 'Schema JSON-LD' : opt.category === 'density' ? (lang === 'pl' ? 'Frazy i synonimy' : 'Co-citation Keywords') : opt.category}
                        </span>
                        <span className="bg-slate-900 border border-slate-800 text-slate-300 font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-sm">
                          {opt.targetLLM}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm ${
                            opt.priority === 'High'
                              ? 'bg-rose-950/40 text-rose-300 border border-rose-900/60'
                              : 'bg-amber-950/40 text-amber-300 border border-amber-900/60'
                          }`}
                        >
                          {getLocalizedPriority(opt.priority)} {t.optimizer.priorityLabel}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 pt-1 tracking-tight group-hover:text-cyan-400 transition-colors duration-150">
                        {lang === 'pl' && opt.title.includes('Schema Markup') ? 'Podpięcie struktury schematów dla SGE' : lang === 'pl' && opt.title.includes('reddit') ? 'Kampania wzmianek dyskusyjnych na Reddit' : opt.title}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {/* Problem Description */}
                    <div className="flex items-start gap-2 text-xs text-slate-350 leading-relaxed">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-200 font-bold">{t.optimizer.problemLabel}:</strong> {lang === 'pl' ? (opt.id === 'opt-1' ? 'Brak powiązań cen w czasie rzeczywistym powoduje, że filtry Google SGE pomijają asortyment sklepu Cosibella.' : 'Niski poziom współcytowań marki na ogólnodostępnych forach społecznościowych zaniża autorytet rynkowy w ChatGPT.') : opt.problemStatement}
                      </div>
                    </div>

                    {/* Optimization Action/Prompt */}
                    <div className="bg-slate-950 text-slate-100 p-3 rounded-lg text-xs font-mono relative group mt-2 overflow-x-auto select-all border border-slate-850/60">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800/80 pb-1.5 mb-2 pointer-events-none">
                        <span className="font-bold tracking-wider">{lang === 'pl' ? 'ZALECANA STRUKTURA KONTENTU' : 'RECOMMENDED CONTENT STRUCTURE'}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(opt.id, opt.optimizedPromptTemplate);
                          }}
                          className="pointer-events-auto text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === opt.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              {t.optimizer.copiedBtn}
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              {t.optimizer.copyBtn}
                            </>
                          )}
                        </button>
                      </div>
                      <span className="whitespace-pre-line text-slate-300 font-medium">
                        {opt.optimizedPromptTemplate}
                      </span>
                    </div>

                    {/* Bottom stats summary */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{lang === 'pl' ? (opt.id === 'opt-1' ? 'Prognoza: +16% widoczności w SGE w ciągu 14 dni' : 'Prognoza: +35% szans na polecenie w Perplexity') : opt.impactMetrics}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Guide to AI SEO */}
          <div className="bg-[#12151C]/60 border border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-inner">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5 select-none">
              <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
              {lang === 'pl' ? 'Podręcznik SEO AI Cosibella' : 'Cosibella.pl LLM SEO Playbook'}
            </h4>
            
            <p className="text-xs text-slate-350 leading-relaxed">
              {lang === 'pl' 
                ? <span>W odróżnieniu od klasycznego pozycjonowania (opartego o linkowanie), <strong>widoczność w generatywnych wyszukiwarkach AI</strong> bazuje przede wszystkim na autorytecie tematycznym i współtowarzyszeniu marki w dyskursie.</span>
                : <span>Unlike traditional search engine indexing (ranking with backlinks), <strong>Generative AI visibility</strong> relies heavily on topical authority, expert corroboration, and entities normalization.</span>}
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-2.5">
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/50 border border-indigo-900 w-5 h-5 rounded-full flex items-center justify-center shrink-0 select-none">1</span>
                <div>
                  <h5 className="text-xs font-bold text-slate-250">{lang === 'pl' ? 'Bliskość encji (Entity Proximity)' : 'Entity Proximity'}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {lang === 'pl'
                      ? 'Umieszczaj nazwę brandu bezpośrednio obok kluczowych kategorii produktowych (np. "specjalista K-Beauty", "diagnostyka kosmetologiczna") w kodzie HTML sklepu.'
                      : 'Surround your brand name with high-importance category keywords (e.g. "K-Beauty specialist", "professional cosmetology diagnostics") inside product layouts.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/50 border border-indigo-900 w-5 h-5 rounded-full flex items-center justify-center shrink-0 select-none">2</span>
                <div>
                  <h5 className="text-xs font-bold text-slate-250">{lang === 'pl' ? 'Gęstość współcytowań' : 'Co-Citation density'}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {lang === 'pl'
                      ? 'AI korelują autorytet na podstawie rzeczywistych recenzji dyskusyjnych, analiz rynkowych i blogów. Aktywna obecność marki w tych źródłach podwyższa pozycję.'
                      : 'LLMs cross-correlate authority by looking on Reddit reviews, forum responses, and comparison grids. Active participation boosts your recommendability index.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-1.5 md:gap-2.5">
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/50 border border-indigo-900 w-5 h-5 rounded-full flex items-center justify-center shrink-0 select-none">3</span>
                <div>
                  <h5 className="text-xs font-bold text-slate-250">{lang === 'pl' ? 'Strukturyzowane schematy JSON-LD' : 'Structured LD schemas'}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {lang === 'pl'
                      ? 'Upewnij się, że Google SGE i Bing Copilot mogą łatwo skanować ceny i dostępność produktów bez potrzeby kosztownego renderowania JS.'
                      : 'Ensure Google SGE and Bing CoPilot can crawl real-time price & availability without complex JavaScript rendering. Static markup wins pricing sliders.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3.5 mt-4 text-[10px] text-slate-500 italic select-none">
              💡 <em>{lang === 'pl' ? 'LLMpulse automatycznie pobiera te dane, aby dopasować strategię rynkową.' : 'LLMpulse automates scans to trace these ranking patterns relative to competitors.'}</em>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
