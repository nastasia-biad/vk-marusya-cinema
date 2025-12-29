import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useErrorHandler } from '../utils/errorHandler';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Хук для проверки авторизации
export const useAuth = () => {
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  return {
    isAuthenticated,
    user,
    isLoading,
    dispatch,
  };
};

// Хук для управления фильмами
export const useMovies = () => {
  const { randomMovie, topMovies, genres, searchedMovies, favoriteMovies, isLoading } = useAppSelector((state) => state.movies);
  const dispatch = useAppDispatch();
  
  return {
    randomMovie,
    topMovies,
    genres,
    searchedMovies,
    favoriteMovies,
    isLoading,
    dispatch,
  };
};

// Хук для управления UI
export const useUI = () => {
  const { 
    isAuthModalOpen, 
    isTrailerModalOpen, 
    isSearchModalOpen,
    searchQuery,
    searchResults,
    isSearchDropdownOpen,
    currentTrailerUrl,
    notification 
  } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  
  return {
    isAuthModalOpen,
    isTrailerModalOpen,
    isSearchModalOpen,
    searchQuery,
    searchResults,
    isSearchDropdownOpen,
    currentTrailerUrl,
    notification,
    dispatch,
  };
};

export { useErrorHandler };