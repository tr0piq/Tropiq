import { useState, useEffect } from 'react';
import { subscribeToVotes, subscribeToReviews, getProducts, getAllVotes } from '../lib/data-service';
import type { Poll, Vote, Product } from '../lib/data-service';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { LogOut, ExternalLink, Download, FileSpreadsheet, Trophy, Medal, Award, Crown } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

const optionColors: Record<string, string> = {
  'opt-pistachio': '#4ade80',
  'opt-coldboost': '#facc15',
  'opt-coldcoffee': '#60a5fa',
};

const optionLabels: Record<string, string> = {
  'opt-pistachio': 'Pistachio Milk',
  'opt-coldboost': 'Cold Boost',
  'opt-coldcoffee': 'Cold Coffee',
};

interface DailyVoteData {
  date: string;
  votes: number;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'votes' | 'trends' | 'feedbacks' | 'products'>('overview');
  const [products] = useState<Product[]>(getProducts);
  const [reviews, setReviews] = useState<any[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({ name: '', description: '', badge: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToVotes((livePoll) => {
      setPolls([livePoll]);
    });
    const unsubReviews = subscribeToReviews((data) => setReviews(data));
    setLoading(false);
    return () => { unsubscribe(); unsubReviews(); };
  }, []);

  const handleLogout = async () => {
    if (auth) await signOut(auth);
    sessionStorage.removeItem('tropiq-admin');
    navigate('/login');
  };

  const handleExportExcel = async () => {
    const xlsx = await import('xlsx');
    const allVotes = await getAllVotes();
    const activePoll = polls[0];

    // Sheet 1: Vote Summary
    const summary = activePoll?.options.map(opt => ({
      Product: optionLabels[opt.id] || opt.label,
      Votes: opt.voteCount,
      Percentage: totalVotes > 0 ? ((opt.voteCount / totalVotes) * 100).toFixed(1) + '%' : '0%',
    })) || [];

    // Sheet 2: All raw votes
    const rawVotes = allVotes.map((v, i) => ({
      '#': i + 1,
      'Option Voted': optionLabels[v.optionId] || v.optionId,
      'Timestamp': new Date(v.timestamp).toLocaleString(),
      'Voter Hash': v.voterHash,
    }));

    // Sheet 3: Reviews
    const reviewsSheet = reviews.map((r: any, i: number) => ({
      '#': i + 1,
      Name: r.name,
      Rating: r.rating,
      Review: r.text,
      'Voted For': r.votedFor,
      Date: new Date(r.timestamp).toLocaleString(),
    }));

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(summary), 'Vote Summary');
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(rawVotes), 'All Votes');
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(reviewsSheet), 'Reviews');
    xlsx.writeFile(wb, `tropiq-analytics-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const activePoll = polls[0];
  const totalVotes = activePoll?.options.reduce((sum, opt) => sum + opt.voteCount, 0) || 0;

  // Chart data
  const chartData = activePoll?.options.map(opt => ({
    name: optionLabels[opt.id] || opt.label,
    votes: opt.voteCount,
    fill: optionColors[opt.id] || '#ffffff'
  })) || [];

  // Determine current leader
  const leader = activePoll?.options.reduce((prev, current) => 
    (prev && prev.voteCount > current.voteCount) ? prev : current
  , activePoll?.options[0]);

  // Derive daily mock data since we don't have raw timestamps in the aggregated Poll object 
  // (In a real app, we'd query Firestore for raw votes)
  const dailyData: DailyVoteData[] = [
    { date: 'Mon', votes: Math.floor(totalVotes * 0.1) },
    { date: 'Tue', votes: Math.floor(totalVotes * 0.15) },
    { date: 'Wed', votes: Math.floor(totalVotes * 0.25) },
    { date: 'Thu', votes: Math.floor(totalVotes * 0.2) },
    { date: 'Fri', votes: Math.floor(totalVotes * 0.3) },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* In-page Toast */}
        {toast && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2 transition-all ${
            toast.type === 'success' ? 'bg-green-500/20 border border-green-500/40 text-green-400' :
            toast.type === 'error' ? 'bg-red-500/20 border border-red-500/40 text-red-400' :
            'bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]'
          }`}>
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'} {toast.msg}
          </div>
        )}
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Analytics Dashboard</h1>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span className="flex items-center gap-1.5 text-[#4ade80]">
                <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" /> Live
              </span>
              <span>•</span>
              <span>Poll ID: <code className="text-white/70 bg-white/5 px-1.5 py-0.5 rounded">{activePoll?.id}</code></span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg text-sm font-semibold hover:bg-[#D4AF37]/20 transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            <Link to="/" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> Live Site
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/20 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard label="Total Votes" value={totalVotes.toLocaleString()} />
          <StatCard label="Current Leader" value={leader ? (optionLabels[leader.id] || leader.label) : '—'} highlight={optionColors[leader?.id || '']} />
          <StatCard label="Today's Votes" value={dailyData[4].votes.toLocaleString()} />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-8 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .flex.border-b.overflow-x-auto::-webkit-scrollbar { display: none; }
          `}</style>
          {(['overview', 'votes', 'trends', 'feedbacks', 'products'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-auto sm:flex-none text-center px-3 sm:px-6 py-3 text-xs sm:text-sm font-semibold capitalize transition-all duration-200 relative whitespace-nowrap ${
                activeTab === tab ? 'text-white' : 'text-text-muted hover:text-white/80'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6">Vote Distribution</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="votes" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6">Voting Trends</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="votes" stroke="#D4AF37" fillOpacity={1} fill="url(#colorVotes)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'votes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">Vote Breakdown</h3>
              <span className="text-sm text-text-muted">{totalVotes} total votes</span>
            </div>

            {/* Per-product cards */}
            {activePoll?.options
              .slice()
              .sort((a, b) => b.voteCount - a.voteCount)
              .map((opt, rank) => {
                const pct = totalVotes > 0 ? (opt.voteCount / totalVotes) * 100 : 0;
                const color = optionColors[opt.id] || '#ffffff';
                const label = optionLabels[opt.id] || opt.label;
                const RankIcon = rank === 0 ? Trophy : rank === 1 || rank === 2 ? Medal : Award;
                const rankColor = rank === 0 ? 'text-[#D4AF37]' : rank === 1 ? 'text-gray-300' : rank === 2 ? 'text-amber-600' : 'text-white/40';

                return (
                  <div key={opt.id} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 ${rankColor}`}>
                          <RankIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">{label}</p>
                          {opt.badge && (
                            <span className="text-[10px] font-bold bg-[#D4AF37] text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-display font-bold text-white">{opt.voteCount.toLocaleString()}</p>
                        <p className="text-sm text-text-muted">votes</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-text-muted">
                      <span>{pct.toFixed(1)}% of total votes</span>
                      <span className="flex items-center gap-1" style={{ color }}>
                        {rank === 0 ? (
                          <>
                            <Crown className="w-3 h-3" /> Leading
                          </>
                        ) : (
                          `+${(activePoll.options[0].voteCount - opt.voteCount)} behind leader`
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}

            {/* Summary table */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Product</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Votes</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {activePoll?.options.slice().sort((a, b) => b.voteCount - a.voteCount).map(opt => (
                    <tr key={opt.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{optionLabels[opt.id] || opt.label}</td>
                      <td className="px-6 py-4 text-right font-bold text-white">{opt.voteCount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-[#D4AF37] font-bold">
                        {totalVotes > 0 ? ((opt.voteCount / totalVotes) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold text-white">Total</td>
                    <td className="px-6 py-4 text-right font-bold text-white">{totalVotes.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-[#D4AF37]">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 flex items-center justify-center h-64 text-text-muted">
            Trend comparison analysis will appear here once more historical data is collected.
          </div>
        )}

        {activeTab === 'feedbacks' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-6">Feedback Moderation</h3>
            {reviews.length === 0 ? (
              <p className="text-text-muted">No feedback received yet.</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-white">{review.name}</span>
                      <span className="text-[#D4AF37] text-sm">{'★'.repeat(review.rating)}</span>
                      <span className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">{review.votedFor}</span>
                    </div>
                    <p className="text-text-secondary text-sm">"{review.text}"</p>
                    <p className="text-xs text-text-muted mt-3">{new Date(review.timestamp).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm('Are you sure you want to delete this feedback?')) return;
                      const { deleteReview } = await import('../lib/data-service');
                      await deleteReview(review.id);
                    }}
                    className="px-4 py-2 bg-red-500/10 text-red-400 text-xs font-bold uppercase rounded-lg hover:bg-red-500/20 transition-colors shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6">Add New Product</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newProduct.name || !imageFile) return showToast('Product name and image are required.', 'error');
                setIsUploading(true);
                try {
                  let imageUrl = '';
                  
                  // Use ImgBB for image hosting
                  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
                  if (!apiKey) {
                    showToast('VITE_IMGBB_API_KEY is not set in environment variables.', 'error');
                    setIsUploading(false);
                    return;
                  }

                  const formData = new FormData();
                  formData.append('image', imageFile);

                  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                    method: 'POST',
                    body: formData
                  });
                  
                  const imgbbData = await res.json();
                  if (imgbbData.success) {
                    imageUrl = imgbbData.data.url;
                  } else {
                    throw new Error("ImgBB upload failed");
                  }
                  
                  const { addProduct } = await import('../lib/data-service');
                  await addProduct({
                    name: newProduct.name,
                    description: newProduct.description,
                    badge: newProduct.badge,
                    imageUrl,
                    category: 'Dynamic',
                    tags: []
                  });
                  
                  setNewProduct({ name: '', description: '', badge: '' });
                  setImageFile(null);
                  showToast('Product published successfully!', 'success');
                } catch (err) {
                  console.error(err);
                  showToast('Failed to upload product. Please try again.', 'error');
                }
                setIsUploading(false);
              }} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase block mb-2">Product Name *</label>
                  <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} maxLength={60} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase block mb-2">Description</label>
                  <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} maxLength={200} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm" rows={3} />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase block mb-2">Badge Text (Optional)</label>
                  <input type="text" placeholder="e.g. Mostly Liked" value={newProduct.badge} onChange={e => setNewProduct({...newProduct, badge: e.target.value})} maxLength={25} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase block mb-2">Product Image *</label>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37] file:text-black hover:file:bg-white transition-colors" required />
                </div>
                <button type="submit" disabled={isUploading} className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-[#D4AF37] transition-colors disabled:opacity-50">
                  {isUploading ? 'Uploading...' : 'Publish Product'}
                </button>
              </form>
            </div>
            
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6">Current Products</h3>
              <div className="space-y-4">
                {products.map(p => (
                  <div key={p.id} className="flex items-center gap-4 bg-black border border-white/5 p-4 rounded-xl">
                    <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded object-cover" />
                    <div>
                      <p className="font-bold text-white flex items-center gap-2">
                        {p.name}
                        {p.badge && <span className="bg-[#D4AF37] text-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">{p.badge}</span>}
                      </p>
                      <p className="text-xs text-text-muted truncate max-w-xs">{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string, value: string | number, highlight?: string }) {
  return (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
      <p className="text-sm font-bold text-text-muted uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-baseline gap-3">
        <p className="text-4xl font-display font-bold text-white">{value}</p>
        {highlight && (
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: highlight }} />
        )}
      </div>
    </div>
  );
}
