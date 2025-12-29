export const config = {
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'https://cinemaguide.skillbox.cc',
    enableMocks: process.env.REACT_APP_ENABLE_MOCKS === 'true',
    endpoints: {
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
        byGenre: (genreName: string, page: number = 1, limit: number = 10) => 
          `/movie?genres=${genreName}&page=${page}&limit=${limit}`
      },
      genres: '/movie/genres',
      favorites: {
        all: '/favorites',
        add: '/favorites',
        remove: (id: number) => `/favorites/${id}`
      },
      health: '/'
    }
  },
  storage: {
    user: 'marusya_user',
    auth: 'marusya_auth',
    favorites: 'marusya_favorites',
    theme: 'marusya_theme',
    token: 'marusya_token' 
  },
  app: {
    name: 'Marusya Cinema',
    version: '1.0.0',
    pagination: {
      moviesPerPage: 10,
      genresPerPage: 12
    }
  }
};