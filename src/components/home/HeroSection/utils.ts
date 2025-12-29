export const getRatingColor = (rating: number): string => {
  if (rating >= 8.0) return '#308E21';
  if (rating >= 7.0) return '#4CAF50';
  if (rating >= 6.0) return '#A59400';
  if (rating >= 5.0) return '#FF9800';
  return '#777777';
};


export const formatDuration = (duration: string): string => {
  return duration.replace('ч', 'ч ').replace('м', 'мин');
};


export const truncateDescription = (description: string, maxLength: number = 200): string => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength).trim() + '...';
};


export const getAnimationIcon = (type: string): string => {
  const icons: Record<string, string> = {
    fade: '✨',
    slide: '↕️',
    flip: '🔄',
    scale: '📐',
    bounce: '🏀'
  };
  return icons[type] || '🎬';
};


export const getRandomGradient = (): string => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  ];
  
  return gradients[Math.floor(Math.random() * gradients.length)];
};


export const isNewMovie = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return currentYear - year <= 1;
};