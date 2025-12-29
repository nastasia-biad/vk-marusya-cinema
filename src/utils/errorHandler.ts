export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}


export const handleApiError = (error: any): { message: string; details?: string } => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          message: data?.message || 'Некорректный запрос',
          details: data?.details
        };
      
      case 401:
        return {
          message: data?.message || 'Требуется авторизация',
          details: 'Пожалуйста, войдите в систему'
        };
      
      case 403:
        return {
          message: data?.message || 'Доступ запрещен',
          details: 'У вас недостаточно прав для выполнения этого действия'
        };
      
      case 404:
        return {
          message: data?.message || 'Ресурс не найден',
          details: 'Запрошенный ресурс не существует'
        };
      
      case 409:
        return {
          message: data?.message || 'Конфликт данных',
          details: data?.details
        };
      
      case 422:
        return {
          message: data?.message || 'Ошибка валидации',
          details: data?.errors ? JSON.stringify(data.errors) : data?.details
        };
      
      case 429:
        return {
          message: 'Слишком много запросов',
          details: 'Пожалуйста, подождите некоторое время перед повторной попыткой'
        };
      
      case 500:
        return {
          message: 'Внутренняя ошибка сервера',
          details: 'Пожалуйста, попробуйте позже'
        };
      
      case 502:
      case 503:
      case 504:
        return {
          message: 'Сервер временно недоступен',
          details: 'Пожалуйста, попробуйте позже'
        };
      
      default:
        return {
          message: `Ошибка сервера: ${status}`,
          details: data?.message
        };
    }
  } 
  else if (error.request) {
    if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
      return {
        message: 'Ошибка CORS',
        details: 'Проверьте настройки сервера и прокси'
      };
    }
    
    if (error.code === 'ECONNABORTED') {
      return {
        message: 'Превышено время ожидания',
        details: 'Сервер слишком долго отвечает. Попробуйте позже'
      };
    }
    
    return {
      message: 'Нет ответа от сервера',
      details: 'Проверьте подключение к интернету'
    };
  } 
  else {
    return {
      message: error.message || 'Ошибка при выполнении запроса',
      details: error.code
    };
  }
};

export const isNetworkError = (error: any): boolean => {
  return !error.response && error.request;
};

export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401;
};


export const isValidationError = (error: any): boolean => {
  return error.response?.status === 422;
};

export const isCorsError = (error: any): boolean => {
  return error.message?.includes('CORS') || error.message?.includes('cross-origin');
};


export const isTimeoutError = (error: any): boolean => {
  return error.code === 'ECONNABORTED' || error.message?.includes('timeout');
};

export const handleUIError = (error: any, fallbackMessage: string = 'Произошла ошибка'): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return fallbackMessage;
};


export const safeLog = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[LOG]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WARN]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR]', ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info('[INFO]', ...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[DEBUG]', ...args);
    }
  }
};

export const useErrorHandler = () => {
  const handleError = (error: any, callback?: (message: string) => void) => {
    const errorInfo = handleApiError(error);

    safeLog.error('Error occurred:', error);
    safeLog.error('Error info:', errorInfo);
    
    if (callback) {
      callback(errorInfo.message);
    }
    
    return errorInfo;
  };
  
  const handleAsyncError = async <T>(
    promise: Promise<T>,
    callback?: (message: string) => void
  ): Promise<{ data?: T; error?: string }> => {
    try {
      const data = await promise;
      return { data };
    } catch (error) {
      const errorInfo = handleError(error, callback);
      return { error: errorInfo.message };
    }
  };
  
  return {
    handleError,
    handleAsyncError,
    isNetworkError,
    isAuthError,
    isValidationError,
    isCorsError,
    isTimeoutError
  };
};


export const setupGlobalErrorHandler = () => {
  if (window._globalErrorHandlerInstalled) {
    return;
  }
  
  const handlePromiseRejection = (event: PromiseRejectionEvent) => {
    safeLog.error('Unhandled Promise rejection:', event.reason);
    
    event.preventDefault();
    
  };
  
  const handleGlobalError = (event: ErrorEvent) => {
    safeLog.error('Global error:', event.error);
    
    event.preventDefault();
    
    if (event.target instanceof HTMLElement) {
      return;
    }
    
    if (event.error && event.error.message) {
      const errorMessage = event.error.message;
      
      if (!errorMessage.includes('React will try to recreate this component tree')) {
      }
    }
  };
  
  window.addEventListener('unhandledrejection', handlePromiseRejection);
  window.addEventListener('error', handleGlobalError);
  
  window._globalErrorHandlerInstalled = true;
  
  safeLog.info('Global error handler установлен');
  
  return () => {
    window.removeEventListener('unhandledrejection', handlePromiseRejection);
    window.removeEventListener('error', handleGlobalError);
    window._globalErrorHandlerInstalled = false;
  };
};


export const performanceMonitor = {
  start: (name: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.time(`⏱️ ${name}`);
    }
  },
  
  end: (name: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd(`⏱️ ${name}`);
    }
  },
  
  measure: async <T>(name: string, operation: () => Promise<T>): Promise<T> => {
    performanceMonitor.start(name);
    try {
      const result = await operation();
      performanceMonitor.end(name);
      return result;
    } catch (error) {
      performanceMonitor.end(name);
      throw error;
    }
  }
};

declare global {
  interface Window {
    _globalErrorHandlerInstalled?: boolean;
  }
}