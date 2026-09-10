import { Link, useLocation } from 'react-router-dom';
import { LogIn, BarChart2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
      });
      return () => unsubscribe();
    } else {
      const demoUser = sessionStorage.getItem('tropiq-user');
      if (demoUser) setUser({ email: demoUser });
    }
  }, []);

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
    sessionStorage.removeItem('tropiq-user');
    window.location.reload();
  };

  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#040504]/70 backdrop-blur-3xl border-b border-white/[0.03]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        
        <Link to="/" className="group flex items-center gap-1">
          <span className="text-2xl font-display font-bold tracking-tight text-white group-hover:opacity-80 transition-opacity">
            TropiQ
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mb-1" />
        </Link>

        <div className="flex items-center gap-6">
          <Link 
            to="/admin/login" 
            className="text-text-secondary hover:text-white transition-colors duration-300"
            title="Admin Dashboard"
          >
            <span className="sr-only">Admin Dashboard</span>
            <BarChart2 className="w-5 h-5" />
          </Link>

          {user ? (
            <button
              onClick={handleSignOut}
              className="text-xs font-bold tracking-widest uppercase text-white hover:text-[#D4AF37] transition-colors duration-300"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className="group flex items-center gap-2 px-6 py-2.5 rounded-full glass-panel hover:bg-white/10 transition-all duration-300"
            >
              <LogIn className="w-4 h-4 text-white group-hover:text-[#D4AF37] transition-colors" /> 
              <span className="text-xs font-bold tracking-widest uppercase text-white">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
