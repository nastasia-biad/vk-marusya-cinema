import { createAsyncThunk } from '@reduxjs/toolkit';
import { adaptiveApiService } from '../../services/adaptiveApiService';
import { setWarning } from '../slices/uiSlice';

export const fetchRandomMovie = createAsyncThunk(
  'movies/fetchRandomMovie',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const movie = await adaptiveApiService.getRandomMovie();
      return movie;
    } catch (error: any) {
      const message = error.message || 'Ошибка загрузки случайного фильма';
      dispatch(setWarning(message));
      return rejectWithValue(message);
    }
  }
);

export const fetchTopMovies = createAsyncThunk(
  'movies/fetchTopMovies',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const movies = await adaptiveApiService.getTopMovies();
      return movies;
    } catch (error: any) {
      const message = error.message || 'Ошибка загрузки топ фильмов';
      dispatch(setWarning(message));
      return rejectWithValue(message);
    }
  }
);

export const fetchGenres = createAsyncThunk(
  'movies/fetchGenres',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const genres = await adaptiveApiService.getGenres();
      return genres;
    } catch (error: any) {
      const message = error.message || 'Ошибка загрузки жанров';
      dispatch(setWarning(message));
      return rejectWithValue(message);
    }
  }
);

export const searchMovies = createAsyncThunk(
  'movies/searchMovies',
  async (query: string, { dispatch, rejectWithValue }) => {
    try {
      const movies = await adaptiveApiService.searchMovies(query);
      return movies;
    } catch (error: any) {
      const message = error.message || 'Ошибка поиска фильмов';
      dispatch(setWarning(message));
      return rejectWithValue(message);
    }
  }
);
