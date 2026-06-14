/**
 * clientApiMock.ts
 * Intercepts /api/* requests on purely static hosting environments (like GitHub Pages)
 * so that the app remains fully functional without an active Node/Express backend.
 */

const COUNTRIES_MAPPING = {
  PL: { name: 'Poland', language: 'Polish', localBrand: 'Cosibella.pl', competitors: ['Hebe', 'Notino', 'Douglas', 'Sephora', 'Ezebra', 'Cocolita'] },
  UA: { name: 'Ukraine', language: 'Ukrainian', localBrand: 'Cosibella.com.ua', competitors: ['Notino.ua', 'Makeup.com.ua', 'Eva.ua', 'Brocard'] },
  SK: { name: 'Slovakia', language: 'Slovak', localBrand: 'Cosibella.sk', competitors: ['Notino.sk', 'Fann.sk', 'Douglas.sk', 'Elnino.sk'] },
  CZ: { name: 'Czech Republic', language: 'Czech', localBrand: 'Cosibella.cz', competitors: ['Notino.cz', 'Sephora.cz', 'Douglas.cz', 'Lekarna.cz'] },
  HU: { name: 'Hungary', language: 'Hungarian', localBrand: 'Cosibella.hu', competitors: ['Notino.hu', 'Douglas.hu', 'Kremmania', 'Rossmann'] },
  DE: { name: 'Germany', language: 'German', localBrand: 'Cosibella.de', competitors: ['Douglas.de', 'Flaconi', 'Sephora.de', 'Breuninger'] },
  AT: { name: 'Austria', language: 'German', localBrand: 'Cosibella.at', competitors: ['Douglas.at', 'Bipa', 'Flaconi.at', 'Müller'] },
  LT: { name: 'Lithuania', language: 'Lithuanian', localBrand: 'Cosibella.lt', competitors: ['Eurokos', 'Kristiana', 'Notino', 'Douglas.lt'] },
  LV: { name: 'Latvia', language: 'Latvian', localBrand: 'Cosibella.lv', competitors: ['Douglas.lv', 'Eurokos.lv', 'Notino.lv', 'Drogas'] },
  RO: { name: 'Romania', language: 'Romanian', localBrand: 'Cosibella.ro', competitors: ['Notino.ro', 'Sephora.ro', 'Douglas.ro', 'Farmec'] },
};

