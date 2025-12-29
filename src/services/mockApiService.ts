import { config } from '../config';
import { User, Movie, Genre, LoginData, RegisterData, AuthResponse } from '../types';
import { mockGenres, allMovies } from '../data/mocData';
import { storage } from '../utils/storage';

export const mockApiService = {
  checkHealth: async (): Promise<boolean> => {
    return true;
  },
  
  login: async (data: LoginData): Promise<AuthResponse> => {
    console.log('[Mock API] Login with:', { ...data, password: '***' });
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user: User = {
      id: Date.now(),
      firstName: data.email.split('@')[0],
      lastName: 'User',
      email: data.email,
      favoriteMovies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const userFavorites = storage.getFavorites(user.id);
    if (userFavorites.length > 0) {
      user.favoriteMovies = userFavorites;
      console.log(`[Mock API] Restored ${userFavorites.length} favorites for user ${user.id}`);
    }
    
    localStorage.setItem(config.storage.user, JSON.stringify(user));
    localStorage.setItem(config.storage.auth, 'true');
    
    console.log('[Mock API] Login successful:', user);
    return { user, token: 'mock-token-' + Date.now() };
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    console.log('[Mock API] Register with:', { ...data, password: '***' });
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user: User = {
      id: Date.now(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      favoriteMovies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(config.storage.user, JSON.stringify(user));
    localStorage.setItem(config.storage.auth, 'true');
    
    console.log('[Mock API] Register successful:', user);
    return { user, token: 'mock-token-' + Date.now() };
  },
  
  logout: async (): Promise<void> => {
    console.log('[Mock API] Logout');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    localStorage.removeItem(config.storage.user);
    localStorage.removeItem(config.storage.auth);
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    console.log('[Mock API] Get current user');
    
    try {
      const storedUser = localStorage.getItem(config.storage.user);
      const storedAuth = localStorage.getItem(config.storage.auth);
      
      if (storedUser && storedAuth === 'true') {
        const user = JSON.parse(storedUser);
        console.log('[Mock API] User found:', user);
        return user;
      }
      
      console.log('[Mock API] No authenticated user found');
      return null;
    } catch (error) {
      console.error('[Mock API] Error getting current user:', error);
      return null;
    }
  },
  
  // Фильмы
  getRandomMovie: async (): Promise<Movie> => {
    console.log('[Mock API] Get random movie');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const movies = allMovies;
    const randomIndex = Math.floor(Math.random() * movies.length);
    return movies[randomIndex];
  },
  
  getTopMovies: async (): Promise<Movie[]> => {
    console.log('[Mock API] Get top movies');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const movies = [...allMovies];
    return movies.sort((a, b) => b.rating - a.rating).slice(0, 10);
  },
  
  getMovie: async (id: number): Promise<Movie> => {
    console.log(`[Mock API] Get movie ${id}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const movie = allMovies.find(m => m.id === id);
    if (!movie) {
      throw new Error(`Фильм с ID ${id} не найден`);
    }
    return movie;
  },
  
  searchMovies: async (query: string): Promise<Movie[]> => {
    console.log(`[Mock API] Search movies: "${query}"`);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    const movies = allMovies.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm) ||
      movie.description.toLowerCase().includes(searchTerm) ||
      movie.genre.some(genre => genre.toLowerCase().includes(searchTerm))
    );
    
    return movies.slice(0, 20); 
  },
  
  getMoviesByGenre: async (genreId: number, page: number = 1, limit: number = 10): Promise<{ movies: Movie[], total: number, hasMore: boolean }> => {
    console.log(`[Mock API] Get movies for genre ${genreId}, page ${page}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const genre = mockGenres.find(g => g.id === genreId);
    if (!genre) {
      return { movies: [], total: 0, hasMore: false };
    }
    
    const allGenreMovies = allMovies.filter(movie =>
      movie.genre.some(g => g.toLowerCase() === genre.name.toLowerCase())
    );
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const movies = allGenreMovies.slice(startIndex, endIndex);
    
    const total = allGenreMovies.length;
    const hasMore = endIndex < total;
    
    return {
      movies,
      total,
      hasMore
    };
  },
  
  // Жанры
  getGenres: async (): Promise<Genre[]> => {
    console.log('[Mock API] Get genres');
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockGenres;
  },
  
  getFavorites: async (): Promise<Movie[]> => {
    console.log('[Mock API] Get favorites');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      const currentUser = await mockApiService.getCurrentUser();
      const userId = currentUser?.id || null;
      
      const favoriteIds = storage.getFavorites(userId);
      
      if (favoriteIds.length === 0) return [];
      
      return allMovies.filter(movie => favoriteIds.includes(movie.id));
    } catch (error) {
      console.error('[Mock API] Error getting favorites:', error);
      return [];
    }
  },
  
  addToFavorites: async (movieId: number): Promise<void> => {
    console.log(`[Mock API] Add movie ${movieId} to favorites`);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      const currentUser = await mockApiService.getCurrentUser();
      const userId = currentUser?.id || null;
      
      const favoriteIds = storage.getFavorites(userId);
      
      if (!favoriteIds.includes(movieId)) {
        favoriteIds.push(movieId);
        storage.setFavorites(userId, favoriteIds);
        console.log(`[Mock API] Movie ${movieId} added to favorites for user ${userId || 'anonymous'}`);
      }
    } catch (error) {
      console.error('[Mock API] Error adding to favorites:', error);
      throw error;
    }
  },
  
  removeFromFavorites: async (movieId: number): Promise<void> => {
    console.log(`[Mock API] Remove movie ${movieId} from favorites`);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      const currentUser = await mockApiService.getCurrentUser();
      const userId = currentUser?.id || null;
      
      const favoriteIds = storage.getFavorites(userId);
      const updatedFavorites = favoriteIds.filter((id: number) => id !== movieId);
      
      storage.setFavorites(userId, updatedFavorites);
      console.log(`[Mock API] Movie ${movieId} removed from favorites for user ${userId || 'anonymous'}`);
    } catch (error) {
      console.error('[Mock API] Error removing from favorites:', error);
      throw error;
    }
  }
};

export default mockApiService;