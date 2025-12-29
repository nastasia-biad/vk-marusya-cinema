import React, { useEffect, useState } from 'react';
import './TransitionWrapper.scss';

interface TransitionWrapperProps {
  children: React.ReactNode;
  isChanging: boolean;
  animationType?: 'fade' | 'slide' | 'flip' | 'scale';
  duration?: number;
  onAnimationComplete?: () => void;
}

const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  isChanging,
  animationType = 'fade',
  duration = 500,
  onAnimationComplete
}) => {
  const [showContent, setShowContent] = useState(true);
  const [localIsChanging, setLocalIsChanging] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (isChanging && !localIsChanging) {
      setLocalIsChanging(true);
      setShowContent(false);
      
      const timer = setTimeout(() => {
        setAnimationKey(prev => prev + 1);
        setShowContent(true);
        
        setTimeout(() => {
          setLocalIsChanging(false);
          onAnimationComplete?.();
        }, duration);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isChanging, localIsChanging, duration, onAnimationComplete]);

  const getAnimationClass = () => {
    const baseClass = `transition-wrapper transition-wrapper--${animationType}`;
    
    if (localIsChanging) {
      return `${baseClass} transition-wrapper--changing`;
    }
    
    if (showContent) {
      return `${baseClass} transition-wrapper--visible`;
    }
    
    return `${baseClass} transition-wrapper--hidden`;
  };

  return (
    <div 
      className={getAnimationClass()}
      style={{ '--transition-duration': `${duration}ms` } as React.CSSProperties}
      key={animationKey}
    >
      <div className="transition-wrapper__content">
        {children}
      </div>
      
      {localIsChanging && (
        <div className="transition-wrapper__overlay">
          <div className="transition-wrapper__loader">
            <div className="transition-wrapper__loader-spinner"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransitionWrapper;