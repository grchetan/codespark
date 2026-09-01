import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Effect } from '@/mocks/effects';

interface SavedContextType {
  savedEffects: Effect[];
  savedCount: number;
  isSaved: (effectId: string) => boolean;
  toggleSave: (effect: Effect) => boolean;
  removeSaved: (effectId: string) => void;
  clearAllSaved: () => void;
  isLiked: (effectId: string) => boolean;
  toggleLike: (effectId: string, baseCount?: number) => { liked: boolean; count: number };
  getLikeCount: (effectId: string, baseCount?: number) => number;
  toast: string | null;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export function SavedProvider({ children }: { children: ReactNode }) {
  // 1. Saved Effects Collection
  const [savedEffects, setSavedEffects] = useState<Effect[]>(() => {
    try {
      const stored = localStorage.getItem('codespark_saved_effects');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [];
  });

  // 2. Liked Effect IDs
  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('codespark_liked_ids');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [];
  });

  // 3. Real Like Counts Map
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('codespark_like_counts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return {};
  });

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Sync savedEffects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('codespark_saved_effects', JSON.stringify(savedEffects));
    } catch {}
  }, [savedEffects]);

  // Sync likedIds to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('codespark_liked_ids', JSON.stringify(likedIds));
    } catch {}
  }, [likedIds]);

  // Sync likeCounts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('codespark_like_counts', JSON.stringify(likeCounts));
    } catch {}
  }, [likeCounts]);

  const isSaved = (effectId: string): boolean => {
    return savedEffects.some((e) => e.id === effectId || e.slug === effectId);
  };

  const toggleSave = (effect: Effect): boolean => {
    const exists = isSaved(effect.id);
    if (exists) {
      setSavedEffects((prev) => prev.filter((e) => e.id !== effect.id && e.slug !== effect.id));
      showToast(`Removed "${effect.name}" from your saved collection`);
      return false;
    } else {
      setSavedEffects((prev) => [effect, ...prev]);
      showToast(`Saved "${effect.name}" to your collection! 🔖`);
      return true;
    }
  };

  const removeSaved = (effectId: string) => {
    setSavedEffects((prev) => prev.filter((e) => e.id !== effectId && e.slug !== effectId));
    showToast('Removed effect from saved collection');
  };

  const clearAllSaved = () => {
    setSavedEffects([]);
    showToast('Cleared all saved effects');
  };

  const isLiked = (effectId: string): boolean => {
    return likedIds.includes(effectId);
  };

  const getLikeCount = (effectId: string, baseCount?: number): number => {
    if (typeof likeCounts[effectId] === 'number') {
      return likeCounts[effectId];
    }
    // Calculate initial baseline count from mock or 0
    const fallback = typeof baseCount === 'number' ? Math.max(0, baseCount) : 0;
    return fallback;
  };

  const toggleLike = (effectId: string, baseCount?: number): { liked: boolean; count: number } => {
    const currentLiked = isLiked(effectId);
    const currentCount = getLikeCount(effectId, baseCount);
    
    let newLiked: boolean;
    let newCount: number;

    if (currentLiked) {
      // Unlike
      newLiked = false;
      newCount = Math.max(0, currentCount - 1);
      setLikedIds((prev) => prev.filter((id) => id !== effectId));
    } else {
      // Like
      newLiked = true;
      newCount = currentCount + 1;
      setLikedIds((prev) => [...prev, effectId]);
      showToast('Liked component! ❤️');
    }

    setLikeCounts((prev) => ({
      ...prev,
      [effectId]: newCount,
    }));

    return { liked: newLiked, count: newCount };
  };

  return (
    <SavedContext.Provider
      value={{
        savedEffects,
        savedCount: savedEffects.length,
        isSaved,
        toggleSave,
        removeSaved,
        clearAllSaved,
        isLiked,
        toggleLike,
        getLikeCount,
        toast,
      }}
    >
      {children}
      {/* Universal Floating Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-foreground-950 px-4 py-2.5 text-xs font-semibold text-background-50 shadow-2xl border border-foreground-800 animate-fade-in">
          <i className="ri-checkbox-circle-fill text-primary-400 text-sm" />
          <span>{toast}</span>
        </div>
      )}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
}
