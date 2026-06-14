import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  isCosibellaWorker: boolean;
  authInitialized: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCosibellaWorker, setIsCosibellaWorker] = useState<boolean>(false);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setAuthError(null);
      if (usr) {
        // Enforce @cosibella.pl email constraint
        const email = usr.email || '';
        const hasAccess = email.toLowerCase().endsWith('@cosibella.pl');

        if (hasAccess) {
          setCurrentUser(usr);
          setIsCosibellaWorker(true);
        } else {
          // Force sign out instantly to remain secure in firebase rules
          signOut(auth);
          setCurrentUser(null);
          setIsCosibellaWorker(false);
          setAuthError(
            `Konto ${email} nie ma dostępu. Zaloguj się za pomocą konta służbowego @cosibella.pl.`
          );
        }
      } else {
        setCurrentUser(null);
        setIsCosibellaWorker(false);
      }
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      // Ensure we prompt for account selection so users can choose their @cosibella.pl profile
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
        hd: 'cosibella.pl' // hint to prioritize the cosibella.pl Google workspace domain
      });
      
      const res = await signInWithPopup(auth, provider);
      const email = res.user.email || '';
      
      if (!email.toLowerCase().endsWith('@cosibella.pl')) {
        await signOut(auth);
        throw new Error(`Dostęp wzbroniony: Twój adres e-mail (${email}) nie należy do domeny @cosibella.pl.`);
      }
    } catch (err: any) {
      console.error('Błąd logowania:', err);
      setAuthError(err.message || 'Wystąpił błąd podczas logowania przez Google.');
      setCurrentUser(null);
      setIsCosibellaWorker(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsCosibellaWorker(false);
      setAuthError(null);
    } catch (err) {
      console.error('Błąd wylogowania:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isCosibellaWorker,
        authInitialized,
        signInWithGoogle,
        logout,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
