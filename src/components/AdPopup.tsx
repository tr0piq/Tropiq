import { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface AdPopupProps {
  show: boolean;
  onClose: () => void;
}

const DURATION = 10;

export default function AdPopup({ show, onClose }: AdPopupProps) {
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setTimeLeft(DURATION);
      setVisible(false);
      return;
    }
    // Small delay so it appears after vote confirmation animation
    const showTimer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(showTimer);
  }, [show]);

  useEffect(() => {
    if (!visible) return;

    if (timeLeft === 0) {
      handleClose();
      return;
    }

    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [visible, timeLeft]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(6px)' }}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-sm border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 ${
          visible ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'
        }`}
        style={{
          background: 'linear-gradient(160deg, #111 0%, #0d0d0d 100%)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
            Sponsored
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-white/30 tabular-nums">
              {timeLeft}s
            </span>
            <button
              onClick={handleClose}
              className="w-6 h-6 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-3 h-3 text-white/60" />
            </button>
          </div>
        </div>

        {/* Ad Content */}
        <a
          href="https://kallanumpolicum.online"
          target="_blank"
          rel="noopener noreferrer"
          className="block px-5 pb-5 group"
          onClick={handleClose}
        >
          {/* Real Game Logo */}
          <div className="flex justify-center mb-4">
            <img
              src="/kallanum-logo.png"
              alt="Kallanum Policum — Thief and Police"
              className="w-48 h-48 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <p className="text-center text-sm text-white/55 leading-relaxed mb-5">
            Play the ultimate Thief and Police game online — free, fun, and addictive!
          </p>

          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full text-xs font-bold group-hover:bg-[#D4AF37] transition-colors duration-300">
              Play Free Now <ExternalLink className="w-3 h-3" />
            </div>
          </div>

          <p className="text-center text-[10px] text-white/20 mt-3 tracking-wide">
            kallanumpolicum.online
          </p>
        </a>

        {/* Countdown progress bar */}
        <div className="h-0.5 bg-white/5">
          <div
            className="h-full bg-[#D4AF37] transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / DURATION) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
