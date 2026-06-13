# LLMpulse — Generative Engine Optimization (GEO/AEO) Platform for Cosibella

**LLMpulse** to zaawansowany system full-stack do monitorowania, analizy, audytu oraz optymalizacji widoczności marki **Cosibella** w konwersacyjnych silnikach wyszukiwania i modelach językowych (LLM) takich jak **ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google) oraz Perplexity API**.

Aplikacja wspiera pozycjonowanie nowej generacji — **GEO (Generative Engine Optimization)** oraz **AEO (Answer Engine Optimization)**. Pomaga zabezpieczyć pozycję lidera e-commerce Cosibella w erze, w której użytkownicy zamiast tradycyjnego Google używają chatbotów AI do rekomendacji produktowych i porad pielęgnacyjnych.

---

## Główne Kierunki Strategiczne i Moduły

### **Kierunek A: Panel Funkcjonalny (Najwyższy priorytet dla SEO/AEO)**

1. **Dashboard globalnej widoczności (GLVS):**
   - Agregacja wskaźników **Share of Voice (SOV)** marki Cosibella vs. konkurenci (np. Douglas, Sephora, Hebe) w czasie rzeczywistym.
   - Interaktywna mapa rynków europejskich (Polska, Czechy, Słowacja, Ukraina, Węgry, Rumunia itp.) pokazująca siłę brandu w lokalnych rekomendacjach AI.

2. **AEO Sandbox (Emulator Serper & LLM Grounding):**
   - Pozwala emulować i wysyłać zapytania bezpośrednio do modeli AI.
   - Analizuje czy Cosibella pojawia się w odpowiedzi jako źródło (citation track) i w jakim kontekście (np. "najlepsze kremy z ceramidami").

3. **Optymalizator Promptów i Rekomendacji Treści:**
   - Analizuje strukturę obecnych podstron sklepu i generuje konkretne rekomendacje zmian (np. dodanie tabeli porównawczej, zmiana tonu, nasycenie słowami kluczowymi preferowanymi przez ChatGPT/Claude).

4. **Korelator Szpiega Botów (Server Log Analyzer):**
   - Przegląd aktywności botów crawlerskich (takich jak `GPTBot`, `ClaudeBot`, `Google-Extended`, `PerplexityBot`).
   - Pozwala sprawdzić, jak często sieci neuronowe skanują asortyment Cosibella.

5. **Generator Query Fanout:**
   - Automatycznie generuje dziesiątki pytań pobocznych ze słowa bazowego (seed), symulując prawdziwe intencje zakupowe klientów e-commerce.

6. **Konsola Ustawień i Integracji (NEW):**
   - **Klucze API:** Szybka, bezpieczna konfiguracja własnych kluczy do **OpenAI, Anthropic, Google Gemini** oraz **Perplexity AI** (zapis lokalny w przeglądarce).
   - **Wgrywanie Logów:** Moduł drag-and-drop do analizy plików `access.log` z serwerów Nginx, Apache lub Cloudflare.
   - **Cloudflare Zone API:** Bezpośrednia integracja z CDN Cloudflare (Zone ID, API Token) dla automatycznego pobierania logów i synchronizacji co 5, 15, 30 lub 60 minut.

---

### **Kierunek B: GEO Tools (Unikalna Wartość na Rynku)**

1. **GEO Content Scorer (Optymalizator Tekstu):**
   - Działa jak Yoast SEO / Surfer SEO, ale dla modeli językowych.
   - Po wklejeniu opisu produktu lub artykułu blogowego, algorytm sprawdza kryteria GEO: *Citations Ratio*, *Information Density*, *Technical Jargon Integration*, *Brand Mentions Flow* oraz *Readability*.
   - Nadaje punktację i generuje warianty tekstu ze zwiększoną szansą na cytowanie przez AI.

2. **Dynamiczny Generator `/llms.txt` dla Rynków Cosibella:**
   - Nowy standard internetowy wspierający komunikację z modelami AI (`/llms.txt`).
   - Generuje skrojony na miarę, wielojęzyczny plik dynamiczny osobno dla każdego rynku (Cosibella.pl, Cosibella.com.ua, Cosibella.cz, Cosibella.sk itp.).
   - Przekazuje botom instrukcje, jak indeksować bestsellery, gdzie szukać rzetelnych składów INCI oraz jak interpretować porady kosmetologów.

---

