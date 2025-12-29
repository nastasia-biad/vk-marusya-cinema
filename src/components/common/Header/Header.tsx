import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { logoutUser } from '../../../store/slices/authSlice';
import {
  openAuthModal,
  openSearchModal,
  setSearchQuery,
  setSearchResults,
  openSearchDropdown,
  closeSearchDropdown,
  clearSearch
} from '../../../store/slices/uiSlice';
import { searchMovies } from '../../../store/thunks/movieThunks';
import { Movie } from '../../../types';
import './Header.scss';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { searchResults, isSearchDropdownOpen } = useAppSelector((state) => state.ui);
  const { searchedMovies } = useAppSelector((state) => state.movies);

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleSearchInputFocus = () => {
  if (searchInputRef.current) {
    searchInputRef.current.focus();
  }
};

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    dispatch(setSearchQuery(query));

    if (query.trim() === '') {
      dispatch(setSearchResults([]));
      dispatch(closeSearchDropdown());
    } else {
      dispatch(searchMovies(query))
        .unwrap()
        .then((results) => {
          dispatch(setSearchResults(results.slice(0, 5)));
          dispatch(openSearchDropdown());
        })
        .catch(() => {
          dispatch(closeSearchDropdown());
        });
    }
  };

  const handleSearchResultClick = (movieId: number) => {
    navigate(`/movie/${movieId}`);
    setLocalSearchQuery('');
    dispatch(clearSearch());
    dispatch(closeSearchDropdown());
  };

  const handleSearchIconClick = () => {
    dispatch(openSearchModal());
  };

  const handleGenresClick = () => {
    navigate('/genres');
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate('/account');
    } else {
      dispatch(openAuthModal());
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    dispatch(clearSearch());
    dispatch(closeSearchDropdown());
  };


  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.header__search-dropdown')
      ) {
        dispatch(closeSearchDropdown());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dispatch]);


  useEffect(() => {
    dispatch(setSearchResults(searchedMovies.slice(0, 5)));
  }, [searchedMovies, dispatch]);

  const getRatingColor = (rating: number) => {
    if (rating >= 8.0) return '#308E21';
    if (rating >= 6.0) return '#A59400';
    return '#777777';
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header__wrapper">
          <Link to="/" className="header__logo">
            <img
              src="/assets/icons/marusya-white.svg"
              alt="Marusya Cinema"
              className="header__logo-image"
            />
          </Link>

          {/* Мобильные кнопки действий (только для мобильных) */}
          {isMobile && (
            <div className="header__mobile-actions">
              <button 
                className="header__mobile-action-btn"
                onClick={handleGenresClick}
                aria-label="Жанры"
              >
                <img 
                  src="/assets/icons/genres.svg" 
                  alt="Жанры"
                  width="24"
                  height="24"
                />
              </button>
              
              <button 
                className="header__mobile-action-btn"
                onClick={handleSearchIconClick}
                aria-label="Поиск"
              >
                <img 
                  src="/assets/icons/search.svg" 
                  alt="Поиск"
                  width="24"
                  height="24"
                />
              </button>
              
              <button 
                className="header__mobile-action-btn"
                onClick={handleAccountClick}
                aria-label="Аккаунт"
              >
                <img 
                  src="/assets/icons/user-white.svg" 
                  alt="Аккаунт"
                  width="24"
                  height="24"
                />
              </button>
            </div>
          )}

          {/* Основная навигация (только для десктопа) */}
          {!isMobile && (
            <nav className="header__nav">
              <div className="header__nav-links">
                <Link
                  to="/"
                  className={`header__nav-item ${isActive('/') ? 'header__nav-item--active' : ''}`}
                >
                  Главная
                </Link>
                <Link
                  to="/genres"
                  className={`header__nav-item ${isActive('/genres') ? 'header__nav-item--active' : ''}`}
                >
                  Жанры
                </Link>
              </div>

              <div className="header__search-container" ref={searchContainerRef}>
                <div className="header__search-input-wrapper">
                  <div className="header__search-icon" onClick={handleSearchIconClick}>
                    <img
                      src="/assets/icons/search.svg"
                      alt="Поиск"
                      className="header__search-icon-image"
                    />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Поиск фильма..."
                    className="header__search-input"
                    value={localSearchQuery}
                    onChange={handleSearchInputChange}
                  />
                  {localSearchQuery && (
                    <button
                      className="header__search-clear"
                      onClick={handleClearSearch}
                      aria-label="Очистить поиск"
                    >
                      <img
                        src="/assets/icons/close.svg"
                        alt="Очистить"
                        className="header__search-clear-icon"
                      />
                    </button>
                  )}
                </div>

                {isSearchDropdownOpen && searchResults.length > 0 && (
                  <div className="header__search-dropdown">
                    <div className="header__search-dropdown-content">
                      {searchResults.map((movie: Movie) => (
                        <div
                          key={movie.id}
                          className="header__search-result"
                          onClick={() => handleSearchResultClick(movie.id)}
                        >
                          <div className="header__search-result-image-container">
                            <img
                              src={movie.poster || '/assets/images/placeholder.jpg'}
                              alt={movie.title}
                              className="header__search-result-image"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/assets/images/placeholder.jpg';
                              }}
                            />
                          </div>
                          <div className="header__search-result-info">
                            <div className="header__search-result-meta">
                              <div
                                className="header__search-result-rating"
                                style={{ backgroundColor: getRatingColor(movie.rating) }}
                              >
                                <img
                                  src="/assets/icons/star.svg"
                                  alt="Рейтинг"
                                  className="header__search-result-rating-icon"
                                />
                                <span className="header__search-result-rating-value">
                                  {movie.rating}
                                </span>
                              </div>
                              <span className="header__search-result-year">{movie.year}</span>
                              <span className="header__search-result-genre">
                                {Array.isArray(movie.genre) ? movie.genre.slice(0, 2).join(', ') : movie.genre}
                              </span>
                            </div>
                            <h4 className="header__search-result-title">{movie.title}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="header__user-section">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/account" 
                      className={`header__user-link ${isActive('/account') ? 'header__user-link--active' : ''}`}
                    >
                      {user?.lastName || 'Аккаунт'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="header__logout-btn"
                      aria-label="Выйти"
                    >
                      Выйти
                    </button>
                  </>
                ) : (
                  <button
                    className={`header__login-btn ${isActive('/login') ? 'header__login-btn--active' : ''}`}
                    onClick={() => dispatch(openAuthModal())}
                  >
                    Войти
                  </button>
                )}
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;