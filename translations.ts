export interface TranslationDict {
  header: {
    proLabel: string;
    subtitle: string;
    interactiveLicensee: string;
    systemReady: string;
  };
  banner: {
    hubLabel: string;
    dedicatedApp: string;
    title: string;
    description: string;
    storeButton: string;
    emulatorButton: string;
  };
  gsc_toolbar: {
    searchType: string;
    searchTypeVal: string;
    dateLabel: string;
    last7Days: string;
    last28Days: string;
    last3Months: string;
    last6Months: string;
    customRange: string;
    liveStatus: string;
    utcTime: string;
    startDateLabel: string;
    endDateLabel: string;
    applyCustomRange: string;
    customRangeEditor: string;
    dateRangeTitle: string;
  };
  tabs: {
    dashboard: string;
    emulator: string;
    optimizer: string;
    gapAnalysis: string;
    logAnalyzer: string;
    queryFanout: string;
    settings: string;
  };
  metrics: {
    globalScore: string;
    globalScoreDesc: string;
    shareOfVoice: string;
    shareOfVoiceDesc: string;
    sectionAuthority: string;
    sectionAuthorityDesc: string;
    crawlCoverage: string;
    crawlCoverageDesc: string;
    indexWeight: string;
    avgPresenceWeight: string;
    strong: string;
    trans: string;
    conv: string;
    comp: string;
    rec: string;
    regionLabel: string;
    activeQueries: string;
  };
  dashboard: {
    mapTitle: string;
    mapDesc: string;
    clearFilter: string;
    gridScale: string;
    sovTitle: string;
    sovDesc: string;
    rankDistTitle: string;
    rankDistDesc: string;
    trendTitle: string;
    trendDesc: string;
    trendsLegendMe: string;
    trendsLegendComp: string;
    allLlms: string;
    firstRecommend: string;
    top3: string;
    top10: string;
    notMentioned: string;
    consoleTitle: string;
    searchPlaceholder: string;
    allCountries: string;
    allEngines: string;
    allCategories: string;
    allVisibilities: string;
    onlyPresent: string;
    onlyAbsent: string;
    btnClean: string;
    colQuery: string;
    colCategory: string;
    colCountry: string;
    colEngine: string;
    colPresence: string;
    colSOV: string;
    colSentiment: string;
    colActions: string;
    btnDetails: string;
    emptyResults: string;
    sentimentPositive: string;
    sentimentNeutral: string;
    sentimentNegative: string;
    categoryTransactional: string;
    categoryConversational: string;
    categoryComparison: string;
    categoryRecommendation: string;
    noBrandPresence: string;
    brandPresent: string;
    rankOnPage: string;
  };
  modal: {
    diagnosticTitle: string;
    modalOverview: string;
    keyEvidence: string;
    queryLabel: string;
    categoryLabel: string;
    regionLabel: string;
    detectedAgent: string;
    positionLabel: string;
    shareOfVoiceLabel: string;
    emotionalTone: string;
    brandPresenceLabel: string;
    scannedTime: string;
    closeLabel: string;
    rankLabel: string;
    snippetLabel: string;
    competitorsLabel: string;
    reverseEngineeringLabel: string;
    contextTagsLabel: string;
  };
  emulator: {
    title: string;
    desc: string;
    presetTitle: string;
    runBtn: string;
    loadingLabel: string;
    stepTranslations: string[];
    responseHeader: string;
    simulatedMetrics: string;
    sentimentLabel: string;
    presenceLabel: string;
    posLabel: string;
    shareLabel: string;
    revFactorsLabel: string;
    optAdviseLabel: string;
    placeholderQuery: string;
    validationError: string;
    emulatorLogSelected: string;
    copUrlLabel: string;
  };
  optimizer: {
    title: string;
    desc: string;
    targetLabel: string;
    priorityLabel: string;
    problemLabel: string;
    templateLabel: string;
    impactLabel: string;
    copyBtn: string;
    copiedBtn: string;
    allPlatformsOption: string;
    noResults: string;
  };
  gaps: {
    title: string;
    desc: string;
    priorityHigh: string;
    priorityMed: string;
    visibleCompetitors: string;
    recommendingFactors: string;
    actionPlan: string;
    resolvedText: string;
  };
}

