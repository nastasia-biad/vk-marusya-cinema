import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/apiServices';
import { useAppDispatch } from './redux';
import { openAuthModal, setSuccess, setWarning, setInfo } from '../store/slices/uiSlice';
import { Movie, Genre, User, LoginData, RegisterData, AuthResponse } from '../types';


interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  autoFetch?: boolean;
  showLoading?: boolean;
  showError?: boolean;
  successMessage?: string;
}

interface UseApiResult<T, P extends any[]> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  execute: (...args: P) => Promise<T | undefined>;
  reset: () => void;
  reload: () => void;
}

const handleApiError = (error: any): string => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return error.response.data?.message || 'Некорректный запрос';
      case 401:
        return 'Неавторизованный доступ. Пожалуйста, войдите в систему';
      case 403:
        return 'Доступ запрещен';
      case 404:
        return 'Ресурс не найден';
      case 409:
        return 'Конфликт данных';
      case 422:
        return 'Ошибка валидации данных';
      case 500:
        return 'Внутренняя ошибка сервера';
      default:
        return error.response.data?.message || `Ошибка сервера: ${error.response.status}`;
    }
  } else if (error.request) {
    return 'Нет ответа от сервера. Проверьте подключение к интернету';
  } else {
    return error.message || 'Ошибка при выполнении запроса';
  }
};

const isNetworkError = (error: any): boolean => {
  return !error.response && error.request;
};

const isAuthError = (error: any): boolean => {
  return error.response?.status === 401;
};

export function useApi<T, P extends any[] = []>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T, P> {
  const {
    initialData,
    onSuccess,
    onError,
    autoFetch = false,
    showLoading = true,
    showError = true,
    successMessage,
  } = options;

  const dispatch = useAppDispatch();
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [executionCount, setExecutionCount] = useState(0);

  const execute = useCallback(async (...args: P): Promise<T | undefined> => {
    if (showLoading) {
      setLoading(true);
    }
    setLocalError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
      onSuccess?.(result);

      if (showError && successMessage) {
        dispatch(setSuccess(successMessage));
      }

      return result;
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      setLocalError(errorMessage);

      if (showError) {
        const isAuthErr = isAuthError(err);
        if (isAuthErr) {
          dispatch(setWarning(errorMessage));
        } else {
          dispatch(setInfo(errorMessage));
        }
      }

      onError?.(errorMessage);

      if (isAuthError(err)) {
        dispatch(openAuthModal());
      }

      return undefined;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [apiFunction, onSuccess, onError, showLoading, showError, successMessage, dispatch]);

  const reset = useCallback(() => {
    setData(initialData);
    setLocalError(null);
    setLoading(false);
  }, [initialData]);

  const reload = useCallback(() => {
    setExecutionCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      execute(...([] as unknown as P));
    }
  }, [autoFetch, execute, executionCount]);

  return {
    data,
    loading,
    error: localError,
    execute,
    reset,
    reload,
  };
}

export function useMovies() {
  const useTopMovies = () => useApi(
    () => apiService.getTopMovies(),
    {
      autoFetch: true,
      initialData: [],
      showError: true,
    }
  );

  const useRandomMovie = () => useApi(
    () => apiService.getRandomMovie(),
    {
      autoFetch: true,
      showError: true,
    }
  );

  const useMovieById = (id?: number) => useApi(
    () => {
      if (!id) throw new Error('ID фильма не указан');
      return apiService.getMovie(id);
    },
    {
      autoFetch: !!id,
      showError: true,
    }
  );

  const useMoviesByGenre = (genreId?: number) => useApi<
    { movies: Movie[]; total: number; hasMore: boolean },
    [number?, number?, number?]
  >(
    (genreId?: number, page?: number, limit?: number) => {
      if (!genreId) throw new Error('Жанр не указан');
      return apiService.getMoviesByGenre(genreId, page, limit);
    },
    {
      autoFetch: !!genreId,
      initialData: { movies: [], total: 0, hasMore: false },
      showError: true,
    }
  );

  const useSearchMovies = () => {
    const [query, setQuery] = useState('');
    const searchResult = useApi(
      () => {
        if (!query.trim()) return Promise.resolve([]);
        return apiService.searchMovies(query);
      },
      {
        autoFetch: false,
        initialData: [],
        showError: true,
      }
    );

    const search = useCallback((searchQuery: string) => {
      setQuery(searchQuery);
      if (searchQuery.trim()) {
        searchResult.execute();
      } else {
        searchResult.reset();
      }
    }, [searchResult]);

    return {
      ...searchResult,
      search,
      query,
    };
  };

  return {
    useTopMovies,
    useRandomMovie,
    useMovieById,
    useMoviesByGenre,
    useSearchMovies,
  };
}

