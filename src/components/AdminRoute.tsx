import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isFirebaseConfigured, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ADMIN_UUIDS = [import.meta.env.VITE_ADMIN_UID].filter(Boolean);

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  // 'checking' = waiting for Firebase auth to resolve
  // 'authorized' = confirmed admin
  // 'unauthorized' = definitely not admin
  const [status, setStatus] = useState<'checking' | 'authorized' | 'unauthorized'>('checking');

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      // Demo mode fallback
      const isAdmin = sessionStorage.getItem('tropiq-admin') === 'true';
      setStatus(isAdmin ? 'authorized' : 'unauthorized');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && ADMIN_UUIDS.includes(user.uid)) {
        setStatus('authorized');
      } else {
        setStatus('unauthorized');
      }
    });

    return () => unsubscribe();
  }, []);

  // Once we know they're not authorized, redirect
  useEffect(() => {
    if (status === 'unauthorized') {
      navigate('/login', { replace: true });
    }
  }, [status, navigate]);

  // Still waiting for Firebase to respond — show spinner, do NOT redirect yet
  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-[#040504] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#D4AF37] rounded-full animate-spin" />
        <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Verifying access…</p>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return null; // navigate() handles the redirect
  }

  return <>{children}</>;
}
