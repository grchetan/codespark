import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Effect } from '@/mocks/effects';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface SavedContextType {
  savedEffects: Effect[];
  savedCount: number;
  isSaved: (effectId: string) => boolean;
  toggleSave: (effect: Effect) => boolean;
  removeSaved: (effectId: string) => void;
  clearAllSaved: () => void;
  isLiked: (effectId: string) => boolean;
  toggleLike: (effectId: string) => { liked: boolean; count: number };
  getLikeCount: (effectId: string) => number;
  toast: string | null;
  authPromptModal: boolean;
  closeAuthPrompt: () => void;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export function SavedProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [authPromptModal, setAuthPromptModal] = useState(false);

  // User-specific storage keys
  const userKey = user ? `u_${user.id}` : 'guest';

  // 1. Saved Effects Collection (tied to authenticated user)
  const [savedEffects, setSavedEffects] = useState<Effect[]>(() => {
    try {
      const stored = localStorage.getItem(`codespark_saved_${userKey}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // 2. Liked Effect IDs
  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`codespark_liked_${userKey}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // 3. Real Global Like Counts Map (strictly real starting from 0)
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('codespark_real_like_counts');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Reload user-specific saved/liked when user changes
  useEffect(() => {
    try {
      const storedSaved = localStorage.getItem(`codespark_saved_${userKey}`);
      setSavedEffects(storedSaved ? JSON.parse(storedSaved) : []);

      const storedLiked = localStorage.getItem(`codespark_liked_${userKey}`);
      setLikedIds(storedLiked ? JSON.parse(storedLiked) : []);
    } catch {}
  }, [userKey]);

  // Sync savedEffects
  useEffect(() => {
    try {
      localStorage.setItem(`codespark_saved_${userKey}`, JSON.stringify(savedEffects));
    } catch {}
  }, [savedEffects, userKey]);

  // Sync likedIds
  useEffect(() => {
    try {
      localStorage.setItem(`codespark_liked_${userKey}`, JSON.stringify(likedIds));
    } catch {}
  }, [likedIds, userKey]);

  // Sync real like counts
  useEffect(() => {
    try {
      localStorage.setItem('codespark_real_like_counts', JSON.stringify(likeCounts));
    } catch {}
  }, [likeCounts]);

  const isSaved = (effectId: string): boolean => {
    return savedEffects.some((e) => e.id === effectId || e.slug === effectId);
  };

  const toggleSave = (effect: Effect): boolean => {
    if (!isAuthenticated) {
      setAuthPromptModal(true);
      showToast('🔒 Please sign in to save components to your collection!');
      return false;
    }

    const exists = isSaved(effect.id);
    if (exists) {
      setSavedEffects((prev) => prev.filter((e) => e.id !== effect.id && e.slug !== effect.id));
      showToast(`Removed "${effect.name}" from your collection`);
      return false;
    } else {
      setSavedEffects((prev) => [effect, ...prev]);
      showToast(`Saved "${effect.name}" to your collection! 🔖`);
      return true;
    }
  };

  const removeSaved = (effectId: string) => {
    setSavedEffects((prev) => prev.filter((e) => e.id !== effectId && e.slug !== effectId));
    showToast('Removed from saved collection');
  };

  const clearAllSaved = () => {
    setSavedEffects([]);
    showToast('Cleared saved collection');
  };

  const isLiked = (effectId: string): boolean => {
    return likedIds.includes(effectId);
  };

  // Real like count (Starts strictly from 0 real baseline!)
  const getLikeCount = (effectId: string): number => {
    return likeCounts[effectId] || 0;
  };

  const toggleLike = (effectId: string): { liked: boolean; count: number } => {
    if (!isAuthenticated) {
      setAuthPromptModal(true);
      showToast('🔒 Please sign in to like components!');
      return { liked: false, count: getLikeCount(effectId) };
    }

    const currentLiked = isLiked(effectId);
    const currentCount = getLikeCount(effectId);

    let newLiked: boolean;
    let newCount: number;

    if (currentLiked) {
      newLiked = false;
      newCount = Math.max(0, currentCount - 1);
      setLikedIds((prev) => prev.filter((id) => id !== effectId));
    } else {
      newLiked = true;
      newCount = currentCount + 1;
      setLikedIds((prev) => [...prev, effectId]);
      showToast('Liked component! ❤️');
    }

    setLikeCounts((prev) => ({
      ...prev,
      [effectId]: newCount,
    }));

    // Sync to backend / Supabase
    try {
      fetch(`/api/effects/${effectId}/like`, { method: 'POST' }).catch(() => {});
    } catch {}

    return { liked: newLiked, count: newCount };
  };

  const closeAuthPrompt = () => setAuthPromptModal(false);

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
        authPromptModal,
        closeAuthPrompt,
      }}
    >
      {children}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-foreground-950 px-4 py-2.5 text-xs font-semibold text-background-50 shadow-2xl border border-foreground-800 animate-fade-in">
          <i className="ri-information-fill text-primary-400 text-sm" />
          <span>{toast}</span>
        </div>
      )}

      {/* Modern Auth Prompt Modal when unauthenticated user tries to like/save */}
      {authPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-background-50 p-6 shadow-2xl border border-background-300/80 space-y-4 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-500/10 text-2xl text-primary-500 font-bold">
              ⚡
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground-950">
                Sign in to CodeSpark
              </h3>
              <p className="mt-1 text-xs text-foreground-500 leading-relaxed">
                Create a free account or log in to like, bookmark components to your personal collection, and submit UI effects.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href="/login"
                className="btn btn-primary h-10 w-full text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <i className="ri-user-line" /> Sign In
              </a>
              <a
                href="/signup"
                className="btn btn-secondary h-10 w-full text-xs font-semibold flex items-center justify-center gap-2"
              >
                Create Free Account
              </a>
              <button
                type="button"
                onClick={closeAuthPrompt}
                className="text-xs text-foreground-400 hover:text-foreground-700 pt-1 block w-full"
              >
                Maybe later
              </button>
            </div>
          </div>
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
