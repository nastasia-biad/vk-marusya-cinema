import { config } from '../config';
import { User } from '../types';

export const storage = {
  setAuthData: (user: User) => {
    try {
      localStorage.setItem(config.storage.user, JSON.stringify({
        user,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  },
  
  getAuthData: (): { user: User | null; timestamp: number } => {
    try {
      const data = localStorage.getItem(config.storage.user);
      if (!data) return { user: null, timestamp: 0 };
      
      const parsed = JSON.parse(data);
      return parsed;
    } catch (error) {
      console.error('Error reading auth data:', error);
      return { user: null, timestamp: 0 };
    }
  },
  
  clearAuthData: () => {
    localStorage.removeItem(config.storage.user);
    localStorage.removeItem(config.storage.auth);
  },
  
  getFavoritesKey: (userId: number | null): string => {
    return userId ? `marusya_favorites_${userId}` : 'marusya_favorites_anonymous';
  },
  
  setFavorites: (userId: number | null, movieIds: number[]) => {
    try {
      const key = storage.getFavoritesKey(userId);
      localStorage.setItem(key, JSON.stringify(movieIds));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  },
  
  getFavorites: (userId: number | null): number[] => {
    try {
      const key = storage.getFavoritesKey(userId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading favorites:', error);
      return [];
    }
  },
  
  clearFavorites: (userId: number | null) => {
    const key = storage.getFavoritesKey(userId);
    localStorage.removeItem(key);
  },
  
  migrateOldFavorites: (): void => {
    try {
      const oldFavorites = localStorage.getItem('marusya_favorites');
      if (oldFavorites) {
        console.log('[Storage] Migrating old favorites data...');
        
        localStorage.setItem('marusya_favorites_anonymous', oldFavorites);
        
        const authData = storage.getAuthData();
        if (authData.user?.id) {
          localStorage.setItem(`marusya_favorites_${authData.user.id}`, oldFavorites);
        }
        
        localStorage.removeItem('marusya_favorites');
        console.log('[Storage] Migration complete');
      }
    } catch (error) {
      console.error('Error migrating favorites:', error);
    }
  },
  
  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem(config.storage.theme, theme);
  },
  
  getTheme: (): 'light' | 'dark' => {
    return (localStorage.getItem(config.storage.theme) as 'light' | 'dark') || 'dark';
  },
  
  setToken: (token: string) => {
    try {
      localStorage.setItem(config.storage.auth, JSON.stringify({ token }));
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },
  
  getToken: (): string | null => {
    try {
      const data = localStorage.getItem(config.storage.auth);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      return parsed.token || null;
    } catch (error) {
      console.error('Error reading token:', error);
      return null;
    }
  },
  
  clearToken: () => {
    localStorage.removeItem(config.storage.auth);
  },
  
  clearAll: () => {
    localStorage.removeItem(config.storage.user);
    localStorage.removeItem(config.storage.auth);
  }
};