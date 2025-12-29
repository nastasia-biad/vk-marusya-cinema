import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Movie } from '../../types';

interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
}

interface UiState {
  isTrailerModalOpen: boolean;
  isAuthModalOpen: boolean;
  isSearchModalOpen: boolean;
  isSearchDropdownOpen: boolean;
  searchQuery: string;
  searchResults: Movie[];
  currentTrailerUrl: string | null;
  notification: Notification | null;
}

const initialState: UiState = {
  isTrailerModalOpen: false,
  isAuthModalOpen: false,
  isSearchModalOpen: false,
  isSearchDropdownOpen: false,
  searchQuery: '',
  searchResults: [],
  currentTrailerUrl: null,
  notification: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Модальные окна
    openTrailerModal: (state, action: PayloadAction<string>) => {
      state.isTrailerModalOpen = true;
      state.currentTrailerUrl = action.payload;
    },
    closeTrailerModal: (state) => {
      state.isTrailerModalOpen = false;
      state.currentTrailerUrl = null;
    },
    openAuthModal: (state) => {
      state.isAuthModalOpen = true;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    openSearchModal: (state) => {
      state.isSearchModalOpen = true;
    },
    closeSearchModal: (state) => {
      state.isSearchModalOpen = false;
      state.searchQuery = '';
      state.searchResults = [];
    },
    
    // Поиск
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<Movie[]>) => {
      state.searchResults = action.payload;
    },
    openSearchDropdown: (state) => {
      state.isSearchDropdownOpen = true;
    },
    closeSearchDropdown: (state) => {
      state.isSearchDropdownOpen = false;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
      state.isSearchDropdownOpen = false;
    },
    
    // Уведомления
    setNotification: (state, action: PayloadAction<Notification>) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    setSuccess: (state, action: PayloadAction<string>) => {
      state.notification = {
        type: 'success',
        message: action.payload,
      };
    },
    setError: (state, action: PayloadAction<string>) => {
      state.notification = {
        type: 'error',
        message: action.payload,
      };
    },
    setWarning: (state, action: PayloadAction<string>) => {
      state.notification = {
        type: 'warning',
        message: action.payload,
      };
    },
    setInfo: (state, action: PayloadAction<string>) => {
      state.notification = {
        type: 'info',
        message: action.payload,
      };
    },
  },
});

export const {
  openTrailerModal,
  closeTrailerModal,
  openAuthModal,
  closeAuthModal,
  openSearchModal,
  closeSearchModal,
  setSearchQuery,
  setSearchResults,
  openSearchDropdown,
  closeSearchDropdown,
  clearSearch,
  setNotification,
  clearNotification,
  setSuccess,
  setError,
  setWarning,
  setInfo,
} = uiSlice.actions;

export default uiSlice.reducer;