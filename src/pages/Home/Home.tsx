import React from 'react';
import { useMobile } from '../../hooks/useMobile';
import Header from '../../components/common/Header/Header';
import HeroSection from '../../components/home/HeroSection/HeroSection';
import TopMovies from '../../components/home/TopMovies/TopMovies';
import Footer from '../../components/common/Footer/Footer';
import './Home.scss';

const Home: React.FC = () => {
  const isMobile = useMobile();
  
  return (
    <div className={`home ${isMobile ? 'home--mobile' : ''}`}>
      <Header />
      <main className="home__main">
        <HeroSection />
        <TopMovies />
      </main>
      <Footer />
    </div>
  );
};

export default Home;