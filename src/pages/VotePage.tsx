import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeToVotes, castVote, INITIAL_POLL } from '../lib/data-service';
import { isFirebaseConfigured, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { Poll } from '../lib/data-service';
import ProductCard from '../components/ProductCard';
import { CheckCircle2, ArrowLeft, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VotePage() {
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll>(INITIAL_POLL);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsubscribeAuth = () => {};
    
    if (isFirebaseConfigured() && auth) {
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (!user) {
          navigate('/login');
        }
      });
    } else {
      const isLoggedIn = sessionStorage.getItem('tropiq-user');
      if (!isLoggedIn) {
        navigate('/login');
        return;
      }
    }

    const unsubscribeVotes = subscribeToVotes((livePoll) => {
      setPoll(livePoll);
    });
    
    if (typeof window !== 'undefined') {
      const voted = localStorage.getItem('tropiq-voted-poll-tropiq-fav');
      if (voted) {
        setHasVoted(true);
        setSelectedOption(voted);
      }
    }

    return () => {
      unsubscribeAuth();
      unsubscribeVotes();
    };
  }, [navigate]);

  const handleVote = async () => {
    if (!selectedOption || !poll) return;
    
    setLoading(true);
    // Determine voter identity
    let voterIdentity = 'anonymous';
    if (isFirebaseConfigured() && auth?.currentUser) {
      voterIdentity = auth.currentUser.uid;
    } else {
      voterIdentity = sessionStorage.getItem('tropiq-user') || 'demo-user';
    }

    try {
      await castVote(poll.id, selectedOption);
      localStorage.setItem(`tropiq-voted-poll-${poll.id}`, selectedOption);
      setHasVoted(true);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Page always renders with INITIAL_POLL data immediately, then hydrates from Firestore

  return (
    <div className="min-h-screen bg-black py-12 px-4 relative">
      <div className="minimal-grid-bg fixed inset-0 pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">
        
        <Link to="/" className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-8 text-sm font-semibold tracking-widest uppercase">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="mb-16 text-center">
          <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase mb-6 block">
            Phase 1: Market Research
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white mb-6 leading-tight">
            Which signature blend <br className="hidden md:block"/> deserves to be <span className="text-[#D4AF37] italic">next?</span>
          </h1>
          <p className="text-text-secondary text-base md:text-lg font-light max-w-2xl mx-auto">
            {poll.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {poll.options.map((option) => (
            <ProductCard
              key={option.id}
              option={option}
              selected={selectedOption === option.id}
              onSelect={() => !hasVoted && setSelectedOption(option.id)}
              disabled={hasVoted}
            />
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 glass-panel p-8 md:p-10 rounded-3xl mt-16 relative overflow-hidden">
          {hasVoted && (
            <div className="absolute inset-0 bg-[#D4AF37]/5 pointer-events-none" />
          )}
          
          <div className="flex items-center gap-6 text-text-muted relative z-10">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-500 ${
              hasVoted ? 'bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#D4AF37]' : 'glass-panel border-white/10 text-white/50'
            }`}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-2">
                {hasVoted ? 'Signature Recorded' : 'Awaiting Decision'}
              </p>
              <p className="text-sm font-light">
                {hasVoted ? 'Your palette has influenced the global consensus.' : 'Select your favorite blend to cast your vote.'}
              </p>
            </div>
          </div>
          
          <div className="w-full md:w-auto relative z-10">
            {!hasVoted ? (
              <button
                onClick={handleVote}
                disabled={!selectedOption || loading}
                className="group w-full md:w-auto relative px-10 py-4 bg-white text-black rounded-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!disabled && <div className="absolute inset-0 bg-[#D4AF37] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />}
                <span className="relative z-10 flex items-center justify-center gap-3 text-sm font-bold tracking-widest uppercase transition-colors duration-300">
                  {loading ? 'Processing...' : 'Seal Your Vote'}
                </span>
              </button>
            ) : (
              <Link
                to="/admin/dashboard"
                className="group w-full md:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-[#D4AF37] text-black font-bold rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <span className="relative z-10 flex items-center gap-3 text-sm font-bold tracking-widest uppercase transition-colors duration-300">
                  <BarChart2 className="w-4 h-4" /> Live Analytics
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
