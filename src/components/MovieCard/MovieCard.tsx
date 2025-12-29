import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { openAuthModal } from '../../store/slices/uiSlice';
import { addToFavorites, removeFromFavorites } from '../../store/slices/authSlice';
import './MovieCard.scss';

interface MovieCardProps {
  id: number;
  title: string;
  year: number;
  rating: number;
  poster: string;
  genre: string[];
  ranking?: number;
  showRanking?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  id, 
  title, 
  year, 
  rating, 
  poster, 
  genre,
  ranking,
  showRanking = false
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  
  const isFavorite = user?.favoriteMovies?.includes(id) || false;

  const handleCardClick = () => {
    navigate(`/movie/${id}`);
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      dispatch(openAuthModal());
      return;
    }

    try {
      setIsFavoriteLoading(true);
      
      if (isFavorite) {
        dispatch(removeFromFavorites(id));
      } else {
        dispatch(addToFavorites(id));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  return (
    <div className="movie-card" onClick={handleCardClick}>
      <div className="movie-card__image-container">
        <img 
          src={poster} 
          alt={title} 
          className="movie-card__image"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/assets/images/placeholder.jpg';
            target.style.backgroundColor = '#393B3C';
          }}
        />
        
        {showRanking && ranking && (
          <div className={`movie-card__ranking ${!showRanking ? 'movie-card__ranking--hidden' : ''}`}>
            {ranking}
          </div>
        )}
        
        {/* Кнопка избранного */}
        <button 
          className={`movie-card__favorite-btn ${isFavorite ? 'movie-card__favorite-btn--active' : ''}`}
          onClick={handleFavoriteClick}
          disabled={isFavoriteLoading}
          aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          {isFavoriteLoading ? (
            <div className="movie-card__favorite-loader"></div>
          ) : (
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" 
                fill="currentColor"
              />
            </svg>
          )}
        </button>
      </div>
      
      <div className="movie-card__content">
        <h3 className="movie-card__title">{title}</h3>
        <div className="movie-card__meta">
          <span className="movie-card__year">{year}</span>
          <span className="movie-card__genre">
            {genre.slice(0, 2).join(', ')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;