import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { 
  closeSearchModal, 
  setSearchQuery, 
  setSearchResults,
  clearSearch 
} from '../../../store/slices/uiSlice';
import { searchMovies } from '../../../store/thunks/movieThunks';
import Loading from '../Loading/Loading';
import './SearchModal.scss';

const SearchModal: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { searchQuery, searchResults } = useAppSelector((state) => state.ui);
  const [localQuery, setLocalQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const performSearch = useCallback(async (query: string) => {
    if (query.trim() === '') {
      dispatch(setSearchResults([]));
      return;
    }

    setIsSearching(true);
    
    try {
      const results = await dispatch(searchMovies(query)).unwrap();
      dispatch(setSearchResults(results));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    if (searchQuery) {
      setLocalQuery(searchQuery);
      performSearch(searchQuery);
    }
    
    return () => {
      dispatch(clearSearch());
    };
  }, [dispatch]);

  const handleClose = () => {
    dispatch(closeSearchModal());
    dispatch(clearSearch());
    setLocalQuery('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalQuery(query);
    dispatch(setSearchQuery(query));
    
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);
    
    return () => clearTimeout(timer);
  };

  const handleMovieClick = (movieId: number) => {
    navigate(`/movie/${movieId}`);
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
    if (e.key === 'Enter' && localQuery.trim()) {
      performSearch(localQuery);
    }
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    dispatch(clearSearch());
  };

  return (
    <div className="search-modal-overlay" onClick={handleClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal__header">
          <div className="search-modal__input-container">
            <img 
              src="/assets/icons/search.svg" 
              alt="Search" 
              className="search-modal__search-icon"
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Поиск фильма..."
              className="search-modal__input"
              value={localQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
            {localQuery && (
              <button 
                className="search-modal__clear-btn"
                onClick={handleClearSearch}
                aria-label="Очистить поиск"
              >
                <img src="/assets/icons/close.svg" alt="Clear" />
              </button>
            )}
          </div>
          <button className="search-modal__close-btn" onClick={handleClose}>
            <img src="/assets/icons/close.svg" alt="Close" />
          </button>
        </div>

        <div className="search-modal__results">
          {isSearching ? (
            <div className="search-modal__loading">
              <Loading size="small" message="Поиск..." />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="search-modal__results-list">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  className="search-modal__result-item"
                  onClick={() => handleMovieClick(movie.id)}
                >
                  <img 
                    src={movie.poster} 
                    alt={movie.title}
                    className="search-modal__result-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.backgroundColor = '#393B3C';
                    }}
                  />
                  <div className="search-modal__result-info">
                    <h4 className="search-modal__result-title">{movie.title}</h4>
                    <div className="search-modal__result-meta">
                      <span className="search-modal__result-year">{movie.year}</span>
                      <span className="search-modal__result-rating">★ {movie.rating}</span>
                    </div>
                    <p className="search-modal__result-genre">
                      {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : localQuery.trim() !== '' ? (
            <div className="search-modal__no-results">
              <p>По запросу "{localQuery}" ничего не найдено</p>
            </div>
          ) : (
            <div className="search-modal__initial-state">
              <p>Введите название фильма для поиска</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;