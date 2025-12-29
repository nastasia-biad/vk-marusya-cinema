import { AppDispatch } from '../store';
import { apiService } from '../services/apiServices';


export const syncFavorites = async (dispatch: AppDispatch, userId?: number): Promise<number[]> => {
  try {
    const savedFavorites = localStorage.getItem('marusya_favorites');
    const localFavorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    
    if (userId) {
      try {
        const serverFavorites = await apiService.getFavorites();
        const serverFavoriteIds = serverFavorites.map((movie: any) => movie.id);
        
        const localSet = new Set(localFavorites);
        const serverSet = new Set(serverFavoriteIds);
        
        const toAdd = localFavorites.filter((id: number) => !serverSet.has(id));
        const toRemove = serverFavoriteIds.filter((id: number) => !localSet.has(id));
        
        const mergedFavorites = Array.from(new Set([...localFavorites, ...serverFavoriteIds]));
        
        await syncWithServer(toAdd, toRemove);
        
        localStorage.setItem('marusya_favorites', JSON.stringify(mergedFavorites));
        
        return mergedFavorites;
        
      } catch (serverError) {
        console.error('Error syncing with server:', serverError);
        return localFavorites;
      }
    } else {
      return localFavorites;
    }
  } catch (error) {
    console.error('Error in favorites sync:', error);
    return [];
  }
};


const syncWithServer = async (toAdd: number[], toRemove: number[]): Promise<void> => {
  try {
    const addPromises = toAdd.map(movieId => 
      apiService.addToFavorites(movieId).catch(error => {
        console.error(`Error adding movie ${movieId} to favorites:`, error);
        return null;
      })
    );
    
    const removePromises = toRemove.map(movieId => 
      apiService.removeFromFavorites(movieId).catch(error => {
        console.error(`Error removing movie ${movieId} from favorites:`, error);
        return null;
      })
    );
    
    await Promise.all([...addPromises, ...removePromises]);
  } catch (error) {
    console.error('Error in server sync:', error);
  }
};


export const restoreFavorites = (): number[] => {
  try {
    const savedFavorites = localStorage.getItem('marusya_favorites');
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites);
      if (Array.isArray(favorites)) {
        return favorites;
      }
    }
  } catch (error) {
    console.error('Error restoring favorites:', error);
  }
  return [];
};


export const clearFavorites = (): void => {
  localStorage.removeItem('marusya_favorites');
};

export const isMovieFavorite = (movieId: number): boolean => {
  try {
    const savedFavorites = localStorage.getItem('marusya_favorites');
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites);
      return Array.isArray(favorites) && favorites.includes(movieId);
    }
  } catch (error) {
    console.error('Error checking if movie is favorite:', error);
  }
  return false;
};


export const getCurrentFavorites = (): number[] => {
  try {
    const savedFavorites = localStorage.getItem('marusya_favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  } catch {
    return [];
  }
};


export const saveFavorites = (favorites: number[]): void => {
  try {
    localStorage.setItem('marusya_favorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
};