import axios from 'axios';
import { config } from '../config';
import { User, Movie, Genre, LoginData, RegisterData, AuthResponse } from '../types';

const realApi = axios.create({
  baseURL: config.api.baseURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

realApi.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Real API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[Real API Request Error]', error);
    return Promise.reject(error);
  }
);

realApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await realApi.post(config.api.endpoints.auth.refresh);
        const newToken = refreshResponse.data.token;

        localStorage.setItem(config.storage.auth, JSON.stringify({
          token: newToken,
          timestamp: Date.now()
        }));

        if (newToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }
        return realApi(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem(config.storage.auth);
        localStorage.removeItem(config.storage.user);
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const handleApiError = (error: any): string => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return error.response.data?.message || 'Некорректный запрос';
      case 401:
        return 'Неавторизованный доступ';
      case 403:
        return 'Доступ запрещен';
      case 404:
        return 'Ресурс не найден';
      case 409:
        return 'Конфликт данных';
      case 422:
        return 'Ошибка валидации данных';
      case 429:
        return 'Слишком много запросов';
      case 500:
        return 'Внутренняя ошибка сервера';
      default:
        return error.response.data?.message || `Ошибка сервера: ${error.response.status}`;
    }
  } else if (error.request) {
    return 'Сервер не отвечает. Проверьте подключение к интернету';
  } else {
    return error.message || 'Ошибка при выполнении запроса';
  }
};

const transformMovie = (apiMovie: any): Movie => {
  let genres: string[] = [];
  if (Array.isArray(apiMovie.genres)) {
    genres = apiMovie.genres;
  } else {
    genres = ['Неизвестно'];
  }

  return {
    id: apiMovie.id || 0,
    title: apiMovie.title || 'Без названия',
    description: apiMovie.plot || 'Описание отсутствует',
    rating: apiMovie.tmdbRating || 0,
    year: apiMovie.releaseYear || 0,
    genre: genres,
    duration: apiMovie.runtime ? `${apiMovie.runtime} мин` : 'Не указано',
    poster: apiMovie.posterUrl || null,
    posterDetail: apiMovie.backdropUrl || apiMovie.posterUrl || null,
    trailer: apiMovie.trailerUrl || '',
    country: apiMovie.countriesOfOrigin ? apiMovie.countriesOfOrigin.join(', ') : 'Не указано',
    director: apiMovie.director || 'Не указано',
    cast: apiMovie.cast || [],
    budget: apiMovie.budget || 'Не указано',
    production: apiMovie.production || 'Не указано',
    boxOffice: apiMovie.revenue || 'Не указано',
    awards: apiMovie.awardsSummary ? [apiMovie.awardsSummary] : [],
    createdAt: apiMovie.createdAt,
    updatedAt: apiMovie.updatedAt
  };
};

const transformGenre = (apiGenre: string): Genre => {
  return {
    id: 0, 
    name: apiGenre,
    image: `/assets/images/genres/${apiGenre.toLowerCase().replace(/\s+/g, '-')}.png`
  };
};

const transformUser = (apiUser: any): User => ({
  id: apiUser.id || 0,
  firstName: apiUser.name || 'Пользователь',
  lastName: apiUser.surname || '',
  email: apiUser.email || '',
  favoriteMovies: apiUser.favorites || [],
  createdAt: apiUser.createdAt,
  updatedAt: apiUser.updatedAt
});

