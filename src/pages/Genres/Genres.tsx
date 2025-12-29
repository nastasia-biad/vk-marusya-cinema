import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import GenresList from '../../components/genres/GenresList/GenresList';
import { fetchGenres } from '../../store/thunks/movieThunks';
import './Genres.scss';

const Genres: React.FC = () => {
  const dispatch = useAppDispatch();
  const { genres, isLoading, error } = useAppSelector((state) => state.movies);

  useEffect(() => {
    dispatch(fetchGenres());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="genres-page">
        <Header />
        <main className="genres-main">
          <div className="container">
            <div className="genres-loading">Загрузка жанров...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="genres-page">
        <Header />
        <main className="genres-main">
          <div className="container">
            <div className="genres-error">Ошибка загрузки жанров: {error}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="genres-page">
      <Header />
      <main className="genres-main">
        <div className="container">
          <div className="genres-content">
            <div className="genres-header">
              <div className="genres-title-wrapper">
                <div className="genres-icon"></div>
                <h1 className="genres-title">Жанры</h1>
              </div>
            </div>
            
            {genres.length > 0 ? (
              <GenresList genres={genres} />
            ) : (
              <div className="genres-empty">
                Жанры не найдены
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Genres;