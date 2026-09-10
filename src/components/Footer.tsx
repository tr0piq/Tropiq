'use client';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.08]"
            style={{ background: '#000000' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3 opacity-80">
            <span className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              TropiQ
            </span>
            <span className="text-[10px] text-text-muted tracking-[0.2em] uppercase">Premium</span>
          </div>

          {/* Copyright */}
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} TropiQ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
