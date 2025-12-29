export { default as TransitionWrapper } from './TransitionWrapper';
export { default as LoadingOverlay } from './LoadingOverlay';

// Утилиты анимации
export const getRandomAnimationType = (): string => {
  const types = ['fade', 'slide', 'flip', 'scale'];
  return types[Math.floor(Math.random() * types.length)];
};

export const createAnimationStyles = (duration: number = 300) => ({
  animationDuration: `${duration}ms`,
  animationTimingFunction: 'ease-in-out',
});