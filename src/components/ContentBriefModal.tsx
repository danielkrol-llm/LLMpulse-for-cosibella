import React, { useState } from 'react';
import {
  X, Copy, Download, CheckCircle, ExternalLink,
  Zap, FileText, AlertCircle, Loader2,
} from 'lucide-react';
import { BriefData, formatBriefAsMarkdown, copyAsMarkdownBrief, downloadAsTxt } from '../lib/exportUtils';

export interface ContentBriefModalProps {
  brief: BriefData & { title: string; targetMarket?: string };
  lang: 'pl' | 'en';
  onClose: () => void;
}

type ToastState = { type: 'success' | 'error'; message: string } | null;

const SCORE_COLOR = (n: number) =>
  n >= 70 ? 'text-emerald-400' : n >= 45 ? 'text-amber-400' : 'text-rose-400';

const SCORE_BAR = (n: number) =>
  n >= 70 ? 'bg-emerald-500' : n >= 45 ? 'bg-amber-500' : 'bg-rose-500';

export default function ContentBriefModal({ brief, lang, onClose }: ContentBriefModalProps) {
  const [copied, setCopied] = useState(false);
  const [clickupLoading, setClickupLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopy = () => {
    copyAsMarkdownBrief(brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const slug = brief.title.slice(0, 32).replace(/\s+/g, '-').toLowerCase();
    downloadAsTxt(`geo-brief-${slug}.txt`, formatBriefAsMarkdown(brief));
  };

  const handleClickUp = async () => {
    setClickupLoading(true);
    try {
      const res = await fetch('/api/clickup-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listName: 'Content Plan — Cosibella',
          taskName: brief.title,
          description: formatBriefAsMarkdown(brief),
          tags: ['content', 'geo', brief.targetMarket ?? 'PL'].filter(Boolean),
          priority: 2,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast('success', lang === 'pl' ? 'Zadanie dodane do ClickUp ✓' : 'Task added to ClickUp ✓');
    } catch {
      showToast('error', lang === 'pl' ? 'Błąd połączenia z ClickUp' : 'ClickUp connection error');
    } finally {
      setClickupLoading(false);
    }
  };

  const md = formatBriefAsMarkdown(brief);
  const today = new Date().toISOString().slice(0, 10);
  const totalScore = brief.geoScore;

  return (
    <div
      className="fixed inset-0 z-[998] flex items-center justify-center p-4"
      style={{ background: 'rgba(7,9,14,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0F1115] border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col">

        {/* Accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-indigo-600 shrink-0" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="space-y-0.5 pr-8">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
              Content Brief — GEO Optimized
            </span>
            <h2 className="text-base font-extrabold text-white leading-snug">{brief.title}</h2>
            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
              <span>{today}</span>
              {brief.targetMarket && (
                <>
                  <span className="text-slate-700">·</span>
                  <span className="text-indigo-400">{brief.targetMarket}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* GEO Score badge */}
            <div className="text-center">
              <div className={`text-2xl font-black font-mono ${SCORE_COLOR(totalScore)}`}>
                {totalScore}%
              </div>
              <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">GEO Score</div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Query */}
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">
              {lang === 'pl' ? 'Intencja zapytania' : 'Query context'}
            </div>
            <p className="text-xs text-slate-200 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 font-mono leading-relaxed">
              {brief.query}
            </p>
          </div>

          {/* Score breakdown */}
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">
              {lang === 'pl' ? 'Rozkład wyników GEO' : 'GEO Score breakdown'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {([
                ['Direct answers', brief.rating.declarativeAnswers],
                ['Factual density', brief.rating.factualDensity],
                ['Citation triggers', brief.rating.citationTriggers],
                ['Intent resolution', brief.rating.keywordRetrievalStructure],
              ] as [string, number][]).map(([label, val]) => (
                <div key={label} className="bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono">{label}</span>
                    <span className={`text-xs font-bold font-mono ${SCORE_COLOR(val * 4)}`}>{val}<span className="text-slate-600">/25</span></span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${SCORE_BAR(val * 4)}`} style={{ width: `${(val / 25) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimized passage */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">
              <Zap className="w-3 h-3 text-amber-400" />
              {lang === 'pl' ? 'Fragment zoptymalizowany (gotowy do wklejenia)' : 'Optimized passage (paste-ready)'}
            </div>
            <div className="flex items-start gap-2 bg-indigo-950/20 border border-indigo-900/30 text-xs text-indigo-300 p-2 rounded-lg mb-2 leading-snug">
              💡 {lang === 'pl'
                ? 'Umieść ten fragment w pierwszych 150 słowach artykułu dla maksymalnego cytowania przez AI.'
                : 'Place this in the first 150 words of your article for maximum AI citation.'}
            </div>
            <blockquote className="p-3.5 rounded-lg bg-[#0e121a] border border-cyan-900/30 text-xs font-mono text-amber-100 leading-relaxed border-l-2 border-l-cyan-500">
              {brief.optimizedPassage}
            </blockquote>
          </div>

          {/* Strengths / weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-wider mb-2">
                ✔ {lang === 'pl' ? 'Atuty' : 'Strengths'}
              </div>
              <ul className="space-y-1">
                {brief.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300 font-mono">
                    <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[10px] text-amber-500 font-bold font-mono uppercase tracking-wider mb-2">
                ✗ {lang === 'pl' ? 'Do poprawy' : 'Weaknesses'}
              </div>
              <ul className="space-y-1">
                {brief.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300 font-mono">
                    <AlertCircle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Markdown preview (collapsible) */}
          <details className="group">
            <summary className="text-[10px] text-slate-500 font-mono uppercase tracking-widest cursor-pointer hover:text-slate-300 transition select-none">
              <FileText className="w-3 h-3 inline mr-1" />
              {lang === 'pl' ? 'Podgląd Markdown ▸' : 'Markdown preview ▸'}
            </summary>
            <pre className="mt-2 p-3 rounded-lg bg-[#0a0c10] border border-slate-800 text-[10px] text-slate-400 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {md}
            </pre>
          </details>

        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-800 shrink-0 space-y-2.5">

          {/* Toast */}
          {toast && (
            <div className={`flex items-center gap-2 text-[11px] font-mono px-3 py-2 rounded-lg border ${
              toast.type === 'success'
                ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400'
                : 'bg-rose-950/30 border-rose-900/40 text-rose-400'
            }`}>
              {toast.type === 'success'
                ? <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              {toast.message}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold bg-[#151921] hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition cursor-pointer"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {lang === 'pl' ? 'Kopiuj jako Markdown' : 'Copy as Markdown'}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold bg-[#151921] hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {lang === 'pl' ? 'Pobierz .txt' : 'Download .txt'}
            </button>

            <button
              onClick={handleClickUp}
              disabled={clickupLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold bg-violet-900/40 hover:bg-violet-800/50 border border-violet-800/60 rounded-xl text-violet-300 transition cursor-pointer disabled:opacity-50"
            >
              {clickupLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <ExternalLink className="w-3.5 h-3.5" />}
              {lang === 'pl' ? 'Dodaj do ClickUp' : 'Add to ClickUp'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
