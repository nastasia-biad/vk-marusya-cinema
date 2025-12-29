export interface Movie {
  id: number;
  title: string;
  description: string;
  rating: number;
  year: number;
  genre: string[];
  duration: string;
  poster: string;
  posterDetail?: string;
  trailer: string;
  country?: string;
  director?: string;
  cast?: string[];
  budget?: string;
  production?: string;
  boxOffice?: string;
  awards?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Genre {
  id: number;
  name: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  favoriteMovies: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface GenreMoviesResponse {
  movies: Movie[];
  hasMore: boolean;
  total: number;
  currentPage: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