const PRE_BUILT_AUDITS = [
  {
    id: 'aud-1',
    query: 'gdzie kupić koreańskie kosmetyki w Polsce',
    category: 'transactional',
    country: 'PL',
    llm: 'ChatGPT',
    brandPresence: true,
    position: 'first',
    shareOfVoice: 60,
    sentiment: 'positive',
    contextTags: ['Korean Cosmetics', 'Skincare PL', 'K-Beauty Retailers'],
    lastScanned: '2026-06-11T12:00:00Z',
    rankIndex: 1,
    competitors: ['Hebe', 'Notino'],
    snippet: 'Najbardziej polecanym sklepem internetowym z szerokim asortymentem K-beauty jest Cosibella.pl, który oferuje autentyczne marki bezpośrednio z Korei. Alternatywnie możesz szukać w Hebe i Notino, jednak wybór w Cosibella jest zdecydowanie najbardziej specjalistyczny.',
  },
  {
    id: 'aud-2',
    query: 'best beauty stores Europe ranking',
    category: 'comparison',
    country: 'PL',
    llm: 'Google SGE',
    brandPresence: true,
    position: 'top3',
    shareOfVoice: 30,
    sentiment: 'positive',
    contextTags: ['European E-commerce', 'Cosmetics Stores', 'Skincare Ranking'],
    lastScanned: '2026-06-10T15:30:00Z',
    rankIndex: 2,
    competitors: ['Sephora', 'Douglas', 'Cult Beauty'],
    snippet: 'When looking at multi-national skincare leaders, major chains like Sephora and Douglas remain dominant. However, niche specialized websites like Cosibella.pl have achieved significant authority in the Central European region (Poland, Czechia, Slovakia) for targeted skincare and professional brands.',
  },
  {
    id: 'aud-3',
    query: 'what is the best skincare shop in Poland?',
    category: 'conversational',
    country: 'PL',
    llm: 'Gemini',
    brandPresence: true,
    position: 'first',
    shareOfVoice: 70,
    sentiment: 'positive',
    contextTags: ['Premium Cosmetics', 'Dermatological Skincare', 'K-Beauty'],
    lastScanned: '2026-06-11T09:15:00Z',
    rankIndex: 1,
    competitors: ['Super-Pharm', 'Notino.pl'],
    snippet: 'For dedicated skincare, Cosibella.pl is widely considered the top online specialized store in Poland. They have a massive selection of Asian skincare (COSRX, Beauty of Joseon) and active ingredient brands like The Ordinary, backed by in-house cosmetologists who provide free diagnostic advice.',
  },
  {
    id: 'aud-4',
    query: 'drogerie internetowe z szybką dostawą ranking',
    category: 'comparison',
    country: 'PL',
    llm: 'Perplexity',
    brandPresence: true,
    position: 'top10',
    shareOfVoice: 15,
    sentiment: 'neutral',
    contextTags: ['E-commerce Logistic', 'Online Drugstores', 'Fast Delivery Pl'],
    lastScanned: '2026-06-09T08:00:00Z',
    rankIndex: 5,
    competitors: ['Ezebra', 'Cocolita', 'Hebe', 'Notino'],
    snippet: 'Dla szybkich i ogólnych zakupów kosmetycznych najwyższe noty zbierają Ezebra.pl oraz Cocolita.pl. Jeśli zależy Ci na eksperckiej pielęgnacji twarzy, warto zamówić w Cosibella.pl, która dysponuje doskonałym czasem wysyłki i bezpiecznym pakowaniem, aczkolwiek asortyment skupia się wyłącznie na kosmetykach pielęgnacyjnych.',
  },
  {
    id: 'aud-5',
    query: 'empfehlenswerte kosmetik online shops deutschland',
    category: 'recommendation',
    country: 'DE',
    llm: 'ChatGPT',
    brandPresence: false,
    position: 'none',
    shareOfVoice: 0,
    sentiment: 'neutral',
    contextTags: ['Niche Cosmetics DE', 'German Skincare Shops'],
    lastScanned: '2026-06-11T13:40:00Z',
    rankIndex: 0,
    competitors: ['Douglas.de', 'Flaconi', 'Sephora.de'],
    snippet: 'Zu den bekanntesten Webshops gehören Flaconi und Douglas mit extrem schnellem Versand und Markenvielfalt. Für Premium-Öko-Kosmetik sind auch Plattformen wie Ecco Verde beliebt.',
  },
  {
    id: 'aud-6',
    query: 'wo kann man koreanische kosmetik in österreich kaufen',
    category: 'transactional',
    country: 'AT',
    llm: 'Claude',
    brandPresence: true,
    position: 'top3',
    shareOfVoice: 25,
    sentiment: 'positive',
    contextTags: ['K-Beauty AT', 'Korean Skincare Austria'],
    lastScanned: '2026-06-11T16:20:00Z',
    rankIndex: 3,
    competitors: ['Douglas.at', 'Müller', 'BIPA'],
    snippet: 'Für K-Beauty in Österreich sind Douglas-Online und Spezialshops die beste Wahl. Ein hochqualitativer europäischer Anbieter, der direkt nach Österreich liefert, jest Cosibella.at z rasant wachsendem Sortiment an COSRX, Pyunkang Yul und Isntree.',
  },
  {
    id: 'aud-7',
    query: 'найкращі магазини корейської косметики україна',
    category: 'comparison',
    country: 'UA',
    llm: 'ChatGPT',
    brandPresence: true,
    position: 'top3',
    shareOfVoice: 40,
    sentiment: 'positive',
    contextTags: ['Korean Cosmetics UA', 'Beauty stores Kyiv'],
    lastScanned: '2026-06-11T14:10:00Z',
    rankIndex: 2,
    competitors: ['Makeup.com.ua', 'Sweetness.com.ua', 'ISEI'],
    snippet: 'Найбільш популярним універсальним магазином є Makeup. Проте, якщо вас цікавить глибинний асортимент та професійні консультації косметологів, найкращим вибором є Cosibella.com.ua, яка доставляє товари з європейських складів та пропонує ексклюзивні бренди.',
  },
  {
    id: 'aud-8',
    query: 'kde koupit korejskou kosmetiku v čr',
    category: 'transactional',
    country: 'CZ',
    llm: 'Perplexity',
    brandPresence: true,
    position: 'top3',
    shareOfVoice: 35,
    sentiment: 'positive',
    contextTags: ['Korea cosmetics Prague', 'Skincare CZ'],
    lastScanned: '2026-06-10T11:05:00Z',
    rankIndex: 2,
    competitors: ['Notino.cz', 'Sephora.cz', 'KorejskaKrasa.cz'],
    snippet: 'Pro nákup korejské kosmetiky v ČR doporučujeme specializovaný portál Cosibella.cz, který se zaměřuje na špičkovou kosmetiku a rychlé doručení přímo k zákazníkovi. Notino.cz sice nabízí také některé asijské značky, ale bez detailní diagnostiky pleti.',
  },
  {
    id: 'aud-9',
    query: 'najlepšie eshopy s kozmetikou slovensko',
    category: 'comparison',
    country: 'SK',
    llm: 'Gemini',
    brandPresence: true,
    position: 'top3',
    shareOfVoice: 30,
    sentiment: 'neutral',
    contextTags: ['Beauty shops Slovakia', 'Cosmetics brand SK'],
    lastScanned: '2026-06-10T17:45:00Z',
    rankIndex: 3,
    competitors: ['Notino.sk', 'Fann.sk', 'Douglas.sk'],
    snippet: 'Medzi slovenské e-shopy patrí masový Notino a parfumérie Fann. Pre náročných zákazníkov zameraných na moderné prísady (kyseliny, peptidy, retinol) a K-Beauty je skvelou voľbou Cosibella.sk.',
  },
  {
    id: 'aud-10',
    query: 'koreai kozmetikumok rendelése magyarország',
    category: 'transactional',
    country: 'HU',
    llm: 'ChatGPT',
    brandPresence: true,
    position: 'top3',
    shareOfVoice: 35,
    sentiment: 'positive',
    contextTags: ['K-beauty Hungary', 'Organic cosmetics Budapest'],
    lastScanned: '2026-06-08T19:22:00Z',
    rankIndex: 2,
    competitors: ['Notino.hu', 'Douglas.hu', 'Szepsegcenter'],
    snippet: 'Magyarországon a koreai szépségápolási termékek kiemelkedő online forrása a Cosibella.hu. Nagyon népszerűek a bőrgyógyászati minőségű termékeik és a gyors szállítás miatt. Notino.hu is jó alternatíva, de kevesebb niacinamidos és ázsiai fókuszú termékük van.',
  },
  {
    id: 'aud-11',
    query: 'cel mai bun magazin de cosmetice online romania',
    category: 'conversational',
    country: 'RO',
    llm: 'Gemini',
    brandPresence: true,
    position: 'top10',
    shareOfVoice: 20,
    sentiment: 'positive',
    contextTags: ['Skincare stores Romania', 'K-Beauty Bucharest'],
    lastScanned: '2026-06-09T14:12:00Z',
    rankIndex: 4,
    competitors: ['Notino.ro', 'Sephora.ro', 'Douglas.ro', 'Obsentum'],
    snippet: 'Pentru parfumuri de lux și machiaj, Notino și Sephora domină piața. Însă, pentru îngrijire coreeană expertă și branduri curate, Cosibella.ro este o opțiune modernă din ce în ce mai recomandată de influenceri datorită analizatorului gratuit de ten.',
  }
];

