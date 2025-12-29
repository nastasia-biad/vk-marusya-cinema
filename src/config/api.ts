export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'https://cinemaguide.skillbox.cc',
  endpoints: {
    health: '/',
    auth: {
      login: '/auth/login',
      register: '/user',
      logout: '/auth/logout',
      me: '/profile',
      refresh: '/auth/refresh'
    },
    movies: {
      random: '/movie/random',
      top: '/movie/top10',
      byId: (id: number) => `/movie/${id}`,
      search: '/movie',
      all: '/movie',
    },
    genres: '/movie/genres',
    favorites: {
      all: '/favorites',
      add: '/favorites',
      remove: (id: number) => `/favorites/${id}`,
    }
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};