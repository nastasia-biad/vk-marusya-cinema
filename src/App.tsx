import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { 
  restoreUserFromStorage, 
  checkAuth,
  restoreFavorites
} from './store/slices/authSlice';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';
import Loading from './components/common/Loading/Loading';
import Toast from './components/common/Toast/Toast';
import './styles/globals.scss';


// Ленивая загрузка компонентов страниц
const Home = lazy(() => import('./pages/Home/Home'));
const Genres = lazy(() => import('./pages/Genres/Genres'));
const GenreMovies = lazy(() => import('./pages/GenreMovies/GenreMovies'));
const MoviePage = lazy(() => import('./pages/MoviePage/MoviePage'));
const AccountPage = lazy(() => import('./pages/AccountPage/AccountPage'));

// Ленивая загрузка модальных компонентов
const AuthModal = lazy(() => import('./components/common/Modal/AuthModal'));
const TrailerModal = lazy(() => import('./components/common/Modal/TrailerModal'));
const SearchModal = lazy(() => import('./components/common/Modal/SearchModal'));


const AppInitializer: React.FC = () => {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
  const initializeApp = async () => {
    try {
      console.log('Initializing app...');
      
      dispatch(restoreUserFromStorage());
      dispatch(restoreFavorites());

      
      console.log('App initialization complete');
    } catch (error) {
      console.error('App initialization error:', error);
    }
  };
  
  initializeApp();
}, [dispatch]);
  
  return null;
};

const ModalManager: React.FC = () => {
  const { isAuthModalOpen, isTrailerModalOpen, isSearchModalOpen } = useAppSelector((state) => state.ui);
  
  return (
    <Suspense fallback={null}>
      {isAuthModalOpen && <AuthModal />}
      {isTrailerModalOpen && <TrailerModal />}
      {isSearchModalOpen && <SearchModal />}
    </Suspense>
  );
};

const NotificationManager: React.FC = () => {
  return <Toast autoClose={true} autoCloseDuration={5000} />;
};

const LoadingFallback: React.FC = () => (
  <div className="app-loading">
    <Loading size="large" message="Загрузка приложения..." />
  </div>
);

const NotFoundPage: React.FC = () => (
  <div className="not-found-page">
    <div className="container">
      <div className="not-found-content">
        <h2>Страница не найдена</h2>
        <p>Запрошенная страница не существует.</p>
        <a href="/" className="btn btn-primary">
          На главную
        </a>
      </div>
    </div>
  </div>
);

const GlobalLoadingOverlay: React.FC = () => {
  const { isLoading: authLoading } = useAppSelector((state) => state.auth);
  const { isLoading: moviesLoading } = useAppSelector((state) => state.movies);
  
  const isGlobalLoading = authLoading || moviesLoading;
  
  if (!isGlobalLoading) return null;
  
  return (
    <div className="global-loading-overlay">
      <Loading size="large" message="Загрузка..." />
    </div>
  );
};

function AppContent() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return (
    <div className="App">
      <AppInitializer />
      <NotificationManager />
      <ModalManager />
      <GlobalLoadingOverlay />
      
      <Suspense fallback={<LoadingFallback />}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/genre/:id" element={<GenreMovies />} />
          <Route path="/movie/:id" element={<MoviePage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <AppContent />
        </Router>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;