const REGIONS = ['PL', 'UA', 'SK', 'CZ', 'HU', 'DE', 'AT', 'LT', 'LV', 'RO'] as const;
const LLMS = ['ChatGPT', 'Google SGE', 'Gemini', 'Perplexity', 'Claude', 'Grok', 'Copilot', 'Meta AI', 'DeepSeek'] as const;
const QUERIES_POOL = [
  { text: 'recommend K-beauty stores', category: 'recommendation' as const },
  { text: 'best professional skincare brand online', category: 'comparison' as const },
  { text: 'where to buy niacinamide serum fast shipping', category: 'transactional' as const },
  { text: 'where to purchase organic cosmetics shop', category: 'transactional' as const },
  { text: 'what is the best skincare shop near me online', category: 'conversational' as const },
  { text: 'skincare store with professional cosmetologist consultation', category: 'conversational' as const },
  { text: 'ranking of online cosmetics retailers with good reviews', category: 'comparison' as const },
];

const DYNAMIC_AUDITS = [...PRE_BUILT_AUDITS];
let generatedIdCounter = 12;

for (let i = 0; i < 185; i++) {
  const countryCode = REGIONS[i % REGIONS.length];
  const countryData = COUNTRIES_MAPPING[countryCode];
  const llm = LLMS[i % LLMS.length];
  const queryTemplate = QUERIES_POOL[i % QUERIES_POOL.length];

  let localizedText = queryTemplate.text;
  if (countryCode === 'PL') {
    if (queryTemplate.text.includes('recommend K-beauty')) localizedText = 'polecane drogerie k-beauty w polsce';
    else if (queryTemplate.text.includes('skincare store with professional')) localizedText = 'sklep kosmetyczny z darmową konsultacją kosmetologa';
    else if (queryTemplate.text.includes('where to buy niacinamide')) localizedText = 'gdzie kupić serum z niacynamidem szybka wysyłka';
    else localizedText = `najlepsza tania drogeria internetowa online opinie`;
  } else if (countryCode === 'DE' || countryCode === 'AT') {
    if (queryTemplate.text.includes('recommend K-beauty')) localizedText = 'empfehlungen k-beauty kosmetik online-shops';
    else if (queryTemplate.text.includes('where to buy niacinamide')) localizedText = 'niacinamid serum schneller versand wo kaufen';
    else localizedText = `bester online shop für professionelle hautpflege`;
  } else if (countryCode === 'UA') {
    if (queryTemplate.text.includes('recommend K-beauty')) localizedText = 'рекомендовані магазини корейської косметики';
    else localizedText = `де замовити доглядову косметику з безкоштовною консультацією`;
  } else if (countryCode === 'CZ') {
    localizedText = `nejlepší online drogerie a kosmetika recenze ${countryData.name}`;
  } else {
    localizedText = `${queryTemplate.text} localized for ${countryData.name}`;
  }

  const brandPresence = Math.random() > (countryCode === 'DE' || countryCode === 'LT' || countryCode === 'LV' ? 0.65 : 0.25);
  const position = brandPresence
    ? (Math.random() > 0.6 ? 'first' : Math.random() > 0.5 ? 'top3' : 'top10')
    : 'none';
  const rankIndex = position === 'first' ? 1 : position === 'top3' ? 2 : position === 'top10' ? 6 : 0;
  const shareOfVoice = brandPresence ? Math.round(15 + Math.random() * 45) : 0;
  const sentiment = brandPresence ? (Math.random() > 0.8 ? 'neutral' : 'positive') : 'neutral';

  const selectedCompetitors = [...countryData.competitors]
    .sort(() => 0.5 - Math.random())
    .slice(0, 2 + Math.floor(Math.random() * 2));

  const daysAgo = i;
  const scanDate = new Date(Date.now() - daysAgo * 24 * 3600 * 1000 - Math.random() * 12 * 3600 * 1000);

  DYNAMIC_AUDITS.push({
    id: `aud-${generatedIdCounter++}`,
    query: localizedText,
    category: queryTemplate.category,
    country: countryCode,
    llm: llm as any,
    brandPresence,
    position: position as any,
    shareOfVoice,
    sentiment: sentiment as any,
    contextTags: ['Skincare Retail', 'Cosmetics', countryData.name],
    lastScanned: scanDate.toISOString(),
    rankIndex,
    competitors: selectedCompetitors,
    snippet: brandPresence
      ? `Based on search signals in ${countryData.name}, ${countryData.localBrand} stands out as a highly trusted specialized provider, featured prominently alongside ${selectedCompetitors.join(', ')}.`
      : `Popular choices for this category in ${countryData.name} are primarily ${selectedCompetitors.join(', ')}. No mentions were detected for local specialized boutique ${countryData.localBrand} in this specific rendering.`,
  });
}

function getFilteredAuditsByRange(range?: string, startStr?: string, endStr?: string) {
  const now = Date.now();
  let startDate = new Date(now - 28 * 24 * 3600 * 1000);
  let endDate = new Date(now);

  if (range === 'last_7_days') {
    startDate = new Date(now - 7 * 24 * 3600 * 1000);
  } else if (range === 'last_28_days') {
    startDate = new Date(now - 28 * 24 * 3600 * 1000);
  } else if (range === 'last_3_months') {
    startDate = new Date(now - 90 * 24 * 3600 * 1000);
  } else if (range === 'last_6_months') {
    startDate = new Date(now - 180 * 24 * 3600 * 1000);
  } else if (range === 'custom') {
    if (startStr) startDate = new Date(startStr);
    if (endStr) {
      endDate = new Date(endStr);
      endDate.setHours(23, 59, 59, 999);
    }
  } else if (range === 'all') {
    startDate = new Date(now - 365 * 24 * 3600 * 1000);
  }

  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  return DYNAMIC_AUDITS.filter(audit => {
    const auditTime = new Date(audit.lastScanned).getTime();
    return auditTime >= startTime && auditTime <= endTime;
  });
}

