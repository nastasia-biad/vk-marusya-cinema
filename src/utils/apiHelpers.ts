export const withCredentials = {
  withCredentials: true,
};

export const handleApiError = (error: any): string => {
  if (error.response?.status === 401) {
    return 'Требуется авторизация';
  }
  if (error.response?.status === 404) {
    return 'Ресурс не найден';
  }
  return 'Ошибка сервера';
};