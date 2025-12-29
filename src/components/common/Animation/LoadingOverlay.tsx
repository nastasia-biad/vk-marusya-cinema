import React from 'react';
import './LoadingOverlay.scss';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  type?: 'spinner' | 'dots' | 'pulse' | 'morph';
  backdropBlur?: boolean;
  transparent?: boolean;
  fullScreen?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Загрузка...',
  type = 'morph',
  backdropBlur = true,
  transparent = false,
  fullScreen = false,
}) => {
  if (!isVisible) return null;

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

  const overlayClass = `loading-overlay ${backdropBlur ? 'loading-overlay--blur' : ''} ${
    transparent ? 'loading-overlay--transparent' : ''
  } ${fullScreen ? 'loading-overlay--fullscreen' : ''}`;

  const contentClass = `loading-overlay__content ${
    fullScreen ? 'loading-overlay__content--fullscreen' : ''
  }`;

  return (
    <div className={overlayClass}>
      <div className={contentClass}>
        {renderLoader()}
        {message && <p className="loading-overlay__message">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingOverlay;