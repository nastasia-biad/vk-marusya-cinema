import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Movie, Genre } from '../../types';
import { apiService } from '../../services/apiServices';
import { setError as setUiError } from './uiSlice';

interface MoviesState {
  randomMovie: Movie | null;
  topMovies: Movie[];
  genres: Genre[];
  searchedMovies: Movie[];
  favoriteMovies: number[]; 
  isLoading: boolean;
  error: string | null;
}

const initialState: MoviesState = {
  randomMovie: null,
  topMovies: [],
  genres: [],
  searchedMovies: [],
  favoriteMovies: [], 
  isLoading: false,
  error: null,
};

// Thunks
export const fetchRandomMovie = createAsyncThunk(
  'movies/fetchRandomMovie',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      return await apiService.getRandomMovie();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка загрузки случайного фильма';
      dispatch(setUiError(message));
      return rejectWithValue(message);
    }
  }
);

export const fetchTopMovies = createAsyncThunk(
  'movies/fetchTopMovies',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      return await apiService.getTopMovies();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка загрузки топ фильмов';
      dispatch(setUiError(message));
      return rejectWithValue(message);
    }
  }
);

export const fetchGenres = createAsyncThunk(
  'movies/fetchGenres',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      return await apiService.getGenres();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка загрузки жанров';
      dispatch(setUiError(message));
      return rejectWithValue(message);
    }
  }
);

export const searchMovies = createAsyncThunk(
  'movies/searchMovies',
  async (query: string, { dispatch, rejectWithValue }) => {
    try {
      if (!query.trim()) return [];
      return await apiService.searchMovies(query);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка поиска фильмов';
      dispatch(setUiError(message));
      return rejectWithValue(message);
    }
  }
);

export const fetchMovieById = createAsyncThunk(
  'movies/fetchMovieById',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      return await apiService.getMovie(id);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Фильм не найден';
      dispatch(setUiError(message));
      return rejectWithValue(message);
    }
  }
);

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchedMovies = [];
    },
    setRandomMovie: (state, action: PayloadAction<Movie>) => {
      state.randomMovie = action.payload;
    },
    restoreLocalFavorites: (state) => {
      const savedFavorites = localStorage.getItem('marusya_favorites');
      if (savedFavorites) {
        try {
          const favorites = JSON.parse(savedFavorites);

        } catch (error) {
          console.error('Error parsing saved favorites:', error);
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRandomMovie.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRandomMovie.fulfilled, (state, action) => {
        state.isLoading = false;
        state.randomMovie = action.payload;
      })
      .addCase(fetchRandomMovie.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      .addCase(fetchTopMovies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTopMovies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topMovies = action.payload;
      })
      .addCase(fetchTopMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      .addCase(fetchGenres.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGenres.fulfilled, (state, action) => {
        state.isLoading = false;
        state.genres = action.payload;
      })
      .addCase(fetchGenres.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      .addCase(searchMovies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchedMovies = action.payload;
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      .addCase(fetchMovieById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMovieById.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.randomMovie?.id === action.payload.id) {
          state.randomMovie = action.payload;
        }
      })
      .addCase(fetchMovieById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearSearchResults,
  setRandomMovie,
} = moviesSlice.actions;

export default moviesSlice.reducer;