export function useFavorites() {
  const dispatch = useAppDispatch();

  const useGetFavorites = () => useApi(
    () => apiService.getFavorites(),
    {
      autoFetch: true,
      initialData: [],
      showError: true,
    }
  );

  const useAddToFavorites = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const add = useCallback(async (movieId: number) => {
      setLoading(true);
      setError(null);

      try {
        await apiService.addToFavorites(movieId);

        dispatch(setSuccess('Фильм добавлен в избранное'));

        return true;
      } catch (err: any) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);

        dispatch(setWarning(errorMessage));

        return false;
      } finally {
        setLoading(false);
      }
    }, [dispatch]);

    return { add, loading, error };
  };

  const useRemoveFromFavorites = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const remove = useCallback(async (movieId: number) => {
      setLoading(true);
      setError(null);

      try {
        await apiService.removeFromFavorites(movieId);

        dispatch(setSuccess('Фильм удален из избранного'));

        return true;
      } catch (err: any) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);

        dispatch(setWarning(errorMessage));

        return false;
      } finally {
        setLoading(false);
      }
    }, [dispatch]);

    return { remove, loading, error };
  };

  const useToggleFavorite = () => {
    const { add, loading: addLoading, error: addError } = useAddToFavorites();
    const { remove, loading: removeLoading, error: removeError } = useRemoveFromFavorites();
    const [isLoading, setIsLoading] = useState(false);

    const toggle = useCallback(async (movieId: number, isCurrentlyFavorite: boolean) => {
      setIsLoading(true);
      try {
        if (isCurrentlyFavorite) {
          return await remove(movieId);
        } else {
          return await add(movieId);
        }
      } finally {
        setIsLoading(false);
      }
    }, [add, remove]);

    return {
      toggle,
      loading: isLoading || addLoading || removeLoading,
      error: addError || removeError,
    };
  };

  return {
    useGetFavorites,
    useAddToFavorites,
    useRemoveFromFavorites,
    useToggleFavorite,
  };
}

export function useGenres() {
  return useApi(
    () => apiService.getGenres(),
    {
      autoFetch: true,
      initialData: [],
      showError: true,
    }
  );
}

export function useAuth() {
  const dispatch = useAppDispatch();

  const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const user = await apiService.login({ email, password });

        dispatch(setSuccess('Вы успешно вошли в систему'));

        return user;
      } catch (err: any) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);

        dispatch(setWarning(errorMessage));

        throw err;
      } finally {
        setLoading(false);
      }
    }, [dispatch]);

    return { login, loading, error };
  };

  const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const register = useCallback(async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const user = await apiService.register(data);

        dispatch(setSuccess('Регистрация успешно завершена'));

        return user;
      } catch (err: any) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);

        dispatch(setWarning(errorMessage));

        throw err;
      } finally {
        setLoading(false);
      }
    }, [dispatch]);

    return { register, loading, error };
  };

  const useLogout = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const logout = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        await apiService.logout();

        dispatch(setSuccess('Вы успешно вышли из системы'));

        return true;
      } catch (err: any) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);

        dispatch(setWarning(errorMessage));

        return false;
      } finally {
        setLoading(false);
      }
    }, [dispatch]);

    return { logout, loading, error };
  };

  const useCheckAuth = () => {
    return useApi(
      () => apiService.getCurrentUser(),
      {
        autoFetch: true,
        showLoading: false,
        showError: false,
      }
    );
  };

  return {
    useLogin,
    useRegister,
    useLogout,
    useCheckAuth,
  };
}

export function useAppApi() {
  const movies = useMovies();
  const favorites = useFavorites();
  const genres = useGenres();
  const auth = useAuth();

  return {
    movies,
    favorites,
    genres,
    auth,
  };
}

export function useLoadingManager() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const startLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingStates[key] || false;
    }
    return Object.values(loadingStates).some(state => state);
  }, [loadingStates]);

  const clearLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    startLoading,
    stopLoading,
    isLoading,
    loadingStates,
    clearLoading,
  };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useInfiniteScroll<T>(
  fetchMore: () => Promise<void>,
  hasMore: boolean,
  isLoading: boolean,
  threshold: number = 100
) {
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.scrollHeight - threshold &&
        hasMore &&
        !isLoading
      ) {
        fetchMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchMore, hasMore, isLoading, threshold]);
}