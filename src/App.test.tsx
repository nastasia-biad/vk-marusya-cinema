import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import authReducer from './store/slices/authSlice';
import moviesReducer from './store/slices/moviesSlice';
import uiReducer from './store/slices/uiSlice';

jest.mock('./pages/Home/Home', () => () => <div data-testid="home-page">Home Page</div>);
jest.mock('./pages/Genres/Genres', () => () => <div>Genres Page</div>);
jest.mock('./pages/GenreMovies/GenreMovies', () => () => <div>Genre Movies Page</div>);
jest.mock('./pages/MoviePage/MoviePage', () => () => <div>Movie Page</div>);
jest.mock('./pages/AccountPage/AccountPage', () => () => <div>Account Page</div>);

jest.mock('./components/common/Modal/AuthModal', () => () => null);
jest.mock('./components/common/Modal/TrailerModal', () => () => null);
jest.mock('./components/common/Modal/SearchModal', () => () => null);
jest.mock('./components/common/Toast/Toast', () => () => null);

jest.mock('./services/apiServices', () => ({
  apiService: {
    getCurrentUser: jest.fn().mockResolvedValue(null),
  },
}));

const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      movies: moviesReducer,
      ui: uiReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
      movies: {
        randomMovie: null,
        topMovies: [],
        genres: [],
        searchedMovies: [],
        favoriteMovies: [],
        isLoading: false,
        error: null,
      },
      ui: {
        isTrailerModalOpen: false,
        isAuthModalOpen: false,
        isSearchModalOpen: false,
        isSearchDropdownOpen: false,
        searchQuery: '',
        searchResults: [],
        currentTrailerUrl: null,
        notification: null,
      },
      ...preloadedState,
    },
  });
};

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders app without crashing', async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  test('shows loading overlay when loading', () => {
    const store = createMockStore({
      auth: { isLoading: true },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });
});