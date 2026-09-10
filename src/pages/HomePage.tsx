import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart2, ArrowRight } from 'lucide-react';
import { getProducts, subscribeToProducts } from '../lib/data-service';
import type { Product } from '../lib/data-service';
import ReviewsMarquee from '../components/ReviewsMarquee';

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(getProducts());

  useEffect(() => {
    const unsub = subscribeToProducts((ps) => setProducts(ps));
    return () => unsub();
  }, []);

  const handleVoteClick = () => {
    navigate('/vote');
  };

  return (
    <div className="min-h-screen bg-background relative pt-36 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="minimal-grid-bg fixed inset-0 pointer-events-none opacity-50" />
      
      {/* Cinematic Ambient Glows */}
      <div className="ambient-glow w-[800px] h-[800px] bg-[#D4AF37] top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5" />
      <div className="ambient-glow w-[600px] h-[600px] bg-[#4ade80] bottom-0 right-0 opacity-5" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Editorial Header Section */}
        <div className="text-center mb-24 animate-fade-in flex flex-col items-center">
          <span className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-6 block">
            The Signature Collection
          </span>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-bold leading-[0.9] tracking-tight mb-8">
            Define The Next <br />
            <span className="text-gradient-white">Classic.</span>
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl font-light leading-relaxed mb-12">
            Immerse yourself in our curated selection of artisanal beverages. 
            Your palette dictates the future of TropiQ.
          </p>

          <button
            onClick={handleVoteClick}
            className="group relative px-8 py-4 bg-white text-black rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#D4AF37] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <span className="relative z-10 flex items-center gap-3 text-sm font-bold tracking-widest uppercase transition-colors duration-300">
              Cast Your Vote <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>

        {/* Cinematic Product Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 40 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden glass-panel"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 opacity-80" />
              <img
                src={product.imageUrl}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover mix-blend-lighten transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4AF37] mb-3 block">
                    {product.category}
                  </span>
                  <h2 className="text-3xl font-display font-bold text-white mb-3">{product.name}</h2>
                  <p className="text-text-secondary text-sm font-light leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {product.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Analytics Teaser */}
        <motion.div 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-6">
            <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-xs text-text-muted uppercase tracking-widest font-semibold">Live Data Processing</span>
          </div>
          <h3 className="text-2xl font-display font-medium text-white mb-6">Track the global consensus in real-time.</h3>
          <Link 
            to="/admin/dashboard" 
            className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-white transition-colors uppercase tracking-widest group"
          >
            Access Analytics <BarChart2 className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Reviews Marquee */}
        <div className="relative z-20 mt-12">
          <ReviewsMarquee />
        </div>

      </div>
    </div>
  );
}
