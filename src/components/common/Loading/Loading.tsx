import React from 'react';
import './Loading.scss';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
  type?: 'spinner' | 'dots' | 'pulse' | 'morph';
  color?: 'primary' | 'white' | 'gradient';
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'medium', 
  message = 'Загрузка...',
  fullScreen = false,
  type = 'morph',
  color = 'gradient'
}) => {
  const sizeClass = `loading--${size}`;
  const typeClass = `loading--${type}`;
  const colorClass = `loading--${color}`;
  
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="loading-dots">
            <div className="loading-dots__dot loading-dots__dot--1"></div>
            <div className="loading-dots__dot loading-dots__dot--2"></div>
            <div className="loading-dots__dot loading-dots__dot--3"></div>
          </div>
        );
      case 'pulse':
        return (
          <div className="loading-pulse">
            <div className="loading-pulse__circle loading-pulse__circle--1"></div>
            <div className="loading-pulse__circle loading-pulse__circle--2"></div>
            <div className="loading-pulse__circle loading-pulse__circle--3"></div>
          </div>
        );
      case 'morph':
        return (
          <div className="loading-morph">
            <div className="loading-morph__shape loading-morph__shape--1"></div>
            <div className="loading-morph__shape loading-morph__shape--2"></div>
            <div className="loading-morph__shape loading-morph__shape--3"></div>
          </div>
        );
      default:
        return (
          <div className="loading-spinner">
            <div className="loading-spinner__circle"></div>
            <div className="loading-spinner__inner-circle"></div>
          </div>
        );
    }
  };
  
  const content = (
    <div className={`loading ${sizeClass} ${typeClass} ${colorClass}`}>
      <div className="loading__animation">
        {renderLoader()}
      </div>
      {message && <p className="loading__message">{message}</p>}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-fullscreen__backdrop"></div>
        {content}
      </div>
    );
  }
  
  return content;
};

export default Loading;