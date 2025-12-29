import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GenreCard.scss';

interface GenreCardProps {
  id: number;
  name: string;
  image: string;
}

const GenreCard: React.FC<GenreCardProps> = ({ id, name, image }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/genre/${id}`);
  };

  return (
    <div className="genre-card" onClick={handleClick}>
      <div className="genre-card__image-container">
        <img 
          src={image} 
          alt={name} 
          className="genre-card__image"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.backgroundColor = '#616161';
          }}
        />
      </div>
      <div className="genre-card__overlay"></div>
      <div className="genre-card__content">
        <h3 className="genre-card__title">{name}</h3>
      </div>
    </div>
  );
};

export default GenreCard;