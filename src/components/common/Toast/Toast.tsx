import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { clearNotification } from '../../../store/slices/uiSlice';
import './Toast.scss';

interface ToastProps {
  autoClose?: boolean;
  autoCloseDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const Toast: React.FC<ToastProps> = ({
  autoClose = true,
  autoCloseDuration = 5000,
  position = 'top-right'
}) => {
  const dispatch = useAppDispatch();
  const { notification } = useAppSelector((state) => state.ui);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      setProgress(100);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => dispatch(clearNotification()), 300);
        }, autoCloseDuration);
        
        const progressTimer = setInterval(() => {
          setProgress(prev => {
            if (prev <= 0) {
              clearInterval(progressTimer);
              return 0;
            }
            return prev - (100 / (autoCloseDuration / 100));
          });
        }, 100);
        
        return () => {
          clearTimeout(timer);
          clearInterval(progressTimer);
        };
      }
    }
  }, [notification, autoClose, autoCloseDuration, dispatch]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => dispatch(clearNotification()), 300);
  };

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg className="toast__icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor" />
          </svg>
        );
      case 'error':
        return (
          <svg className="toast__icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="toast__icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z" fill="currentColor" />
          </svg>
        );
      case 'info':
        return (
          <svg className="toast__icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeClass = () => {
    switch (notification.type) {
      case 'success': return 'toast--success';
      case 'error': return 'toast--error';
      case 'warning': return 'toast--warning';
      case 'info': return 'toast--info';
      default: return '';
    }
  };

  const getPositionClass = () => {
    switch (position) {
      case 'top-right': return 'toast--top-right';
      case 'top-left': return 'toast--top-left';
      case 'bottom-right': return 'toast--bottom-right';
      case 'bottom-left': return 'toast--bottom-left';
      case 'top-center': return 'toast--top-center';
      case 'bottom-center': return 'toast--bottom-center';
      default: return 'toast--top-right';
    }
  };

  const getTitle = () => {
    switch (notification.type) {
      case 'success': return 'Успешно!';
      case 'error': return 'Ошибка!';
      case 'warning': return 'Внимание!';
      case 'info': return 'Информация';
      default: return '';
    }
  };

  return (
    <div className={`toast ${getTypeClass()} ${getPositionClass()} ${isVisible ? 'toast--visible' : ''}`}>
      <div className="toast__content">
        <div className="toast__header">
          <div className="toast__icon-container">
            {getIcon()}
          </div>
          <div className="toast__title">{getTitle()}</div>
          <button 
            className="toast__close" 
            onClick={handleClose}
            aria-label="Закрыть уведомление"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
            </svg>
          </button>
        </div>
        
        <div className="toast__message">{notification.message}</div>
        
        {notification.details && (
          <div className="toast__details">
            <details>
              <summary>Подробнее</summary>
              <p>{notification.details}</p>
            </details>
          </div>
        )}
        
        {autoClose && (
          <div className="toast__progress">
            <div 
              className="toast__progress-bar" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Toast;