import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, BarChart2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useIsAdmin, useCurrentUser } from '../hooks/useAuth';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Vote', to: '/vote' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const isAdmin = useIsAdmin();
  const [scrolled, setScrolled] = useState(false);

  // Must come before any early returns to comply with React hooks rules
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hide navbar on admin pages
  const isAdminPage = location.pathname.startsWith('/admin');
  if (isAdminPage) return null;

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
    sessionStorage.removeItem('tropiq-user');
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4">
      <nav
        className={`w-full max-w-4xl flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-500 ${
          scrolled
            ? 'bg-[#0a0a0a]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/10'
            : 'bg-white/[0.04] backdrop-blur-xl border border-white/[0.06]'
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center group-hover:bg-[#D4AF37]/30 transition-colors duration-300">
            <span className="text-[#D4AF37] text-xs font-display font-bold">T</span>
          </div>
          <span className="font-display font-bold text-white text-base tracking-tight">
            TropiQ<span className="text-[#D4AF37]">.</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden sm:flex items-center gap-1 bg-white/[0.04] rounded-xl px-1.5 py-1.5 border border-white/[0.06]">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-black'
                    : 'text-[#A0A0A0] hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-white" />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Admin Dashboard icon — only shown to admin */}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              title="Admin Dashboard"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                location.pathname === '/admin/dashboard'
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-black'
                  : 'bg-white/[0.04] border-white/10 text-[#A0A0A0] hover:text-white hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
            </Link>
          )}

          {user ? (
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-[#A0A0A0] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#D4AF37] transition-all duration-300 tracking-wide"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
