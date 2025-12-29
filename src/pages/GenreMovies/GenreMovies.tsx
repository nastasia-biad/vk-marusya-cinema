import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import MovieCard from '../../components/MovieCard/MovieCard';
import Loading from '../../components/common/Loading/Loading';
import { adaptiveApiService } from '../../services/adaptiveApiService';
import './GenreMovies.scss';

const GenreMovies: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movies, setMovies] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [totalMovies, setTotalMovies] = useState(0);

  const genreId = parseInt(id || '0');

  const loadMovies = useCallback(async (page: number = 1) => {
    if (isLoading || !genreId) return;

    setIsLoading(true);

    try {
      const result = await adaptiveApiService.getMoviesByGenre(genreId, page);

      if (page === 1) {
        setMovies(result.movies);
      } else {
        setMovies(prev => [...prev, ...result.movies]);
      }

      setTotalMovies(result.total);
      setHasMore(result.hasMore);
      setCurrentPage(page);

    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [genreId, isLoading]);

  useEffect(() => {
    if (genreId) {
      loadMovies(1);
    }
  }, [genreId]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadMovies(currentPage + 1);
    }
  }, [isLoading, hasMore, currentPage, loadMovies]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.scrollHeight - 500 &&
        hasMore &&
        !isLoading
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, loadMore]);

  const rows: any[][] = [];
  for (let i = 0; i < movies.length; i += 5) {
    rows.push(movies.slice(i, i + 5));
  }

  return (
    <div className="genre-movies-page">
      <Header />
      <main className="genre-movies-main">
        <div className="container">
          <div className="genre-movies-content">
            {/* Хлебные крошки */}
            <div className="genre-movies-breadcrumbs">
              <div className="genre-movies-back-btn-wrapper">
                <button
                  className="genre-movies-back-btn"
                  onClick={() => navigate('/genres')}
                >
                  <div className="genre-movies-back-btn-content">
                    <div className="genre-movies-back-icon">
                      <img
                        src="/assets/icons/arrow-back.svg"
                        alt="Назад"
                        width="24"
                        height="24"
                      />
                    </div>
                    <span className="genre-movies-back-text">Назад к жанрам</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Заголовок с количеством фильмов */}
            <div className="genre-movies-header">
              <h1 className="genre-movies-title">Фильмы</h1>
              {totalMovies > 0 && (
                <div className="genre-movies-count">
                  Найдено: {totalMovies} фильмов
                </div>
              )}
            </div>

            {/* Сетка фильмов */}
            <div className="genre-movies-grid">
              {rows.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="genre-movies-row">
                  {row.map((movie) => (
                    <div key={movie.id} className="genre-movie-card-wrapper">
                      <MovieCard
                        id={movie.id}
                        title={movie.title}
                        year={movie.year}
                        rating={movie.rating}
                        poster={movie.poster}
                        genre={movie.genre}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Индикатор загрузки */}
            {isLoading && (
              <div className="genre-movies-loading">
                <Loading size="small" message="Загрузка фильмов..." />
              </div>
            )}

            {/* Кнопка загрузки еще */}
            {!isLoading && hasMore && movies.length > 0 && (
              <div className="genre-movies-load-more">
                <button
                  className="genre-movies-load-more-btn"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  Показать еще
                </button>
              </div>
            )}

            {/* Сообщение об отсутствии фильмов */}
            {!isLoading && movies.length === 0 && (
              <div className="genre-movies-empty">
                <p>По данному жанру фильмов не найдено</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GenreMovies;