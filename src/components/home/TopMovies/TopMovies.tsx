import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { fetchTopMovies } from '../../../store/thunks/movieThunks';
import './TopMovies.scss';

const TopMovies: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { topMovies, isLoading } = useAppSelector((state) => state.movies);

  useEffect(() => {
    dispatch(fetchTopMovies());
  }, [dispatch]);

  const handleMovieClick = (movieId: number) => {
    navigate(`/movie/${movieId}`);
  };

  if (isLoading) {
    return (
      <section className="top-movies">
        <div className="container">
          <div className="top-movies__content">
            <h2 className="top-movies__title">Топ 10 фильмов</h2>
            <div className="top-movies__loading">Загрузка топ фильмов...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="top-movies">
      <div className="container">
        <div className="top-movies__content">
          <h2 className="top-movies__title">Топ 10 фильмов</h2>
          
          {/* Первый ряд фильмов 1-5 */}
          <div className="top-movies__row">
            {topMovies.slice(0, 5).map((movie, index) => (
              <div 
                key={movie.id} 
                className="top-movie-card"
                onClick={() => handleMovieClick(movie.id)}
              >
                <div className="top-movie-card__rank">{index + 1}</div>
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="top-movie-card__image"
                />
              </div>
            ))}
          </div>
          
          {/* Второй ряд фильмов 6-10 */}
          <div className="top-movies__row">
            {topMovies.slice(5, 10).map((movie, index) => (
              <div 
                key={movie.id} 
                className="top-movie-card"
                onClick={() => handleMovieClick(movie.id)}
              >
                <div className="top-movie-card__rank">{index + 6}</div>
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="top-movie-card__image"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopMovies;