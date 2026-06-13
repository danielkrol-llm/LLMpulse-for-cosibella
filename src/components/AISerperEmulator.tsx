import React, { useState, useEffect } from 'react';
import { KeyCountry } from '../types';
import { 
  Play, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  ArrowRight, 
  UserCheck, 
  CheckCircle2, 
  BarChart3, 
  History, 
  Settings, 
  Copy, 
  Download, 
  Trash2, 
  Languages,
  Save,
  Cloud,
  CloudLightning
} from 'lucide-react';
import { translations } from '../translations';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

interface AISerperEmulatorProps {
  countriesMetadata: Record<KeyCountry, any>;
  onAddLogMessage?: (msg: string) => void;
  onRefreshAllData?: () => void;
  lang?: 'pl' | 'en';
}

interface HistoricalAudit {
  id: string;
  ts: string;
  query: string;
  country: KeyCountry;
  brand: string;
  results: Record<string, any>;
}

export default function AISerperEmulator({
  countriesMetadata,
  onAddLogMessage,
  onRefreshAllData,
  lang = 'pl',
}: AISerperEmulatorProps) {
  const t = translations[lang];

  // --- SUB-TAB ROUTING ---
  const [activeSubTab, setActiveSubTab] = useState<'MONITOR' | 'BATCH' | 'ANALYTICS' | 'HISTORY' | 'KEYS'>('MONITOR');

  // --- BASIC SELECTIONS ---
  const [selectedCountry, setSelectedCountry] = useState<KeyCountry>('PL');
  const [customQuery, setCustomQuery] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // --- LOCAL PERSISTENCE STATE ---
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('llm-auditor-keys');
      return saved ? JSON.parse(saved) : { openai: '', anthropic: '', gemini: '', perplexity: '' };
    } catch {
      return { openai: '', anthropic: '', gemini: '', perplexity: '' };
    }
  });

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({
    openai: false, anthropic: false, gemini: false, perplexity: false
  });

  const [brandToTrack, setBrandToTrack] = useState(() => {
    return localStorage.getItem('llm-auditor-brand') || 'Cosibella';
  });

  const [competitorsText, setCompetitorsText] = useState(() => {
    return localStorage.getItem('llm-auditor-competitors') || 'Hebe, Notino, Douglas, Sephora, Cocolita, Ezebra';
  });

  const [auditHistory, setAuditHistory] = useState<HistoricalAudit[]>(() => {
    try {
      const saved = localStorage.getItem('llm-auditor-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [monitorResults, setMonitorResults] = useState<Record<string, any> | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);

  const loadHistoryFromFirestore = async (user: User) => {
    setIsLoadingCloud(true);
    try {
      const qSnap = await getDocs(
        query(
          collection(db, 'auditQueries'),
          orderBy('createdAt', 'desc'),
          limit(60)
        )
      );
      
      const grouped: Record<string, HistoricalAudit> = {};
      
      qSnap.forEach((doc) => {
        const item = doc.data();
        const parts = item.id.split('-');
        const baseId = parts.slice(0, 2).join('-');
        const itemDate = item.createdAt || new Date().toISOString();
        
        if (!grouped[baseId]) {
          grouped[baseId] = {
            id: baseId,
            ts: itemDate,
            query: item.queryText || '',
            country: (item.country as KeyCountry) || 'PL',
            brand: item.brand || 'Cosibella',
            results: {}
          };
        }
        
        grouped[baseId].results[item.model] = {
          answer: item.responseMarkdown || '',
          brandPresence: item.score > 0 || (item.detectedBrands && item.detectedBrands.length > 0),
          rankingPosition: item.score > 0 ? 'top3' : 'none',
          shareOfVoice: item.score || 0,
          sentiment: 'positive',
          competitorsMentioned: item.detectedBrands || [],
          attributionSource: 'Cloud Firestore'
        };
      });
      
      const firestoreHistory = Object.values(grouped).sort((a, b) => b.ts.localeCompare(a.ts));
      
      setAuditHistory((prevLocal) => {
        const localMap = new Map<string, HistoricalAudit>(prevLocal.map((item) => [item.id, item]));
        firestoreHistory.forEach((item) => {
          localMap.set(item.id, item);
        });
        const combined = Array.from(localMap.values()).sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 100);
        localStorage.setItem('llm-auditor-history', JSON.stringify(combined));
        return combined;
      });
      
      onAddLogMessage?.(lang === 'pl' 
        ? `Baza danych: zsynchronizowano wpisy historii z chmury Firestore` 
        : `Database: synchronized historical records from live Cloud Firestore`
      );
    } catch (e) {
      console.warn('Firestore sync failed or offline:', e);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      setCurrentUser(usr);
      if (usr) {
        loadHistoryFromFirestore(usr);
      }
    });
    return () => unsub();
  }, [lang]);

  // Sync keys from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('llm-auditor-keys');
      if (saved) {
        setApiKeys(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error syncing keys from localStorage mount', e);
    }
  }, []);

  // --- BATCH TESTING CONFIGS & RESULTS ---
  const [batchQueriesText, setBatchQueriesText] = useState(
    lang === 'pl'
      ? 'Gdzie kupić koreańskie kosmetyki w Polsce?\nSzybki sklep z darmową konsultacją kosmetyczną\nSklep z niacynamidem Beauty of Joseon\nBest beauty online store reviews Poland'
      : 'Gdzie kupić koreańskie kosmetyki w Polsce?\nSzybki sklep z darmową konsultacją kosmetyczną\nSklep z niacynamidem Beauty of Joseon\nBest beauty online store reviews Poland'
  );
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const [batchCurrentIndex, setBatchCurrentIndex] = useState(0);
  const [batchResults, setBatchResults] = useState<any[]>([]);

  // Presets trigger mapping
  const presets = lang === 'pl' ? [
    { text: 'Poleć najlepszy polski specjalistyczny sklep z kosmetykami', query: 'what is the best skincare shop in Poland?' },
    { text: 'Gdzie kupić koreańskie kosmetyki w Polsce z szybką wysyłką', query: 'Gdzie kupić koreańskie kosmetyki w Polsce?' },
    { text: 'Zalecany czeski sklep dermo z darmową konsultacją', query: 'kde koupit kosmetiku s konzultací kosmetičky česká republika' }
  ] : [
    { text: 'Recommend the best Polish specialized cosmetics store', query: 'what is the best skincare shop in Poland?' },
    { text: 'Where to buy Korean cosmetics Poland fast shipping', query: 'Gdzie kupić koreańskie kosmetyki w Polsce?' },
    { text: 'Recommended cosmetics store with cosmetologist consultation Czechia', query: 'kde koupit kosmetiku s konzultací kosmetičky česká republika' }
  ];

  // Helper translations for position & sentiment
  const getPosLabel = (p: string) => {
    if (!p) return lang === 'pl' ? '❌ Brak wzmianki' : '❌ Not Mentioned';
    const pl = lang === 'pl';
    if (p.includes('1') || p.includes('first')) return pl ? '🥇 Rekomendacja #1' : '🥇 First Choice';
    if (p.includes('3') || p.includes('top3')) return pl ? '🥈 Pozycja w Top 3' : '🥈 Top 3 List';
    if (p.includes('10') || p.includes('top10')) return pl ? '🥉 Pozycja w Top 10' : '🥉 Top 10 List';
    return pl ? '❌ Brak wzmianki' : '❌ Not Mentioned';
  };

  const getSentimentLabel = (s: string) => {
    if (s === 'positive') return lang === 'pl' ? '🟢 Pozytywny' : '🟢 Positive';
    if (s === 'negative') return lang === 'pl' ? '🔴 Negatywny' : '🔴 Negative';
    return lang === 'pl' ? '🟡 Neutralny' : '🟡 Neutral';
  };

  // --- SAVE SETTINGS ---
  const handleSelectPreset = (q: string) => {
    setCustomQuery(q);
    setErrorText(null);
  };

  const saveKeys = (newKeys: typeof apiKeys) => {
    setApiKeys(newKeys);
    localStorage.setItem('llm-auditor-keys', JSON.stringify(newKeys));
    onAddLogMessage?.(lang === 'pl' ? 'Klucze API zostały zaktualizowane pomyślnie' : 'Private API keys updated locally');
  };

  const saveBrandConfig = () => {
    localStorage.setItem('llm-auditor-brand', brandToTrack);
    localStorage.setItem('llm-auditor-competitors', competitorsText);
    onAddLogMessage?.(lang === 'pl' ? `Konfiguracja marki zaktualizowana: ${brandToTrack}` : `Brand tracker configuration saved: ${brandToTrack}`);
    alert(lang === 'pl' ? 'Zapisano pomyślnie!' : 'Configuration saved successfully!');
  };

  // --- RUN SINGLE MONITOR SIMULATOR / REAL CALLS ---
  const handleRunMonitor = async () => {
    const q = customQuery.trim();
    if (!q) {
      setErrorText(lang === 'pl' ? 'Wpisz zapytanie.' : 'Please enter a search query.');
      return;
    }
    setErrorText(null);
    setIsAuditing(true);
    setMonitorResults(null);
    onAddLogMessage?.(lang === 'pl' ? `Uruchomiono Audytor Live dla zapytania: "${q}"` : `Launched Live Auditor request: "${q}"`);

    const targetLLMs = ['Gemini', 'ChatGPT', 'Claude', 'Perplexity'];
    const parsedComps = competitorsText.split(',').map(c => c.trim()).filter(Boolean);
    const resultsMap: Record<string, any> = {};

    try {
      await Promise.all(
        targetLLMs.map(async (llm) => {
          try {
            const resp = await fetch('/api/live-query', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: q,
                country: selectedCountry,
                llm: llm,
                brand: brandToTrack,
                competitors: parsedComps,
                userKeys: apiKeys
              })
            });
            if (!resp.ok) throw new Error(`Status ${resp.status}`);
            const data = await resp.json();
            resultsMap[llm] = data;
          } catch (err: any) {
            console.error(`Error querying ${llm}:`, err);
            resultsMap[llm] = {
              answer: lang === 'pl' ? `Błąd połączenia z API: ${err.message}` : `Integration connection error: ${err.message}`,
              brandPresence: false,
              rankingPosition: 'none',
              shareOfVoice: 0,
              sentiment: 'none',
              competitorsMentioned: [],
              error: err.message
            };
          }
        })
      );

      setMonitorResults(resultsMap);

      const baseRunId = `aud-${Date.now()}`;
      const newAudit: HistoricalAudit = {
        id: baseRunId,
        ts: new Date().toISOString(),
        query: q,
        country: selectedCountry,
        brand: brandToTrack,
        results: resultsMap
      };

      const updatedHistory = [newAudit, ...auditHistory].slice(0, 100);
      setAuditHistory(updatedHistory);
      localStorage.setItem('llm-auditor-history', JSON.stringify(updatedHistory));

      // --- FIRESTORE PERSISTENCE SYNC ---
      if (auth.currentUser) {
        onAddLogMessage?.(lang === 'pl' ? 'Chmura Firestore: zapisywanie wyników analizy...' : 'Cloud Firestore: saving analysis results...');
        try {
          await Promise.all(
            Object.entries(resultsMap).map(async ([llm, data]) => {
              const docId = `${baseRunId}-${llm}`;
              const docData = {
                id: docId,
                queryText: q.substring(0, 1000),
                model: llm,
                responseMarkdown: (data.answer || '').substring(0, 20000),
                citations: data.citations || [],
                score: Number(data.shareOfVoice) || 0,
                detectedBrands: data.competitorsMentioned || [],
                createdAt: new Date().toISOString(),
                country: selectedCountry,
                brand: brandToTrack
              };
              await setDoc(doc(db, 'auditQueries', docId), docData);
            })
          );
          onAddLogMessage?.(lang === 'pl' ? 'Chmura Firestore: dane zsynchronizowane!' : 'Cloud Firestore: data synchronized securely!');
        } catch (err) {
          console.error('Firestore save failed', err);
          onAddLogMessage?.(lang === 'pl' ? 'Chmura Firestore: błąd zapisu historii' : 'Cloud Firestore: serialization mismatch on persist handler');
        }
      }

      onAddLogMessage?.(lang === 'pl' ? `Audytor zakończony: "${q.substring(0, 20)}..."` : `Live Auditor complete: "${q.substring(0, 20)}..."`);
      onRefreshAllData?.();
    } catch (e: any) {
      setErrorText(e.message);
    } finally {
      setIsAuditing(false);
    }
  };

  // --- RUN BATCH QUEUE ---
  const handleRunBatch = async () => {
    if (isBatchRunning) return;
    const queries = batchQueriesText.split('\n').map(q => q.trim()).filter(Boolean);
    if (queries.length === 0) {
      alert(lang === 'pl' ? 'Wpisz zapytania do przetestowania.' : 'Please provide batch queries.');
      return;
    }

    setIsBatchRunning(true);
    setBatchProgress(0);
    setBatchTotal(queries.length);
    setBatchCurrentIndex(0);
    setBatchResults([]);
    onAddLogMessage?.(lang === 'pl' ? `Rozpoczęto audyt serii ${queries.length} zapytań` : `Started batch test run for ${queries.length} queries`);

    const parsedComps = competitorsText.split(',').map(c => c.trim()).filter(Boolean);
    const accumulated: any[] = [];

    for (let i = 0; i < queries.length; i++) {
      const q = queries[i];
      setBatchCurrentIndex(i);
      
      const targetLLMs = ['Gemini', 'ChatGPT', 'Claude', 'Perplexity'];
      const queryResults: Record<string, any> = {};

      try {
        await Promise.all(
          targetLLMs.map(async (llm) => {
            try {
              const resp = await fetch('/api/live-query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  query: q,
                  country: selectedCountry,
                  llm: llm,
                  brand: brandToTrack,
                  competitors: parsedComps,
                  userKeys: apiKeys
                })
              });
              const data = await resp.json();
              queryResults[llm] = data;
            } catch {
              queryResults[llm] = { brandPresence: false, rankingPosition: 'none', shareOfVoice: 0, sentiment: 'none', competitorsMentioned: [] };
            }
          })
        );

        const row = {
          query: q,
          results: queryResults,
          ts: new Date().toISOString()
        };
        accumulated.push(row);
        setBatchResults([...accumulated]);

        const baseDocId = `aud-batch-${Date.now()}-${i}`;
        const auditRecord: HistoricalAudit = {
          id: baseDocId,
          ts: new Date().toISOString(),
          query: q,
          country: selectedCountry,
          brand: brandToTrack,
          results: queryResults
        };

        setAuditHistory(prev => {
          const joined = [auditRecord, ...prev].slice(0, 100);
          localStorage.setItem('llm-auditor-history', JSON.stringify(joined));
          return joined;
        });

        // --- BATCH PERSIST TO FIRESTORE ---
        if (auth.currentUser) {
          try {
            await Promise.all(
              Object.entries(queryResults).map(async ([llm, data]: [string, any]) => {
                const docId = `${baseDocId}-${llm}`;
                const docData = {
                  id: docId,
                  queryText: q.substring(0, 1000),
                  model: llm,
                  responseMarkdown: (data.answer || '').substring(0, 20000),
                  citations: data.citations || [],
                  score: Number(data.shareOfVoice) || 0,
                  detectedBrands: data.competitorsMentioned || [],
                  createdAt: new Date().toISOString(),
                  country: selectedCountry,
                  brand: brandToTrack
                };
                await setDoc(doc(db, 'auditQueries', docId), docData);
              })
            );
          } catch (err) {
            console.error('Firestore batch save failed', err);
          }
        }

      } catch (err) {
        console.error('Error in batch loop', err);
      }

      setBatchProgress(Math.round(((i + 1) / queries.length) * 100));
      await new Promise(r => setTimeout(r, 450));
    }

    setIsBatchRunning(false);
    onAddLogMessage?.(lang === 'pl' ? 'Audyt seryjny zakończony pomyślnie' : 'Batch testing run successfully finished');
    onRefreshAllData?.();
  };

  // --- ANALYTICS CALCULATIONS ---
  const getCompetitorsStats = () => {
    const counts: Record<string, number> = {};
    let totalMentions = 0;

    auditHistory.forEach(audit => {
      Object.keys(audit.results).forEach(l => {
        const r = audit.results[l];
        if (!r || !r.competitorsMentioned) return;
        (r.competitorsMentioned as string[]).forEach(c => {
          counts[c] = (counts[c] || 0) + 1;
          totalMentions++;
        });
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, val]) => ({
        name,
        count: val,
        percentage: totalMentions > 0 ? Math.round((val / auditHistory.length) * 100) : 0
      }));
  };

  const getGlobalStats = () => {
    let totals = 0;
    let presenceVal = 0;
    const llmMentions: Record<string, { total: number; present: number }> = {
      ChatGPT: { total: 0, present: 0 },
      Claude: { total: 0, present: 0 },
      Gemini: { total: 0, present: 0 },
      Perplexity: { total: 0, present: 0 }
    };

    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    const dateTrend: Record<string, { total: number; mentions: number }> = {};

    auditHistory.forEach(audit => {
      const dayKey = audit.ts.substring(5, 10);
      if (!dateTrend[dayKey]) dateTrend[dayKey] = { total: 0, mentions: 0 };

      Object.keys(audit.results).forEach(llm => {
        const r = audit.results[llm];
        if (!r) return;
        totals++;
        dateTrend[dayKey].total++;

        if (llmMentions[llm]) {
          llmMentions[llm].total++;
        }

        if (r.brandPresence) {
          presenceVal++;
          dateTrend[dayKey].mentions++;
          if (llmMentions[llm]) llmMentions[llm].present++;

          if (r.sentiment === 'positive') sentimentCounts.positive++;
          else if (r.sentiment === 'negative') sentimentCounts.negative++;
          else sentimentCounts.neutral++;
        }
      });
    });

    const averageMentionRate = totals > 0 ? Math.round((presenceVal / totals) * 100) : 0;

    const trendsMapped = Object.entries(dateTrend)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, val]) => ({
        label: day,
        rate: val.total > 0 ? Math.round((val.mentions / val.total) * 100) : 0
      }));

    return {
      averageMentionRate,
      totals,
      llmMentions,
      sentimentCounts,
      trendsMapped
    };
  };

  const stats = getGlobalStats();

  const handleClearHistory = () => {
    if (confirm(lang === 'pl' ? 'Czy na pewno chcesz usunąć całą historię audytów?' : 'Are you sure you want to completely erase the audit logs?')) {
      setAuditHistory([]);
      localStorage.removeItem('llm-auditor-history');
      setMonitorResults(null);
      setBatchResults([]);
      onAddLogMessage?.(lang === 'pl' ? 'Wyczyszczono historię z pamięci' : 'Erase persistent audit history context');
    }
  };

  // --- EXPORT METRICS ---
  const handleExportCSV = () => {
    if (auditHistory.length === 0) {
      alert(lang === 'pl' ? 'Brak danych do eksportu.' : 'No items to export.');
      return;
    }
    const headers = ['Query', 'DateTime', 'Country', 'Brand', 'LLM', 'Presence', 'Position', 'SOV %', 'Sentiment', 'Source'];
    const rows = [headers];

    auditHistory.forEach(item => {
      Object.keys(item.results).forEach(llm => {
        const r = item.results[llm];
        if (!r) return;
        rows.push([
          item.query,
          item.ts,
          item.country,
          item.brand,
          llm,
          r.brandPresence ? 'YES' : 'NO',
          r.rankingPosition || '',
          String(r.shareOfVoice || 0),
          r.sentiment || '',
          r.attributionSource || 'Local Engine'
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LLMpulse-Audits-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToSheets = () => {
    if (auditHistory.length === 0) {
      alert(lang === 'pl' ? 'Brak danych.' : 'No audit data.');
      return;
    }
    const headers = ['Query', 'DateTime', 'Country', 'Brand', 'LLM', 'Presence', 'Position', 'SOV %', 'Sentiment'];
    const rows = auditHistory.map(item => {
      const rowQueries: string[] = [];
      Object.keys(item.results).forEach(llm => {
        const r = item.results[llm];
        if (!r) return;
        rowQueries.push([
          item.query,
          item.ts.substring(0, 16).replace('T', ' '),
          item.country,
          item.brand,
          llm,
          r.brandPresence ? 'YES' : 'NO',
          r.rankingPosition,
          `${r.shareOfVoice}%`,
          r.sentiment
        ].join('\t'));
      });
      return rowQueries.join('\n');
    });

    const tsvText = headers.join('\t') + '\n' + rows.join('\n');
    navigator.clipboard.writeText(tsvText)
      .then(() => {
        alert(lang === 'pl' 
          ? 'Skopiowano do schowka w formacie TSV! Otwórz Google Sheets i wklej (Ctrl+V).' 
          : 'Spreadsheet TSV copied successfully! Go to Google Sheets & press Ctrl+V to paste.'
        );
      })
      .catch((err) => {
        console.error('Copy to sheets error', err);
      });
  };

  // Bold brand entities naturally in markup
  const highlightEntities = (txt: string, trackingB: string) => {
    let htmlText = txt;
    if (!htmlText) return '';
    try {
      const bEsc = trackingB.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const bReg = new RegExp(`\\b(${bEsc})\\b`, 'gi');
      htmlText = htmlText.replace(bReg, `<mark class="bg-emerald-500/30 text-emerald-400 font-bold px-1 rounded-sm">$1</mark>`);

      const comps = competitorsText.split(',').map(c => c.trim()).filter(Boolean);
      comps.forEach(c => {
        if (!c) return;
        const cEsc = c.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const cReg = new RegExp(`\\b(${cEsc})\\b`, 'gi');
        htmlText = htmlText.replace(cReg, `<span class="text-amber-400/90 font-mono font-medium">$1</span>`);
      });
    } catch (e) {
      console.error(e);
    }
    return <div className="text-slate-350 leading-relaxed font-serif whitespace-pre-wrap text-[11px] sm:text-xs" dangerouslySetInnerHTML={{ __html: htmlText }} />;
  };

  return (
    <div className="bg-[#11141c] border border-slate-850/65 rounded-2xl shadow-xl overflow-hidden font-sans">
      
      {/* Top Header Card */}
      <div className="p-6 border-b border-slate-850 bg-[#161a24]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            Live LLMpulse Monitor & Auditor v2.2
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {lang === 'pl' 
              ? 'Realny monitoring i seryjny audyt widoczności Cosibella w wyszukiwarkach AI (ChatGPT, Claude, Gemini, Perplexity).'
              : 'Empirical multi-engine benchmark (ChatGPT, Claude, Gemini, Perplexity) testing brand visibility across Central-European language models.'}
          </p>
        </div>

        <div className="flex gap-2.5 shrink-0 select-none">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#0e1117] border border-slate-800 text-center min-w-[85px]">
            <span className="text-[8px] uppercase tracking-wider text-slate-505 block font-bold">SOV AVG</span>
            <span className="text-xs font-bold text-cyan-400 font-mono tracking-wide mt-0.5 inline-block">
              {stats.averageMentionRate > 0 ? `${stats.averageMentionRate}%` : '—'}
            </span>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-[#0e1117] border border-slate-800 text-center min-w-[85px]">
            <span className="text-[8px] uppercase tracking-wider text-slate-550 block font-bold">TOTAL TRIAL</span>
            <span className="text-xs font-bold text-slate-200 mt-0.5 inline-block font-mono">
              {auditHistory.length}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Sub-navigation bar */}
      <div className="px-4 border-b border-slate-850 bg-[#0c0e14] flex flex-wrap justify-between items-center">
        <div className="flex space-x-1 py-2">
          <button
            onClick={() => setActiveSubTab('MONITOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'MONITOR' ? 'bg-[#1a202e] text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            {lang === 'pl' ? 'Audytor Live' : 'Live Auditor'}
          </button>
          <button
            onClick={() => setActiveSubTab('BATCH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'BATCH' ? 'bg-[#1a202e] text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {lang === 'pl' ? 'Seryjny Test' : 'Batch Testing'}
          </button>
          <button
            onClick={() => setActiveSubTab('ANALYTICS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'ANALYTICS' ? 'bg-[#1a202e] text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {lang === 'pl' ? 'Logi i Analityka' : 'Analytics'}
          </button>
          <button
            onClick={() => setActiveSubTab('HISTORY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'HISTORY' ? 'bg-[#1a202e] text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            {lang === 'pl' ? 'Archiwum' : 'Audit History'}
          </button>
          <button
            onClick={() => setActiveSubTab('KEYS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'KEYS' ? 'bg-[#1a202e] text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            {lang === 'pl' ? 'Konfiguracja API' : 'API Keys & Brand'}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2.5 text-[10px] font-mono text-slate-500 py-2 select-none">
          {currentUser ? (
            <div className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/45 border border-emerald-900/40 px-1.5 py-0.5 rounded mr-1">
              <Cloud className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>FIRESTORE SYNCED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400 bg-slate-950/40 border border-slate-900 px-1.5 py-0.5 rounded mr-1">
              <CloudLightning className="w-3 h-3 text-slate-550" />
              <span>LOCAL PERSISTENCE ONLY</span>
            </div>
          )}
          <span>Tracked:</span>
          <span className="text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-900/40 font-bold">{brandToTrack}</span>
          <span>CEE Region:</span>
          <span>{countriesMetadata[selectedCountry]?.name || 'Poland'}</span>
        </div>
      </div>

      {/* Main Container Render router */}
      <div className="p-6">

        {/* ==================== SUB-TAB A: SINGLE MONITOR ==================== */}
        {activeSubTab === 'MONITOR' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-4 space-y-4">
                
                {/* Target Region */}
                <div className="bg-[#151922] border border-slate-850 rounded-xl p-4.5 space-y-3">
                  <div className="flex items-center gap-1">
                    <Languages className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block font-mono">
                      {lang === 'pl' ? 'Wybierz Rynek Target' : 'CEE Target Market'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-1.5">
                    {(Object.keys(countriesMetadata) as KeyCountry[]).map((code) => (
                      <button
                        key={code}
                        onClick={() => setSelectedCountry(code)}
                        className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition cursor-pointer flex flex-col items-center justify-center ${
                          selectedCountry === code
                            ? 'bg-cyan-500 text-slate-900 border-cyan-500 shadow-md'
                            : 'bg-[#0f1115] text-slate-400 border-slate-800/80 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-sm">{countriesMetadata[code]?.flag}</span>
                        <span className="text-[9px] mt-0.5 uppercase">{code}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Templates seeds */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1 font-mono uppercase tracking-wider pl-1.5">
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    {lang === 'pl' ? 'Przykłady pytań' : 'Search Templates'}
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {presets.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectPreset(p.query)}
                        className="text-left py-2 px-3 border border-slate-850 hover:border-cyan-500 bg-[#0F1115]/80 hover:bg-[#12161f]/80 rounded-xl text-xs transition flex justify-between items-center group cursor-pointer"
                      >
                        <div className="truncate pr-2">
                          <span className="font-semibold text-slate-250 block truncate group-hover:text-cyan-400">
                            {p.text}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono italic block truncate mt-0.5">
                            Query: &ldquo;{p.query}&rdquo;
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Query Search */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 block pl-1.5 font-mono uppercase tracking-wider">
                    {lang === 'pl' ? 'Wpisz zapytanie do Silników AI' : 'Enter Target Inquiry'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customQuery}
                      onChange={(e) => {
                        setCustomQuery(e.target.value);
                        setErrorText(null);
                      }}
                      placeholder="Gdzie kupić azjatyckie kosmetyki wolne od okrucieństwa?"
                      className="w-full text-xs font-medium border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-3 pr-10 bg-[#0F1115] text-slate-100 placeholder-slate-505 focus:outline-none"
                    />
                    <Sparkles className="absolute right-3.5 top-3.5 w-4 h-4 text-cyan-400 pointer-events-none" />
                  </div>
                  {errorText && (
                    <p className="text-[10px] text-rose-500 flex items-center gap-1 pl-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errorText}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleRunMonitor}
                  disabled={isAuditing}
                  className="w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer select-none border border-cyan-500 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  {isAuditing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                      Auditing 4 AI Engines...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {lang === 'pl' ? '🔎 Wyślij i przetestuj' : '🔎 Query Live Multi-LLM'}
                    </>
                  )}
                </button>

              </div>

              {/* Outputs panel */}
              <div className="lg:col-span-8 space-y-4">
                
                {isAuditing && (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4 rounded-2xl bg-[#0d1017] border border-slate-850">
                    <div className="relative">
                      <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-cyan-400 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-cyan-400 font-mono tracking-wider">CREATING REALTIME BENCHMARKS</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                        Gathering search context and requesting responses parallelly across engines...
                      </p>
                    </div>
                  </div>
                )}

                {!isAuditing && !monitorResults && (
                  <div className="flex flex-col items-center justify-center py-20 border border-slate-850/65 rounded-2xl bg-[#0f1116]/40 text-center space-y-4">
                    <div className="w-11 h-11 rounded-full bg-slate-900/80 flex items-center justify-center border border-slate-830">
                      <UserCheck className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-205 font-mono tracking-wide">{lang === 'pl' ? 'Audytor Porównania gotowy' : 'Auditor Playground Idle'}</h4>
                      <p className="text-[11px] text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                        Uruchom zapytanie. System odpyta jednocześnie 4 kluczowe modele AI (ChatGPT, Claude, Gemini, Perplexity) i wykaże obecność Twojej marki w ich indexach.
                      </p>
                    </div>
                  </div>
                )}

                {!isAuditing && monitorResults && (
                  <div className="space-y-4">
                    
                    <div className="p-4 bg-gradient-to-r from-cyan-950/15 to-indigo-950/5 rounded-xl border border-slate-850 flex flex-wrap items-center justify-between gap-3 font-mono">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="text-[10px] text-slate-500 block">AUDITED QUERY</span>
                          <span className="text-xs text-slate-200 font-bold">&ldquo;{customQuery}&rdquo;</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(Object.entries(monitorResults) as Array<[string, any]>).map(([llm, data]) => {
                        const isOk = !data.error;
                        return (
                          <div key={llm} className={`rounded-xl border bg-[#0d1017] p-4.5 flex flex-col justify-between min-h-[290px] transition-all duration-200 ${
                            data.brandPresence ? 'border-emerald-500/25 shadow-md' : 'border-slate-850'
                          }`}>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-850/80 pb-2">
                                <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                                  {llm}
                                </span>
                                {data.brandPresence ? (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 uppercase font-mono">
                                    {lang === 'pl' ? 'Wykryto' : 'Mentioned'}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-450 border border-rose-500/15 uppercase font-mono">
                                    {lang === 'pl' ? 'Brak' : 'Absent'}
                                  </span>
                                )}
                              </div>

                              <div className="min-h-[120px] max-h-[160px] overflow-y-auto pr-1">
                                {isOk ? (
                                  highlightEntities(data.answer, brandToTrack)
                                ) : (
                                  <p className="text-xs text-rose-500 font-mono italic">⚠️ {data.answer}</p>
                                )}
                              </div>
                            </div>

                            {isOk && (
                              <div className="pt-2.5 border-t border-slate-850/80 space-y-2 mt-3 text-[10px]">
                                <div className="flex flex-wrap gap-1">
                                  {data.brandPresence && (
                                    <>
                                      <span className="bg-[#121622] text-[#818cf8] border border-slate-800 rounded px-1.5 py-0.5 font-bold font-mono">
                                        {getPosLabel(data.rankingPosition)}
                                      </span>
                                      <span className="bg-[#121622] text-[#22c55e] border border-slate-800 rounded px-1.5 py-0.5 font-bold font-mono">
                                        {getSentimentLabel(data.sentiment)}
                                      </span>
                                      <span className="bg-[#121622] text-cyan-400 border border-slate-800 rounded px-1.5 py-0.5 font-bold font-mono">
                                        SOV: {data.shareOfVoice}%
                                      </span>
                                    </>
                                  )}
                                  {data.competitorsMentioned?.map((comp: string, idx: number) => (
                                    <span key={idx} className="bg-slate-900 text-slate-500 border border-slate-850 rounded text-[9px] font-bold px-1.5 py-0.5 font-mono">
                                      {comp}
                                    </span>
                                  ))}
                                </div>
                                <div className="text-[9px] font-mono text-slate-500 flex justify-between">
                                  <span>Source:</span>
                                  <span className="text-slate-400 font-bold">{data.attributionSource || 'Simulator'}</span>
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* ==================== SUB-TAB B: BATCH TESTING SUITE ==================== */}
        {activeSubTab === 'BATCH' && (
          <div className="space-y-6">
            <div className="p-5 border border-slate-850 rounded-xl bg-[#0d1017] space-y-4">
              <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wide">
                📦 Seryjna Weryfikacja LLM (Bulk Tester)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Zapytania testowe (Jedno na linię)</span>
                  <textarea
                    rows={4}
                    value={batchQueriesText}
                    onChange={(e) => setBatchQueriesText(e.target.value)}
                    className="w-full text-xs font-mono p-3 rounded-lg bg-[#0a0c10] border border-slate-800 text-slate-300 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-3">
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase text-slate-505 block mb-1">Target Country</label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value as KeyCountry)}
                      className="w-full bg-[#0a0c10] text-xs font-bold px-2 py-2.5 rounded-lg border border-slate-800 text-slate-300 focus:outline-none"
                    >
                      {(Object.keys(countriesMetadata) as KeyCountry[]).map((code) => (
                        <option key={code} value={code}>
                          {countriesMetadata[code]?.flag} {countriesMetadata[code]?.name} ({code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleRunBatch}
                    disabled={isBatchRunning}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl cursor-pointer text-xs"
                  >
                    {isBatchRunning ? 'Running diagnostics...' : 'Run Bulk Benchmark'}
                  </button>
                </div>
              </div>
            </div>

            {isBatchRunning && (
              <div className="p-4 rounded-xl border border-slate-800 bg-[#0e1117] space-y-2 font-mono">
                <div className="flex justify-between text-xs">
                  <span className="text-cyan-400 font-bold">Query {batchCurrentIndex + 1} of {batchTotal}...</span>
                  <span>{batchProgress}%</span>
                </div>
                <div className="h-2 rounded bg-slate-900 overflow-hidden border border-slate-850">
                  <div style={{ width: `${batchProgress}%` }} className="h-full bg-cyan-400 transition-all duration-300" />
                </div>
              </div>
            )}

            {batchResults.length > 0 && (
              <div className="border border-slate-850 rounded-xl bg-[#0d1017] p-5 space-y-4 font-mono">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Spreadsheet Output</span>
                  <div className="flex gap-2">
                    <button onClick={handleCopyToSheets} className="px-2 py-1 text-[10px] border border-slate-800 rounded bg-[#131722] text-slate-300 flex items-center gap-1 cursor-pointer">
                      Copy Google Sheets TSV
                    </button>
                    <button onClick={handleExportCSV} className="px-2 py-1 text-[10px] border border-slate-800 rounded bg-[#131722] text-slate-300 flex items-center gap-1 cursor-pointer">
                      Save CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-mono font-bold text-slate-400">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Query</th>
                        <th className="py-2 px-3 text-center">GPT</th>
                        <th className="py-2 px-3 text-center">Claude</th>
                        <th className="py-2 px-3 text-center">Gemini</th>
                        <th className="py-2 px-3 text-center">Perplexity</th>
                        <th className="py-2 px-3 text-center">SOV AVG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60 font-mono text-[11px]">
                      {batchResults.map((row, idx) => {
                        const g = row.results?.ChatGPT?.brandPresence;
                        const c = row.results?.Claude?.brandPresence;
                        const gem = row.results?.Gemini?.brandPresence;
                        const p = row.results?.Perplexity?.brandPresence;

                        const averageSOV = Math.round(([
                          row.results?.ChatGPT?.shareOfVoice || 0,
                          row.results?.Claude?.shareOfVoice || 0,
                          row.results?.Gemini?.shareOfVoice || 0,
                          row.results?.Perplexity?.shareOfVoice || 0,
                        ].reduce((x, y) => x + y, 0) / 4));

                        return (
                          <tr key={idx} className="hover:bg-slate-800/15 text-slate-300">
                            <td className="py-2 px-3 text-slate-500 font-bold">{idx + 1}</td>
                            <td className="py-2 px-3 text-slate-200 font-sans truncate max-w-[200px]">{row.query}</td>
                            <td className="py-2 px-3 text-center">{g ? '✓' : '—'}</td>
                            <td className="py-2 px-3 text-center">{c ? '✓' : '—'}</td>
                            <td className="py-2 px-3 text-center">{gem ? '✓' : '—'}</td>
                            <td className="py-2 px-3 text-center">{p ? '✓' : '—'}</td>
                            <td className={`py-2 px-3 text-center font-bold ${averageSOV > 0 ? 'text-cyan-400' : 'text-slate-600'}`}>
                              {averageSOV}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================== SUB-TAB C: LOGS & DYNAMIC ANALYTICS ==================== */}
        {activeSubTab === 'ANALYTICS' && (
          <div className="space-y-6">
            {auditHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-slate-850/65 rounded-2xl bg-[#0f1116]/40 text-center space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Brak danych diagnostycznych</p>
                <p className="text-[11px] text-slate-505 max-w-sm">Uruchom analizę w dziale Audytor Live, aby odblokować trend charts oraz raporty konkurentów.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                  <div className="p-4 rounded-xl border border-slate-850 bg-[#0d1017]">
                    <span className="text-[9px] text-slate-505 font-bold uppercase block">GLVS Share of Voice</span>
                    <span className="text-2xl font-bold text-cyan-400 block mt-1">{stats.averageMentionRate}%</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-850 bg-[#0d1017]">
                    <span className="text-[9px] text-slate-505 font-bold uppercase block">Zgromadzone Próby</span>
                    <span className="text-2xl font-bold text-slate-205 block mt-1">{stats.totals}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-850 bg-[#0d1017]">
                    <span className="text-[9px] text-slate-505 font-bold uppercase block">Wydźwięk Wzmianki</span>
                    <span className="text-2xl font-bold text-amber-400 block mt-1 text-sm uppercase">Positive Standard</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* SVG Map Chart */}
                  <div className="p-5 border border-slate-850 rounded-xl bg-[#0d1017] space-y-4">
                    <h4 className="text-xs font-bold text-slate-250 font-mono uppercase tracking-wide">
                      📊 Wskaźnik Wzmianek w Czasie (Trend Map)
                    </h4>
                    
                    {stats.trendsMapped.length < 2 ? (
                      <div className="h-[150px] flex items-center justify-center text-slate-505 font-mono text-[10px]">
                        Requires at least 2 distinct days of historical audit.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="relative h-[130px] bg-[#07090f]/50 border border-slate-850 px-2 rounded-lg py-4 flex items-end">
                          <svg className="w-full h-full text-cyan-500 font-mono overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                            <path
                              fill="none"
                              stroke="url(#trend-gradient)"
                              strokeWidth="2"
                              d={stats.trendsMapped.map((val, idx) => {
                                const x = (idx / (stats.trendsMapped.length - 1)) * 400;
                                const y = 100 - val.rate;
                                return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                              }).join(' ')}
                            />
                            <path
                              fill="url(#trend-fill)"
                              d={
                                `${stats.trendsMapped.map((val, idx) => {
                                  const x = (idx / (stats.trendsMapped.length - 1)) * 400;
                                  const y = 100 - val.rate;
                                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                }).join(' ')} L 400 100 L 0 100 Z`
                              }
                            />
                            <defs>
                              <linearGradient id="trend-gradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#6366f1" />
                              </linearGradient>
                              <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.12" />
                                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="flex justify-between font-mono text-[8px] text-slate-500">
                          <span>{stats.trendsMapped[0]?.label}</span>
                          <span>Timeline Span</span>
                          <span>{stats.trendsMapped[stats.trendsMapped.length - 1]?.label}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5 border border-slate-850 rounded-xl bg-[#0d1017] space-y-4">
                    <h4 className="text-xs font-bold text-slate-250 font-mono uppercase tracking-wide">
                      ⚡ Współwzmianki Rywali (Co-citation)
                    </h4>
                    
                    <div className="space-y-3 max-h-[140px] overflow-y-auto">
                      {getCompetitorsStats().slice(0, 4).map((comp, idx) => (
                        <div key={idx} className="space-y-1 font-mono text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-slate-300 font-bold">{comp.name}</span>
                            <span className="text-slate-500">Mentions: {comp.count} ({comp.percentage}%)</span>
                          </div>
                          <div className="h-1 rounded bg-slate-900 border border-slate-850 overflow-hidden">
                            <div style={{ width: `${comp.percentage}%` }} className="h-full bg-amber-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>
        )}

        {/* ==================== SUB-TAB D: HISTORY ARCHIVE ==================== */}
        {activeSubTab === 'HISTORY' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Session History ({auditHistory.length} Saved rows)
              </span>
              <div className="flex gap-2">
                <button onClick={handleCopyToSheets} disabled={auditHistory.length === 0} className="px-2 py-1.5 text-xs rounded border border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer flex items-center gap-1">
                  Copy Sheets TSV
                </button>
                <button onClick={handleExportCSV} disabled={auditHistory.length === 0} className="px-2 py-1.5 text-xs rounded border border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer flex items-center gap-1">
                  Export CSV
                </button>
                <button onClick={handleClearHistory} disabled={auditHistory.length === 0} className="px-2 py-1.5 text-xs rounded border border-red-950/40 text-rose-500 hover:bg-red-955/10 cursor-pointer flex items-center gap-1">
                  Clear All
                </button>
              </div>
            </div>

            <div className="border border-slate-850 bg-[#0d1017] rounded-xl overflow-x-auto font-mono text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-505 font-bold uppercase text-[9px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Query</th>
                    <th className="py-2.5 px-3 text-center">Country</th>
                    <th className="py-2.5 px-3 text-center">GPT</th>
                    <th className="py-2.5 px-3 text-center">Claude</th>
                    <th className="py-2.5 px-3 text-center">Gemini</th>
                    <th className="py-2.5 px-3 text-center">Perp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/50">
                  {auditHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/10 text-slate-350 font-mono text-[11px]">
                      <td className="py-2.5 px-3 text-slate-505 shrink-0 whitespace-nowrap">
                        {item.ts.substring(5, 16).replace('T', ' ')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-205 max-w-[200px] truncate" title={item.query}>{item.query}</td>
                      <td className="py-2.5 px-3 text-center text-slate-400 font-bold">{item.country}</td>
                      <td className="py-2.5 px-3 text-center">{item.results?.ChatGPT?.brandPresence ? '✓' : '—'}</td>
                      <td className="py-2.5 px-3 text-center">{item.results?.Claude?.brandPresence ? '✓' : '—'}</td>
                      <td className="py-2.5 px-3 text-center">{item.results?.Gemini?.brandPresence ? '✓' : '—'}</td>
                      <td className="py-2.5 px-3 text-center">{item.results?.Perplexity?.brandPresence ? '✓' : '—'}</td>
                    </tr>
                  ))}
                  {auditHistory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-505 italic">
                        No persistent history found. Runs will populate logs here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB E: CUSTOM SETTINGS ==================== */}
        {activeSubTab === 'KEYS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-5 border border-slate-850 rounded-xl bg-[#0d1017] space-y-4">
              <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                🔑 Prywatne Integracje (Klucze API)
              </h3>
              
              <div className="space-y-3 pt-2 text-xs">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold block flex justify-between">
                    <span>OpenAI API Key (ChatGPT)</span>
                    <button onClick={() => setShowKeys(p => ({ ...p, openai: !p.openai }))} className="text-slate-500 text-[9px]">
                      {showKeys.openai ? 'Hide' : 'Show'}
                    </button>
                  </label>
                  <input
                    type={showKeys.openai ? 'text' : 'password'}
                    value={apiKeys.openai}
                    onChange={(e) => saveKeys({ ...apiKeys, openai: e.target.value.trim() })}
                    placeholder="sk-..."
                    className="w-full text-xs font-mono p-2 rounded bg-[#07090f] border border-slate-850 text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold block flex justify-between">
                    <span>Anthropic API Key (Claude)</span>
                    <button onClick={() => setShowKeys(p => ({ ...p, anthropic: !p.anthropic }))} className="text-slate-500 text-[9px]">
                      {showKeys.anthropic ? 'Hide' : 'Show'}
                    </button>
                  </label>
                  <input
                    type={showKeys.anthropic ? 'text' : 'password'}
                    value={apiKeys.anthropic}
                    onChange={(e) => saveKeys({ ...apiKeys, anthropic: e.target.value.trim() })}
                    placeholder="sk-ant-..."
                    className="w-full text-xs font-mono p-2 rounded bg-[#07090f] border border-slate-850 text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold block flex justify-between">
                    <span>Perplexity API Key</span>
                    <button onClick={() => setShowKeys(p => ({ ...p, perplexity: !p.perplexity }))} className="text-slate-500 text-[9px]">
                      {showKeys.perplexity ? 'Hide' : 'Show'}
                    </button>
                  </label>
                  <input
                    type={showKeys.perplexity ? 'text' : 'password'}
                    value={apiKeys.perplexity}
                    onChange={(e) => saveKeys({ ...apiKeys, perplexity: e.target.value.trim() })}
                    placeholder="pplx-..."
                    className="w-full text-xs font-mono p-2 rounded bg-[#07090f] border border-slate-850 text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold block flex justify-between">
                    <span>Google Gemini API Key</span>
                    <button onClick={() => setShowKeys(p => ({ ...p, gemini: !p.gemini }))} className="text-slate-500 text-[9px]">
                      {showKeys.gemini ? 'Hide' : 'Show'}
                    </button>
                  </label>
                  <input
                    type={showKeys.gemini ? 'text' : 'password'}
                    value={apiKeys.gemini}
                    onChange={(e) => saveKeys({ ...apiKeys, gemini: e.target.value.trim() })}
                    placeholder="AIza..."
                    className="w-full text-xs font-mono p-2 rounded bg-[#07090f] border border-slate-850 text-slate-200"
                  />
                </div>

              </div>
            </div>

            <div className="p-5 border border-slate-850 rounded-xl bg-[#0d1017] flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                  🎯 Szczegóły Śledzenia Marki
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-slate-505 font-bold block">Keywords Twojej Marki (Entity)</label>
                    <input type="text" value={brandToTrack} onChange={(e) => setBrandToTrack(e.target.value)} className="w-full px-2.5 py-2.5 rounded bg-[#07090f] border border-slate-850 text-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-slate-505 font-bold block">Rywalizujące Marki (Oddziel przecinkami)</label>
                    <input type="text" value={competitorsText} onChange={(e) => setCompetitorsText(e.target.value)} className="w-full px-2.5 py-2.5 rounded bg-[#07090f] border border-slate-850 text-slate-200" />
                  </div>
                </div>
              </div>

              <button
                onClick={saveBrandConfig}
                className="w-full mt-4 py-3 bg-[#171c26] hover:bg-[#202735] text-slate-200 border border-slate-800 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer font-mono"
              >
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                Zakończ i Zapisz Konfigurację
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
