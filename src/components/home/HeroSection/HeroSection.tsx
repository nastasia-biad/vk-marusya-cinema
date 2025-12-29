import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { fetchRandomMovie } from '../../../store/thunks/movieThunks';
import { addToFavorites, removeFromFavorites } from '../../../store/slices/authSlice';
import { openTrailerModal, openAuthModal } from '../../../store/slices/uiSlice';
import Loading from '../../common/Loading/Loading';
import './HeroSection.scss';

const HeroSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { randomMovie, isLoading } = useAppSelector((state) => state.movies);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isRandomLoading, setIsRandomLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Загрузка начального фильма
  useEffect(() => {
    if (!randomMovie) {
      dispatch(fetchRandomMovie());
    }
  }, [dispatch, randomMovie]);

  const handleWatchTrailer = () => {
    if (randomMovie?.trailer) {
      dispatch(openTrailerModal(randomMovie.trailer));
    }
  };

  const handleAboutMovie = () => {
    if (randomMovie) {
      navigate(`/movie/${randomMovie.id}`);
    }
  };

  const handleToggleFavorite = async () => {
    if (!randomMovie) return;
    
    if (!isAuthenticated) {
      dispatch(openAuthModal());
      return;
    }

    try {
      setIsFavoriteLoading(true);
      const isFavorite = user?.favoriteMovies?.includes(randomMovie.id) || false;
      
      if (isFavorite) {
        dispatch(removeFromFavorites(randomMovie.id));
      } else {
        dispatch(addToFavorites(randomMovie.id));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleRandomMovie = async () => {
    if (isRandomLoading || isAnimating) return;
    
    setIsRandomLoading(true);
    setIsAnimating(true);
    
    try {
      await dispatch(fetchRandomMovie());
    } catch (error) {
      console.error('Ошибка при загрузке фильма:', error);
    } finally {
      setTimeout(() => {
        setIsRandomLoading(false);
        setIsAnimating(false);
      }, 300);
    }
  };

  const isFavorite = user?.favoriteMovies?.includes(randomMovie?.id || 0) || false;

  const getRatingColor = (rating: number) => {
    if (rating >= 8.0) return '#308E21';
    if (rating >= 6.0) return '#A59400';
    return '#777777';
  };

  if (isLoading && !randomMovie) {
    return (
      <section className="hero">
        <div className="container">
          <div className="hero__content hero__content--loading">
            <Loading message="Загрузка случайного фильма..." />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero">
      <div className="hero__wallpaper">
        <div className="container">
          {/* Десктоп версия */}
          {!isMobile ? (
            <div className="hero__content hero__content--desktop">
              {/* Левая часть - информация о фильме */}
              <div className="hero__info">
                <div className="hero__film-data">
                  <div className={`hero__movie-content ${isAnimating ? 'hero__movie-content--fading' : ''}`}>
                    {/* Мета-информация */}
                    <div className="hero__meta">
                      <div 
                        className="rating"
                        style={{ backgroundColor: randomMovie ? getRatingColor(randomMovie.rating) : '#308E21' }}
                      >
                        <img src="/assets/icons/star.svg" alt="Rating" className="rating__icon" />
                        <span className="rating__value">
                          {randomMovie ? randomMovie.rating.toFixed(1) : '0.0'}
                        </span>
                      </div>
                      <span className="meta-info__item">{randomMovie?.year || ''}</span>
                      <span className="meta-info__item">
                        {randomMovie ? randomMovie.genre.join(', ') : ''}
                      </span>
                      <span className="meta-info__item">{randomMovie?.duration || ''}</span>
                    </div>

                    {/* Заголовок и описание */}
                    <h1 className="hero__title">{randomMovie?.title || 'Загрузка...'}</h1>
                    <p className="hero__description">{randomMovie?.description || ''}</p>
                  </div>

                  {/* Кнопки действий */}
                  <div className="hero__actions">
                    <button
                      className="btn btn-primary"
                      onClick={handleWatchTrailer}
                      disabled={!randomMovie?.trailer || isAnimating}
                    >
                      Трейлер
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleAboutMovie}
                      disabled={isAnimating}
                    >
                      О фильме
                    </button>
                    <button
                      className={`btn btn-icon ${isFavorite ? 'favorite-active' : ''}`}
                      onClick={handleToggleFavorite}
                      disabled={isFavoriteLoading || isAnimating}
                      aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                    >
                      {isFavoriteLoading ? (
                        <div className="btn__loader"></div>
                      ) : (
                        <img src="/assets/icons/like.svg" alt="Favorite" />
                      )}
                    </button>
                    <button
                      className="btn btn-icon random-movie-btn"
                      onClick={handleRandomMovie}
                      disabled={isRandomLoading || isAnimating}
                      aria-label="Случайный фильм"
                      title="Новый случайный фильм"
                    >
                      {isRandomLoading ? (
                        <div className="btn__loader"></div>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="random-movie-icon"
                        >
                          <path
                            d="M19 8L15 12H18C18 15.31 15.31 18 12 18C11.06 18 10.19 17.75 9.42 17.32L7.74 19C8.97 19.74 10.43 20 12 20C16.42 20 20 16.42 20 12H23L19 8ZM6 12C6 8.69 8.69 6 12 6C12.94 6 13.81 6.25 14.58 6.68L16.26 5C15.03 4.26 13.57 4 12 4C7.58 4 4 7.58 4 12H1L5 16L9 12H6Z"
                            fill="white"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Правая часть - постер фильма */}
              <div className="hero__poster">
                {randomMovie ? (
                  <img
                    src={randomMovie.posterDetail || randomMovie.poster}
                    alt={randomMovie.title}
                    className={`hero__poster-image ${isAnimating ? 'hero__poster-image--fading' : ''}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.backgroundColor = '#393B3C';
                    }}
                  />
                ) : (
                  <div className="hero__poster-skeleton shimmer-effect"></div>
                )}
              </div>
            </div>
          ) : (
            /* Мобильная версия */
            <div className="hero__content hero__content--mobile">
              {/* Постер сверху */}
              <div className="hero__mobile-poster">
                {randomMovie ? (
                  <img
                    src={randomMovie.posterDetail || randomMovie.poster}
                    alt={randomMovie.title}
                    className="hero__mobile-poster-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.backgroundColor = '#393B3C';
                    }}
                  />
                ) : (
                  <div className="hero__mobile-poster-skeleton shimmer-effect"></div>
                )}
              </div>

              {/* Контент под постером */}
              <div className="hero__mobile-info">
                <div className={`hero__mobile-movie-content ${isAnimating ? 'hero__mobile-movie-content--fading' : ''}`}>
                  {/* Мета-информация */}
                  <div className="hero__mobile-meta">
                    <div 
                      className="hero__mobile-rating"
                      style={{ backgroundColor: randomMovie ? getRatingColor(randomMovie.rating) : '#308E21' }}
                    >
                      <img src="/assets/icons/star.svg" alt="Rating" className="hero__mobile-rating-icon" />
                      <span className="hero__mobile-rating-value">
                        {randomMovie ? randomMovie.rating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                    <div className="hero__mobile-meta-items">
                      <span className="hero__mobile-meta-item">{randomMovie?.year || ''}</span>
                      <span className="hero__mobile-meta-item">
                        {randomMovie ? randomMovie.genre.slice(0, 2).join(', ') : ''}
                      </span>
                      <span className="hero__mobile-meta-item">{randomMovie?.duration || ''}</span>
                    </div>
                  </div>

                  {/* Заголовок и описание */}
                  <h1 className="hero__mobile-title">{randomMovie?.title || 'Загрузка...'}</h1>
                  <p className="hero__mobile-description">{randomMovie?.description || ''}</p>
                </div>

                {/* Кнопки для мобильной версии */}
                <div className="hero__mobile-actions">
                  {/* Кнопка трейлера*/}
                  <button
                    className="hero__mobile-trailer-btn"
                    onClick={handleWatchTrailer}
                    disabled={!randomMovie?.trailer || isAnimating}
                  >
                    Трейлер
                  </button>
                  
                  {/* Группа из 3 кнопок под трейлером */}
                  <div className="hero__mobile-button-group">
                    <button
                      className="hero__mobile-about-btn"
                      onClick={handleAboutMovie}
                      disabled={isAnimating}
                    >
                      О фильме
                    </button>
                    <button
                      className={`hero__mobile-favorite-btn ${isFavorite ? 'hero__mobile-favorite-btn--active' : ''}`}
                      onClick={handleToggleFavorite}
                      disabled={isFavoriteLoading || isAnimating}
                      aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                    >
                      {isFavoriteLoading ? (
                        <div className="hero__mobile-favorite-loader"></div>
                      ) : (
                        <img src="/assets/icons/like.svg" alt="Favorite" />
                      )}
                    </button>
                    <button
                      className="hero__mobile-random-btn"
                      onClick={handleRandomMovie}
                      disabled={isRandomLoading || isAnimating}
                      aria-label="Случайный фильм"
                    >
                      {isRandomLoading ? (
                        <div className="hero__mobile-random-loader"></div>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="random-movie-icon"
                        >
                          <path
                            d="M19 8L15 12H18C18 15.31 15.31 18 12 18C11.06 18 10.19 17.75 9.42 17.32L7.74 19C8.97 19.74 10.43 20 12 20C16.42 20 20 16.42 20 12H23L19 8ZM6 12C6 8.69 8.69 6 12 6C12.94 6 13.81 6.25 14.58 6.68L16.26 5C15.03 4.26 13.57 4 12 4C7.58 4 4 7.58 4 12H1L5 16L9 12H6Z"
                            fill="white"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;