import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isFirebaseConfigured, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ADMIN_UUIDS = [
  'veY9xdNhpKWtCVAxFHpRCEvIVcb2',
];

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let unsubscribeAuth = () => {};

    if (isFirebaseConfigured() && auth) {
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (user && ADMIN_UUIDS.includes(user.uid)) {
          setIsAuthorized(true);
        } else {
          navigate('/admin/login', { replace: true });
        }
      });
    } else {
      // Demo Mode - check sessionStorage
      const isAdmin = sessionStorage.getItem('tropiq-admin') === 'true';
      if (isAdmin) {
        setIsAuthorized(true);
      } else {
        navigate('/admin/login', { replace: true });
      }
    }

    return () => unsubscribeAuth();
  }, [navigate]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
