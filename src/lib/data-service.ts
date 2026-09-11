import { db, auth } from './firebase';
import { collection, addDoc, onSnapshot, query, getDocs, Timestamp, deleteDoc, doc, where } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  tags: string[];
  badge?: string; // e.g. "Mostly Liked"
}

export interface PollOption {
  id: string;
  productId: string;
  label: string;
  imageUrl: string;
  voteCount: number;
  badge?: string;
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
let dynamicProducts: Product[] = [];

// Subscribe to dynamic products
export function subscribeToProducts(callback: (products: Product[]) => void) {
  if (!db) return () => {};
  const q = query(collection(db, 'products'));
  return onSnapshot(q, (snapshot) => {
    const products: Product[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
    dynamicProducts = products;
    callback([...PRODUCTS, ...products]);
  });
}

// Add a new product
export async function addProduct(product: Omit<Product, 'id'>) {
  if (!db) throw new Error("Firestore not initialized");
  await addDoc(collection(db, 'products'), product);
}

// Subscribe to live votes and merge with products
export function subscribeToVotes(callback: (poll: Poll) => void) {
  if (!db) return () => {};

  const q = query(collection(db, 'votes'));
  
  const unsubscribeVotes = onSnapshot(q, (snapshot) => {
    const counts: Record<string, number> = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      counts[data.optionId] = (counts[data.optionId] || 0) + 1;
    });
    
    liveVoteCounts = counts;
    updateCombinedPoll(counts, callback);
  });

  const unsubscribeProducts = subscribeToProducts(() => {
    updateCombinedPoll(liveVoteCounts, callback);
  });

  return () => {
    unsubscribeVotes();
    unsubscribeProducts();
  };
}

function updateCombinedPoll(counts: Record<string, number>, callback: (poll: Poll) => void) {
  const allProducts = [...PRODUCTS, ...dynamicProducts];
  
  // Build dynamic options based on all products
  const dynamicOptions: PollOption[] = allProducts.map(p => ({
    id: `opt-${p.id}`,
    productId: p.id,
    label: p.name,
    imageUrl: p.imageUrl,
    voteCount: counts[`opt-${p.id}`] || 0,
    badge: p.badge
  }));

  const updatedPoll = {
    ...INITIAL_POLL,
    options: dynamicOptions
  };
  
  callback(updatedPoll);
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
  // Vote saved to Firestore — no additional sync needed
}

export async function checkUserVoted(pollId: string, voterHash: string): Promise<string | null> {
  if (!db) return null;
  const q = query(
    collection(db, 'votes'),
    where('pollId', '==', pollId),
    where('voterHash', '==', voterHash)
  );
  const snapshot = await getDocs(q);
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.timestamp && data.timestamp.toDate() >= startOfDay) {
      return data.optionId as string;
    }
  }
  return null;
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

// ─── Reviews ───
export interface Review {
  id?: string;
  name: string;
  rating: number; // 1-5
  text: string;
  votedFor: string; // product label
  timestamp: string;
  uid?: string;
}

export async function submitReview(review: Omit<Review, 'id' | 'timestamp'>): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  await addDoc(collection(db, 'reviews'), {
    ...review,
    timestamp: Timestamp.now(),
    uid: auth?.currentUser?.uid || 'anonymous',
  });
}

export function subscribeToReviews(callback: (reviews: Review[]) => void) {
  if (!db) { callback([]); return () => {}; }
  const q = query(collection(db, 'reviews'));
  return onSnapshot(q, (snapshot) => {
    const reviews: Review[] = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name,
        rating: d.rating,
        text: d.text,
        votedFor: d.votedFor,
        timestamp: d.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        uid: d.uid,
      };
    });
    // Newest first
    reviews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(reviews);
  });
}

export async function deleteReview(id: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  await deleteDoc(doc(db, 'reviews', id));
}
