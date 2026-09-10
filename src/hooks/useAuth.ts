import { useState, useEffect } from 'react';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ADMIN_UUIDS = [import.meta.env.VITE_ADMIN_UID].filter(Boolean);

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user && ADMIN_UUIDS.includes(user.uid));
    });
    return () => unsub();
  }, []);

  return isAdmin;
}

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      const demo = sessionStorage.getItem('tropiq-user');
      if (demo) setUser({ email: demo });
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return user;
}