##  Architektura Technologiczna

Aplikacja została zaprojektowana w nowoczesnym stosie technologicznym **full-stack**:

* **Frontend:** React 19, TypeScript, **Tailwind CSS v4** (nowoczesny silnik stylizowania), **Lucide React** (zestaw minimalistycznych ikon) oraz **Motion** (płynne, kinetyczne animacje interfejsu).
* **Backend:** Node.js (TypeScript uruchamiany przez `tsx` w środowisku deweloperskim) + **Express 4**.
* **Bundler & Serwer deweloperski:** **Vite** podpinany jako middleware Express w trybie SPA dla błyskawicznego odświeżania.
* **Proces kompilacji produkcyjnej:** Backend jest bundlowany przez **Esbuild** do pojedynczego, super-optymalnego pliku CommonJS (`dist/server.cjs`), co eliminuje problemy ze ścieżkami relatywnymi w kontenerach produkcyjnych (np. Google Cloud Run).

---

##  Struktura Projektu

```text
├── server.ts                 # Główny plik serwera Express (Vite Middleware w dev)
├── vite.config.ts            # Konfiguracja środowiska uruchomieniowego Vite
├── package.json              # Skrypty startowe, kompilacji oraz zależności npm
├── tsconfig.json             # Konfiguracja transpilera TypeScript
├── src/
│   ├── App.tsx               # Serce aplikacji React, nawigacja tabs i layout
│   ├── main.tsx              # Plik wejściowy klienta React
│   ├── index.css             # Import Tailwind CSS v4 oraz definicje typograficzne
│   ├── translations.ts       # Mechanizm lokalizacji i tłumaczeń (PL & EN)
│   └── components/           # Lekkie, modułowe komponenty interfejsu
│       ├── SettingsTab.tsx   # Panel do wprowadzania kluczy API i logów Nginx/Cloudflare
│       ├── GEOToolSuite.tsx  # GEO Content Scorer i dynamiczne /llms.txt
│       ├── LogAnalyzer.tsx   # Narzędzie analizy ruchu botów crawlerskich
│       ├── AISerperEmulator.tsx # Piaskownica zapytań deweloperskich i emulator
│       └── ...               # Wykresy SOV (Recharts) i interaktywna mapa Europy
```

---

## Instrukcja Instalacji i Uruchomienia (Lokalnie lub na Serwerze)

### Wymagania wstępne:
* Zainstalowane środowisko **Node.js** (rekomendowana wersja `v18` lub nowsza).
* Menedżer pakietów **npm** (dostarczany automatycznie z Node).

### 1. Pobranie i instalacja pakietów
Sklonuj swoje repozytorium z systemu GitHub i zainstaluj potrzebne biblioteki:

```bash
# 1. Wejdź do katalogu projektu
cd llmpulse

# 2. Zainstaluj zależności zdefiniowane w package.json
npm install
```

### 2. Konfiguracja zmiennych środowiskowych
Skopiuj szablon zmiennych i uzupełnij go (np. o klucz Gemini):

```bash
cp .env.example .env
```

Następnie otwórz utworzony plik `.env` i wpisz klucz, np.:
```env
GEMINI_API_KEY=AIzaSyYourSecretKeyHere
```

### 3. Uruchomienie trybu deweloperskiego (Dev Mode)
Poniższa komenda uruchomi zintegrowany serwer Express i deweloperski kompilator Vite:

```bash
npm run dev
```
Serwer domyślnie nasłuchuje na porcie **3000**. Otwórz przeglądarkę i przejdź pod adres:
`http://localhost:3000`

### 4. Kompilacja do produkcji (Production Build)
Gdy aplikacja jest gotowa do wdrożenia (np. na serwerze dedykowanym VPS, Heroku czy Google Cloud Run), przygotuj wersję zoptymalizowaną:

```bash
npm run build
```
Komenda ta wygeneruje:
1. Skompilowane, zminimalizowane pliki statyczne dla przeglądarki (HTML, JS, CSS) w katalogu `dist/`.
2. Szybki, skompresowany plik serwera zapakowany przez esbuild w `dist/server.cjs`.

### 5. Uruchomienie wersji produkcyjnej
Po zbudowaniu projektu, możesz go odpalić tak, jak działa w środowisku chmurowym:

```bash
npm run start
```
---

## 📄 Licencja

**MIT License** dla repozytorium GitHub,
