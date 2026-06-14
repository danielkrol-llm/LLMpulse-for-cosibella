# Instrukcja aktualizacji src/App.tsx (Google Auth @cosibella.pl)

Ten plik opisuje zmiany, które zostały wprowadzone / należy wprowadzić w pliku `src/App.tsx`, aby aktywować pełną bramkę logowania z restrykcją domeny `@cosibella.pl`.

---

## Krok 1: Importy na górze pliku
W pliku `src/App.tsx` dodaj import `AuthProvider` i `useAuth` z nowo stworzonych modułów oraz `LoginPage`:

```tsx
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
```

## Krok 2: Główny komponent `App` jako Provider
Zastąp dotychczasowy domyślny export na dole pliku wrapperem, który udostępnia kontekst uwierzytelniania:

```tsx
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

## Krok 3: Przeniesienie logiki do `AppContent`
Zmień nazwę dotychczasowej funkcji `export default function App()` na `function AppContent()`.

## Krok 4: Użycie stanu z `useAuth` zamiast lokalnego useState
Usuń lokalny stan `currentUser` i `authInitialized` z `AppContent`, a zamiast tego pobierz je z kontekstu:

```tsx
// USUŃ te linie:
// const [currentUser, setCurrentUser] = useState<User | null>(null);
// const [authInitialized, setAuthInitialized] = useState(false);

// DODAJ tę linię:
const { currentUser, authInitialized, logout } = useAuth();
```

Podmień przycisk wylogowania, by używał funkcji `logout` pochodzącej z kontekstu w celu zachowania spójności.

## Krok 5: Blokada renderowania Dashboardu
Zabezpiecz główny render wewnątrz `AppContent`. Jeśli sesja nie jest zainicjalizowana, pokaż ekrany ładowarki. Jeśli użytkownik nie jest zalogowany (lub nie należy do autoryzowanej domeny), wyrenderuj `<LoginPage />`:

```tsx
if (!authInitialized) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-mono text-cyan-400 gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
      <p className="text-xs">Uruchamianie systemów zabezpieczeń Cosibella...</p>
    </div>
  );
}

if (!currentUser) {
  return <LoginPage />;
}

// ... Dalszy kod renderujący dashboard Cosibella ...
```

---

## Krok 6: Zabezpieczenie Firestore (Reguły Firestore)
Zastąp zawartość pliku `firestore.rules` rygorystycznymi regułami bezpieczeństwa, które autoryzują wyłącznie zapytania pochodzące od zalogowanych użytkowników z domeną `@cosibella.pl`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /{document=**} {
      allow read, write: if false; // domyślna odmowa dostępu
    }

    function isSignedIn() {
      return request.auth != null;
    }

    function isCosibellaEmail() {
      return isSignedIn() && request.auth.token.email.toLowerCase().endsWith('@cosibella.pl');
    }

    // Reguły dla ustawień współdzielonych Google OAuth
    match /settings/{settingsId} {
      allow read: if true; // publiczne czytanie przed zalogowaniem do pobrania Client ID
      allow write: if isCosibellaEmail();
    }

    // Pozostałe kolekcje (auditQueries, marki, logi crawlera, optymalizacje GEO)
    match /auditQueries/{queryId} {
      allow read, write: if isCosibellaEmail();
    }

    match /brands/{brandId} {
      allow read, write: if isCosibellaEmail();
    }

    match /crawlerLogs/{logId} {
      allow read, write: if isCosibellaEmail();
    }

    match /geoContentScans/{scanId} {
      allow read, write: if isCosibellaEmail();
    }
  }
}
```
