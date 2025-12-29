import { config } from '../config';
import { realApiService } from './realApiService';
import { mockApiService } from './mockApiService';
import { User, Movie, Genre, LoginData, RegisterData, AuthResponse } from '../types';
import { storage } from '../utils/storage';

const PRIORITIZE_MOCK_DATA = true;

let apiAvailabilityCache = {
  lastCheck: 0,
  isAvailable: false,
  cacheDuration: 30000 
};

export const adaptiveApiService = {
  checkRealApiAvailability: async (forceCheck: boolean = false): Promise<boolean> => {
    console.debug('[Adaptive API] Using baseURL:', config.api.baseURL);
    const now = Date.now();

    if (!forceCheck && now - apiAvailabilityCache.lastCheck < apiAvailabilityCache.cacheDuration) {
      return apiAvailabilityCache.isAvailable;
    }

    try {
      const isAvailable = await realApiService.checkHealth();
      apiAvailabilityCache = {
        lastCheck: now,
        isAvailable,
        cacheDuration: isAvailable ? 60000 : 10000 
      };

      console.log(`[Adaptive API] Health check: ${isAvailable ? 'Available' : 'Unavailable'}`);
      return isAvailable;
    } catch (error) {
      apiAvailabilityCache = {
        lastCheck: now,
        isAvailable: false,
        cacheDuration: 10000
      };
      console.warn('[Adaptive API] Health check failed:', error);
      return false;
    }
  },

  // Авторизация
  login: async (data: LoginData): Promise<AuthResponse> => {
    const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();

    if (isApiAvailable) {
      try {
        console.log('[Adaptive API] Using real API for login');
        return await realApiService.login(data);
      } catch (error) {
        console.warn('[Adaptive API] Real API login failed, using mock data:', error);
        return await mockApiService.login(data);
      }
    } else {
      console.warn('[Adaptive API] Real API unavailable, using mock login');
      return await mockApiService.login(data);
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();

    if (isApiAvailable) {
      try {
        console.log('[Adaptive API] Using real API for register');
        return await realApiService.register(data);
      } catch (error) {
        console.warn('[Adaptive API] Real API register failed, using mock data:', error);
        return await mockApiService.register(data);
      }
    } else {
      console.warn('[Adaptive API] Real API unavailable, using mock register');
      return await mockApiService.register(data);
    }
  },

  logout: async (): Promise<void> => {
    const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();

    if (isApiAvailable) {
      try {
        console.log('[Adaptive API] Using real API for logout');
        await realApiService.logout();
      } catch (error) {
        console.warn('[Adaptive API] Real API logout failed, using mock:', error);
        await mockApiService.logout();
      }
    } else {
      console.warn('[Adaptive API] Real API unavailable, using mock logout');
      await mockApiService.logout();
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();

    if (isApiAvailable) {
      try {
        console.log('[Adaptive API] Using real API for getCurrentUser');
        return await realApiService.getCurrentUser();
      } catch (error) {
        console.warn('[Adaptive API] Real API getCurrentUser failed, using mock:', error);
        return await mockApiService.getCurrentUser();
      }
    } else {
      console.warn('[Adaptive API] Real API unavailable, using mock getCurrentUser');
      return await mockApiService.getCurrentUser();
    }
  },

  // Фильмы
  getRandomMovie: async (): Promise<Movie> => {
    if (PRIORITIZE_MOCK_DATA) {
      try {
        console.log('[Adaptive API] Priority: using mock getRandomMovie');
        return await mockApiService.getRandomMovie();
      } catch (mockError) {
        console.warn('[Adaptive API] Mock getRandomMovie failed, trying real API:', mockError);
        try {
          const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();
          if (isApiAvailable) {
            console.log('[Adaptive API] Using real API as fallback for getRandomMovie');
            return await realApiService.getRandomMovie();
          }
        } catch (apiError) {
          console.warn('[Adaptive API] Real API also failed for getRandomMovie');
          throw mockError;
        }
        throw mockError;
      }
    }

    const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();

    if (isApiAvailable) {
      try {
        console.log('[Adaptive API] Using real API for getRandomMovie');
        return await realApiService.getRandomMovie();
      } catch (error) {
        console.warn('[Adaptive API] Real API getRandomMovie failed, using mock:', error);
        return await mockApiService.getRandomMovie();
      }
    } else {
      console.warn('[Adaptive API] Real API unavailable, using mock getRandomMovie');
      return await mockApiService.getRandomMovie();
    }
  },

  getTopMovies: async (): Promise<Movie[]> => {
    if (PRIORITIZE_MOCK_DATA) {
      try {
        console.log('[Adaptive API] Priority: using mock getTopMovies');
        return await mockApiService.getTopMovies();
      } catch (mockError) {
        console.warn('[Adaptive API] Mock getTopMovies failed, trying real API:', mockError);
        try {
          const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();
          if (isApiAvailable) {
            console.log('[Adaptive API] Using real API as fallback for getTopMovies');
            return await realApiService.getTopMovies();
          }
        } catch (apiError) {
          console.warn('[Adaptive API] Real API also failed for getTopMovies');
          throw mockError;
        }
        throw mockError;
      }
    }

    const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();

    if (isApiAvailable) {
      try {
        console.log('[Adaptive API] Using real API for getTopMovies');
        return await realApiService.getTopMovies();
      } catch (error) {
        console.warn('[Adaptive API] Real API getTopMovies failed, using mock:', error);
        return await mockApiService.getTopMovies();
      }
    } else {
      console.warn('[Adaptive API] Real API unavailable, using mock getTopMovies');
      return await mockApiService.getTopMovies();
    }
  },

  getMovie: async (id: number): Promise<Movie> => {
    if (PRIORITIZE_MOCK_DATA) {
      try {
        console.log(`[Adaptive API] Priority: trying mock getMovie ${id}`);
        return await mockApiService.getMovie(id);
      } catch (mockError) {
        console.warn(`[Adaptive API] Mock getMovie ${id} failed, trying real API`);
        try {
          const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();
          if (isApiAvailable) {
            console.log(`[Adaptive API] Using real API as fallback for getMovie ${id}`);
            return await realApiService.getMovie(id);
          }
        } catch (apiError) {
          console.warn(`[Adaptive API] Real API also failed for getMovie ${id}`);
          throw mockError;
        }
        throw mockError;
      }
    }

    const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();

    if (isApiAvailable) {
      try {
        console.log(`[Adaptive API] Using real API for getMovie ${id}`);
        return await realApiService.getMovie(id);
      } catch (error) {
        console.warn(`[Adaptive API] Real API getMovie ${id} failed, using mock:`, error);
        return await mockApiService.getMovie(id);
      }
    } else {
      console.warn(`[Adaptive API] Real API unavailable, using mock getMovie ${id}`);
      return await mockApiService.getMovie(id);
    }
  },

  searchMovies: async (query: string): Promise<Movie[]> => {
    if (PRIORITIZE_MOCK_DATA) {
      try {
        console.log(`[Adaptive API] Priority: searching mock data for "${query}"`);
        const mockResults = await mockApiService.searchMovies(query);

        if (mockResults.length >= 3) {
          return mockResults;
        }
        console.log(`[Adaptive API] Only ${mockResults.length} results in mock, trying real API`);
        try {
          const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();
          if (isApiAvailable) {
            const apiResults = await realApiService.searchMovies(query);
            const allResults = [...mockResults, ...apiResults]
              .filter((movie, index, self) =>
                self.findIndex(m => m.id === movie.id) === index
              );
            return allResults;
          }
        } catch (apiError) {
          console.warn('[Adaptive API] Real API search failed, returning only mock results');
          return mockResults;
        }
        return mockResults;
      } catch (mockError) {
        console.warn('[Adaptive API] Mock search failed completely, trying real API');
        const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();
        if (isApiAvailable) {
          try {
            return await realApiService.searchMovies(query);
          } catch (apiError) {
            throw mockError;
          }
        }
        throw mockError;
      }
    }

    const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();

    if (isApiAvailable) {
      try {
        console.log(`[Adaptive API] Using real API for searchMovies: "${query}"`);
        return await realApiService.searchMovies(query);
      } catch (error) {
        console.warn(`[Adaptive API] Real API searchMovies failed, using mock:`, error);
        return await mockApiService.searchMovies(query);
      }
    } else {
      console.warn('[Adaptive API] Real API unavailable, using mock searchMovies');
      return await mockApiService.searchMovies(query);
    }
  },

  getMoviesByGenre: async (genreId: number, page: number = 1, limit: number = 10): Promise<{ movies: Movie[], total: number, hasMore: boolean }> => {
    if (PRIORITIZE_MOCK_DATA) {
      try {
        console.log(`[Adaptive API] Priority: using mock getMoviesByGenre: ${genreId}`);
        return await mockApiService.getMoviesByGenre(genreId, page, limit);
      } catch (mockError) {
        console.warn(`[Adaptive API] Mock getMoviesByGenre failed, trying real API`);

        const genres = await adaptiveApiService.getGenres();
        const genre = genres.find(g => g.id === genreId);
        const genreName = genre ? genre.name.toLowerCase() : '';

        if (!genreName) {
          throw mockError;
        }
        try {
          const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();
          if (isApiAvailable) {
            console.log(`[Adaptive API] Using real API as fallback for genre: ${genreName}`);
            return await realApiService.getMoviesByGenre(genreName, page, limit);
          }
        } catch (apiError) {
          console.warn(`[Adaptive API] Real API also failed for getMoviesByGenre`);
          throw mockError;
        }
        throw mockError;
      }
    }

    const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();

    if (isApiAvailable) {
      try {
        const genres = await adaptiveApiService.getGenres();
        const genre = genres.find(g => g.id === genreId);
        const genreName = genre ? genre.name.toLowerCase() : '';

        console.log(`[Adaptive API] Using real API for getMoviesByGenre: ${genreName}, page=${page}`);
        return await realApiService.getMoviesByGenre(genreName, page, limit);
      } catch (error) {
        console.warn(`[Adaptive API] Real API getMoviesByGenre failed, using mock:`, error);
        return await mockApiService.getMoviesByGenre(genreId, page, limit);
      }
    } else {
      console.warn('[Adaptive API] Real API unavailable, using mock getMoviesByGenre');
      return await mockApiService.getMoviesByGenre(genreId, page, limit);
    }
  },

  // Жанры
  getGenres: async (): Promise<Genre[]> => {
    if (PRIORITIZE_MOCK_DATA) {
      try {
        console.log('[Adaptive API] Priority: using mock getGenres');
        const mockGenres = await mockApiService.getGenres();

        if (mockGenres && mockGenres.length > 0) {
          console.log(`[Adaptive API] Found ${mockGenres.length} genres in mock data`);
          return mockGenres;
        }
        console.log('[Adaptive API] No genres in mock data, trying real API');
        const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();
        if (isApiAvailable) {
          try {
            console.log('[Adaptive API] Using real API as fallback for getGenres');
            const apiGenres = await realApiService.getGenres();
            const allGenres = [...mockGenres];
            apiGenres.forEach(apiGenre => {
              if (!allGenres.some(g => g.name.toLowerCase() === apiGenre.name.toLowerCase())) {
                allGenres.push(apiGenre);
              }
            });

            return allGenres;
          } catch (apiError) {
            console.warn('[Adaptive API] Real API getGenres failed:', apiError);
            return mockGenres; 
          }
        }
        return mockGenres;
      } catch (mockError) {
        console.warn('[Adaptive API] Mock getGenres failed:', mockError);
        const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();
        if (isApiAvailable) {
          try {
            return await realApiService.getGenres();
          } catch (apiError) {
            throw mockError;
          }
        }
        throw mockError;
      }
    }

    const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();

    if (isApiAvailable) {
      try {
        console.log('[Adaptive API] Using real API for getGenres');
        return await realApiService.getGenres();
      } catch (error) {
        console.warn('[Adaptive API] Real API getGenres failed, using mock:', error);
        return await mockApiService.getGenres();
      }
    } else {
      console.warn('[Adaptive API] Real API unavailable, using mock getGenres');
      return await mockApiService.getGenres();
    }
  },

  // Избранное
  getFavorites: async (): Promise<Movie[]> => {
    if (PRIORITIZE_MOCK_DATA) {
      try {
        console.log('[Adaptive API] Priority: using mock getFavorites');
        const mockFavorites = await mockApiService.getFavorites();

        if (mockFavorites && mockFavorites.length > 0) {
          console.log(`[Adaptive API] Found ${mockFavorites.length} favorites in mock data`);
          return mockFavorites;
        }
        console.log('[Adaptive API] No favorites in mock data, trying real API');
        const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();
        if (isApiAvailable) {
          try {
            console.log('[Adaptive API] Using real API as fallback for getFavorites');
            const apiFavorites = await realApiService.getFavorites();

            const allFavorites = [...mockFavorites];
            apiFavorites.forEach(apiMovie => {
              if (!allFavorites.some(m => m.id === apiMovie.id)) {
                allFavorites.push(apiMovie);
              }
            });

            return allFavorites;
          } catch (apiError) {
            console.warn('[Adaptive API] Real API getFavorites failed:', apiError);
            return mockFavorites;
          }
        }
        return mockFavorites;
      } catch (mockError) {
        console.warn('[Adaptive API] Mock getFavorites failed:', mockError);
        const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();
        if (isApiAvailable) {
          try {
            return await realApiService.getFavorites();
          } catch (apiError) {
            throw mockError;
          }
        }
        throw mockError;
      }
    }

    const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();

    if (isApiAvailable) {
      try {
        console.log('[Adaptive API] Using real API for getFavorites');
        return await realApiService.getFavorites();
      } catch (error) {
        console.warn('[Adaptive API] Real API getFavorites failed, using mock:', error);
        return await mockApiService.getFavorites();
      }
    } else {
      console.warn('[Adaptive API] Real API unavailable, using mock getFavorites');
      return await mockApiService.getFavorites();
    }
  },

  addToFavorites: async (movieId: number): Promise<void> => {
    if (PRIORITIZE_MOCK_DATA) {
      try {
        console.log(`[Adaptive API] Priority: saving to mock favorites: ${movieId}`);
        await mockApiService.addToFavorites(movieId);

        const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();
        if (isApiAvailable) {
          try {
            console.log(`[Adaptive API] Syncing with real API for addToFavorites: ${movieId}`);
            await realApiService.addToFavorites(movieId);
          } catch (apiError) {
            console.warn(`[Adaptive API] Real API sync failed for addToFavorites ${movieId}:`, apiError);
          }
        }

        return; 
      } catch (mockError) {
        console.warn(`[Adaptive API] Mock addToFavorites failed for ${movieId}, trying real API:`, mockError);
        const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();
        if (isApiAvailable) {
          try {
            await realApiService.addToFavorites(movieId);
          } catch (apiError) {
            throw mockError; 
          }
        } else {
          throw mockError;
        }
      }
    }

    const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();

    if (isApiAvailable) {
      try {
        console.log(`[Adaptive API] Using real API for addToFavorites: ${movieId}`);
        await realApiService.addToFavorites(movieId);
      } catch (error) {
        console.warn(`[Adaptive API] Real API addToFavorites failed, using mock:`, error);
        await mockApiService.addToFavorites(movieId);
      }
    } else {
      console.warn(`[Adaptive API] Real API unavailable, using mock addToFavorites: ${movieId}`);
      await mockApiService.addToFavorites(movieId);
    }

    try {
      const currentUser = await adaptiveApiService.getCurrentUser();
      const userId = currentUser?.id || null;
      
      const userFavorites = storage.getFavorites(userId);
      if (!userFavorites.includes(movieId)) {
        userFavorites.push(movieId);
        storage.setFavorites(userId, userFavorites);
      }
    } catch (error) {
      console.error('Error updating favorites in localStorage:', error);
    }
  },

  removeFromFavorites: async (movieId: number): Promise<void> => {
    if (PRIORITIZE_MOCK_DATA) {
      try {
        console.log(`[Adaptive API] Priority: removing from mock favorites: ${movieId}`);
        await mockApiService.removeFromFavorites(movieId);

        const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();
        if (isApiAvailable) {
          try {
            console.log(`[Adaptive API] Syncing with real API for removeFromFavorites: ${movieId}`);
            await realApiService.removeFromFavorites(movieId);
          } catch (apiError) {
            console.warn(`[Adaptive API] Real API sync failed for removeFromFavorites ${movieId}:`, apiError);
          }
        }

        return;
      } catch (mockError) {
        console.warn(`[Adaptive API] Mock removeFromFavorites failed for ${movieId}, trying real API:`, mockError);
        const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();
        if (isApiAvailable) {
          try {
            await realApiService.removeFromFavorites(movieId);
          } catch (apiError) {
            throw mockError; 
          }
        } else {
          throw mockError;
        }
      }
    }

    const isApiAvailable = await adaptiveApiService.checkRealApiAvailability();

    if (isApiAvailable) {
      try {
        console.log(`[Adaptive API] Using real API for removeFromFavorites: ${movieId}`);
        await realApiService.removeFromFavorites(movieId);
      } catch (error) {
        console.warn(`[Adaptive API] Real API removeFromFavorites failed, using mock:`, error);
        await mockApiService.removeFromFavorites(movieId);
      }
    } else {
      console.warn(`[Adaptive API] Real API unavailable, using mock removeFromFavorites: ${movieId}`);
      await mockApiService.removeFromFavorites(movieId);
    }

    try {
      const currentUser = await adaptiveApiService.getCurrentUser();
      const userId = currentUser?.id || null;
      
      const userFavorites = storage.getFavorites(userId);
      const updatedFavorites = userFavorites.filter((id: number) => id !== movieId);
      storage.setFavorites(userId, updatedFavorites);
    } catch (error) {
      console.error('Error updating favorites in localStorage:', error);
    }
  },

  forceHealthCheck: async (): Promise<boolean> => {
    return await adaptiveApiService.checkRealApiAvailability(true);
  }
};

export default adaptiveApiService;