export const translations: Record<'pl' | 'en', TranslationDict> = {
  pl: {
    header: {
      proLabel: 'PRO',
      subtitle: 'Konsola Szukania i Widoczności Marki AI dla Cosibella.pl',
      interactiveLicensee: 'Licencjobiorca:',
      systemReady: 'Gotowy do działania',
    },
    banner: {
      hubLabel: 'Centrum Operacji AI',
      dedicatedApp: 'Dedykowana Aplikacja Cosibella',
      title: 'Silnik Optymalizacji Wyszukiwania AI Cosibella',
      description: 'Monitoruj i kieruj tym, jak główne platformy generatywne (ChatGPT, SGE, Gemini, Perplexity) rekomendują Twoje produkty kosmetyczne konsumentom w Europie Środkowo-Wschodniej.',
      storeButton: 'Sklep Cosibella.pl',
      emulatorButton: 'Uruchom Emulator AI',
    },
    gsc_toolbar: {
      searchType: 'Typ szukania:',
      searchTypeVal: 'Wyszukiwarki Generatywne AI',
      dateLabel: 'Data:',
      last7Days: 'Ostatnie 7 dni',
      last28Days: 'Ostatnie 28 dni',
      last3Months: 'Ostatnie 3 miesiące',
      last6Months: 'Ostatnie 6 miesięcy',
      customRange: 'Niestandardowy zakres...',
      liveStatus: 'Skaner Aktywny',
      utcTime: 'Czas UTC:',
      startDateLabel: 'Data początkowa',
      endDateLabel: 'Data końcowa',
      applyCustomRange: 'Zastosuj zakres dat',
      customRangeEditor: 'Niestandardowy edytor zakresu',
      dateRangeTitle: 'Zakres Dat',
    },
    tabs: {
      dashboard: 'Globalny panel analiz',
      emulator: 'Emulator SERP AI',
      optimizer: 'Optymalizator treści AI',
      gapAnalysis: 'Analizator luk widoczności',
      logAnalyzer: 'Analizator logów serwera',
      queryFanout: 'Generator Query Fanout',
      settings: 'Ustawienia i klucze API',
    },
    metrics: {
      globalScore: 'Globalny wynik (GLVS)',
      globalScoreDesc: 'Ważona średnia widoczność marki we wszystkich aktywnych skanach',
      shareOfVoice: 'Udział w głosie (AI-SOV)',
      shareOfVoiceDesc: 'Ważony poziom rekomendacji w porównaniu do konkurentów regionalnych',
      sectionAuthority: 'Autorytet sekcji (K-Beauty)',
      sectionAuthorityDesc: 'Autorytet w e-commerce w zależności od typu zapytania',
      crawlCoverage: 'Indeks pokrycia skanów',
      crawlCoverageDesc: 'Aktywne profile zapytań w monitorowanych rynkach',
      indexWeight: 'waga indeksu',
      avgPresenceWeight: 'średnia waga obecności',
      strong: 'Silny',
      trans: 'Transakcyjny',
      conv: 'Konwersacyjny',
      comp: 'Porównawczy',
      rec: 'Rekomendacyjny',
      regionLabel: 'POLSKA, NIEMCY I 8 INNYCH REGIONÓW ŚRODKOWEJ EUROPY',
      activeQueries: 'załadowanych skanów',
    },
    dashboard: {
      mapTitle: 'Geograficzna mapa dominacji AI',
      mapDesc: 'Symulacja mapy ciepła pokazująca poziom autorytetu marki Cosibella na poszczególnych rynkach.',
      clearFilter: 'Wyczyść filtr (Globalny)',
      gridScale: 'SKALA SIATKI: 50.31° N, 19.34° E (REGIONALNA CE)',
      sovTitle: 'Udział w Głosie AI (AI-SOV)',
      sovDesc: 'Agregowany wskaźnik rekomendacji marki Cosibella i konkurentów.',
      rankDistTitle: 'Dystrybucja pozycji rekomendowanych',
      rankDistDesc: 'Odsetek skanów, w których Cosibella zajmuje określone pozycje.',
      trendTitle: 'Zmienna historia trendów widoczności',
      trendDesc: 'Wzrost wskaźnika GLVS marki Cosibella w porównaniu do średniej rynkowej.',
      trendsLegendMe: 'Cosibella (GLVS)',
      trendsLegendComp: 'Średnia konkurencji',
      allLlms: 'Wszystkie silniki',
      firstRecommend: 'Rekomendacja #1',
      top3: 'Pozycja w Top 3',
      top10: 'Pozycja w Top 10',
      notMentioned: 'Brak wzmianki',
      consoleTitle: 'Logi systemowe w czasie rzeczywistym',
      searchPlaceholder: 'Przeszukaj zapytania, tagi lub fragmenty odpowiedzi...',
      allCountries: 'Wszystkie Kraje',
      allEngines: 'Wszystkie Silniki AI',
      allCategories: 'Wszystkie Kategorie',
      allVisibilities: 'Każda Widoczność',
      onlyPresent: 'Tylko Obecni',
      onlyAbsent: 'Tylko Nieobecni',
      btnClean: 'Wyczyść filtry',
      colQuery: 'ZAPYTANIE',
      colCategory: 'KATEGORIA',
      colCountry: 'KRAJ',
      colEngine: 'SILNIK AI',
      colPresence: 'WIDOCZNOŚĆ',
      colSOV: 'SOV',
      colSentiment: 'SENTYMENT',
      colActions: 'OPCJE',
      btnDetails: 'Audyt',
      emptyResults: 'Nie znaleziono zapytań spełniających wybrane kryteria.',
      sentimentPositive: 'Pozytywny',
      sentimentNeutral: 'Neutralny',
      sentimentNegative: 'Negatywny',
      categoryTransactional: 'transakcyjne',
      categoryConversational: 'konwersacyjne',
      categoryComparison: 'porównawcze',
      categoryRecommendation: 'rekomendacja',
      noBrandPresence: 'Brak wzmianki',
      brandPresent: 'Obecny',
      rankOnPage: 'Poz.',
    },
    modal: {
      diagnosticTitle: 'Skan diagnostyczny LLM AI',
      modalOverview: 'SZCZEGÓŁOWE DANE AUDYTU ZAPYTANIA',
      keyEvidence: 'DOWODY REKOMENDACJI W GENEROWANEJ TREŚCI',
      queryLabel: 'Pełne Zapytanie',
      categoryLabel: 'Kategoria Intencji',
      regionLabel: 'Odbiorca Regionalny',
      detectedAgent: 'Wykryty Agent AI',
      positionLabel: 'Najlepsza Pozycja',
      shareOfVoiceLabel: 'Udział w Głosie',
      emotionalTone: 'Sentyment Wypowiedzi',
      brandPresenceLabel: 'Status Obecności',
      scannedTime: 'Data Skanowania',
      closeLabel: 'Zamknij Okno',
      rankLabel: 'Pozycja',
      snippetLabel: 'Wycinek odpowiedzi AI',
      competitorsLabel: 'Wykryta Konkurencja',
      reverseEngineeringLabel: 'Czynniki Pozycjonowania AI (Reverse Engineering)',
      contextTagsLabel: 'Tagi Kontekstowe',
    },
    emulator: {
      title: 'Emulator Wyników Wyszukiwania SERP AI',
      desc: 'Testuj w czasie rzeczywistym, jak silniki językowe interpretują Twoje frazy. Wpisz testowe zapytanie lub wybierz gotowy wzorzec poniżej.',
      presetTitle: 'Kliknij, aby wgrać szablon zapytania e-commerce:',
      runBtn: 'Symuluj odpowiedź wyszukiwarki',
      loadingLabel: 'Analiza zapytania w bazie...',
      stepTranslations: [
        'Tłumaczenie frazy na lokalny dialekt i intencję zakupową klienta...',
        'Przeszukiwanie lokalnego indeksu AI i wycinków wyszukiwarek...',
        'Symulowanie siatki uwagi neuronowej LLM dla wybranego zapytania...',
        'Dopasowanie algorytmów NER (Named Entity Recognition) dla marki Cosibella...',
        'Wyodrębnianie konkurencji i budowanie rekomendacji optymalizacyjnych...',
      ],
      responseHeader: 'SYMULOWANA ODPOWIEDŹ PLATFORMY AI',
      simulatedMetrics: 'METRYKI WYSZUKIWANIA I POZYCJONOWANIA AI (WYDOBYTE)',
      sentimentLabel: 'Sentyment Wypowiedzi',
      presenceLabel: 'Obecność Marki',
      posLabel: 'Pozycja w Odpowiedzi',
      shareLabel: 'Udział w Głowach (SOV)',
      revFactorsLabel: 'Parametry Decyzyjne Agenta AI',
      optAdviseLabel: 'Wskazówka Optymalizacji Treści',
      placeholderQuery: 'Co polecasz na wrażliwą cerę z koreańskich kosmetyków?',
      validationError: 'Błąd: Wpisz lub wybierz zapytanie testowe przed rozpoczęciem symulacji.',
      emulatorLogSelected: 'Wgrano szablon zapytania testowego do emulatora',
      copUrlLabel: 'Skopiuj Link',
    },
    optimizer: {
      title: 'Optymalizator i Szablony Treści AI SEO',
      desc: 'Strategie i struktury znaczników zaprojektowane z myślą o pozycjonowaniu w wyszukiwarkach AI (SGE, ChatGPT, Perplexity).',
      targetLabel: 'Celowany Procesor AI',
      priorityLabel: 'Priorytet',
      problemLabel: 'Analiza Problemu AI',
      templateLabel: 'Szablon Struktury Danych / Kontentu',
      impactLabel: 'Prognozowany Wpływ',
      copyBtn: 'Kopiuj Szablon',
      copiedBtn: 'Skopiowano!',
      allPlatformsOption: 'Wszystkie Platformy AI',
      noResults: 'Nie znaleziono szablonów optymalizacji dla wybranych filtrów.',
    },
    gaps: {
      title: 'Analiza Luk w Rekomendacjach AI',
      desc: 'Zapytania lokalne, w których konkurenci są silnie polecani, ale marka Cosibella jest pomijana. Wdróż poniższe wytyczne, aby zająć ich miejsce.',
      priorityHigh: 'Wysoki Priorytet',
      priorityMed: 'Średni Priorytet',
      visibleCompetitors: 'Widoczni Konkurenci',
      recommendingFactors: 'Kluczowe czynniki wyboru AI',
      actionPlan: 'Plan działania optymalizacji (SEO AI)',
      resolvedText: 'Wszystkie zidentyfikowane luki widoczności zostały rozwiązane prawidłowo.',
    },
  },
  en: {
    header: {
      proLabel: 'PRO',
      subtitle: 'AI Brand Visibility & SEO Search Console for Cosibella.pl',
      interactiveLicensee: 'Licensee:',
      systemReady: 'System Active',
    },
    banner: {
      hubLabel: 'Corporate Intelligence Hub',
      dedicatedApp: 'Dedicated Cosibella Application',
      title: 'Cosibella AI Search Optimization Engine',
      description: 'Monitor, extract, and manipulate how major generative platforms (ChatGPT, SGE, Gemini, Perplexity) recommend your dermal products to Central & Eastern European consumers.',
      storeButton: 'Cosibella.pl Store',
      emulatorButton: 'Launch Emulator AI',
    },
    gsc_toolbar: {
      searchType: 'Search type:',
      searchTypeVal: 'Generative AI Search',
      dateLabel: 'Date:',
      last7Days: 'Last 7 days',
      last28Days: 'Last 28 days',
      last3Months: 'Last 3 months',
      last6Months: 'Last 6 months',
      customRange: 'Custom range...',
      liveStatus: 'Crawler Live',
      utcTime: 'UTC Time:',
      startDateLabel: 'Start Date',
      endDateLabel: 'End Date',
      applyCustomRange: 'Apply Custom Range',
      customRangeEditor: 'Custom Range Editor',
      dateRangeTitle: 'Date Range',
    },
    tabs: {
      dashboard: 'Global Dashboard Console',
      emulator: 'AI SERP Emulator Hub',
      optimizer: 'AI Content Optimizer',
      gapAnalysis: 'Visibility Gap Analyzer',
      logAnalyzer: 'Server Log Analyzer',
      queryFanout: 'Query Fanout Generator',
      settings: 'Settings & API Keys',
    },
    metrics: {
      globalScore: 'Global Score (GLVS)',
      globalScoreDesc: 'Weighted average of brand presence across active scans',
      shareOfVoice: 'AI Share of Voice (AI-SOV)',
      shareOfVoiceDesc: 'Weighted emphasis compared to primary regional competitors',
      sectionAuthority: 'Section Authority (K-Beauty)',
      sectionAuthorityDesc: 'Authority breakdown across e-commerce query structures',
      crawlCoverage: 'Crawl Coverage Index',
      crawlCoverageDesc: 'Active scanning profiles over our localized coverages',
      indexWeight: 'index weight',
      avgPresenceWeight: 'avg presence weight',
      strong: 'Strong',
      trans: 'Transactional',
      conv: 'Conversational',
      comp: 'Comparison',
      rec: 'Recommendation',
      regionLabel: 'POLAND, GERMANY & 8 MORE CEE REGIONS',
      activeQueries: 'active queries loaded',
    },
    dashboard: {
      mapTitle: 'Geo AI Dominance Map',
      mapDesc: 'Simulated geo heatmaps analyzing Cosibella\'s local brand authority index.',
      clearFilter: 'Clear Filter (Global)',
      gridScale: 'GRID SCALE: 50.31° N, 19.34° E (CEE REGION)',
      sovTitle: 'AI Share of Voice (AI-SOV) Leaderboard',
      sovDesc: 'Aggregated recommend density indices compiled over active foreign queries.',
      rankDistTitle: 'Ranking Position Distribution',
      rankDistDesc: 'Share of scans in which Cosibella holds specific placement tiers.',
      trendTitle: 'Rolling Visibility History',
      trendDesc: 'Cosibella\'s brand visibility GLVS climb compared to index benchmark averages.',
      trendsLegendMe: 'Cosibella (GLVS)',
      trendsLegendComp: 'Competitor Avg',
      allLlms: 'All LLMs',
      firstRecommend: 'First Recommendation',
      top3: 'Top 3 Recommendation',
      top10: 'Top 10 Mentioned',
      notMentioned: 'Not Mentioned',
      consoleTitle: 'Real-Time Operational Log Stream',
      searchPlaceholder: 'Search queries, context tags or target snippet replies...',
      allCountries: 'All Countries',
      allEngines: 'All AI Engines',
      allCategories: 'All Categories',
      allVisibilities: 'Any Visibility',
      onlyPresent: 'Only Present',
      onlyAbsent: 'Only Absent',
      btnClean: 'Clear search filters',
      colQuery: 'QUERY',
      colCategory: 'CATEGORY',
      colCountry: 'COUNTRY',
      colEngine: 'AI ENGINE',
      colPresence: 'VISIBILITY',
      colSOV: 'SOV',
      colSentiment: 'SENTIMENT',
      colActions: 'ACTIONS',
      btnDetails: 'Audit',
      emptyResults: 'No scanned queries found matching the active selection criteria.',
      sentimentPositive: 'Positive',
      sentimentNeutral: 'Neutral',
      sentimentNegative: 'Negative',
      categoryTransactional: 'transactional',
      categoryConversational: 'conversational',
      categoryComparison: 'comparison',
      categoryRecommendation: 'recommendation',
      noBrandPresence: 'Not Mentioned',
      brandPresent: 'Present',
      rankOnPage: 'Rank',
    },
    modal: {
      diagnosticTitle: 'Skan diagnostyczny LLM AI',
      modalOverview: 'DIAGNOSTIC QUERY AUDIT SPEC SHEET',
      keyEvidence: 'AI GENERATED TRACE SEGMENTS (KNOWLEDGE SNIPPET)',
      queryLabel: 'Full Live Query',
      categoryLabel: 'Intent Category',
      regionLabel: 'Target CEE Region',
      detectedAgent: 'Auditing LLM Agent',
      positionLabel: 'Best Placement',
      shareOfVoiceLabel: 'Share of Voice',
      emotionalTone: 'Emotional Tone',
      brandPresenceLabel: 'Visibility Status',
      scannedTime: 'Last Scanned At',
      closeLabel: 'Close Diagnostic',
      rankLabel: 'Rank Placement',
      snippetLabel: 'AI Generated Snippet',
      competitorsLabel: 'Co-Mentioned Competitors',
      reverseEngineeringLabel: 'AI Knowledge Retrieval Factors (Reverse Engineered)',
      contextTagsLabel: 'Context Retrieval Tags',
    },
    emulator: {
      title: 'AI SERP Emulator Hub',
      desc: 'Conduct a real-time predictive sandbox evaluation. Type a custom buyers search phrase or load one of our optimized standard presets below.',
      presetTitle: 'Click to load a standard purchase intent template:',
      runBtn: 'Run AI Search Simulation',
      loadingLabel: 'Simulating neural response retrieval...',
      stepTranslations: [
        'Translating query naturally to local dialect & buyer search intent...',
        'Crawling localized AI index registries & regional search snippets...',
        'Simulating LLM neural attention response grids for the designated query...',
        'Executing Named Entity Recognition (NER) algorithms for Cosibella parsing...',
        'Extracting competitor mentions & compiling prompt-to-rank optimization advice...',
      ],
      responseHeader: 'SIMULATED LLM SEARCH ENGINE OUTPUT',
      simulatedMetrics: 'MAPPED AI SEARCH METRICS & ENTITY EXTRAPOLATION',
      sentimentLabel: 'Extracted Sentiment',
      presenceLabel: 'Brand Recommendation',
      posLabel: 'Placement Level',
      shareLabel: 'Share of Voice (AI-SOV)',
      revFactorsLabel: 'Influencing AI Ranking Parameters',
      optAdviseLabel: 'Prompt & Content Priority Action',
      placeholderQuery: 'Which beauty store with consultant in Warsaw has fast shipping?',
      validationError: 'Error: Please enter or choose a request format context prior to running simulation.',
      emulatorLogSelected: 'Loaded standard request preset into SERP Simulator text box',
      copUrlLabel: 'Copy Link',
    },
    optimizer: {
      title: 'AI Prompt & Content Optimization Engine',
      desc: 'Actionable strategies and markup templates designed to win brand recommendations inside LLM answers.',
      targetLabel: 'Target Processor Node',
      priorityLabel: 'Priority Level',
      problemLabel: 'Problem Statement Analysis',
      templateLabel: 'Optimized Markup / Content Template',
      impactLabel: 'Predicted Metric Impact',
      copyBtn: 'Copy Template',
      copiedBtn: 'Copied!',
      allPlatformsOption: 'All LLM Platforms',
      noResults: 'No optimized strategies found matching this filter.',
    },
    gaps: {
      title: 'AI Visibility Gap Analysis',
      desc: 'Queries where core competitors currently dominate LLM recommendations but Cosibella is absent. Leverage guidelines below to patch the gap.',
      priorityHigh: 'High Priority Gap',
      priorityMed: 'Medium Priority Gap',
      visibleCompetitors: 'Visible Competitors',
      recommendingFactors: 'AI Ranking Determinants',
      actionPlan: 'AI SEO Remediation Blueprint',
      resolvedText: 'All scanned visibility gaps resolved perfectly.',
    },
  },
};