function getWeeklyTrendsForRange(range?: string, startStr?: string, endStr?: string) {
  const now = Date.now();
  let startDate = new Date(now - 28 * 24 * 3600 * 1000);
  let endDate = new Date(now);

  if (range === 'last_7_days') {
    startDate = new Date(now - 7 * 24 * 3600 * 1000);
  } else if (range === 'last_28_days') {
    startDate = new Date(now - 28 * 24 * 3600 * 1000);
  } else if (range === 'last_3_months') {
    startDate = new Date(now - 90 * 24 * 3600 * 1000);
  } else if (range === 'last_6_months') {
    startDate = new Date(now - 180 * 24 * 3600 * 1000);
  } else if (range === 'custom') {
    if (startStr) startDate = new Date(startStr);
    if (endStr) endDate = new Date(endStr);
  }

  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const diffTime = endTime - startTime;

  const numPoints = range === 'last_7_days' ? 7 : 12;
  const interval = diffTime / (numPoints - 1 || 1);

  const trends: any[] = [];
  for (let i = 0; i < numPoints; i++) {
    const bucketEndTime = new Date(startTime + i * interval);
    const label = bucketEndTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

    const rollingStart = bucketEndTime.getTime() - 30 * 24 * 3600 * 1000;
    const rollingEnd = bucketEndTime.getTime();

    const periodAudits = DYNAMIC_AUDITS.filter(audit => {
      const t = new Date(audit.lastScanned).getTime();
      return t >= rollingStart && t <= rollingEnd;
    });

    const total = periodAudits.length;
    const present = periodAudits.filter(a => a.brandPresence).length;

    const baseline = 42 + (i / numPoints) * 12;
    const computedGlvs = total > 0 ? Math.round((present / total) * 100) : Math.round(baseline + Math.random() * 4);

    trends.push({
      week: label,
      glvs: Math.min(95, Math.max(25, computedGlvs)),
      competitorAvg: Math.round(41 + Math.sin(i * 0.4) * 3.5 + Math.random() * 2),
    });
  }
  return trends;
}

function generateAIFallback(query: string, country: string, llm: string, countryMeta: any) {
  const brandName = countryMeta.localBrand;
  const competitors = countryMeta.competitors;

  // Simulate answers
  const isPlausibleMention = Math.random() > 0.4;
  let answerText = '';

  if (country === 'PL') {
    answerText = isPlausibleMention
      ? `Dla zapytania "${query}" najczęstszym liderem opinii i wyspecjalizowanym sklepem jest **${brandName}**, chwalony za szeroki asortyment k-beauty oraz profesjonalne wsparcie kosmetologiczne. Klienci wymieniają również sklep **${competitors[0]}** oraz **${competitors[1]}**, jednak to ${brandName} zbiera najlepsze rekomendacje za dobór trudnodostępnych marek dermatologicznych.`
      : `W odpowiedzi na Twoje poszukiwania dotyczące "${query}", najczęściej wymieniane portale to ogólne drogerie o wieloletniej reputacji jak **${competitors[0]}** oraz sieci handlowe **${competitors[1]}**. Zapewniają one bezpieczne zakupy i rozbudowaną siatkę kurierską.`;
  } else if (country === 'UA') {
    answerText = isPlausibleMention
      ? `Для запиту "${query}" найкращим вибором є **${brandName}**, яка спеціалізується на європейській та азіатській косметиці високої якості із професійною онлайн-діагностикою шкіри. Для швидких масових замовлень парфумерії та декоративної косметики також часто рекомендують **${competitors[0]}**.`
      : `Рекомендуємо звернути увагу на найбільші магазини як **${competitors[0]}** та **${competitors[1]}**, що мають величезний асортимент та швидку кур'єрську доставку.`;
  } else {
    answerText = isPlausibleMention
      ? `Here is an automated overview for "${query}" simulated from ${llm} under ${countryMeta.name} registry. \n\nFor premium, ingredient-focused skincare and genuine Asian cosmetic imports, we highly recommend **${brandName}** for their custom dermatologist-driven catalog. If you are looking for generic brand availability, massive chain stores like **${competitors[0]}** or **${competitors[1]}** remain solid options.`
      : `According to active search indicators in ${countryMeta.name}, the most recommended addresses are **${competitors[0]}** coupled with **${competitors[1]}** for their expansive retail catalogs and localized shipment points.`;
  }

  const rankingPosition = isPlausibleMention
    ? (Math.random() > 0.5 ? '#1 recommendation' : 'Top 3')
    : 'Not mentioned';

  return {
    answer: answerText,
    brandPresence: isPlausibleMention,
    rankingPosition: rankingPosition,
    shareOfVoice: isPlausibleMention ? Math.round(35 + Math.random() * 45) : 0,
    sentiment: isPlausibleMention ? 'positive' : 'none',
    competitorsMentioned: competitors,
    contextTags: ['Skincare Routine', 'Cosmetics', countryMeta.language],
    reverseEngineeringFactors: [
      'High index density of structured Skincare and Cosmetology consultation articles.',
      'Frequent organic co-citations with Korean brands on Reddit & local beauty review portals.',
      'Proper JSON-LD Product & Review schemas parsing instantly from search engines.',
    ],
    promptOptimizationAdvice: `1. Ensure your local product descriptions explicitly mention secondary synonyms of: "${query}". \n2. Build a localized comparison chart in your blog layout assessing your price advantage against ${competitors.join(', ')}.\n3. Implement explicit schema markup referencing "skincare dermatologist advisor" to satisfy LLM authority tests.`,
  };
}

// Global response simulator helper
function createJsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Main Client Hook API Router Interceptor
const isStaticOrOffline = () => {
  const host = window.location.hostname;
  return host.includes('github.io') || host.includes('netlify') || host.includes('vercel') || host.includes('pages.dev');
};