export const realApiService = {
  // Аутентификация
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await realApi.post(config.api.endpoints.auth.login, {
        email: data.email,
        password: data.password
      });

      let user: User;
      let token: string | undefined;

      if (response.data.user) {
        user = transformUser(response.data.user);
        token = response.data.token;
      } else {
        user = transformUser(response.data);
        token = response.data.token;
      }

      localStorage.setItem(config.storage.auth, JSON.stringify({
        token: token || '',
        timestamp: Date.now()
      }));
      localStorage.setItem(config.storage.user, JSON.stringify(user));

      console.log('Real API login successful:', user);
      return { user, token: token || '' };
    } catch (error: any) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await realApi.post(config.api.endpoints.auth.register, data);

      let user: User;
      let token: string | undefined;

      if (response.data.user) {
        user = transformUser(response.data.user);
        token = response.data.token;
      } else {
        user = transformUser(response.data);
        token = response.data.token;
      }

      localStorage.setItem(config.storage.auth, JSON.stringify({
        token,
        timestamp: Date.now()
      }));
      localStorage.setItem(config.storage.user, JSON.stringify(user));

      console.log('Real API register successful:', user);
      return { user, token };
    } catch (error: any) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await realApi.get(config.api.endpoints.auth.logout); 
      console.log('Real API logout successful');
    } catch (error: any) {
      console.warn('Real API logout error:', handleApiError(error));
    } finally {
      localStorage.removeItem(config.storage.auth);
      localStorage.removeItem(config.storage.user);
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await realApi.get(config.api.endpoints.auth.me);
      const user = transformUser(response.data);

      localStorage.setItem(config.storage.user, JSON.stringify(user));

      console.log('Real API getCurrentUser successful:', user);
      return user;
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('User not authenticated');
        localStorage.removeItem(config.storage.auth);
        localStorage.removeItem(config.storage.user);
        return null;
      }

      console.error('Get current user error:', handleApiError(error));
      return null;
    }
  },

  // Фильмы
  getRandomMovie: async (): Promise<Movie> => {
    try {
      const response = await realApi.get(config.api.endpoints.movies.random);
      const movie = transformMovie(response.data);
      console.log('Real API getRandomMovie successful:', movie.title);
      return movie;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  getTopMovies: async (): Promise<Movie[]> => {
    try {
      const response = await realApi.get(config.api.endpoints.movies.top);

      let movies: any[] = [];
      if (Array.isArray(response.data)) {
        movies = response.data;
      } else if (response.data.movies) {
        movies = response.data.movies;
      } else if (response.data.results) {
        movies = response.data.results;
      }

      const transformedMovies = movies.map(transformMovie);
      console.log('Real API getTopMovies successful, found:', transformedMovies.length);
      return transformedMovies;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  getMovie: async (id: number): Promise<Movie> => {
    try {
      const response = await realApi.get(config.api.endpoints.movies.byId(id));
      const movie = transformMovie(response.data);
      console.log('Real API getMovie successful:', movie.title);
      return movie;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  searchMovies: async (query: string): Promise<Movie[]> => {
    try {
      const response = await realApi.get(config.api.endpoints.movies.all, {
        params: {
          search: query 
        }
      });

      let movies: any[] = [];
      if (Array.isArray(response.data)) {
        movies = response.data;
      } else if (response.data.movies) {
        movies = response.data.movies;
      }

      const transformedMovies = movies.map(transformMovie);
      console.log('Real API searchMovies successful, found:', transformedMovies.length);
      return transformedMovies;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },


  getMoviesByGenre: async (genreName: string, page: number = 1, limit: number = 10): Promise<{ movies: Movie[], total: number, hasMore: boolean }> => {
    try {
      const response = await realApi.get(config.api.endpoints.movies.all, {
        params: {
          genres: genreName, 
          page,
          limit
        }
      });

      let movies: any[] = [];
      if (Array.isArray(response.data)) {
        movies = response.data;
      } else if (response.data.movies) {
        movies = response.data.movies;
      }

      const total = response.data.total || movies.length;
      const hasMore = page * limit < total;

      const transformedMovies = movies.map(transformMovie);
      console.log('Real API getMoviesByGenre successful:', {
        genreName,
        page,
        found: transformedMovies.length,
        total,
        hasMore
      });

      return {
        movies: transformedMovies,
        total,
        hasMore
      };
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  // Жанры
  getGenres: async (): Promise<Genre[]> => {
    try {
      const response = await realApi.get(config.api.endpoints.genres);

      let genres: string[] = [];
      if (Array.isArray(response.data)) {
        genres = response.data;
      }

      const transformedGenres = genres.map((genreName, index) => ({
        id: index + 1,
        name: genreName.charAt(0).toUpperCase() + genreName.slice(1), 
        image: `/assets/images/genres/${genreName.toLowerCase().replace(/\s+/g, '-')}.png`
      }));

      console.log('Real API getGenres successful, found:', transformedGenres.length);
      return transformedGenres;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  // Избранное
  getFavorites: async (): Promise<Movie[]> => {
    try {
      const response = await realApi.get(config.api.endpoints.favorites.all);

      let movies: any[] = [];
      if (Array.isArray(response.data)) {
        movies = response.data;
      } else if (response.data.movies) {
        movies = response.data.movies;
      } else if (response.data.favorites) {
        movies = response.data.favorites;
      }

      const transformedMovies = movies.map(transformMovie);
      console.log('Real API getFavorites successful, found:', transformedMovies.length);
      return transformedMovies;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  addToFavorites: async (movieId: number): Promise<void> => {
    try {
      await realApi.post(config.api.endpoints.favorites.add, { movieId });
      console.log('Real API addToFavorites successful for movie:', movieId);
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  removeFromFavorites: async (movieId: number): Promise<void> => {
    try {
      await realApi.delete(config.api.endpoints.favorites.remove(movieId));
      console.log('Real API removeFromFavorites successful for movie:', movieId);
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await realApi.get(config.api.endpoints.genres, {
        timeout: 3000,
        validateStatus: function (status) {
          return status < 500; 
        }
      });

      console.log('[Real API] Health check status:', response.status);
      return true;
    } catch (error: any) {
      console.warn('[Real API] Health check completely failed:', error.message);
      return false;
    }
  },
};

export default realApiService;