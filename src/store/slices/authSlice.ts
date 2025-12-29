import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { apiService } from '../../services/apiServices';
import { setSuccess, setError as setUiError } from './uiSlice';
import { storage } from '../../utils/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiService.login(data);
      
      const userFavorites = storage.getFavorites(response.user.id);
      if (userFavorites.length > 0) {
        response.user.favoriteMovies = userFavorites;
        console.log(`Favorites restored for user ${response.user.id}:`, userFavorites);
      }
      
      dispatch(setSuccess('Вход выполнен успешно!'));
      return response.user;
    } catch (error: any) {
      const message = error.message || 'Ошибка авторизации';
      dispatch(setUiError(message));
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: { firstName: string; lastName: string; email: string; password: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiService.register(data);
      dispatch(setSuccess('Регистрация успешно завершена!'));
      return response.user;
    } catch (error: any) {
      const message = error.message || 'Ошибка регистрации';
      dispatch(setUiError(message));
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await apiService.logout();
      dispatch(setSuccess('Вы успешно вышли из системы'));
      return null;
    } catch (error: any) {
      const message = error.message || 'Ошибка выхода';
      dispatch(setUiError(message));
      return rejectWithValue(message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const user = await apiService.getCurrentUser();
      return user;
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Auth check error:', error);
      }
      return rejectWithValue('Пользователь не авторизован');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    restoreUserFromStorage: (state) => {
      const storedUser = localStorage.getItem('marusya_user');
      const storedAuth = localStorage.getItem('marusya_auth');
      
      if (storedUser && storedAuth === 'true') {
        try {
          const user = JSON.parse(storedUser);
          state.user = user;
          state.isAuthenticated = true;
          console.log('User restored from storage:', user);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('marusya_user');
          localStorage.removeItem('marusya_auth');
        }
      }
    },
    
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    
    addToFavorites: (state, action: PayloadAction<number>) => {
      if (state.user) {
        if (!state.user.favoriteMovies) {
          state.user.favoriteMovies = [];
        }
        
        if (!state.user.favoriteMovies.includes(action.payload)) {
          state.user.favoriteMovies.push(action.payload);
          
          storage.setFavorites(state.user.id, state.user.favoriteMovies);
          
          localStorage.setItem('marusya_user', JSON.stringify(state.user));
        }
      } else {
        const anonymousFavorites = storage.getFavorites(null);
        if (!anonymousFavorites.includes(action.payload)) {
          anonymousFavorites.push(action.payload);
          storage.setFavorites(null, anonymousFavorites);
        }
      }
    },
    
    removeFromFavorites: (state, action: PayloadAction<number>) => {
      if (state.user && state.user.favoriteMovies) {
        state.user.favoriteMovies = state.user.favoriteMovies.filter(id => id !== action.payload);
        
        storage.setFavorites(state.user.id, state.user.favoriteMovies);
        
        localStorage.setItem('marusya_user', JSON.stringify(state.user));
      } else {
        const anonymousFavorites = storage.getFavorites(null);
        const updatedFavorites = anonymousFavorites.filter(id => id !== action.payload);
        storage.setFavorites(null, updatedFavorites);
      }
    },
    
    restoreFavorites: (state) => {
      storage.migrateOldFavorites();
      
      if (state.user && state.user.id) {
        const userFavorites = storage.getFavorites(state.user.id);
        if (userFavorites.length > 0) {
          console.log(`Favorites restored for user ${state.user.id}:`, userFavorites);
          state.user.favoriteMovies = userFavorites;
        }
      } else {
        const anonymousFavorites = storage.getFavorites(null);
        console.log('Anonymous favorites restored:', anonymousFavorites);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        
        localStorage.setItem('marusya_user', JSON.stringify(action.payload));
        localStorage.setItem('marusya_auth', 'true');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        
        localStorage.setItem('marusya_user', JSON.stringify(action.payload));
        localStorage.setItem('marusya_auth', 'true');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        
        localStorage.removeItem('marusya_user');
        localStorage.removeItem('marusya_auth');
        localStorage.removeItem('marusya_token');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        
        localStorage.setItem('marusya_user', JSON.stringify(action.payload));
        localStorage.setItem('marusya_auth', 'true');
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { 
  clearError, 
  restoreUserFromStorage, 
  setUser, 
  addToFavorites, 
  removeFromFavorites,
  restoreFavorites 
} = authSlice.actions;

export default authSlice.reducer;