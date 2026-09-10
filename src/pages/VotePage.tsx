import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { subscribeToVotes, castVote, INITIAL_POLL } from '../lib/data-service';
import { isFirebaseConfigured, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { Poll } from '../lib/data-service';
import ProductCard from '../components/ProductCard';
import { CheckCircle2, ArrowLeft, BarChart2 } from 'lucide-react';
import { useIsAdmin } from '../hooks/useAuth';
import ReviewForm from '../components/ReviewForm';

export default function VotePage() {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const [poll, setPoll] = useState<Poll>(INITIAL_POLL);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsubscribeAuth = () => {};

    if (isFirebaseConfigured() && auth) {
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (!user) navigate('/login');
      });
    } else {
      const isLoggedIn = sessionStorage.getItem('tropiq-user');
      if (!isLoggedIn) { navigate('/login'); return; }
    }

    const unsubscribeVotes = subscribeToVotes((livePoll) => setPoll(livePoll));

    const voted = localStorage.getItem(`tropiq-voted-poll-${INITIAL_POLL.id}`);
    if (voted) { setHasVoted(true); setSelectedOption(voted); }

    return () => { unsubscribeAuth(); unsubscribeVotes(); };
  }, [navigate]);

  const handleVote = async () => {
    if (!selectedOption || !poll) return;
    setLoading(true);
    try {
      await castVote(poll.id, selectedOption);
      localStorage.setItem(`tropiq-voted-poll-${poll.id}`, selectedOption);
      setHasVoted(true);
      setShowReview(true); // show the review form right after voting
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#040504] pt-28 pb-24 px-4 relative overflow-hidden">
      <div className="minimal-grid-bg fixed inset-0 pointer-events-none opacity-40" />
      <div className="ambient-glow w-[500px] h-[500px] bg-[#D4AF37] top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]" />

      <div className="max-w-6xl mx-auto relative z-10">

        <Link to="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-white transition-colors mb-12 text-xs font-bold tracking-widest uppercase">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Header */}
        <div className="mb-16 text-center">
          <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase mb-6 block">
            Phase 1 · Market Research
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-white mb-6 leading-tight">
            Which signature blend <br className="hidden md:block" />
            deserves to be <em className="text-[#D4AF37] not-italic">next?</em>
          </h1>
          <p className="text-[#A0A0A0] text-base md:text-lg font-light max-w-2xl mx-auto">
            {poll.description}
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
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

        {/* Vote Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-10 rounded-3xl relative overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-xl">
          {hasVoted && <div className="absolute inset-0 bg-[#D4AF37]/[0.04] pointer-events-none" />}

          <div className="flex items-center gap-5 relative z-10">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-700 ${
              hasVoted
                ? 'bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37]'
                : 'border-white/10 text-white/30'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white mb-1.5">
                {hasVoted ? 'Signature Recorded' : 'Awaiting Decision'}
              </p>
              <p className="text-sm text-[#6B7280] font-light">
                {hasVoted
                  ? 'Your palette has shaped the global consensus.'
                  : 'Select your favourite blend to cast your vote.'}
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto relative z-10">
            {!hasVoted ? (
              <button
                onClick={handleVote}
                disabled={!selectedOption || loading}
                className="group w-full md:w-auto relative px-10 py-4 bg-white text-black rounded-full overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-[#D4AF37] translate-y-[100%] group-hover:translate-y-0 group-disabled:translate-y-[100%] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="relative z-10 text-sm font-bold tracking-widest uppercase">
                  {loading ? 'Processing…' : 'Seal Your Vote'}
                </span>
              </button>
            ) : isAdmin ? (
              <Link
                to="/admin/dashboard"
                className="group relative w-full md:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-[#D4AF37] text-black font-bold rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="relative z-10 flex items-center gap-3 text-sm font-bold tracking-widest uppercase">
                  <BarChart2 className="w-4 h-4" /> Live Analytics
                </span>
              </Link>
            ) : (
              <p className="text-xs font-bold tracking-widest uppercase text-[#D4AF37]">
                ✓ Vote submitted
              </p>
            )}
          </div>
        </div>

        {/* Optional Review Form */}
        {hasVoted && showReview && selectedOption && (
          <ReviewForm
            votedFor={poll.options.find(o => o.id === selectedOption)?.label || ''}
            onDone={() => setShowReview(false)}
          />
        )}

      </div>
    </div>
  );
}
