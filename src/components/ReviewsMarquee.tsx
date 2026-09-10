import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { subscribeToReviews } from '../lib/data-service';
import type { Review } from '../lib/data-service';

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-white/10'}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex-shrink-0 w-72 border border-white/[0.06] bg-white/[0.02] rounded-2xl p-5 mx-3">
      <StarRow rating={review.rating} />
      <p className="text-sm text-white/80 mt-3 leading-relaxed line-clamp-3">"{review.text}"</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-white truncate">{review.name}</span>
        <span className="text-[10px] text-[#6B7280] bg-white/5 px-2 py-0.5 rounded-full shrink-0">{review.votedFor}</span>
      </div>
    </div>
  );
}

function MarqueeRow({ reviews, direction }: { reviews: Review[]; direction: 'left' | 'right' }) {
  // Triplicate for a seamless infinite loop
  const items = [...reviews, ...reviews, ...reviews];
  return (
    <div className="overflow-hidden w-full">
      <div
        className={`flex ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}
        style={{ width: 'max-content' }}
      >
        {items.map((r, i) => (
          <ReviewCard key={`${r.id}-${i}`} review={r} />
        ))}
      </div>
    </div>
  );
}

export default function ReviewsMarquee() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const unsub = subscribeToReviews((r) => setReviews(r));
    return () => unsub();
  }, []);

  // Need at least 2 reviews to make a marquee worthwhile
  if (reviews.length < 2) return null;

  const half = Math.ceil(reviews.length / 2);
  const row1 = reviews.slice(0, half);
  const row2 = reviews.slice(half);

  return (
    <section className="py-24 overflow-hidden">
      <div className="text-center mb-14 px-4">
        <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase block mb-4">
          Community Reviews
        </span>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-white">
          What people are saying.
        </h2>
      </div>

      {/* Fade masks on left and right to prevent hard clipping */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-[#040504] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-[#040504] to-transparent" />

        <div className="space-y-4">
          <MarqueeRow reviews={row1} direction="left" />
          {row2.length > 0 && <MarqueeRow reviews={row2} direction="right" />}
        </div>
      </div>
    </section>
  );
}
