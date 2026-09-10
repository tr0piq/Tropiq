import { db, auth } from './firebase';
import { collection, addDoc, onSnapshot, query, getDocs, Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  tags: string[];
}

export interface PollOption {
  id: string;
  productId: string;
  label: string;
  imageUrl: string;
  voteCount: number;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'closed';
  createdAt: string;
  options: PollOption[];
}

export interface Vote {
  id?: string;
  pollId: string;
  optionId: string;
  timestamp: string;
  voterHash: string;
}

// ─── Static Metadata ───
export const PRODUCTS: Product[] = [
  {
    id: 'pistachio-milk',
    name: 'Pistachio Milk',
    description: 'Creamy plant-based pistachio milk — naturally rich, smooth, and refreshingly green. Perfect for those who chill.',
    imageUrl: '/pistachio-milk.jpg',
    category: 'Chill',
    tags: ['plant-based', 'creamy', 'nutty'],
  },
  {
    id: 'cold-boost',
    name: 'Cold Boost',
    description: 'A refreshing caffeine kick blended with natural ingredients. Your midday energy companion — bold and balanced.',
    imageUrl: '/cold-boost.jpg',
    category: 'Refresh',
    tags: ['caffeine', 'energy', 'smooth'],
  },
  {
    id: 'cold-coffee',
    name: 'Cold Coffee',
    description: 'Classic cold brew meets TropiQ freshness. Rich, dark, and creamy — the ultimate recharge for coffee lovers.',
    imageUrl: '/cold-coffee.jpg',
    category: 'Recharge',
    tags: ['coffee', 'cold-brew', 'classic'],
  },
];

export const INITIAL_POLL: Poll = {
  id: 'poll-tropiq-fav',
  title: 'Which TropiQ drink is your favourite?',
  description: 'Vote for your go-to TropiQ beverage! Results update in real time.',
  status: 'active',
  createdAt: new Date().toISOString(),
  options: [
    { id: 'opt-pistachio', productId: 'pistachio-milk', label: 'Pistachio Milk', imageUrl: '/pistachio-milk.jpg', voteCount: 0 },
    { id: 'opt-coldboost', productId: 'cold-boost', label: 'Cold Boost', imageUrl: '/cold-boost.jpg', voteCount: 0 },
    { id: 'opt-coldcoffee', productId: 'cold-coffee', label: 'Cold Coffee', imageUrl: '/cold-coffee.jpg', voteCount: 0 },
  ],
};

// ─── Synchronous Getters for Static Data ───
export function getProducts() {
  return PRODUCTS;
}

// ─── Live Firestore Data ───

// Keep a local cache of vote counts to supply synchronously if needed before snapshot resolves
let liveVoteCounts: Record<string, number> = {};

// Subscribe to live votes
export function subscribeToVotes(callback: (poll: Poll) => void) {
  if (!db) return () => {};

  const q = query(collection(db, 'votes'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const counts: Record<string, number> = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      counts[data.optionId] = (counts[data.optionId] || 0) + 1;
    });
    
    liveVoteCounts = counts;

    const updatedPoll = {
      ...INITIAL_POLL,
      options: INITIAL_POLL.options.map(opt => ({
        ...opt,
        voteCount: counts[opt.id] || 0
      }))
    };
    
    callback(updatedPoll);
  });

  return unsubscribe;
}

export async function castVote(pollId: string, optionId: string) {
  if (!db) throw new Error("Firestore not initialized");

  const user = auth?.currentUser;
  const voterHash = user ? user.uid : `anon-${Math.random().toString(36).substr(2, 9)}`;

  // 1. Save to Firestore
  await addDoc(collection(db, 'votes'), {
    pollId,
    optionId,
    timestamp: Timestamp.now(),
    voterHash
  });

  // 2. Trigger Next.js API Route to Sync with Google Sheets
  try {
    await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId, optionId, voterHash, timestamp: new Date().toISOString() })
    });
  } catch (err) {
    console.error("Failed to sync with Google Sheets", err);
  }
}

// Admin Chart Data Fetching
export interface DailyVoteData {
  date: string;
  votes: number;
}

export async function getAllVotes(): Promise<Vote[]> {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'votes'));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      pollId: data.pollId,
      optionId: data.optionId,
      timestamp: data.timestamp.toDate().toISOString(),
      voterHash: data.voterHash
    } as Vote;
  });
}

export async function getVotesByDay(): Promise<DailyVoteData[]> {
  const votes = await getAllVotes();
  const byDay: Record<string, number> = {};
  
  votes.forEach(v => {
    const date = new Date(v.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    byDay[date] = (byDay[date] || 0) + 1;
  });

  return Object.entries(byDay).map(([date, count]) => ({ date, votes: count }));
}

export async function getHourlyDistribution() {
  const votes = await getAllVotes();
  const byHour: Record<string, number> = {};
  
  for (let i = 0; i < 24; i++) {
    byHour[`${i}:00`] = 0;
  }

  votes.forEach(v => {
    const hour = new Date(v.timestamp).getHours();
    byHour[`${hour}:00`] += 1;
  });

  return Object.entries(byHour).map(([hour, count]) => ({ name: hour, votes: count }));
}
