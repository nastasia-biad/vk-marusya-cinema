import React from 'react';
import { Genre } from '../../../types';
import GenreCard from '../GenreCard/GenreCard';
import './GenresList.scss';

interface GenresListProps {
  genres: Genre[];
}

const GenresList: React.FC<GenresListProps> = ({ genres }) => {
  const rows: Genre[][] = [];
  for (let i = 0; i < genres.length; i += 4) {
    rows.push(genres.slice(i, i + 4));
  }

  return (
    <div className="genres-list">
      {rows.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="genres-list__row">
          {row.map((genre) => (
            <GenreCard
              key={genre.id}
              id={genre.id}
              name={genre.name}
              image={genre.image}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GenresList;