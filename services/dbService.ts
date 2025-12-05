import { TrackedNiche } from '../types';

const STORAGE_KEY = 'nicheSensei_trackedNiches';

export const dbService = {
  /**
   * Saves a new tracked niche to local storage.
   * If a niche with the same ID exists, it updates it.
   */
  saveNiche: async (niche: TrackedNiche): Promise<void> => {
    // Simulate async db operation
    return new Promise((resolve) => {
      try {
        const existingData = localStorage.getItem(STORAGE_KEY);
        let niches: TrackedNiche[] = existingData ? JSON.parse(existingData) : [];
        
        const index = niches.findIndex(n => n.id === niche.id);
        
        if (index >= 0) {
          niches[index] = niche;
        } else {
          niches.push(niche);
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(niches));
        resolve();
      } catch (error) {
        console.error("Failed to save niche to DB:", error);
        resolve();
      }
    });
  },

  /**
   * Loads all tracked niches from local storage.
   */
  loadAllNiches: async (): Promise<TrackedNiche[]> => {
    return new Promise((resolve) => {
      try {
        const existingData = localStorage.getItem(STORAGE_KEY);
        const niches: TrackedNiche[] = existingData ? JSON.parse(existingData) : [];
        resolve(niches);
      } catch (error) {
        console.error("Failed to load niches from DB:", error);
        resolve([]);
      }
    });
  },
  
  /**
   * Deletes a niche by ID.
   */
  deleteNiche: async (nicheId: string): Promise<void> => {
     return new Promise((resolve) => {
       try {
         const existingData = localStorage.getItem(STORAGE_KEY);
         if (!existingData) { resolve(); return; }
         
         const niches: TrackedNiche[] = JSON.parse(existingData);
         const filtered = niches.filter(n => n.id !== nicheId);
         
         localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
         resolve();
       } catch (error) {
         console.error("Failed to delete niche:", error);
         resolve();
       }
     });
  }
};