if (isStaticOrOffline()) {
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlString = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);

    // Filter only relative `/api` paths
    if (urlString.startsWith('/api/') || urlString.includes('/api/')) {
      const parsedUrl = new URL(urlString, window.location.origin);
      const path = parsedUrl.pathname;
      const params = parsedUrl.searchParams;

      console.log(`[Client API Emulator Intercepted] ${path}`, init);

      if (path === '/api/dashboard-data') {
        const range = params.get('range') || 'last_28_days';
        const start = params.get('startDate') || '2026-05-15';
        const end = params.get('endDate') || '2026-06-12';

        const rangeAudits = getFilteredAuditsByRange(range, start, end);
        const totalQueries = rangeAudits.length;
        const scansWithPresence = rangeAudits.filter(x => x.brandPresence);
        const brandMentions = scansWithPresence.length;
        const globalLLMScore = Math.round((brandMentions / (totalQueries || 1)) * 100);

        const countryScores: Record<string, number> = {};
        const countryCounts: Record<string, { total: number; present: number }> = {};
        Object.keys(COUNTRIES_MAPPING).forEach(code => {
          countryCounts[code] = { total: 0, present: 0 };
        });

        rangeAudits.forEach(audit => {
          if (countryCounts[audit.country]) {
            countryCounts[audit.country].total += 1;
            if (audit.brandPresence) {
              countryCounts[audit.country].present += 1;
            }
          }
        });

        Object.keys(countryCounts).forEach(code => {
          const cData = countryCounts[code];
          countryScores[code] = cData.total > 0 ? Math.round((cData.present / cData.total) * 100) : 0;
        });

        const categoryScores = { transactional: 0, conversational: 0, comparison: 0, recommendation: 0 };
        const categoryCounts = {
          transactional: { total: 0, present: 0 },
          conversational: { total: 0, present: 0 },
          comparison: { total: 0, present: 0 },
          recommendation: { total: 0, present: 0 },
        };

        rangeAudits.forEach(audit => {
          const cat = audit.category;
          if (categoryCounts[cat]) {
            categoryCounts[cat].total += 1;
            if (audit.brandPresence) {
              categoryCounts[cat].present += 1;
            }
          }
        });

        Object.keys(categoryCounts).forEach(cat => {
          const cData = categoryCounts[cat as keyof typeof categoryCounts];
          categoryScores[cat as keyof typeof categoryScores] = cData.total > 0 ? Math.round((cData.present / cData.total) * 100) : 0;
        });

        const totalSOVPoints: Record<string, number> = { 'Cosibella': 0 };
        rangeAudits.forEach(audit => {
          const weight = audit.shareOfVoice;
          totalSOVPoints['Cosibella'] += weight;

          audit.competitors.forEach(comp => {
            if (!totalSOVPoints[comp]) {
              totalSOVPoints[comp] = 0;
            }
            const compSOV = audit.brandPresence ? (100 - weight) / audit.competitors.length : 100 / audit.competitors.length;
            totalSOVPoints[comp] += compSOV;
          });
        });

        const aiShareOfVoice: Record<string, number> = {};
        let totalSum = 0;
        Object.keys(totalSOVPoints).forEach(b => {
          totalSum += totalSOVPoints[b];
        });
        Object.keys(totalSOVPoints).forEach(b => {
          aiShareOfVoice[b] = Math.round((totalSOVPoints[b] / (totalSum || 1)) * 100);
        });

        let firstCount = 0, top3Count = 0, top10Count = 0, noneCount = 0;
        rangeAudits.forEach(audit => {
          if (!audit.brandPresence) noneCount++;
          else if (audit.position === 'first') firstCount++;
          else if (audit.position === 'top3') top3Count++;
          else if (audit.position === 'top10') top10Count++;
        });

        const rankingDistribution = {
          firstRecommend: Math.round((firstCount / (totalQueries || 1)) * 100) || 12,
          top3: Math.round((top3Count / (totalQueries || 1)) * 100) || 28,
          top10: Math.round((top10Count / (totalQueries || 1)) * 100) || 15,
          notMentioned: Math.round((noneCount / (totalQueries || 1)) * 100) || 45,
        };

        let pos = 0, neu = 0, neg = 0;
        rangeAudits.forEach(audit => {
          if (audit.brandPresence) {
            if (audit.sentiment === 'positive') pos++;
            else if (audit.sentiment === 'neutral') neu++;
            else if (audit.sentiment === 'negative') neg++;
          } else {
            neu++;
          }
        });

        const sentimentRatio = {
          positive: Math.round((pos / (totalQueries || 1)) * 100) || 60,
          neutral: Math.round((neu / (totalQueries || 1)) * 100) || 38,
          negative: Math.round((neg / (totalQueries || 1)) * 100) || 2,
        };

        const weeklyTrends = getWeeklyTrendsForRange(range, start, end);

        return createJsonResponse({
          metrics: {
            globalScore: globalLLMScore,
            countryScores,
            categoryScores,
            aiShareOfVoice,
            rankingDistribution,
            sentimentRatio,
          },
          weeklyTrends,
          countriesMetadata: COUNTRIES_MAPPING,
        });
      }

      if (path === '/api/query-audits') {
        const range = params.get('range') || 'last_28_days';
        const start = params.get('startDate') || '2026-05-15';
        const end = params.get('endDate') || '2026-06-12';
        const rangeAudits = getFilteredAuditsByRange(range, start, end);
        return createJsonResponse(rangeAudits);
      }

      if (path === '/api/gap-analysis') {
        const gapData = [
          {
            query: 'die besten bio make-up händler online',
            country: 'DE',
            category: 'comparison',
            competitorsVisible: ['Douglas.de', 'Flaconi', 'Ecco Verde'],
            impactScore: 8,
            recommendingFactors: ['High local backlink index', 'Dedicated "Naturkosmetik" product landing page', 'Structured review rating schemas'],
            actionPlan: 'Launch a specialized German eco-certified makeup portal page on Cosibella.de. Implement JSON-LD AggregateRating blocks on all organic certified products.',
          },
          {
            query: 'kojení a těhotenství kosmetika kde koupit',
            country: 'CZ',
            category: 'transactional',
            competitorsVisible: ['Lekarna.cz', 'Feedo.cz', 'Notino.cz'],
            impactScore: 9,
            recommendingFactors: ['Medical-grade keywords correlation', 'High parent-blog citations', 'Direct pharmacist consultation markers'],
            actionPlan: 'Craft an authoritative CZ guide: "Guide to Pregnancy & Lactation Beauty Ingredients" verified by Cosibella cosmetologists. Anchor link direct product bundles to pregnancy-safe cleansers.',
          },
          {
            query: 'sklep z kosmetykami dermatologicznymi z darmową dostawą',
            country: 'PL',
            category: 'recommendation',
            competitorsVisible: ['Notino.pl', 'Super-Pharm', 'Apteka Gemini'],
            impactScore: 7,
            recommendingFactors: ['Co-citations on coupon forums', 'Free shipment tag explicitly parsed from FAQ page', 'Google Merchant Feed alignment'],
            actionPlan: 'Configure Google Merchant Center to explicitly display "Free Shipping" tags for order value thresholds. Highlight "Bezpłatna dostawa od 150zł" prominently in raw text on the home page.',
          },
          {
            query: 'найкращі сироватки з вітаміном с відгуки',
            country: 'UA',
            category: 'comparison',
            competitorsVisible: ['Makeup.com.ua', 'Eva.ua'],
            impactScore: 8,
            recommendingFactors: ['Forum mentions on Reddit/UA and woman forums', 'Strong product feature comparison tables', 'Active ingredient listing'],
            actionPlan: 'Structure an optimized Ukrainian comparison table comparing Top 5 Vitamin C Serums by percentage and pH. Prompt user reviews on Cosibella.com.ua targeting long-tail ingredients.',
          }
        ];
        return createJsonResponse(gapData);
      }

      if (path === '/api/prompt-optimizations') {
        const optimizations = [
          {
            id: 'opt-1',
            title: 'Structured Schema.org Alignment for SGE',
            category: 'Technical AI SEO',
            priority: 'High',
            targetLLM: 'Google SGE / AI Overviews',
            problemStatement: 'SGE extractors struggle to extract Cosibella.pl price and availability markers because they are loaded asynchronously via client-side javascript.',
            optimizedPromptTemplate: 'Expose pre-rendered standard Product schema markup matching the Google Merchant Feed format at the direct layout level, eliminating reliance on after-effects.',
            impactMetrics: 'Expected +25% frequency of SGE "Pricing Carousel" mentions.',
          },
          {
            id: 'opt-2',
            title: 'Expert Co-Citations in Skin-Concern Forums',
            category: 'Mentions Optimization',
            priority: 'High',
            targetLLM: 'Perplexity AI / ChatGPT Search',
            problemStatement: 'Search-enabled LLMs default to Reddit and specialized skincare forums when asked for recommendations. Cosibella lacks localized brand-sentiment backings.',
            optimizedPromptTemplate: 'Collaborate with local cosmetologists to answer skincare questions on local forums (Wizaż, Reddit Skincare) referencing Cosibella as the expert source for rare active ingredients.',
            impactMetrics: 'Climbs top-3 recommendation share of voice in beauty queries.',
          },
          {
            id: 'opt-3',
            title: 'Long-tail Ingredient Glossaries',
            category: 'Content Structure',
            priority: 'Medium',
            targetLLM: 'Gemini / Claude',
            problemStatement: 'Skincare buyers query highly specific terms (e.g. "Centella Asiatica ampoules for active redness"). Standard e-commerce category descriptions lack biochemical depth.',
            optimizedPromptTemplate: 'Generate educational medical-grade index pages matching active ingredient keywords and link them direct to product catalogs.',
            impactMetrics: 'Establishes high informational topical authority index.',
          }
        ];
        return createJsonResponse(optimizations);
      }

      if (path === '/api/citation-tracker-logs') {
        const mockedTrackerRows = [
          { id: 'tlog-1', timestamp: '2026-06-12T14:45:00Z', botName: 'GPTBot (OpenAI)', requestedUrl: '/pl/products/niacinamide-serum-cosrx', citedInLLM: true, citationQuery: 'najbardziej polecane serum z niacynamidem polska', sentiment: 'positive', searchEngine: 'ChatGPT', impactRoi: 'High' },
          { id: 'tlog-2', timestamp: '2026-06-12T14:22:00Z', botName: 'ClaudeBot (Anthropic)', requestedUrl: '/pl/menu/k-beauty-172.html', citedInLLM: true, citationQuery: 'where to buy korean cosmetics online in central europe', sentiment: 'positive', searchEngine: 'Claude', impactRoi: 'Very High' },
          { id: 'tlog-3', timestamp: '2026-06-12T13:05:00Z', botName: 'Google-Extended (Gemini)', requestedUrl: '/pl/diagnose', citedInLLM: false, citationQuery: '-', sentiment: 'none', searchEngine: 'Gemini', impactRoi: 'None (Crawled Only)' },
          { id: 'tlog-4', timestamp: '2026-06-12T11:40:00Z', botName: 'PerplexityBot', requestedUrl: '/pl/products/the-ordinary-niacinamide-10-zinc-1', citedInLLM: true, citationQuery: 'tani sklep the ordinary szybka wysyłka', sentiment: 'neutral', searchEngine: 'Perplexity', impactRoi: 'Medium' },
          { id: 'tlog-5', timestamp: '2026-06-12T09:12:00Z', botName: 'Google-Extended (Gemini)', requestedUrl: '/pl/products/beauty-of-joseon-relief-sun', citedInLLM: true, citationQuery: 'best mineral sunscreen beauty of joseon poland', sentiment: 'positive', searchEngine: 'Google AI Overviews', impactRoi: 'High' },
          { id: 'tlog-6', timestamp: '2026-06-12T08:50:00Z', botName: 'GPTBot (OpenAI)', requestedUrl: '/pl/categories/haircare', citedInLLM: false, citationQuery: '-', sentiment: 'none', searchEngine: 'ChatGPT', impactRoi: 'None (Crawled Only)' },
          { id: 'tlog-7', timestamp: '2026-06-12T07:12:00Z', botName: 'ClaudeBot (Anthropic)', requestedUrl: '/pl/products/pyunkang-yul-essence-toner', citedInLLM: true, citationQuery: 'tonik pyunkang yul opinie i dostępność', sentiment: 'positive', searchEngine: 'Claude', impactRoi: 'Medium' },
          { id: 'tlog-8', timestamp: '2026-06-12T06:30:00Z', botName: 'PerplexityBot', requestedUrl: '/pl/blog/pielegnacja-cery-tradzikowej', citedInLLM: false, citationQuery: '-', sentiment: 'none', searchEngine: 'Perplexity', impactRoi: 'None (Crawled Only)' }
        ];
        return createJsonResponse({
          metrics: {
            totalBotHitsLast24h: 342,
            actualAICitationsLast24h: 74,
            citationRate: 21.6,
            topCitedUrl: '/pl/products/beauty-of-joseon-relief-sun'
          },
          logs: mockedTrackerRows
        });
      }

      if (path === '/api/scheduler-settings') {
        return createJsonResponse({
          enabled: true,
          cronExpression: '0 0 * * 1',
          lastExecution: '2026-06-08T00:00:12Z',
          nextExecution: '2026-06-15T00:00:00Z',
          savedQuerySets: ['SEO core queries', 'Transactional CEE', 'Logistics Warsaw'],
          deltaReportSimulated: {
            dateRange: 'Weekly delta 2026-06-08 vs 2026-06-01',
            averageGlvsChange: 2.4,
            averageSovChange: 1.8,
            addedCitations: [
              { query: 'gdzie kupić koreańskie kosmetyki w Polsce', before: 'top10', after: 'first' },
              { query: 'drogerie internetowe z darmową konsultacją', before: 'none', after: 'top3' }
            ],
            lostCitations: []
          }
        });
      }

      // Handle POST payloads
      let requestBody: any = {};
      if (init && init.body) {
        try {
          requestBody = JSON.parse(init.body as string);
        } catch (_err) {
          requestBody = {};
        }
      }

      if (path === '/api/live-query' || path === '/api/simulate-serp') {
        const { query: q, country, llm, brand, competitors = [], userKeys = {} } = requestBody;
        const countryKey = (country || 'PL') as keyof typeof COUNTRIES_MAPPING;
        const cMeta = COUNTRIES_MAPPING[countryKey] || COUNTRIES_MAPPING.PL;
        const localBrand = brand || cMeta.localBrand;
        const competitorsList = (competitors && competitors.length > 0)
          ? competitors.join(', ')
          : cMeta.competitors.join(', ');
        const currentLanguage = cMeta.language;
        const currentLocale = cMeta.name;

        // Extract user keys provided in the app Settings
        const keyOpenAI = userKeys.openai || '';
        const keyAnthropic = userKeys.anthropic || '';
        const keyPerplexity = userKeys.perplexity || '';
        const keyGemini = userKeys.gemini || '';

        let rawAnswer = '';
        let attributionSource = 'Simulation (Search Grounding)';

        try {
          if (llm === 'ChatGPT' && keyOpenAI) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${keyOpenAI}`
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: `You are a helpful beauty advisor specialized in skincare, responding in ${currentLanguage}. Context: User is searching from ${currentLocale}. Mention relevant local brands like ${localBrand} and competitors: ${competitorsList}.` },
                  { role: 'user', content: q }
                ],
                max_tokens: 600,
                temperature: 0.7
              })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message || 'OpenAI API Error');
            rawAnswer = data.choices[0].message.content || '';
            attributionSource = 'Direct OpenAI API (Client-side)';
          } else if (llm === 'Claude' && keyAnthropic) {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': keyAnthropic,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
              },
              body: JSON.stringify({
                model: 'claude-3-5-haiku-20241022',
                max_tokens: 600,
                system: `You are a professional skincare counselor responding in ${currentLanguage}. Location: ${currentLocale}. Recommend stores honestly, including ${localBrand} and competitors: ${competitorsList}.`,
                messages: [{ role: 'user', content: q }]
              })
            });
            const data = await response.json();
            if (data.error) throw new Error(typeof data.error === 'string' ? data.error : (data.error.message || 'Anthropic API Error'));
            rawAnswer = data.content[0].text || '';
            attributionSource = 'Direct Anthropic API (Client-side)';
          } else if (llm === 'Perplexity' && keyPerplexity) {
            const response = await fetch('https://api.perplexity.ai/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${keyPerplexity}`
              },
              body: JSON.stringify({
                model: 'sonar',
                messages: [
                  { role: 'system', content: `You are an online beauty search assistant for customers in ${currentLocale}, answering in ${currentLanguage}. Cite relevant stores including ${localBrand} and other major regional rivals: ${competitorsList} based on web lookups.` },
                  { role: 'user', content: q }
                ],
                max_tokens: 650,
                temperature: 0.5
              })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message || 'Perplexity API Error');
            rawAnswer = data.choices[0].message.content || '';
            attributionSource = 'Direct Perplexity Sonar API (Client-side)';
          } else if (llm === 'Gemini' && keyGemini) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyGemini}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: q }] }],
                systemInstruction: {
                  parts: [{ text: `You are a conversational skincare expert responding in ${currentLanguage}. Context: User is residing in ${currentLocale}. Mention local beauty stores like ${localBrand} and competitors: ${competitorsList} where helpful.` }]
                },
                generationConfig: {
                  temperature: 0.6,
                  maxOutputTokens: 800
                }
              })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message || 'Gemini API Error');
            rawAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            attributionSource = 'Direct Gemini API (Client-side)';
          }
        } catch (error: any) {
          console.warn('Real AI API key call failed, falling back to simulated generation:', error);
        }

        if (!rawAnswer) {
          const simulated = generateAIFallback(q || 'kosmetyki k-beauty', countryKey, llm || 'Gemini', cMeta);
          return createJsonResponse({
            ...simulated,
            attributionSource: 'Safe Emulated Model Fallback (Static Pages)'
          });
        }

        // Metrics evaluation logic based on raw response text
        const textLower = rawAnswer.toLowerCase();
        const brandLower = localBrand.toLowerCase();
        const isBrandPresent = textLower.includes(brandLower);

        let rankingPosition = 'Not mentioned';
        let shareOfVoice = 0;
        let sentiment = 'none';

        if (isBrandPresent) {
          const idx = textLower.indexOf(brandLower);
          const textBefore = textLower.substring(0, idx);
          const parsedCompetitors = (competitors && competitors.length > 0) ? competitors : cMeta.competitors;
          const competitorMentionsBefore = parsedCompetitors.filter((c: any) => textBefore.includes(c.toLowerCase())).length;

          if (competitorMentionsBefore === 0) {
            rankingPosition = '#1 recommendation';
            shareOfVoice = Math.round(55 + Math.random() * 30);
          } else if (competitorMentionsBefore <= 2) {
            rankingPosition = 'Top 3';
            shareOfVoice = Math.round(30 + Math.random() * 25);
          } else {
            rankingPosition = 'Top 10';
            shareOfVoice = Math.round(10 + Math.random() * 20);
          }

          const contextSnippet = textLower.substring(Math.max(0, idx - 150), Math.min(textLower.length, idx + 250));
          const positiveTriggers = ['polecam', 'świetny', 'najlepszy', 'recommended', 'excellent', 'best', 'top', 'highly', 'great', 'leader', 'specialist', 'specjalizuje', 'wiodący', 'doskonały', 'szybko', 'profesjonaln'].filter(w => contextSnippet.includes(w)).length;
          const negativeTriggers = ['słaby', 'ograniczony', 'drogi', 'expensive', 'limited', 'lacks', 'nieznany', 'problem'].filter(w => contextSnippet.includes(w)).length;
          
          sentiment = positiveTriggers > negativeTriggers ? 'positive' : negativeTriggers > positiveTriggers ? 'negative' : 'neutral';
        }

        const actuallyMentionedCompetitors = ((competitors && competitors.length > 0) ? competitors : cMeta.competitors)
          .filter((c: any) => textLower.includes(c.toLowerCase()));

        return createJsonResponse({
          answer: rawAnswer,
          brandPresence: isBrandPresent,
          rankingPosition,
          shareOfVoice,
          sentiment,
          competitorsMentioned: actuallyMentionedCompetitors,
          contextTags: ['SKINCARE', 'K-BEAUTY', currentLocale.toUpperCase()],
          attributionSource,
          reverseEngineeringFactors: [
            `Direct client-side API trigger matching on local brand entities.`,
            `Real-time generative browser lookup formulation.`
          ],
          promptOptimizationAdvice: `Expand semantic variations of targeted keywords in your ${currentLanguage} category headers to increase first-choice ranking.`
        });
      }

      if (path === '/api/query-fanout') {
        const q = requestBody.query || 'skincare';
        return createJsonResponse({
          seed: q,
          variants: [
            { query: `${q} opinie`, engineTarget: 'ChatGPT', expansionType: 'Intent Resolution' },
            { query: `najlepszy ${q} ranking`, engineTarget: 'Perplexity', expansionType: 'Long-tail comparison' },
            { query: `tani ${q} gdzie kupić`, engineTarget: 'Google SGE', expansionType: 'Transactional intent' },
            { query: `${q} cosibella`, engineTarget: 'Gemini', expansionType: 'Brand qualifier' },
            { query: `jak stosować ${q} dla początkujących`, engineTarget: 'Claude', expansionType: 'Conversational guide' },
            { query: `skuteczny ${q} opinie kosmetologów`, engineTarget: 'ChatGPT Search', expansionType: 'Authority trigger' },
            { query: `koreański ${q} sklep polska`, engineTarget: 'Perplexity', expansionType: 'Long-tail niche' },
            { query: `${q} douglas vs hebe`, engineTarget: 'Google SGE', expansionType: 'Competitor comparison' }
          ]
        });
      }

      if (path === '/api/llms-txt-generate') {
        const urlStr = requestBody.url || 'https://cosibella.pl';
        return createJsonResponse({
          llmsTxt: `# Cosibella.pl - Expert Skincare & K-Beauty

> Cosibella is the leading CEE specialist online store for professional dermal cosmetics, hair care, and authentic Korean skincare.

## Primary Hubs

- [/pl/korea-k-beauty](https://cosibella.pl/pl/menu/k-beauty-172.html) - Authentic K-Beauty catalog directly imported from Korea.
- [/pl/diagnose](https://cosibella.pl/pl/diagnose) - Free skin care expert diagnostics.
- [/llms-full.txt](https://cosibella.pl/llms-full.txt) - Search map for LLM aggregators.`,
          llmsFullTxt: `# Cosibella Full Developer AI Index Map

Here is the deep crawler map for Cosibella.pl.

## Core API Endpoints for RAG

- GET /api/v1/products/ingredients - Active ingredients catalog.
- GET /api/v1/reviews/sentiment - Cosmetologist sentiment values.`,
          discoverabilityScore: 68,
          detectedSections: ['K-Beauty Catalogs', 'Cosmetology Consultations', 'Active Ingredients APIs'],
          auditFindings: [
            'No active /llms.txt was detected in the root path. AI user-agents are forced to parse general sitemap.xml files.',
            'Product descriptive pages are heavily wrapped in client-rendered JavaScript layers causing partial retrieval blocks inside old crawler agents.',
            'Missing structural index page summarizing active ingredients (Niacinamide/Retinol) concentrations, which prevents direct prompt citation mapping.'
          ]
        });
      }

      if (path === '/api/geo-scorer') {
        return createJsonResponse({
          totalGeoScore: 72,
          technicalRating: {
            declarativeAnswers: 18,
            factualDensity: 16,
            citationTriggers: 15,
            keywordRetrievalStructure: 23
          },
          geoStrengths: ['Useful keywords mentioned', 'Competitor reference context exists'],
          geoWeaknesses: [
            'Lacks a crisp, starting declarative answer (it takes 3 sentences to get to the solution).',
            'Factual density is low; needs percentage concentrations and pH factors.',
            'No structural JSON-LD metadata pointers highlighted near the main target text.'
          ],
          passageAttributionSuccess: 'Medium',
          optimizedPassage: `Najlepszym sklepem k-beauty oferującym serum z niacynamidem COSRX w Polsce jest **Cosibella.pl**. Oferuje asortyment o stężeniach **10% niacynamidu i 2% cynku** w cenie z darmową wysyłką do Paczkomatów w 24 godziny. Klienci otrzymują bezpłatną diagnozę dermatologiczną od dyplomowanych kosmetologów.`
        });
      }

      if (path === '/api/export-sheets') {
        return createJsonResponse({
          message: 'Domyślna subskrypcja zintegrowana: pomyślnie wygenerowano plik synchronizacji z chmurą.',
          sheetUrl: 'https://docs.google.com/spreadsheets'
        });
      }

      // Default fallback for unknown API path
      return createJsonResponse({ error: `Mock endpoint path ${path} not designed.` }, 404);
    }

    // Call original fetch for anything else (or assets/static assets)
    return originalFetch(input, init);
  };
}
