import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import Loading from '../../components/common/Loading/Loading';
import { allMovies } from '../../data/mocData';
import { openTrailerModal, openAuthModal } from '../../store/slices/uiSlice';
import { addToFavorites, removeFromFavorites } from '../../store/slices/authSlice';
import { useMobile } from '../../hooks/useMobile';
import './MoviePage.scss';

const MoviePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useMobile();

  const [movie, setMovie] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    setIsLoading(true);

    // Симуляция загрузки для демонстрации
    const timer = setTimeout(() => {
      const foundMovie = allMovies.find(m => m.id === parseInt(id || ''));
      setMovie(foundMovie || null);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  const handleWatchTrailer = () => {
    if (movie?.trailer) {
      dispatch(openTrailerModal(movie.trailer));
    }
  };

  const handleToggleFavorite = async () => {
    if (!movie) return;

    if (!isAuthenticated) {
      dispatch(openAuthModal());
      return;
    }

    try {
      setIsFavoriteLoading(true);
      const isFavorite = user?.favoriteMovies?.includes(movie.id) || false;

      if (isFavorite) {
        await dispatch(removeFromFavorites(movie.id));
      } else {
        await dispatch(addToFavorites(movie.id));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const isFavorite = user?.favoriteMovies?.includes(movie?.id || 0) || false;

  if (isLoading) {
    return (
      <div className="movie-page">
        <Header />
        <main className="movie-page__main">
          <div className="container">
            <Loading message="Загрузка информации о фильме..." />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-page">
        <Header />
        <main className="movie-page__main">
          <div className="container">
            <div className="movie-page__not-found">
              <h2>Фильм не найден</h2>
              <button onClick={() => navigate('/')} className="btn btn-primary">
                Вернуться на главную
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8.0) return '#308E21';
    if (rating >= 6.0) return '#A59400';
    return '#777777';
  };


  if (isMobile) {
    return (
      <div className="movie-page mobile">
        {/* Мобильный хедер */}
        <div className="mobile-header">
          <div className="mobile-header__logo">
            <img src="/assets/icons/marusya-white.svg" alt="Marusya Cinema" />
          </div>
          <div className="mobile-header__actions">
            <button className="mobile-header__action-btn">
              <img src="/assets/icons/genres.svg" alt="Жанры" />
            </button>
            <button className="mobile-header__action-btn">
              <img src="/assets/icons/search.svg" alt="Поиск" />
            </button>
            <button className="mobile-header__action-btn">
              <img src="/assets/icons/user-white.svg" alt="Профиль" />
            </button>
          </div>
        </div>

        <main className="movie-page__main mobile">
          {/* Hero секция для мобильной версии */}
          <section className="movie-hero-mobile">
            <div className="movie-hero-mobile__wallpaper">
              {/* Постер фильма */}
              <div className="movie-hero-mobile__poster">
                <img
                  src={movie.posterDetail || movie.poster}
                  alt={movie.title}
                  className="movie-hero-mobile__poster-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.backgroundColor = '#393B3C';
                  }}
                />
              </div>

              {/* Информация о фильме */}
              <div className="movie-hero-mobile__info">
                <div className="movie-hero-mobile__film-data">
                  {/* Мета-информация */}
                  <div className="movie-hero-mobile__meta-wrapper">
                    <div
                      className="movie-hero-mobile__rating"
                      style={{ backgroundColor: getRatingColor(movie.rating) }}
                    >
                      <img src="/assets/icons/star.svg" alt="Rating" className="movie-hero-mobile__star-icon" />
                      <span className="movie-hero-mobile__rating-value">{movie.rating.toFixed(1)}</span>
                    </div>
                    <span className="movie-hero-mobile__meta-item movie-hero-mobile__year">{movie.year}</span>
                    <span className="movie-hero-mobile__meta-item movie-hero-mobile__genre">
                      {Array.isArray(movie.genre) ? movie.genre.slice(0, 2).join(', ') : movie.genre}
                    </span>
                    <span className="movie-hero-mobile__meta-item movie-hero-mobile__length">{movie.duration}</span>
                  </div>

                  {/* Заголовок и описание */}
                  <h1 className="movie-hero-mobile__title">{movie.title}</h1>
                  <p className="movie-hero-mobile__subtitle">{movie.description}</p>

                  {/* Кнопки действий */}
                  <div className="movie-hero-mobile__actions-wrapper">
                    <button
                      className="movie-hero-mobile__trailer-btn"
                      onClick={handleWatchTrailer}
                      disabled={!movie.trailer}
                    >
                      <span className="movie-hero-mobile__btn-title">Трейлер</span>
                    </button>
                    <button
                      className={`movie-hero-mobile__favorite-btn ${isFavorite ? 'movie-hero-mobile__favorite-btn--active' : ''}`}
                      onClick={handleToggleFavorite}
                      disabled={isFavoriteLoading}
                      aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                    >
                      {isFavoriteLoading ? (
                        <div className="movie-hero-mobile__favorite-loader"></div>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="movie-hero-mobile__favorite-icon"
                        >
                          <path
                            d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Детальная информация для мобильной версии */}
          <section className="movie-details-mobile">
            <div className="movie-details-mobile__frame">
              <h2 className="movie-details-mobile__title">О фильме</h2>

              <div className="movie-details-mobile__parameters">
                {/* Оригинальное название */}
                <div className="movie-details-mobile__parameter">
                  <div className="movie-details-mobile__parameter-wrapper">
                    <span className="movie-details-mobile__parameter-label">Оригинальное название</span>
                  </div>
                  <span className="movie-details-mobile__parameter-value">
                    {movie.originalTitle || `${movie.title} (оригинальное название)`}
                  </span>
                </div>

                {/* Год производства */}
                <div className="movie-details-mobile__parameter">
                  <div className="movie-details-mobile__parameter-wrapper">
                    <span className="movie-details-mobile__parameter-label">Год производства</span>
                  </div>
                  <span className="movie-details-mobile__parameter-value">{movie.year}</span>
                </div>

                {/* Страна */}
                <div className="movie-details-mobile__parameter">
                  <div className="movie-details-mobile__parameter-wrapper">
                    <span className="movie-details-mobile__parameter-label">Страна</span>
                  </div>
                  <span className="movie-details-mobile__parameter-value">{movie.country || 'Не указано'}</span>
                </div>

                {/* Бюджет */}
                {movie.budget && (
                  <div className="movie-details-mobile__parameter">
                    <div className="movie-details-mobile__parameter-wrapper">
                      <span className="movie-details-mobile__parameter-label">Бюджет</span>
                    </div>
                    <span className="movie-details-mobile__parameter-value">{movie.budget}</span>
                  </div>
                )}

                {/* Выручка */}
                {movie.boxOffice && (
                  <div className="movie-details-mobile__parameter">
                    <div className="movie-details-mobile__parameter-wrapper">
                      <span className="movie-details-mobile__parameter-label">Выручка</span>
                    </div>
                    <span className="movie-details-mobile__parameter-value">{movie.boxOffice}</span>
                  </div>
                )}

                {/* Режиссер */}
                <div className="movie-details-mobile__parameter">
                  <div className="movie-details-mobile__parameter-wrapper">
                    <span className="movie-details-mobile__parameter-label">Режиссер</span>
                  </div>
                  <span className="movie-details-mobile__parameter-value">{movie.director || 'Не указано'}</span>
                </div>

                {/* Производство */}
                {movie.production && (
                  <div className="movie-details-mobile__parameter">
                    <div className="movie-details-mobile__parameter-wrapper">
                      <span className="movie-details-mobile__parameter-label">Производство</span>
                    </div>
                    <span className="movie-details-mobile__parameter-value">{movie.production}</span>
                  </div>
                )}

                {/* В ролях */}
                <div className="movie-details-mobile__parameter">
                  <div className="movie-details-mobile__parameter-wrapper">
                    <span className="movie-details-mobile__parameter-label">В ролях</span>
                  </div>
                  <span className="movie-details-mobile__parameter-value">
                    {movie.cast ? (Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast) : 'Не указано'}
                  </span>
                </div>

                {/* Награды */}
                {movie.awards && movie.awards.length > 0 && (
                  <div className="movie-details-mobile__parameter">
                    <div className="movie-details-mobile__parameter-wrapper">
                      <span className="movie-details-mobile__parameter-label">Награды</span>
                    </div>
                    <span className="movie-details-mobile__parameter-value">
                      {Array.isArray(movie.awards) ? movie.awards.join(', ') : movie.awards}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        {/* Мобильный футер */}
        <footer className="mobile-footer">
          <div className="mobile-footer__social">
            <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="mobile-footer__social-link">
              <img src="/assets/icons/vk.svg" alt="VK" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="mobile-footer__social-link">
              <img src="/assets/icons/youtube.svg" alt="YouTube" />
            </a>
            <a href="https://ok.ru" target="_blank" rel="noopener noreferrer" className="mobile-footer__social-link">
              <img src="/assets/icons/ok.svg" alt="OK" />
            </a>
            <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="mobile-footer__social-link">
              <img src="/assets/icons/telegram.svg" alt="Telegram" />
            </a>
          </div>
        </footer>
      </div>
    );
  }

  // Десктопная версия 
  return (
    <div className="movie-page desktop">
      <Header />
      <main className="movie-page__main">
        {/* Hero секция с обложкой */}
        <section className="movie-hero">
          <div className="movie-hero__wallpaper">
            <div className="container">
              <div className="movie-hero__wrapper">
                {/* Левая часть - информация о фильме */}
                <div className="movie-hero__film-data">
                  {/* Мета-информация */}
                  <div className="movie-hero__meta-wrapper">
                    <div
                      className="movie-hero__rating"
                      style={{ backgroundColor: getRatingColor(movie.rating) }}
                    >
                      <img src="/assets/icons/star.svg" alt="Rating" className="movie-hero__star-icon" />
                      <span className="movie-hero__rating-value">{movie.rating.toFixed(1)}</span>
                    </div>
                    <span className="movie-hero__meta-item movie-hero__year">{movie.year}</span>
                    <span className="movie-hero__meta-item movie-hero__genre">
                      {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                    </span>
                    <span className="movie-hero__meta-item movie-hero__length">{movie.duration}</span>
                  </div>

                  {/* Заголовок и описание */}
                  <h1 className="movie-hero__title">{movie.title}</h1>
                  <p className="movie-hero__subtitle">{movie.description}</p>

                  {/* Кнопки действий */}
                  <div className="movie-hero__actions-wrapper">
                    <button
                      className="movie-hero__trailer-btn"
                      onClick={handleWatchTrailer}
                      disabled={!movie.trailer}
                    >
                      <span className="movie-hero__btn-title">Трейлер</span>
                    </button>
                    <button
                      className={`movie-hero__favorite-btn ${isFavorite ? 'movie-hero__favorite-btn--active' : ''}`}
                      onClick={handleToggleFavorite}
                      disabled={isFavoriteLoading}
                      aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                    >
                      {isFavoriteLoading ? (
                        <div className="movie-hero__favorite-loader"></div>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="movie-hero__favorite-icon"
                        >
                          <path
                            d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Постер фильма */}
          <div className="movie-hero__poster">
            <img
              src={movie.posterDetail || movie.poster}
              alt={movie.title}
              className="movie-hero__poster-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.backgroundColor = '#393B3C';
              }}
            />
          </div>
        </section>

        {/* Детальная информация */}
        <section className="movie-details">
          <div className="container">
            <div className="movie-details__frame">
              <h2 className="movie-details__title">О фильме</h2>

              <div className="movie-details__parameters">
                {/* Оригинальное название */}
                <div className="movie-details__parameter">
                  <div className="movie-details__parameter-wrapper">
                    <span className="movie-details__parameter-label">Оригинальное название</span>
                    <div className="movie-details__parameter-dots"></div>
                  </div>
                  <span className="movie-details__parameter-value">
                    {movie.originalTitle || `${movie.title} (оригинальное название)`}
                  </span>
                </div>

                {/* Год производства */}
                <div className="movie-details__parameter">
                  <div className="movie-details__parameter-wrapper">
                    <span className="movie-details__parameter-label">Год производства</span>
                    <div className="movie-details__parameter-dots"></div>
                  </div>
                  <span className="movie-details__parameter-value">{movie.year}</span>
                </div>

                {/* Страна */}
                <div className="movie-details__parameter">
                  <div className="movie-details__parameter-wrapper">
                    <span className="movie-details__parameter-label">Страна</span>
                    <div className="movie-details__parameter-dots"></div>
                  </div>
                  <span className="movie-details__parameter-value">{movie.country || 'Не указано'}</span>
                </div>

                {/* Бюджет */}
                {movie.budget && (
                  <div className="movie-details__parameter">
                    <div className="movie-details__parameter-wrapper">
                      <span className="movie-details__parameter-label">Бюджет</span>
                      <div className="movie-details__parameter-dots"></div>
                    </div>
                    <span className="movie-details__parameter-value">{movie.budget}</span>
                  </div>
                )}

                {/* Выручка */}
                {movie.boxOffice && (
                  <div className="movie-details__parameter">
                    <div className="movie-details__parameter-wrapper">
                      <span className="movie-details__parameter-label">Выручка</span>
                      <div className="movie-details__parameter-dots"></div>
                    </div>
                    <span className="movie-details__parameter-value">{movie.boxOffice}</span>
                  </div>
                )}

                {/* Режиссер */}
                <div className="movie-details__parameter">
                  <div className="movie-details__parameter-wrapper">
                    <span className="movie-details__parameter-label">Режиссер</span>
                    <div className="movie-details__parameter-dots"></div>
                  </div>
                  <span className="movie-details__parameter-value">{movie.director || 'Не указано'}</span>
                </div>

                {/* Производство */}
                {movie.production && (
                  <div className="movie-details__parameter">
                    <div className="movie-details__parameter-wrapper">
                      <span className="movie-details__parameter-label">Производство</span>
                      <div className="movie-details__parameter-dots"></div>
                    </div>
                    <span className="movie-details__parameter-value">{movie.production}</span>
                  </div>
                )}

                {/* В ролях */}
                <div className="movie-details__parameter">
                  <div className="movie-details__parameter-wrapper">
                    <span className="movie-details__parameter-label">В ролях</span>
                    <div className="movie-details__parameter-dots"></div>
                  </div>
                  <span className="movie-details__parameter-value">
                    {movie.cast ? (Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast) : 'Не указано'}
                  </span>
                </div>

                {/* Награды */}
                {movie.awards && movie.awards.length > 0 && (
                  <div className="movie-details__parameter">
                    <div className="movie-details__parameter-wrapper">
                      <span className="movie-details__parameter-label">Награды</span>
                      <div className="movie-details__parameter-dots"></div>
                    </div>
                    <span className="movie-details__parameter-value">
                      {Array.isArray(movie.awards) ? movie.awards.join(', ') : movie.awards}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MoviePage;