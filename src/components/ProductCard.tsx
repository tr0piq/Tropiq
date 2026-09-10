import { CheckCircle2 } from 'lucide-react';
import type { PollOption } from '../lib/data-service';

interface ProductCardProps {
  option: PollOption;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
}

export default function ProductCard({ option, selected, onSelect, disabled }: ProductCardProps) {
  return (
    <div 
      onClick={() => {
        if (!disabled) onSelect();
      }}
      className={`group relative aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 transform ${
        selected 
          ? 'ring-1 ring-[#D4AF37] scale-100 bg-white/5 shadow-[0_0_40px_rgba(212,175,55,0.15)] z-20' 
          : 'ring-1 ring-white/[0.05] hover:ring-white/20 hover:-translate-y-2 glass-panel z-10'
      } ${disabled && !selected ? 'opacity-40 grayscale-[80%] scale-95 blur-[2px]' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#040504] via-[#040504]/50 to-transparent z-10 opacity-90" />
      
      <img
        src={option.imageUrl}
        alt={option.label}
        className={`absolute inset-0 w-full h-full object-cover mix-blend-lighten transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${selected ? 'scale-110' : 'group-hover:scale-105'}`}
      />

      <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">{option.label}</h3>
          
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
            selected 
              ? 'bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-100' 
              : 'border border-white/20 scale-90 group-hover:border-white/50 group-hover:scale-100'
          }`}>
            {selected && <CheckCircle2 className="w-5 h-5 text-black" />}
          </div>
        </div>
      </div>
    </div>
  );
}
