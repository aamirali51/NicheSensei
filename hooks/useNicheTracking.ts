import { useState, useEffect, useCallback } from 'react';
import { TrackedNiche, MicroNiche } from '../types';
import { dbService } from '../services/dbService';

export const useNicheTracking = () => {
  const [trackedNiches, setTrackedNiches] = useState<TrackedNiche[]>([]);
  const [activeNiche, setActiveNiche] = useState<TrackedNiche | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial Load Logic
  useEffect(() => {
    const loadNiches = async () => {
      setLoading(true);
      try {
        const savedNiches = await dbService.loadAllNiches();
        setTrackedNiches(savedNiches);
        
        // Optional: Restore last active niche if needed, for now we leave it null
      } catch (error) {
        console.error("Failed to load tracked niches", error);
      } finally {
        setLoading(false);
      }
    };

    loadNiches();
  }, []);

  // Lock (Save) Niche Logic
  const lockNiche = useCallback(async (microNiche: MicroNiche) => {
    // Create a robust ID if it doesn't exist, or use a timestamp based one
    const newId = crypto.randomUUID();
    
    const nicheToTrack: TrackedNiche = {
      ...microNiche,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    // 1. Persist to DB
    await dbService.saveNiche(nicheToTrack);

    // 2. Update Local State
    setTrackedNiches(prev => {
      // Avoid duplicates if logic changes later
      const exists = prev.find(n => n.name === nicheToTrack.name);
      if (exists) return prev;
      return [...prev, nicheToTrack];
    });

    // 3. Set as Active
    setActiveNiche(nicheToTrack);
  }, []);

  const unLockNiche = useCallback(() => {
    setActiveNiche(null);
  }, []);

  const selectNiche = useCallback((nicheId: string) => {
    const found = trackedNiches.find(n => n.id === nicheId);
    if (found) {
      setActiveNiche(found);
    }
  }, [trackedNiches]);
  
  const removeNiche = useCallback(async (nicheId: string) => {
     await dbService.deleteNiche(nicheId);
     setTrackedNiches(prev => prev.filter(n => n.id !== nicheId));
     if (activeNiche?.id === nicheId) {
       setActiveNiche(null);
     }
  }, [activeNiche]);

  return {
    trackedNiches,
    activeNiche,
    loading,
    lockNiche,
    unLockNiche,
    selectNiche,
    removeNiche
  };
};