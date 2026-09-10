import { useEffect, useState, useRef } from 'react';
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
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-bold text-white">{review.name}</span>
        <span className="text-[10px] text-[#6B7280] bg-white/5 px-2 py-0.5 rounded-full">{review.votedFor}</span>
      </div>
    </div>
  );
}

function MarqueeRow({ reviews, direction }: { reviews: Review[]; direction: 'left' | 'right' }) {
  // Duplicate for seamless loop
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

// Placeholder reviews shown before real ones load
const PLACEHOLDERS: Review[] = [
  { id: 'p1', name: 'Ayaan R.', rating: 5, text: 'Absolutely love the Pistachio Milk. Smooth, nutty, and refreshing!', votedFor: 'Pistachio Milk', timestamp: '' },
  { id: 'p2', name: 'Meera S.', rating: 5, text: 'Cold Boost is literally my morning ritual now. Incredible taste.', votedFor: 'Cold Boost', timestamp: '' },
  { id: 'p3', name: 'Zaid K.', rating: 4, text: 'Cold Coffee hits different. Best I\'ve had from a brand like this.', votedFor: 'Cold Coffee', timestamp: '' },
  { id: 'p4', name: 'Priya T.', rating: 5, text: 'The pistachio milk surprised me — I was not expecting it to be THIS good.', votedFor: 'Pistachio Milk', timestamp: '' },
  { id: 'p5', name: 'Farhan A.', rating: 5, text: 'Cold Boost before gym = 🔥. 10/10 would recommend.', votedFor: 'Cold Boost', timestamp: '' },
  { id: 'p6', name: 'Layla H.', rating: 4, text: 'Great product, the Cold Coffee is perfectly balanced — not too sweet.', votedFor: 'Cold Coffee', timestamp: '' },
];

export default function ReviewsMarquee() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const unsub = subscribeToReviews((r) => setReviews(r));
    return () => unsub();
  }, []);

  const displayReviews = reviews.length >= 4 ? reviews : [...reviews, ...PLACEHOLDERS].slice(0, Math.max(6, reviews.length));

  if (displayReviews.length < 2) return null;

  const half = Math.ceil(displayReviews.length / 2);
  const row1 = displayReviews.slice(0, half);
  const row2 = displayReviews.slice(half);

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

      <div className="space-y-4">
        <MarqueeRow reviews={row1} direction="left" />
        {row2.length > 0 && <MarqueeRow reviews={row2} direction="right" />}
      </div>
    </section>
  );
}
