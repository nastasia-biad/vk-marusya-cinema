import { restoreFavorites } from '../../utils/favoriteSync';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import Loading from '../../components/common/Loading/Loading';
import { allMovies } from '../../data/mocData';
import { logoutUser, removeFromFavorites } from '../../store/slices/authSlice';
import './AccountPage.scss';

type AccountTab = 'favorites' | 'account';

interface MovieCardProps {
  movie: any;
  onRemove: (movieId: number) => void;
}

const FavoriteMovieCard: React.FC<MovieCardProps> = ({ movie, onRemove }) => {
  const navigate = useNavigate();
  const [isRemoving, setIsRemoving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    console.log('FavoriteMovieCard: Removing movie', movie.id);

    setIsRemoving(true);
    try {
      await onRemove(movie.id);
    } catch (error) {
      console.error('Error removing movie:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div
      className="account-page__movie-card-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Кнопка удаления */}
      {isHovered && (
        <button
          className="account-page__remove-btn"
          onClick={handleRemove}
          disabled={isRemoving}
          aria-label="Удалить из избранного"
        >
          {isRemoving ? (
            <div className="account-page__remove-loader"></div>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="account-page__remove-icon"
            >
              <path
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                fill="#000000"
              />
            </svg>
          )}
        </button>
      )}

      {/* Карточка фильма */}
      <div className="account-page__movie-card" onClick={handleCardClick}>
        <div className="account-page__movie-card-inner">
          <img
            src={movie.poster}
            alt={movie.title}
            className="account-page__movie-card-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.backgroundColor = '#393B3C';
            }}
          />

          {/* Контент карточки */}
          <div className="account-page__movie-card-content">
            <h3 className="account-page__movie-card-title">{movie.title}</h3>
            <div className="account-page__movie-card-meta">
              <span className="account-page__movie-card-year">{movie.year}</span>
              <span className="account-page__movie-card-rating">★ {movie.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<AccountTab>('favorites');
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {

  }, [user, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const handleRemoveFavorite = async (movieId: number) => {
    try {
      dispatch(removeFromFavorites(movieId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const favoriteMoviesList = useMemo(() => {
    if (!user || !user.favoriteMovies || user.favoriteMovies.length === 0) {
      console.log('No favorite movies in user object, checking localStorage');
      const localFavorites = restoreFavorites();
      console.log('Favorites from localStorage:', localFavorites);

      const filtered = allMovies.filter(movie => localFavorites.includes(movie.id));
      console.log('Filtered movies:', filtered);
      return filtered;
    }

    const filtered = allMovies.filter(movie => {
      const isFavorite = user.favoriteMovies.includes(movie.id);
      if (isFavorite) {
        console.log(`Movie ${movie.id} (${movie.title}) is favorite`);
      }
      return isFavorite;
    });

    console.log('Filtered movies from user favorites:', filtered);
    return filtered;
  }, [user]);

  const visibleMovies = favoriteMoviesList.slice(0, visibleCount);
  const hasMore = favoriteMoviesList.length > visibleCount;

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      const nextCount = Math.min(visibleCount + 10, favoriteMoviesList.length);
      setVisibleCount(nextCount);
      setLoadingMore(false);
    }, 500);
  };

  const getUserInitials = () => {
    if (!user) return 'П';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="account-page">
        <Header />
        <main className="account-page__main">
          <div className="container">
            <Loading message="Загрузка профиля..." />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const groupMoviesIntoRows = (movies: any[]) => {
    const rows: any[][] = [];
    for (let i = 0; i < movies.length; i += 5) {
      rows.push(movies.slice(i, i + 5));
    }
    return rows;
  };

  const movieRows = groupMoviesIntoRows(visibleMovies);

  return (
    <div className="account-page">
      <Header />
      <main className="account-page__main">
        <div className="container">
          <div className="account-page__content">
            {/* Заголовок страницы */}
            <div className="account-page__header">
              <div className="account-page__title-wrapper">
                <h1 className="account-page__title">
                  {activeTab === 'favorites' ? 'История просмотров' : 'Настройки аккаунта'}
                </h1>
              </div>
            </div>

            {/* Навигационные вкладки */}
            <div className="account-page__tabs">
              <button
                className={`account-page__tab ${activeTab === 'favorites' ? 'account-page__tab--active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                <svg
                  className="account-page__tab-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="account-page__tab-text">Избранное</span>
              </button>

              <button
                className={`account-page__tab ${activeTab === 'account' ? 'account-page__tab--active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <svg
                  className="account-page__tab-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="account-page__tab-text">Аккаунт</span>
              </button>
            </div>

            {/* Контент вкладок */}
            <div className="account-page__content-area">
              {activeTab === 'favorites' ? (
                <div className="account-page__favorites">
                  {/* Контейнер для карточек фильмов */}
                  <div className="account-page__movies-container">
                    {/* Ряды фильмов */}
                    {movieRows.map((row, rowIndex) => (
                      <div key={`row-${rowIndex}`} className="account-page__movies-row">
                        {row.map((movie) => (
                          <FavoriteMovieCard
                            key={movie.id}
                            movie={movie}
                            onRemove={handleRemoveFavorite}
                          />
                        ))}
                      </div>
                    ))}

                    {/* Кнопка "Показать ещё" */}
                    {hasMore && (
                      <div className="account-page__load-more">
                        <button
                          className="account-page__load-more-btn"
                          onClick={loadMore}
                          disabled={loadingMore}
                        >
                          {loadingMore ? (
                            <>
                              <div className="account-page__load-more-loader"></div>
                              Загрузка...
                            </>
                          ) : (
                            'Показать ещё'
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Сообщение об отсутствии фильмов */}
                  {favoriteMoviesList.length === 0 && (
                    <div className="account-page__no-favorites">
                      <p className="account-page__no-favorites-text">
                        У вас пока нет избранных фильмов
                      </p>
                      <button
                        className="account-page__browse-btn"
                        onClick={() => navigate('/')}
                      >
                        Найти фильмы
                      </button>
                    </div>
                  )}

                  {/* Счетчик фильмов */}
                  {favoriteMoviesList.length > 0 && (
                    <div className="account-page__movies-count">
                      Показано {visibleMovies.length} из {favoriteMoviesList.length} фильмов
                    </div>
                  )}
                </div>
              ) : (
                <div className="account-page__settings">
                  {/* Информация о пользователе */}
                  <div className="account-page__user-info">
                    <div className="account-page__avatar-section">
                      <div className="account-page__avatar">
                        <div className="account-page__avatar-initials">
                          {getUserInitials()}
                        </div>
                      </div>
                      <div className="account-page__user-details">
                        <h3 className="account-page__user-name">
                          {user?.firstName} {user?.lastName}
                        </h3>
                        <p className="account-page__user-label">Имя и фамилия</p>
                      </div>
                    </div>

                    <div className="account-page__email-section">
                      <div className="account-page__email-icon">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      <div className="account-page__email-details">
                        <h3 className="account-page__user-email">{user?.email}</h3>
                        <p className="account-page__email-label">Электронная почта</p>
                      </div>
                    </div>
                  </div>

                  {/* Кнопка выхода */}
                  <button
                    className="account-page__logout-btn"
                    onClick={handleLogout}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountPage;