export type AnimationType = 'fade' | 'slide' | 'flip' | 'scale' | 'bounce';

export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  delay?: number;
  easing?: string;
}

export const getAnimationClasses = (config: AnimationConfig): string => {
  const baseClass = `animation-${config.type}`;
  const classes = [baseClass];
  
  if (config.delay) {
    classes.push(`animation-delay-${config.delay}`);
  }
  
  return classes.join(' ');
};

export const createAnimationKey = (baseKey: string, iteration: number): string => {
  return `${baseKey}-${iteration}`;
};


export const getRandomAnimationType = (): AnimationType => {
  const types: AnimationType[] = ['fade', 'slide', 'flip', 'scale', 'bounce'];
  return types[Math.floor(Math.random() * types.length)];
};


export const msToSeconds = (ms: number): string => {
  return `${ms / 1000}s`;
};


export const createAnimationStyles = (config: AnimationConfig): React.CSSProperties => {
  return {
    '--animation-duration': msToSeconds(config.duration),
    '--animation-delay': config.delay ? msToSeconds(config.delay) : '0s',
    '--animation-easing': config.easing || 'ease-in-out',
  } as React.CSSProperties;
};


export const animateIn = (element: HTMLElement, config: AnimationConfig = {
  type: 'fade',
  duration: 300
}): Promise<void> => {
  return new Promise((resolve) => {
    element.style.animation = `${config.type}In ${config.duration}ms ${config.easing || 'ease-in-out'}`;
    element.style.opacity = '1';
    
    setTimeout(() => {
      element.style.animation = '';
      resolve();
    }, config.duration);
  });
};


export const animateOut = (element: HTMLElement, config: AnimationConfig = {
  type: 'fade',
  duration: 300
}): Promise<void> => {
  return new Promise((resolve) => {
    element.style.animation = `${config.type}Out ${config.duration}ms ${config.easing || 'ease-in-out'}`;
    element.style.opacity = '0';
    
    setTimeout(() => {
      element.style.animation = '';
      resolve();
    }, config.duration);
  });
};

export const animateSequence = async (
  elements: HTMLElement[],
  config: AnimationConfig,
  staggerDelay: number = 100
): Promise<void> => {
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const elementConfig = {
      ...config,
      delay: config.delay ? config.delay + (i * staggerDelay) : i * staggerDelay
    };
    
    await animateIn(element, elementConfig);
  }
};