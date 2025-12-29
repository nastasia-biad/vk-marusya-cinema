import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MovieCard from './MovieCard';
import authReducer from '../../store/slices/authSlice';


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

const mockMovie = {
  id: 1,
  title: 'Test Movie',
  year: 2023,
  rating: 8.5,
  poster: '/test-poster.jpg',
  genre: ['Драма', 'Комедия'],
};

const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: (state = {}, action) => state,
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
      ...preloadedState,
    },
  });
};

describe('MovieCard Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders movie card with correct information', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <MovieCard
          id={mockMovie.id}
          title={mockMovie.title}
          year={mockMovie.year}
          rating={mockMovie.rating}
          poster={mockMovie.poster}
          genre={mockMovie.genre}
        />
      </Provider>
    );

    expect(screen.getByText(mockMovie.title)).toBeInTheDocument();
    expect(screen.getByText(mockMovie.year.toString())).toBeInTheDocument();
  });

  test('navigates to movie page when clicked', () => {
    const store = createMockStore();

    const { container } = render(
      <Provider store={store}>
        <MovieCard
          id={mockMovie.id}
          title={mockMovie.title}
          year={mockMovie.year}
          rating={mockMovie.rating}
          poster={mockMovie.poster}
          genre={mockMovie.genre}
        />
      </Provider>
    );

    const card = container.querySelector('.movie-card');
    fireEvent.click(card!);

    expect(mockNavigate).toHaveBeenCalledWith(`/movie/${mockMovie.id}`);
  });

  test('handles image loading error', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <MovieCard
          id={mockMovie.id}
          title={mockMovie.title}
          year={mockMovie.year}
          rating={mockMovie.rating}
          poster="invalid-image.jpg"
          genre={mockMovie.genre}
        />
      </Provider>
    );

    const image = screen.getByAltText(mockMovie.title);
    fireEvent.error(image);

    expect(image).toBeInTheDocument();
  });
});