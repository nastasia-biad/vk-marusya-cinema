import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setError } from '../store/slices/uiSlice';

export const useErrorHandler = () => {
  const dispatch = useDispatch();
  const [error, setLocalError] = useState<string | null>(null);

  const handleError = useCallback((error: any) => {
    const message = error.response?.data?.message || error.message || 'Произошла ошибка';
    setLocalError(message);
    dispatch(setError(message));
    
    setTimeout(() => {
      setLocalError(null);
    }, 5000);
  }, [dispatch]);

  const clearError = useCallback(() => {
    setLocalError(null);
  }, []);

  return { error, handleError, clearError };
};