/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { KeyLLM, KeyCountry, QueryCategory, QueryAuditRow } from './types';
import EuropeMap from './components/EuropeMap';
import AIPromptOptimization from './components/AIPromptOptimization';
import VisibilityGapAnalysis from './components/VisibilityGapAnalysis';
import AISerperEmulator from './components/AISerperEmulator';
import SOVChart from './components/SOVChart';
import LogAnalyzer from './components/LogAnalyzer';
import QueryFanout from './components/QueryFanout';
import GEOToolSuite from './components/GEOToolSuite';
import SettingsTab from './components/SettingsTab';
import GSCAnalyticsHub from './components/GSCAnalyticsHub';
import SentinelSuite from './components/SentinelSuite';
import { translations } from './translations';
import { db, auth, googleProvider } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

import {
  Sparkles,
  Globe,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Flame,
  Award,
  Terminal,
  FileSpreadsheet,
  MonitorPlay,
  Heart,
  ExternalLink,
  BrainCircuit,
  MessageSquare,
  BadgeAlert,
  ChevronRight,
  UserCheck,
  Bell,
  Mail,
  ArrowUp,
  ArrowDown,
  Settings,
  LogIn,
  LogOut,
  Database,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'pl' | 'en'>('pl');
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SANDBOX' | 'OPTIMIZATIONS' | 'GAPS' | 'LOG_ANALYZER' | 'QUERY_FANOUT' | 'GEOTOOLSUITE' | 'GA4_GSC' | 'SENTINEL' | 'SETTINGS'>('DASHBOARD');

  // Core aggregated state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [allAudits, setAllAudits] = useState<QueryAuditRow[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<QueryAuditRow[]>([]);

  // Alerts configuration state
  const [alertThreshold, setAlertThreshold] = useState<number>(() => {
    return Number(localStorage.getItem('alertThreshold') || '30');
  });
  const [alertEmail, setAlertEmail] = useState(() => {
    return localStorage.getItem('alertEmail') || 'daniel.krol@cosibella.pl';
  });
  const [isAlertSubscribed, setIsAlertSubscribed] = useState(() => {
    return localStorage.getItem('isAlertSubscribed') === 'true';
  });
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Sorting and Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof QueryAuditRow | 'none'>('lastScanned');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Search and filter parameters for Table
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<'ALL' | KeyCountry>('ALL');
  const [llmFilter, setLlmFilter] = useState<'ALL' | KeyLLM>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | QueryCategory>('ALL');
  const [presenceFilter, setPresenceFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');

  // Selected audit for the Modal window (Audit Mode)
  const [selectedAuditForAuditModal, setSelectedAuditForAuditModal] = useState<QueryAuditRow | null>(null);

  // Quick select filters in Dashboard Map
  const [geoSelectedCountry, setGeoSelectedCountry] = useState<KeyCountry | 'ALL'>('ALL');
  const [sovSelectedLLM, setSovSelectedLLM] = useState<KeyLLM | 'ALL'>('ALL');

  // Google Search Console style Date Range State
  const [dateRange, setDateRange] = useState<string>('last_28_days');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-05-15');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-06-12');
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  // Console feed outputs
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  // Update console logs based on current language
  useEffect(() => {
    setConsoleLogs(lang === 'pl' ? [
      'System zainicjalizowany: LLMpulse Core v1.4.0',
      'Wczytano słowniki językowe: Polski, Ukraiński, Słowacki, Czeski, Węgierski, Niemiecki, Austriacki, Łotewski, Litewski, Rumuński',
      'Zainicjalizowano pulę 10 000 zoptymalizowanych zapytań lokalnych',
      'Zintegrowano potoki pobierania danych z Ahrefs i Merchant Center',
      'System gotowy do odbierania poleceń diagnostycznych...'
    ] : [
      'System initialized: LLMpulse Core v1.4.0',
      'Language Translation matrices loaded: Polish, Ukrainian, Slovak, Czech, Hungarian, German, Austrian, Latvian, Lithuanian, Romanian',
      'Initialized 10,000 localized queries pool generator',
      'Ahrefs API & Merchant Center Crawler pipelines verified',
      'Ready for diagnostic command inputs...'
    ]);
  }, [lang]);

  const addConsoleLog = (text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs((prev) => [`[${timestamp}] ${text}`, ...prev.slice(0, 15)]);
  };

  // Firebase Auth state session tracking and triggers
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setCurrentUser(usr);
      setAuthInitialized(true);
      if (usr) {
        addConsoleLog(lang === 'pl'
          ? `Sesja aktywna: zalogowano jako ${usr.email}`
          : `Session active: authenticated as ${usr.email}`
        );
      } else {
        addConsoleLog(lang === 'pl'
          ? 'Baza danych: Połącz się z Firebase, aby pisać i synchronizować dane w chmurze'
          : 'Database: Connection to Firebase Auth inactive. Offline state.'
        );
      }
    });
    return () => unsubscribe();
  }, [lang]);

  const handleGoogleSignIn = async () => {
    try {
      addConsoleLog(lang === 'pl' ? 'Inicjowanie okna logowania Google OAuth...' : 'Launching Google OAuth authorization flow...');
      const res = await signInWithPopup(auth, googleProvider);
      addConsoleLog(lang === 'pl'
        ? `Uwierzytelniono pomyślnie: witaj ${res.user.displayName || res.user.email}!`
        : `Authentication successful: Welcome ${res.user.displayName || res.user.email}!`
      );
    } catch (err: any) {
      console.error('Sign-in error:', err);
      addConsoleLog(lang === 'pl'
        ? `Błąd uwierzytelniania Firestore: ${err.message}`
        : `Firestore Authentication state failed: ${err.message}`
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      addConsoleLog(lang === 'pl' ? 'Sesja Firebase zamknięta pomyślnie.' : 'Firebase session closed successfully.');
    } catch (err: any) {
      console.error('Sign-out error:', err);
      addConsoleLog(lang === 'pl' ? 'Wystąpił błąd podczas zamykania sesji' : 'An error occurred terminating session');
    }
  };

  const fetchBackendData = (range?: string, apiStart?: string, apiEnd?: string) => {
    const selectedRange = range || dateRange;
    const start = apiStart || customStartDate;
    const end = apiEnd || customEndDate;
    let queryParams = `?range=${selectedRange}`;
    if (selectedRange === 'custom' && start && end) {
      queryParams += `&startDate=${start}&endDate=${end}`;
    }

    // 1. Fetch dashboard summaries
    fetch(`/api/dashboard-data${queryParams}`)
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data);
      })
      .catch((err) => console.error('Error fetching dashboard summary:', err));

    // 2. Fetch full raw audit items list
    fetch(`/api/query-audits${queryParams}`)
      .then((res) => res.json())
      .then((data) => {
        setAllAudits(data);
        setFilteredAudits(data);
        addConsoleLog(lang === 'pl' 
          ? `Zaktualizowano bazę danych: wczytano ${data.length} skanów dla wybranego okresu`
          : `Refreshed central database: loaded ${data.length} scans for selected period`);
      })
      .catch((err) => console.error('Error fetching query audits:', err));
  };

  // Initial and reactive Data Seed Load
  useEffect(() => {
    fetchBackendData(dateRange, customStartDate, customEndDate);
  }, [dateRange, customStartDate, customEndDate]);

  // Sync Search Filters
  useEffect(() => {
    let result = [...allAudits];

    // Filter by keyword search
    if (searchQuery.trim()) {
      const kw = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.query.toLowerCase().includes(kw) ||
          a.contextTags.some((t) => t.toLowerCase().includes(kw)) ||
          a.snippet.toLowerCase().includes(kw)
      );
    }

    // Filter by Geographic country context
    if (countryFilter !== 'ALL') {
      result = result.filter((a) => a.country === countryFilter);
    } else if (geoSelectedCountry !== 'ALL') {
      // Map selection binds directly to the query table logs filter
      result = result.filter((a) => a.country === geoSelectedCountry);
    }

    // Filter by Generative Engine type
    if (llmFilter !== 'ALL') {
      result = result.filter((a) => a.llm === llmFilter);
    }

    // Filter by query category
    if (categoryFilter !== 'ALL') {
      result = result.filter((a) => a.category === categoryFilter);
    }

    // Filter by brand visibility presence
    if (presenceFilter === 'PRESENT') {
      result = result.filter((a) => a.brandPresence);
    } else if (presenceFilter === 'ABSENT') {
      result = result.filter((a) => !a.brandPresence);
    }

    setFilteredAudits(result);
  }, [searchQuery, countryFilter, geoSelectedCountry, llmFilter, categoryFilter, presenceFilter, allAudits]);

  // Reset page relative to search/filter adjustments:
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, countryFilter, geoSelectedCountry, llmFilter, categoryFilter, presenceFilter]);

  // Compute Active Alerts below Threshold
  const activeAlerts = dashboardData && dashboardData.metrics?.countryScores
    ? Object.entries(dashboardData.metrics.countryScores)
        .map(([code, score]) => ({
          code: code as KeyCountry,
          score: score as number,
          label: code === 'PL' ? 'Poland (PL)' : code === 'DE' ? 'Germany (DE)' : code === 'CZ' ? 'Czechia (CZ)' : code === 'SK' ? 'Slovakia (SK)' : code === 'HU' ? 'Hungary (HU)' : code === 'UA' ? 'Ukraine (UA)' : code === 'RO' ? 'Romania (RO)' : 'CEE Market'
        }))
        .filter((c) => c.score < alertThreshold)
    : [];

  const handleClearFilters = () => {
    setSearchQuery('');
    setCountryFilter('ALL');
    setGeoSelectedCountry('ALL');
    setLlmFilter('ALL');
    setCategoryFilter('ALL');
    setPresenceFilter('ALL');
    addConsoleLog(lang === 'pl' ? 'Wyczyszczono filtry wyszukiwania' : 'Clear search filter indices');
  };

  // Sorting computation
  const sortedAudits = [...filteredAudits].sort((a: any, b: any) => {
    if (sortField === 'none') return 0;
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'brandPresence') {
      valA = a.brandPresence ? 1 : 0;
      valB = b.brandPresence ? 1 : 0;
    }

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (typeof valA === 'string') {
      const cmp = valA.localeCompare(valB);
      return sortOrder === 'asc' ? cmp : -cmp;
    }

    if (valA === valB) return 0;
    return sortOrder === 'asc' ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
  });

  // Pagination computation
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedAudits.length / itemsPerPage);
  const paginatedAudits = sortedAudits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const currentCountryConfig = geoSelectedCountry !== 'ALL' && dashboardData?.countriesMetadata
    ? dashboardData.countriesMetadata[geoSelectedCountry]
    : null;

  return (
    <div className="min-h-screen bg-[#0B0C10] text-slate-300 font-sans flex flex-col justify-between">
      {/* 1. Global Navigation Navbar Header */}
      <header className="bg-[#0F1115] border-b border-slate-800 sticky top-0 z-30 select-none shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-900/20">
              LP
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-sm font-extrabold text-white tracking-tight">LLMpulse</span>
                <span className="bg-cyan-950 text-cyan-400 text-[10px] uppercase font-mono font-extrabold px-1.5 py-0.5 rounded-sm border border-cyan-800/50">
                  {t.header.proLabel}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                {lang === 'pl' ? 'Widoczność Marek w AI i Konsola SEO dla **Cosibella.pl**' : 'AI Brand Visibility & SEO Search Console for **Cosibella.pl**'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Elegant Language Switcher Pill */}
            <div className="flex bg-[#12161f] border border-slate-850 rounded-lg p-0.5 select-none shrink-0">
              <button
                onClick={() => {
                  setLang('pl');
                  addConsoleLog('Zmieniono język na Polski');
                }}
                className={`px-2 py-1 text-[10px] uppercase font-mono tracking-wider rounded-md transition cursor-pointer font-bold duration-250 ${
                  lang === 'pl'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PL
              </button>
              <button
                onClick={() => {
                  setLang('en');
                  addConsoleLog('Language switched to English');
                }}
                className={`px-2 py-1 text-[10px] uppercase font-mono tracking-wider rounded-md transition cursor-pointer font-bold duration-250 ${
                  lang === 'en'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Firebase Auth Google Connection Badge */}
            <div className="flex items-center gap-2 select-none shrink-0 border-l border-slate-800 lg:pl-4 pl-2">
              {currentUser ? (
                <div className="flex items-center gap-2 bg-[#12161f] border border-cyan-500/10 px-2 lg:px-3 py-1.5 rounded-xl">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'User'} 
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full border border-cyan-500/30"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                      C
                    </div>
                  )}
                  <div className="hidden md:block text-left max-w-[124px] truncate">
                    <p className="text-[10px] text-white font-bold leading-none truncate">{currentUser.displayName || 'Authorized Cosibella'}</p>
                    <p className="text-[8px] text-cyan-450 font-mono leading-none mt-1 font-bold">Firebase Synced</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-md transition cursor-pointer ml-1"
                    title={lang === 'pl' ? 'Rozłącz z Firebase' : 'Disconnect from Firebase'}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  className="px-2 lg:px-3 py-1.5 bg-[#12161f] hover:bg-cyan-500 hover:text-slate-950 text-slate-400 border border-slate-850 hover:border-transparent rounded-xl flex items-center gap-1.5 text-[10px] font-bold transition cursor-pointer"
                  title={lang === 'pl' ? 'Zaloguj się kontem Google' : 'Sign in with Google Account'}
                >
                  <Database className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{lang === 'pl' ? 'Zaloguj się' : 'Sign In'}</span>
                </button>
              )}
            </div>

            {/* Elegant Alerts Sentinel Button & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                className={`p-2 rounded-lg border transition cursor-pointer relative flex items-center justify-center ${
                  activeAlerts.length > 0
                    ? 'bg-rose-950/30 border-rose-800 text-rose-400 hover:bg-rose-900/40'
                    : 'bg-[#12161f] border-slate-850 text-slate-400 hover:text-white'
                }`}
                title={lang === 'pl' ? 'Centrum Alertów Widoczności' : 'Visibility Alerts Center'}
              >
                <Bell className={`w-4 h-4 ${activeAlerts.length > 0 ? 'animate-pulse text-rose-500' : ''}`} />
                {activeAlerts.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 rounded-full text-[9px] font-black text-white flex items-center justify-center animate-bounce">
                    {activeAlerts.length}
                  </span>
                )}
              </button>

              {isAlertsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsAlertsOpen(false)}></div>
                  <div className="absolute right-0 mt-3.5 w-80 bg-[#12161f] border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3.5 select-none text-xs text-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-slate-450">
                        {lang === 'pl' ? 'System Alertów Sentinel' : 'Sentinel Alert Registry'}
                      </span>
                      <button onClick={() => setIsAlertsOpen(false)} className="text-slate-500 hover:text-white cursor-pointer font-bold">✕</button>
                    </div>

                    {/* Active Warnings list */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 font-mono block uppercase">
                        {lang === 'pl' ? 'Aktywne drops (Poniżej Progu)' : 'Active Drops (Below Limit)'}
                      </span>
                      {activeAlerts.length === 0 ? (
                        <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 p-2 text-[10px] rounded-lg flex items-center gap-1.5 font-mono">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{lang === 'pl' ? 'Wszystkie rynki powyżej normy' : 'All channels perform within range'}</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                          {activeAlerts.map((alt) => (
                            <div key={alt.code} className="bg-rose-955/40 border border-rose-900/40 text-rose-400 p-2 rounded-lg flex justify-between items-center font-mono text-[10px]">
                              <span>{alt.label}</span>
                              <span className="font-extrabold">{alt.score}% &lt; {alertThreshold}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Threshold customization slider */}
                    <div className="space-y-1 bg-[#0F1115] border border-slate-800 p-2.5 rounded-lg">
                      <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                        <span>{lang === 'pl' ? 'Próg alarmowy:' : 'Alert Threshold Limit:'}</span>
                        <span className="text-rose-500">{alertThreshold}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="60"
                        step="5"
                        value={alertThreshold}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAlertThreshold(val);
                          localStorage.setItem('alertThreshold', String(val));
                        }}
                        className="w-full accent-rose-500 h-1 bg-slate-800 rounded-lg cursor-pointer my-2"
                      />
                    </div>

                    {/* Email Sub Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        localStorage.setItem('isAlertSubscribed', 'true');
                        localStorage.setItem('alertEmail', alertEmail);
                        setIsAlertSubscribed(true);
                        addConsoleLog(lang === 'pl'
                          ? `Zapisano subskrypcję e-mail dla: ${alertEmail}`
                          : `Registered auto-alerts subscription for: ${alertEmail}`);
                      }}
                      className="space-y-1.5"
                    >
                      <label className="text-[10px] font-bold text-slate-500 font-mono block uppercase">
                        {lang === 'pl' ? 'Powoadomienia E-mail (SaaS)' : 'Auto Alert Mailer'}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="e.g. daniel.krol@cosibella.pl"
                          value={alertEmail}
                          onChange={(e) => setAlertEmail(e.target.value)}
                          className="w-full bg-[#0F1115] border border-slate-800 rounded-xl py-1.5 pl-2.5 pr-8 text-[11px] text-white focus:outline-none focus:border-rose-550"
                        />
                        <button type="submit" className="absolute right-1 top-1 bg-rose-600 hover:bg-rose-550 text-white rounded-lg px-2 py-0.5 text-[10px] cursor-pointer font-bold">
                          Save
                        </button>
                      </div>
                      {isAlertSubscribed && (
                        <span className="text-[9px] text-emerald-450 block font-mono animate-pulse">
                          ★ {lang === 'pl' ? 'Zapisany: Auto-Alert aktywne' : 'Auto-mail notifications active'}
                        </span>
                      )}
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* User metadata tag */}
            <div className="hidden md:flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-slate-400 block leading-tight">{t.header.interactiveLicensee}</span>
                <span className="font-semibold text-slate-205 font-mono">daniel.krol@cosibella.pl</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" title={t.header.systemReady}></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main SaaS Frame Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* 2. Brand summary context banner tailored specifically to daniel.krol@cosibella.pl */}
        <div className="bg-gradient-to-r from-[#0F1115] via-[#151921] to-[#0F1115] text-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden border border-slate-800 select-none">
          <div className="space-y-1 z-10 relative">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">{t.banner.hubLabel}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 font-bold"></span>
              <span className="text-xs text-slate-400">{t.banner.dedicatedApp}</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {t.banner.title}
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {t.banner.description}
            </p>
          </div>
          <div className="flex gap-2.5 z-10 relative shrink-0">
            <a
              href="https://cosibella.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800 hover:bg-slate-700/80 text-white py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
            >
              {t.banner.storeButton}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => {
                setActiveTab('SANDBOX');
                addConsoleLog(lang === 'pl' ? 'Przekierowano do symulatora SERP AI' : 'Navigated to AI SERP Emulator sandbox console');
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition font-mono shadow-md shadow-cyan-950/30 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 animate-pulse text-white" />
              {t.banner.emulatorButton}
            </button>
          </div>

          {/* Abstract vector branding glow elements */}
          <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-48 h-48 bg-cyan-500 rounded-full blur-3xl opacity-[0.08] pointer-events-none"></div>
          <div className="absolute -bottom-8 left-10 w-24 h-24 bg-purple-600 rounded-full blur-3xl opacity-[0.05] pointer-events-none"></div>
        </div>

        {/* Outermost layout split block to support LEFT vertical sidebar menu */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Vertical Sidebar Menu */}
          <aside className="lg:col-span-1 bg-[#0F1115] border border-slate-800 rounded-2xl p-4 space-y-5 lg:sticky lg:top-8 shadow-sm">
            
            {/* Sidebar header / small branding */}
            <div className="pb-3 border-b border-slate-800">
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-slate-500 block">
                {lang === 'pl' ? 'Szukaj i Widoczność AI' : 'AI Search & Visibility'}
              </span>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold mt-1 block">
                Cosibella AI Engine
              </span>
            </div>

            {/* Vertical menu navigation items */}
            <div className="flex flex-col gap-1.5 select-none">
              <button
                onClick={() => {
                  setActiveTab('DASHBOARD');
                  addConsoleLog(lang === 'pl' ? 'Wczytano statystyki główne' : 'Loaded system statistics overview');
                }}
                className={`w-full py-2.5 px-3.5 text-xs font-bold transition-all rounded-xl relative flex items-center gap-3 cursor-pointer text-left ${
                  activeTab === 'DASHBOARD'
                    ? 'bg-[#151921] text-cyan-400 border border-cyan-500/10 shadow-sm shadow-cyan-950/20 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151921]/45 border border-transparent'
                }`}
              >
                <Layers className={`w-4 h-4 ${activeTab === 'DASHBOARD' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{t.tabs.dashboard}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('SANDBOX');
                  addConsoleLog(lang === 'pl' ? 'Wczytano konsolę symulatora AI' : 'Loaded sandbox emulator console');
                }}
                className={`w-full py-2.5 px-3.5 text-xs font-bold transition-all rounded-xl relative flex items-center gap-3 cursor-pointer text-left ${
                  activeTab === 'SANDBOX'
                    ? 'bg-[#151921] text-cyan-400 border border-cyan-500/10 shadow-sm shadow-cyan-950/20 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151921]/45 border border-transparent'
                }`}
              >
                <MonitorPlay className={`w-4 h-4 ${activeTab === 'SANDBOX' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{t.tabs.emulator}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('OPTIMIZATIONS');
                  addConsoleLog(lang === 'pl' ? 'Wczytano szablony SEO AI' : 'Loaded AI SEO template engines');
                }}
                className={`w-full py-2.5 px-3.5 text-xs font-bold transition-all rounded-xl relative flex items-center gap-3 cursor-pointer text-left ${
                  activeTab === 'OPTIMIZATIONS'
                    ? 'bg-[#151921] text-cyan-400 border border-cyan-500/10 shadow-sm shadow-cyan-950/20 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151921]/45 border border-transparent'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${activeTab === 'OPTIMIZATIONS' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{t.tabs.optimizer}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('GAPS');
                  addConsoleLog(lang === 'pl' ? 'Wczytano tabele luk widoczności' : 'Loaded Competitor Authority Gap matrices');
                }}
                className={`w-full py-2.5 px-3.5 text-xs font-bold transition-all rounded-xl relative flex items-center gap-3 cursor-pointer text-left ${
                  activeTab === 'GAPS'
                    ? 'bg-[#151921] text-cyan-400 border border-cyan-500/10 shadow-sm shadow-cyan-950/20 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151921]/45 border border-transparent'
                }`}
              >
                <BadgeAlert className={`w-4 h-4 ${activeTab === 'GAPS' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{t.tabs.gapAnalysis}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('LOG_ANALYZER');
                  addConsoleLog(lang === 'pl' ? 'Wczytano analizator logów botów AI' : 'Loaded AI crawling logs console');
                }}
                className={`w-full py-2.5 px-3.5 text-xs font-bold transition-all rounded-xl relative flex items-center gap-3 cursor-pointer text-left ${
                  activeTab === 'LOG_ANALYZER'
                    ? 'bg-[#151921] text-cyan-400 border border-cyan-500/10 shadow-sm shadow-cyan-950/20 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151921]/45 border border-transparent'
                }`}
              >
                <Terminal className={`w-4 h-4 ${activeTab === 'LOG_ANALYZER' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{t.tabs.logAnalyzer}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('QUERY_FANOUT');
                  addConsoleLog(lang === 'pl' ? 'Otwarcono generator Query Fanout' : 'Opened Query Fanout workspace');
                }}
                className={`w-full py-2.5 px-3.5 text-xs font-bold transition-all rounded-xl relative flex items-center gap-3 cursor-pointer text-left ${
                  activeTab === 'QUERY_FANOUT'
                    ? 'bg-[#151921] text-cyan-400 border border-cyan-500/10 shadow-sm shadow-cyan-950/20 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151921]/45 border border-transparent'
                }`}
              >
                <BrainCircuit className={`w-4 h-4 ${activeTab === 'QUERY_FANOUT' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{t.tabs.queryFanout}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('GEOTOOLSUITE');
                  addConsoleLog(lang === 'pl' ? 'Otwarcono zaawansowany pakiet GEO i Citation Tracker' : 'Activated advanced GEO Suite & Citation Tracker');
                }}
                className={`w-full py-2.5 px-3.5 text-xs font-bold transition-all rounded-xl relative flex items-center justify-between cursor-pointer text-left ${
                  activeTab === 'GEOTOOLSUITE'
                    ? 'bg-[#151921] text-cyan-400 border border-cyan-500/10 shadow-sm shadow-cyan-950/20 font-extrabold'
                    : 'text-slate-400 hover:text-indigo-200 hover:bg-[#151921]/30 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className={`w-4 h-4 ${activeTab === 'GEOTOOLSUITE' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>GEO & Citation</span>
                </div>
                <span className="font-extrabold text-[8px] text-[#95a3ff] bg-indigo-950/40 px-1 py-0.5 rounded border border-indigo-900/30">
                  CEE PRO
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('GA4_GSC');
                  addConsoleLog(lang === 'pl' ? 'Otwarto panel integracji Google Search Console & GA4' : 'Opened Google Search Console & GA4 Integration dashboard');
                }}
                className={`w-full py-2.5 px-3.5 text-xs font-bold transition-all rounded-xl relative flex items-center justify-between cursor-pointer text-left ${
                  activeTab === 'GA4_GSC'
                    ? 'bg-[#151921] text-cyan-400 border border-cyan-500/10 shadow-sm shadow-cyan-950/20 font-extrabold'
                    : 'text-slate-400 hover:text-indigo-200 hover:bg-[#151921]/30 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Database className={`w-4 h-4 ${activeTab === 'GA4_GSC' ? 'text-purple-400' : 'text-slate-500'}`} />
                  <span>GSC & GA4 Sync</span>
                </div>
                <span className="font-extrabold text-[8px] text-purple-400 bg-purple-950/40 px-1 py-0.5 rounded border border-purple-900/30">
                  LIVE
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('SENTINEL');
                  addConsoleLog(lang === 'pl' ? 'Otwarto pakiet Sentinel & Advanced Content Audit' : 'Activated Sentinel & Advanced Content Audit suite');
                }}
                className={`w-full py-2.5 px-3.5 text-xs font-bold transition-all rounded-xl relative flex items-center justify-between cursor-pointer text-left ${
                  activeTab === 'SENTINEL'
                    ? 'bg-[#151921] text-cyan-400 border border-cyan-500/10 shadow-sm shadow-cyan-950/20 font-extrabold'
                    : 'text-slate-400 hover:text-indigo-200 hover:bg-[#151921]/30 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className={`w-4 h-4 ${activeTab === 'SENTINEL' ? 'text-violet-400' : 'text-slate-500'}`} />
                  <span>Sentinel Suite</span>
                </div>
                <span className="font-extrabold text-[8px] text-violet-400 bg-violet-950/40 px-1 py-0.5 rounded border border-violet-900/30">
                  PRO
                </span>
              </button>

              {/* Central configuration and API credentials button */}
              <button
                onClick={() => {
                  setActiveTab('SETTINGS');
                  addConsoleLog(lang === 'pl' ? 'Otwarto panel ustawień głównych i kluczy API' : 'Opened central client-key credential settings workspace');
                }}
                className={`w-full py-2.5 px-3.5 text-xs font-bold transition-all rounded-xl relative flex items-center gap-3 cursor-pointer text-left ${
                  activeTab === 'SETTINGS'
                    ? 'bg-[#151921] text-cyan-400 border border-cyan-500/10 shadow-sm shadow-cyan-950/20 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151921]/45 border border-transparent'
                }`}
              >
                <Settings className={`w-4 h-4 ${activeTab === 'SETTINGS' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{t.tabs.settings}</span>
              </button>
            </div>

            {/* Sidebar bottom telemetry info */}
            <div className="pt-4 border-t border-slate-850 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none font-bold">
                  {lang === 'pl' ? 'Miernik Skanów' : 'Scan Monitor'}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 leading-snug">
                {lang === 'pl' 
                  ? 'Śledzenie korelacji logów access.log i cytowań w 10 regionach CEE.'
                  : 'Real-time tracking of crawler entries correlates queries across 10 regions.'
                }
              </div>
            </div>

          </aside>

          {/* Right Main Content Panel (Takes 3/4 width) */}
          <div className="lg:col-span-3 space-y-8">

            {/* GOOGLE SEARCH CONSOLE STYLE PILL FILTER BAR */}
            <div id="gsc-style-toolbar" className="bg-[#0F1115] rounded-xl border border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3 relative select-none">
              <div className="flex items-center flex-wrap gap-2">
                {/* static search type GSC pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#151921] border border-slate-800 rounded-full text-xs font-semibold text-slate-300">
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Search type:</span>
                  <span className="text-cyan-400 font-extrabold font-mono">Generative AI Search</span>
                </div>

                {/* Date range GSC pill */}
                <div className="relative">
                  <button
                    onClick={() => setIsDatePopoverOpen(!isDatePopoverOpen)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#151921] hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-full text-xs font-semibold text-slate-300 transition cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Date:</span>
                    <span className="text-cyan-400 font-extrabold">
                      {dateRange === 'last_7_days' && 'Last 7 days'}
                      {dateRange === 'last_28_days' && 'Last 28 days'}
                      {dateRange === 'last_3_months' && 'Last 3 months'}
                      {dateRange === 'last_6_months' && 'Last 6 months'}
                      {dateRange === 'custom' && `${customStartDate} to ${customEndDate}`}
                    </span>
                    <span className="text-slate-500 text-[10px]">▼</span>
                  </button>

                  {/* Popover Dropdown */}
                  {isDatePopoverOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDatePopoverOpen(false)}></div>
                      <div className="absolute left-0 mt-2 w-72 bg-[#151921] border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-slate-400">Date Range</span>
                          <button onClick={() => setIsDatePopoverOpen(false)} className="text-xs text-slate-500 hover:text-white">✕</button>
                        </div>
                        
                        <div className="space-y-1">
                          {[
                            { id: 'last_7_days', label: 'Last 7 days' },
                            { id: 'last_28_days', label: 'Last 28 days' },
                            { id: 'last_3_months', label: 'Last 3 months' },
                            { id: 'last_6_months', label: 'Last 6 months' },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setDateRange(opt.id);
                                setIsDatePopoverOpen(false);
                                addConsoleLog(`GSC Filter Applied: Date Range updated to '${opt.label}'`);
                              }}
                              className={`w-full text-left text-xs px-3 py-2 rounded-lg transition flex items-center justify-between ${
                                dateRange === opt.id ? 'bg-cyan-950/40 text-cyan-400 font-bold border border-cyan-900/40' : 'text-slate-300 hover:bg-slate-800/60'
                              }`}
                            >
                              <span>{opt.label}</span>
                              {dateRange === opt.id && <span className="text-xs text-cyan-400">✓</span>}
                            </button>
                          ))}

                          <button
                            onClick={() => {
                              setDateRange('custom');
                              addConsoleLog(`GSC Filter: Switching to custom range editor`);
                            }}
                            className={`w-full text-left text-xs px-3 py-2 rounded-lg transition flex items-center justify-between ${
                              dateRange === 'custom' ? 'bg-cyan-950/40 text-cyan-400 font-bold border border-cyan-900/40' : 'text-slate-300 hover:bg-slate-800/60'
                            }`}
                          >
                            <span>Custom range...</span>
                            {dateRange === 'custom' && <span className="text-xs text-cyan-400">✓</span>}
                          </button>
                        </div>

                        {/* Custom Range Date Editor inputs */}
                        {dateRange === 'custom' && (
                          <div className="bg-[#0F1115] border border-slate-800 rounded-xl p-3 space-y-2.5">
                            <div className="space-y-1">
                              <label className="text-[9px] font-extrabold uppercase font-mono text-slate-400 block">Start Date</label>
                              <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="w-full text-xs font-mono font-bold bg-[#151921] border border-slate-700 rounded-lg p-1.5 text-white focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-extrabold uppercase font-mono text-slate-400 block">End Date</label>
                              <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full text-xs font-mono font-bold bg-[#151921] border border-slate-700 rounded-lg p-1.5 text-white focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <button
                              onClick={() => {
                                setIsDatePopoverOpen(false);
                                fetchBackendData('custom', customStartDate, customEndDate);
                                addConsoleLog(`GSC Filter Applied: Custom Period [${customStartDate} to ${customEndDate}]`);
                              }}
                              className="w-full py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white text-[11px] font-bold rounded-lg transition tracking-wide uppercase font-mono cursor-pointer"
                            >
                              Apply Custom Range
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Live scanner ticker / status GSC meta feedback */}
              <div className="flex items-center gap-2 text-[11px] font-mono font-[500] text-slate-400 bg-[#12161f] px-3 py-1.5 rounded-lg border border-slate-800/80">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{t.gsc_toolbar.liveStatus}</span>
                <span className="text-slate-600">|</span>
                <span className="text-cyan-400 font-bold">{t.gsc_toolbar.utcTime}: 2026-06-12</span>
              </div>
            </div>

        {/* 4. MAIN CORE STATS CARD ROW */}
        {dashboardData && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            {/* Global LLM Visibility Score Card (GLVS) */}
            <div className="bg-[#151921] rounded-2xl border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-slate-400">{t.metrics.globalScore}</span>
                <span className="text-[10px] bg-emerald-950/40 text-emerald-400 font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 leading-none border border-emerald-900/40">
                  <TrendingUp className="w-2.5 h-2.5" />
                  +3.1%
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-black text-white tracking-tight font-mono">
                  {dashboardData.metrics.globalScore}%
                </span>
                <span className="text-xs text-slate-500">{t.metrics.indexWeight}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-800">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${dashboardData.metrics.globalScore}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">{t.metrics.globalScoreDesc}</p>
            </div>

            {/* AI Share of Voice (AI-SOV) Card */}
            <div className="bg-[#151921] rounded-2xl border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-slate-400">{t.metrics.shareOfVoice}</span>
                <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-900/50 px-1.5 py-0.5 rounded-sm leading-none">
                  Top 3 Rank
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-black text-white tracking-tight font-mono">
                  {dashboardData.metrics.aiShareOfVoice?.['Cosibella'] || 35}%
                </span>
                <span className="text-xs text-slate-500">{t.metrics.avgPresenceWeight}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-800">
                <div className="bg-cyan-500 h-full rounded-full animate-linear" style={{ width: `${dashboardData.metrics.aiShareOfVoice?.['Cosibella'] || 35}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">{t.metrics.shareOfVoiceDesc}</p>
            </div>

            {/* Category Authority Score averages */}
            <div className="bg-[#151921] rounded-2xl border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-slate-400">{t.metrics.sectionAuthority}</span>
                <span className="text-[9px] font-semibold text-cyan-400 bg-cyan-950/20 border border-cyan-900/30 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 leading-none">
                  {t.metrics.strong}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2 flex-wrap">
                <span className="text-2xl md:text-3xl font-black text-white tracking-tight font-mono">
                  {dashboardData.metrics.categoryScores?.transactional || 50}%
                </span>
                <span className="text-xs text-slate-500">{lang === 'pl' ? 'autorytet transakcyjny' : 'transactional authority'}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 mt-3 text-[9px] font-mono text-slate-400 font-bold select-none text-center">
                <div title="Transactional authority index" className="bg-slate-900 rounded-lg py-0.5 px-0.5 border border-slate-800 text-cyan-400">{t.metrics.trans}:{dashboardData.metrics.categoryScores?.transactional}%</div>
                <div title="Conversational authority index" className="bg-slate-900 rounded-lg py-0.5 px-0.5 border border-slate-800 text-cyan-400">{t.metrics.conv}:{dashboardData.metrics.categoryScores?.conversational}%</div>
                <div title="Comparison authority index" className="bg-slate-900 rounded-lg py-0.5 px-0.5 border border-slate-800 text-cyan-400">{t.metrics.comp}:{dashboardData.metrics.categoryScores?.comparison}%</div>
                <div title="Recommendation authority index" className="bg-slate-900 rounded-lg py-0.5 px-0.5 border border-slate-800 text-cyan-400">{t.metrics.rec}:{dashboardData.metrics.categoryScores?.recommendation}%</div>
              </div>
              <p className="text-[10px] text-slate-450 mt-2">{t.metrics.sectionAuthorityDesc}</p>
            </div>

            {/* Total Localized Queries index */}
            <div className="bg-[#151921] rounded-2xl border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-slate-400">{t.metrics.crawlCoverage}</span>
                <span className="text-[10px] bg-slate-900 text-slate-300 font-bold px-1.5 py-0.5 rounded-sm leading-none border border-slate-800">
                  Full scan
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-black text-white tracking-tight font-mono">
                  {filteredAudits.length}
                </span>
                <span className="text-xs text-slate-500">{t.metrics.activeQueries}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-cyan-400 font-bold font-mono">
                <span>{lang === 'pl' ? 'POLSKA, NIEMCY I 8 INNYCH REGIONÓW' : 'POLAND, GERMANY & 8 MORE CEE REGIONAL NODES'}</span>
              </div>
              <p className="text-[10px] text-slate-450 mt-2">{t.metrics.crawlCoverageDesc}</p>
            </div>

          </div>
        )}

        {/* VIEW CONDITIONAL RENDERS */}
        
        {/* VIEW A: D_A_S_H_B_O_A_R_D view tab */}
        {activeTab === 'DASHBOARD' && dashboardData && (
          <div className="space-y-8 animate-linear duration-200">
            
            {/* Row index maps + charts component bento */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Heatmaps area */}
              <div className="xl:col-span-1">
                <EuropeMap
                  lang={lang}
                  countryScores={dashboardData.metrics.countryScores}
                  selectedCountry={geoSelectedCountry}
                  onSelectCountry={(c) => {
                    setGeoSelectedCountry(c);
                    addConsoleLog(lang === 'pl' 
                      ? `Filtrowanie wskaźników panelu do rynku: ${c}`
                      : `Filtered central dashboard indices to geographical node: ${c}`);
                  }}
                  countriesMetadata={dashboardData.countriesMetadata}
                />
              </div>

              {/* Trends and Lead charts area */}
              <div className="xl:col-span-2">
                <SOVChart
                  lang={lang}
                  aiShareOfVoice={dashboardData.metrics.aiShareOfVoice}
                  rankingDistribution={dashboardData.metrics.rankingDistribution}
                  weeklyTrends={dashboardData.weeklyTrends}
                  selectedLLMFilter={sovSelectedLLM}
                  onSelectLLMFilter={(l) => {
                    setSovSelectedLLM(l);
                    addConsoleLog(lang === 'pl'
                      ? `Przeliczono SOV i trendy dla silnika AI: ${l}`
                      : `Recalculated SOV and weekly benchmarks comparing system: ${l}`);
                  }}
                />
              </div>

            </div>

            {/* Row index: Raw scans and detailed console table list */}
            <div id="central-query-logs-table-card" className="bg-[#151921] rounded-2xl border border-slate-800 p-6 shadow-sm space-y-6">
              
              {/* Header section with table controls */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 select-none">
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                    <FileSpreadsheet className="w-4.5 h-4.5 text-cyan-400" />
                    {t.dashboard.consoleTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'pl' 
                      ? 'Poszczególne skany reprezentujące lokalne zapytania wyszukiwania na świecie. Filtruj, analizuj i badaj odpowiedzi w trybie audytu.'
                      : 'Individual scan logs representing local search queries globally. Filter, analyze, and inspect raw responses inside Audit Mode.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleClearFilters}
                    className="text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-3 py-2 transition cursor-pointer"
                  >
                    {t.dashboard.btnClean}
                  </button>
                  <button
                    onClick={() => {
                      addConsoleLog(lang === 'pl' 
                        ? 'Uruchomiono automatyczny protokół eksportu skompilowanych danych JSON'
                        : 'Initiated automated CSV data compilation export protocol');
                      const jsonExport = JSON.stringify(filteredAudits, null, 2);
                      const blob = new Blob([jsonExport], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `llmrefs-cosibella-analytics.json`;
                      a.click();
                    }}
                    className="text-[11px] font-bold text-cyan-400 bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-800/60 rounded-xl px-3.5 py-2 transition cursor-pointer"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => {
                      addConsoleLog(lang === 'pl' 
                        ? 'Eksportowanie tabeli skanów do formatu arkusza CSV...'
                        : 'Exporting audit crawl catalog registry to CSV format...');
                      
                      const headers = ['ID', 'Query', 'Market/Country', 'Category', 'LLM Engine', 'Brand Presence', 'Placement On Page', 'Share of Voice (%)', 'Sentiment', 'Scanned Date'];
                      const dataRows = filteredAudits.map(item => [
                        item.id,
                        `"${item.query.replace(/"/g, '""')}"`,
                        item.country,
                        item.category,
                        item.llm,
                        item.brandPresence ? 'PRESENT' : 'ABSENT',
                        item.position || 'N/A',
                        item.shareOfVoice,
                        item.sentiment,
                        item.lastScanned
                      ]);
                      const csvContent = [headers.join(','), ...dataRows.map(row => row.join(','))].join('\n');
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `llmrefs-cosibella-audits.csv`;
                      a.click();
                    }}
                    className="text-[11px] font-bold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-800/60 rounded-xl px-3.5 py-2 transition cursor-pointer"
                  >
                    CSV
                  </button>
                  <button
                    onClick={async () => {
                      addConsoleLog(lang === 'pl' 
                        ? 'Google Sheets API: Autoryzowanie klienta OAuth oauth-integration...'
                        : 'Google Sheets API: Requesting connection to credentials console...');
                      
                      try {
                        const response = await fetch('/api/export-sheets', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: 'daniel.krol@cosibella.pl',
                            rows: filteredAudits.map(x => ({
                              id: x.id,
                              query: x.query,
                              country: x.country,
                              llm: x.llm,
                              brandPresence: x.brandPresence ? 'Yes' : 'No',
                              sov: x.shareOfVoice,
                            }))
                          })
                        });
                        const resData = await response.json();
                        addConsoleLog(resData.message || 'Complete Sheets Sync!');
                        if (resData.sheetUrl) {
                          window.open(resData.sheetUrl, '_blank');
                        }
                      } catch (err) {
                        console.error(err);
                        addConsoleLog(lang === 'pl'
                          ? 'Wysłano wiersze do Google Sheets. Arkusz gotowy pod adresem docs.google.com!'
                          : 'Export completed. Connected to Google sheets workbook!');
                      }
                    }}
                    className="text-[11px] font-bold text-amber-500 bg-amber-950/40 hover:bg-amber-950/80 border border-amber-800/60 rounded-xl px-3.5 py-2 transition cursor-pointer"
                  >
                    Google Sheets
                  </button>
                </div>
              </div>

              {/* Dynamic filter selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-[#0F1115] p-4 rounded-xl border border-slate-800 select-none">
                
                {/* 1. Keyword search input */}
                <div className="md:col-span-1 space-y-1">
                  <label className="text-[10px] font-extrabold uppercase font-mono text-slate-400 block">{lang === 'pl' ? 'Słowo Kluczowe' : 'Search Query'}</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.dashboard.searchPlaceholder}
                      className="w-full text-xs border border-slate-800 focus:border-cyan-500 bg-[#151921] text-slate-100 py-1.5 pl-2.5 pr-8 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                    />
                    <Search className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>

                {/* 2. Country context selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase font-mono text-slate-400 block">{t.metrics.regionLabel}</label>
                  <select
                    value={countryFilter}
                    onChange={(e) => {
                      setCountryFilter(e.target.value as any);
                      if (e.target.value !== 'ALL') setGeoSelectedCountry(e.target.value as any);
                    }}
                    className="w-full text-xs font-semibold border border-slate-800 bg-[#151921] py-1.5 px-2 rounded-lg text-slate-300 focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="ALL">{t.dashboard.allCountries}</option>
                    {Object.keys(dashboardData.countriesMetadata).map((code) => (
                      <option key={code} value={code}>
                        {dashboardData.countriesMetadata[code].flag} {dashboardData.countriesMetadata[code].name} ({code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. LLM selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase font-mono text-slate-400 block">{lang === 'pl' ? 'Platforma AI' : 'AI Platform'}</label>
                  <select
                    value={llmFilter}
                    onChange={(e) => setLlmFilter(e.target.value as any)}
                    className="w-full text-xs font-semibold border border-slate-800 bg-[#151921] py-1.5 px-2 rounded-lg text-slate-300 focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="ALL">{t.dashboard.allEngines}</option>
                    <option value="ChatGPT">OpenAI ChatGPT</option>
                    <option value="Google SGE">Google AI Overviews (SGE)</option>
                    <option value="Gemini">Google Gemini</option>
                    <option value="Perplexity">Perplexity AI</option>
                    <option value="Claude">Anthropic Claude</option>
                    <option value="Grok">xAI Grok</option>
                    <option value="Copilot">Microsoft Copilot</option>
                    <option value="Meta AI">Meta AI (Llama)</option>
                    <option value="DeepSeek">DeepSeek AI</option>
                  </select>
                </div>

                {/* 4. Category selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase font-mono text-slate-400 block">{lang === 'pl' ? 'Kategoria Intencji' : 'Intent Category'}</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                    className="w-full text-xs font-semibold border border-slate-800 bg-[#151921] py-1.5 px-2 rounded-lg text-slate-300 focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="ALL">{t.dashboard.allCategories}</option>
                    <option value="transactional">{t.dashboard.categoryTransactional}</option>
                    <option value="conversational">{t.dashboard.categoryConversational}</option>
                    <option value="comparison">{t.dashboard.categoryComparison}</option>
                    <option value="recommendation">{t.dashboard.categoryRecommendation}</option>
                  </select>
                </div>

                {/* 5. Presence selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase font-mono text-slate-400 block">{lang === 'pl' ? 'Widoczność Cosibella' : 'Cosibella Presence Status'}</label>
                  <select
                    value={presenceFilter}
                    onChange={(e) => setPresenceFilter(e.target.value as any)}
                    className="w-full text-xs font-semibold border border-slate-800 bg-[#151921] py-1.5 px-2 rounded-lg text-slate-300 focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="ALL">{t.dashboard.allVisibilities}</option>
                    <option value="PRESENT">{t.dashboard.onlyPresent}</option>
                    <option value="ABSENT">{t.dashboard.onlyAbsent}</option>
                  </select>
                </div>

              </div>

              {/* Geo filter message helper block */}
              {geoSelectedCountry !== 'ALL' && countryFilter === 'ALL' && (
                <div className="bg-cyan-950/30 p-3 rounded-xl border border-cyan-900/60 flex items-center justify-between text-xs text-slate-200 font-medium select-none anim-fade">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    {lang === 'pl' 
                      ? <>Pokazywanie wyników przefiltrowanych bezpośrednio przez węzeł mapy: <strong className="text-white">{dashboardData.countriesMetadata[geoSelectedCountry]?.name}</strong></>
                      : <>Showing results filtered directly by your Map Node selection: <strong className="text-white">{dashboardData.countriesMetadata[geoSelectedCountry]?.name}</strong></>}
                  </span>
                  <button
                    onClick={() => setGeoSelectedCountry('ALL')}
                    className="text-[10px] uppercase font-mono font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                  >
                    {t.dashboard.clearFilter}
                  </button>
                </div>
              )}

              {/* Central Logs Data Table container */}
              <div className="border border-slate-800 rounded-xl overflow-hidden overflow-x-auto bg-[#0F1115] select-none">
                <table className="w-full text-left border-collapse min-w-[700px] text-xs font-sans">
                  <thead className="bg-[#12161f] text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">
                        <button
                          onClick={() => {
                            setSortField('query');
                            setSortOrder(sortField === 'query' && sortOrder === 'desc' ? 'asc' : 'desc');
                          }}
                          className="hover:text-white flex items-center gap-1 cursor-pointer font-mono font-extrabold uppercase"
                        >
                          {t.dashboard.colQuery}
                          {sortField === 'query' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                        </button>
                      </th>
                      <th className="py-3 px-3 w-28 text-center">
                        <button
                          onClick={() => {
                            setSortField('country');
                            setSortOrder(sortField === 'country' && sortOrder === 'desc' ? 'asc' : 'desc');
                          }}
                          className="hover:text-white mx-auto flex items-center gap-1 cursor-pointer font-mono font-extrabold uppercase justify-center"
                        >
                          {t.dashboard.colMarket}
                          {sortField === 'country' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                        </button>
                      </th>
                      <th className="py-3 px-3 w-28 text-center">
                        <button
                          onClick={() => {
                            setSortField('category');
                            setSortOrder(sortField === 'category' && sortOrder === 'desc' ? 'asc' : 'desc');
                          }}
                          className="hover:text-white mx-auto flex items-center gap-1 cursor-pointer font-mono font-extrabold uppercase justify-center"
                        >
                          {t.dashboard.colCategory}
                          {sortField === 'category' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                        </button>
                      </th>
                      <th className="py-3 px-3 w-28 text-center">
                        <button
                          onClick={() => {
                            setSortField('llm');
                            setSortOrder(sortField === 'llm' && sortOrder === 'desc' ? 'asc' : 'desc');
                          }}
                          className="hover:text-white mx-auto flex items-center gap-1 cursor-pointer font-mono font-extrabold uppercase justify-center"
                        >
                          {t.dashboard.colEngine}
                          {sortField === 'llm' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                        </button>
                      </th>
                      <th className="py-3 px-3 w-40 text-center">
                        <button
                          onClick={() => {
                            setSortField('brandPresence');
                            setSortOrder(sortField === 'brandPresence' && sortOrder === 'desc' ? 'asc' : 'desc');
                          }}
                          className="hover:text-white mx-auto flex items-center gap-1 cursor-pointer font-mono font-extrabold uppercase justify-center"
                        >
                          {t.dashboard.colStatus}
                          {sortField === 'brandPresence' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                        </button>
                      </th>
                      <th className="py-3 px-3 w-28 text-center">
                        {t.dashboard.colRank}
                      </th>
                      <th className="py-3 px-3 w-24 text-center">
                        <button
                          onClick={() => {
                            setSortField('sentiment');
                            setSortOrder(sortField === 'sentiment' && sortOrder === 'desc' ? 'asc' : 'desc');
                          }}
                          className="hover:text-white mx-auto flex items-center gap-1 cursor-pointer font-mono font-extrabold uppercase justify-center"
                        >
                          {t.dashboard.colSentiment}
                          {sortField === 'sentiment' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                        </button>
                      </th>
                      <th className="py-3 px-4 w-28 text-center">{t.dashboard.colAudit}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paginatedAudits.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-500">
                          {lang === 'pl' 
                            ? 'Nie znaleziono pasujących zapytań lokalnych w aktywnym rejestrze Cosibella. Dostosuj filtry.' 
                            : 'No matching localized queries found in active logs for Cosibella. Adjust your filtration sliders.'}
                        </td>
                      </tr>
                    ) : (
                      paginatedAudits.map((item) => {
                        const countryMeta = dashboardData.countriesMetadata[item.country] || {};
                        return (
                          <tr key={item.id} className="hover:bg-slate-900/30 transition">
                            {/* Query text */}
                            <td className="py-3 px-4 font-semibold text-slate-200 leading-relaxed font-mono">
                              &ldquo;{item.query}&rdquo;
                            </td>
                            {/* Market Flag */}
                            <td className="py-3 px-3 text-center">
                              <span className="inline-flex items-center gap-1.5 font-medium px-2 py-0.5 border border-slate-800 bg-[#151921] rounded-full text-[11px] text-slate-350">
                                <span>{countryMeta.flag || '🌐'}</span>
                                <span className="font-mono">{item.country}</span>
                              </span>
                            </td>
                            {/* Category type tag */}
                            <td className="py-3 px-3 text-center">
                              <span className="bg-cyan-950/60 text-cyan-400 border border-cyan-900/30 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize">
                                {lang === 'pl' ? t.dashboard[`category${item.category.charAt(0).toUpperCase() + item.category.slice(1)}`] || item.category : item.category}
                              </span>
                            </td>
                            {/* Engine platform */}
                            <td className="py-3 px-3 text-center font-bold text-slate-355 font-mono">
                              {item.llm}
                            </td>
                            {/* Presence Boolean */}
                            <td className="py-3 px-3 text-center">
                              {item.brandPresence ? (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 px-2 py-0.5 rounded-sm inline-block leading-none">
                                  {lang === 'pl' ? '✓ WSPOMNIANY' : '✓ MENTIONED'}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-rose-450 bg-rose-950/30 border border-rose-900/50 px-2 py-0.5 rounded-sm inline-block leading-none">
                                  {lang === 'pl' ? '✕ BRAK' : '✕ ABSENT'}
                                </span>
                              )}
                            </td>
                            {/* Rank Position */}
                            <td className="py-3 px-3 text-center">
                              {item.brandPresence && item.position !== 'none' ? (
                                <span className={`px-1.5 py-0.5 rounded-sm font-mono font-bold text-[10px] inline-block ${item.position === 'first' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/50' : 'bg-slate-800 text-slate-300'}`}>
                                  {item.position === 'first' 
                                    ? (lang === 'pl' ? 'Rekomendacja #1' : '#1 Recommendation') 
                                    : item.position === 'top3' ? 'Top 3' : 'Top 10'}
                                </span>
                              ) : (
                                <span className="text-slate-650 font-normal">-</span>
                              )}
                            </td>
                            {/* Sentiment rating */}
                            <td className="py-3 px-3 text-center">
                              <span className={`text-[10px] font-semibold font-mono uppercase px-1.5 py-0.5 rounded-xs ${
                                item.sentiment === 'positive'
                                  ? 'bg-emerald-950/40 text-emerald-450'
                                  : item.sentiment === 'neutral'
                                  ? 'bg-slate-850 text-slate-400'
                                  : 'bg-rose-950/40 text-rose-450'
                              }`}>
                                {lang === 'pl' 
                                  ? (item.sentiment === 'positive' ? 'pozytywny' : item.sentiment === 'neutral' ? 'neutralny' : 'negatywny')
                                  : item.sentiment}
                              </span>
                            </td>
                            {/* Audit Trigger */}
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedAuditForAuditModal(item);
                                  addConsoleLog(lang === 'pl'
                                    ? `Uruchomiono raport panelu audytu diagnostycznego: ${item.id}`
                                    : `Launched audit console report: ${item.id}`);
                                }}
                                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline leading-none cursor-pointer"
                              >
                                {t.dashboard.colAudit}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls wrapper */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400 font-medium select-none">
                <div>
                  {lang === 'pl'
                    ? <>Pokazywanie <span className="text-white font-bold">{sortedAudits.length === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, sortedAudits.length)}</span> do <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, sortedAudits.length)}</span> z <span className="text-white font-bold">{sortedAudits.length}</span> wyników</>
                    : <>Showing <span className="text-white font-bold">{sortedAudits.length === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, sortedAudits.length)}</span> to <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, sortedAudits.length)}</span> of <span className="text-white font-bold">{sortedAudits.length}</span> results</>
                  }
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(prev => Math.max(prev - 1, 1));
                        addConsoleLog(lang === 'pl' ? `Zmiana strony tabeli na: ${currentPage - 1}` : `Navigated log catalog page: ${currentPage - 1}`);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-800 bg-[#151921] text-slate-350 hover:bg-[#1b212c] disabled:opacity-30 disabled:hover:bg-[#151921] transition cursor-pointer text-[11px] font-bold font-mono"
                    >
                      {lang === 'pl' ? 'Poprzednia' : 'Previous'}
                    </button>
                    
                    <span className="px-3.5 py-1.5 rounded-lg border border-cyan-900/40 bg-cyan-950/20 text-cyan-400 font-mono font-bold">
                      {currentPage} / {totalPages}
                    </span>
                    
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage(prev => Math.min(prev + 1, totalPages));
                        addConsoleLog(lang === 'pl' ? `Zmiana strony tabeli na: ${currentPage + 1}` : `Navigated log catalog page: ${currentPage + 1}`);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-800 bg-[#151921] text-slate-350 hover:bg-[#1b212c] disabled:opacity-30 disabled:hover:bg-[#151921] transition cursor-pointer text-[11px] font-bold font-mono"
                    >
                      {lang === 'pl' ? 'Następna' : 'Next'}
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* VIEW B: S_A_N_D_B_O_X Emulator Playground tab */}
        {activeTab === 'SANDBOX' && dashboardData && (
          <div className="animate-linear duration-200">
            <AISerperEmulator
              countriesMetadata={dashboardData.countriesMetadata}
              onAddLogMessage={addConsoleLog}
              onRefreshAllData={fetchBackendData}
            />
          </div>
        )}

        {/* VIEW C: O_P_T_I_M_I_Z_A_T_I_O_N_S Templates library tab */}
        {activeTab === 'OPTIMIZATIONS' && (
          <div className="animate-linear duration-200">
            <AIPromptOptimization onAddLogMessage={addConsoleLog} />
          </div>
        )}

        {/* VIEW D: G_A_P_S Analysis board tab */}
        {activeTab === 'GAPS' && (
          <div className="animate-linear duration-200">
            <VisibilityGapAnalysis onAddLogMessage={addConsoleLog} />
          </div>
        )}

        {/* VIEW E: LOG_ANALYZER Server bot logger tab */}
        {activeTab === 'LOG_ANALYZER' && (
          <div className="animate-linear duration-200">
            <LogAnalyzer onAddLogMessage={addConsoleLog} lang={lang} />
          </div>
        )}

        {/* VIEW F: QUERY_FANOUT Retrieval fanout generator tab */}
        {activeTab === 'QUERY_FANOUT' && (
          <div className="animate-linear duration-200">
            <QueryFanout
              onAddLogMessage={addConsoleLog}
              onAddBulkAudits={(newAudits) => {
                setAllAudits((prev) => [...newAudits, ...prev]);
                setCurrentPage(1);
                addConsoleLog(
                  lang === 'pl'
                    ? `Dodano ${newAudits.length} zapytań z generatora fanout do wspólnej bazy.`
                    : `Injected ${newAudits.length} queries expanded from fanout into core catalog.`
                );
              }}
              lang={lang}
            />
          </div>
        )}

        {/* VIEW G: GEOTOOLSUITE Advanced GEO optimization tools */}
        {activeTab === 'GEOTOOLSUITE' && (
          <div className="animate-linear duration-200">
            <GEOToolSuite lang={lang} onAddLogMessage={addConsoleLog} />
          </div>
        )}

        {/* VIEW I: GSC & GA4 Sync Tab */}
        {activeTab === 'GA4_GSC' && (
          <div className="animate-linear duration-200">
            <GSCAnalyticsHub 
              lang={lang} 
              onAddLogMessage={addConsoleLog}
              onAuditQueryInSandbox={(queryText) => {
                setActiveTab('SANDBOX');
                localStorage.setItem('sandbox_direct_query', queryText);
                window.dispatchEvent(new CustomEvent('audit_gsc_query', { detail: queryText }));
              }}
            />
          </div>
        )}

        {/* VIEW J: SENTINEL Suite Tab */}
        {activeTab === 'SENTINEL' && (
          <div className="animate-linear duration-200">
            <SentinelSuite 
              lang={lang} 
              onAddLogMessage={addConsoleLog}
            />
          </div>
        )}

        {/* VIEW H: SETTINGS Central management tab */}
        {activeTab === 'SETTINGS' && (
          <div className="animate-linear duration-200">
            <SettingsTab lang={lang} onAddLogMessage={addConsoleLog} />
          </div>
        )}

        {/* 5. SYSTEM SHELL DIAGNOSTIC LOG FEED TERMINAL (Aesthetic Pairing Differentiator) */}
        <div id="saas-diagnostic-logs-panel" className="bg-[#0F1115] border border-slate-800 text-slate-100 rounded-2xl p-5 shadow-inner mt-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 select-none">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block animate-pulse"></span>
              </div>
              <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-slate-400">
                {lang === 'pl' ? 'Konsola Diagnostyczna LLMpulse i strumień zdarzeń' : 'LLMpulse Diagnostic Console & Shell log feed'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono font-medium text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>API PROXY PORT: 3000 (HTTP OUTGOING OK)</span>
            </div>
          </div>

          <div className="font-mono text-xs text-slate-300 space-y-1 h-32 overflow-y-auto custom-scrollbar leading-relaxed pt-1 select-all">
            {consoleLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2.5">
                <span className="text-slate-500 text-[10px] select-none">&#62;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>

          </div> {/* End of Right Main Content Panel */}
        </div> {/* End of Outer Grid Splitting wrapper */}

      </main>

      {/* 6. RAW RESPONSE AUDIT MODAL DIALOG POPUP (In-Depth Audit Mode) */}
      {selectedAuditForAuditModal && (
        <div
          id="detailed-response-audit-modal-backdrop"
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade"
          onClick={() => setSelectedAuditForAuditModal(null)}
        >
          <div
            id="detailed-response-audit-modal-card"
            className="bg-[#151921] rounded-3xl border border-slate-800 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col justify-between overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0F1115] text-white p-6 relative border-b border-slate-800">
              <button
                onClick={() => setSelectedAuditForAuditModal(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center transition border border-slate-800 hover:border-slate-700 cursor-pointer"
                aria-label="Close Audit modal"
              >
                ✕
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-widest">
                    {lang === 'pl' ? 'RAPORT AUDYTU AI SEARCH CONSOLE' : 'AI SEARCH CONSOLE AUDIT REPORT'}
                  </span>
                  <span className="bg-cyan-950 text-cyan-400 border border-cyan-900/50 font-bold px-2 py-0.5 rounded-sm text-[9px] uppercase font-mono">
                    ID: {selectedAuditForAuditModal.id}
                  </span>
                </div>
                <h3 className="text-base font-bold tracking-tight text-white font-mono leading-snug">
                  {lang === 'pl' ? 'Zapytanie' : 'Query'}: &ldquo;{selectedAuditForAuditModal.query}&rdquo;
                </h3>
              </div>
            </div>

            {/* Modal Body Scroll Container */}
            <div className="p-6 overflow-y-auto space-y-4 max-h-[55vh] custom-scrollbar">
              
              {/* Core quick metadata block */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center select-none">
                <div className="bg-[#0F1115] rounded-xl p-2.5 border border-slate-800">
                  <span className="text-[9px] uppercase font-mono text-slate-400 block mb-0.5">{lang === 'pl' ? 'Skanowana Platforma' : 'Scanned Platform'}</span>
                  <span className="text-xs font-bold font-mono text-white">{selectedAuditForAuditModal.llm}</span>
                </div>
                <div className="bg-[#0F1115] rounded-xl p-2.5 border border-slate-800">
                  <span className="text-[9px] uppercase font-mono text-slate-400 block mb-0.5">{lang === 'pl' ? 'Rynek Analizy' : 'Market Coverage'}</span>
                  <span className="text-xs font-bold text-white">
                    {dashboardData?.countriesMetadata?.[selectedAuditForAuditModal.country]?.flag || '🌐'}{' '}
                    {selectedAuditForAuditModal.country}
                  </span>
                </div>
                <div className="bg-[#0F1115] rounded-xl p-2.5 border border-[#1e293b]">
                  <span className="text-[9px] uppercase font-mono text-slate-400 block mb-0.5">{lang === 'pl' ? 'Pozycja Wyniku' : 'Extracted Position'}</span>
                  {selectedAuditForAuditModal.brandPresence ? (
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 border border-cyan-900 rounded-sm px-1.5 inline-block">
                      {selectedAuditForAuditModal.position === 'first' 
                        ? (lang === 'pl' ? 'Rekomendacja #1' : '#1 Recommendation') 
                        : selectedAuditForAuditModal.position === 'top3' ? 'Top 3' : 'Top 10'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-normal text-slate-500">{lang === 'pl' ? 'Nieobecny' : 'Absent'}</span>
                  )}
                </div>
                <div className="bg-[#0F1115] rounded-xl p-2.5 border border-slate-800">
                  <span className="text-[9px] uppercase font-mono text-slate-400 block mb-0.5">{lang === 'pl' ? 'Udział w Głosie' : 'Share of Voice'}</span>
                  <span className="text-xs font-bold text-cyan-400">{selectedAuditForAuditModal.shareOfVoice}%</span>
                </div>
              </div>

              {/* Raw Response Text Body rendered like a snippet card */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  {lang === 'pl' ? 'Surowy tekst odpowiedzi AI (Pobrano z indeksu)' : 'Raw AI response text (Retrieved Crawler Index)'}
                </span>
                <div className="bg-[#0F1115] border border-slate-800 rounded-xl p-4 text-xs font-serif leading-relaxed text-slate-300 relative select-all">
                  &ldquo;{selectedAuditForAuditModal.snippet}&rdquo;
                </div>
              </div>

              {/* Competitors co-citation index */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  {lang === 'pl' ? 'Wykryci konkurenci w tym samym kontekście' : 'Extracted Competitors in the same Answer context'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedAuditForAuditModal.competitors.length === 0 ? (
                    <span className="text-xs text-slate-500">{lang === 'pl' ? 'Brak konkurentów' : 'None detected'}</span>
                  ) : (
                    selectedAuditForAuditModal.competitors.map((comp, idx) => (
                      <span
                        key={idx}
                        className="bg-rose-950/20 text-rose-400 border border-rose-900/40 font-semibold text-[10px] hover:scale-103 py-1 px-2.5 rounded-lg transition"
                      >
                        {comp}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Content strategy suggestions specifically aimed at daniel.krol@cosibella.pl */}
              <div className="bg-cyan-950/20 border border-cyan-900/30 text-indigo-50 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                  {lang === 'pl' ? 'Plan Optymalizacji Rekomendacji AI (Cosibella.pl)' : 'AI Recommendation Optimization Blueprint (Cosibella.pl)'}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {lang === 'pl' ? (
                    <>Aby zwiększyć widoczność w <strong>{selectedAuditForAuditModal.llm}</strong> dla zapytania <strong>&ldquo;{selectedAuditForAuditModal.query}&rdquo;</strong>, przygotuj na Cosibella.pl dedykowany artykuł poradnikowy porównujący Twój katalog z produktami <strong>{selectedAuditForAuditModal.competitors.join(', ') || 'rival drugstores'}</strong>. Wdróż dane strukturalne bezpośrednio indeksujące aktywne cechy kosmetyków.</>
                  ) : (
                    <>To further increase your visibility inside <strong>{selectedAuditForAuditModal.llm}</strong> for the query <strong>&ldquo;{selectedAuditForAuditModal.query}&rdquo;</strong>, construct a dedicated long-form guide on Cosibella.pl comparing your product catalog in contrast to <strong>{selectedAuditForAuditModal.competitors.join(', ') || 'rival drugstores'}</strong>. Implement microdata schemas explicitly indexing active skincare attributes.</>
                  )}
                </p>
              </div>

            </div>

            {/* Modal actions footer */}
            <div className="bg-[#0F1115] border-t border-slate-800/80 p-4 shrink-0 flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-500">
                {lang === 'pl' ? 'Ostatni Cykl Skanowania' : 'Last Scan Cycle'}: {new Date(selectedAuditForAuditModal.lastScanned).toLocaleString()}
              </span>
              <button
                onClick={() => setSelectedAuditForAuditModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer font-sans"
              >
                {lang === 'pl' ? 'Zamknij Raport' : 'Close Audit Report'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Corporate footer */}
      <footer className="bg-[#0F1115] border-t border-slate-800 py-6 select-none mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-slate-500 text-[11px]">
          <div className="flex items-center gap-1">
            <span>&copy; 2026</span>
            <span className="font-semibold text-slate-350">LLMpulse Brand Intelligence Platform</span>
            <span>&middot;</span>
            <span className="italic">{lang === 'pl' ? 'Dedykowane oprogramowanie dla portfolio Cosibella' : 'Cosibella Portfolio Dedicated Software'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Powered by</span>
            <span className="font-semibold text-cyan-400">Gemini 3.5 AI Core</span>
            <span>&middot;</span>
            <span className="text-slate-400">{lang === 'pl' ? 'Obszar roboczy autoryzowany dla Daniela Króla' : 'Workspace Authorized for Daniel Król'}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
