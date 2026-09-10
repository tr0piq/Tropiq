import { useState } from 'react';
import { Star } from 'lucide-react';
import { submitReview } from '../lib/data-service';
import { auth } from '../lib/firebase';

interface ReviewFormProps {
  votedFor: string; // e.g. "Pistachio Milk"
  onDone: () => void;
}

export default function ReviewForm({ votedFor, onDone }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState(auth?.currentUser?.displayName || '');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !name.trim() || !text.trim()) return;
    setLoading(true);
    try {
      await submitReview({ name: name.trim(), rating, text: text.trim(), votedFor, uid: auth?.currentUser?.uid });
      setSubmitted(true);
      setTimeout(onDone, 1800);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center">
          <Star className="w-7 h-7 text-[#D4AF37] fill-[#D4AF37]" />
        </div>
        <p className="text-xl font-display font-bold text-white">Thank you!</p>
        <p className="text-sm text-[#A0A0A0]">Your review has been published.</p>
      </div>
    );
  }

  return (
    <div className="mt-10 border border-white/[0.06] rounded-3xl p-8 md:p-10 bg-white/[0.02] backdrop-blur-xl">
      <div className="mb-7">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4AF37] block mb-3">
          Your Review
        </span>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">
          Share your thoughts on <em className="not-italic text-[#D4AF37]">{votedFor}</em>
        </h2>
        <p className="text-sm text-[#6B7280] mt-2">Your feedback will be featured on our homepage.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star Rating */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-3">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform duration-150 hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 transition-colors duration-200 ${
                    star <= (hovered || rating)
                      ? 'text-[#D4AF37] fill-[#D4AF37]'
                      : 'text-white/20'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah K."
            maxLength={40}
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 transition-colors text-sm"
          />
        </div>

        {/* Review text */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">Review</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you love about it? How does it taste?"
            maxLength={200}
            rows={3}
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 transition-colors text-sm resize-none"
          />
          <p className="text-right text-xs text-white/20 mt-1">{text.length}/200</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!rating || !name.trim() || !text.trim() || loading}
            className="group relative px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-full overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed text-sm tracking-widest uppercase"
          >
            <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 group-disabled:translate-y-[100%] transition-transform duration-500" />
            <span className="relative z-10">{loading ? 'Submitting…' : 'Publish Review'}</span>
          </button>
          <button
            type="button"
            onClick={onDone}
            className="px-6 py-3 text-sm font-semibold text-[#6B7280] hover:text-white transition-colors"
          >
            Skip
          </button>
        </div>
      </form>
    </div>
  );
}
