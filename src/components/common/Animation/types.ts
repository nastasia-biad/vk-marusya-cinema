export type AnimationType = 'fade' | 'slide' | 'flip' | 'scale' | 'bounce';

export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  delay?: number;
  easing?: string;
}

export interface TransitionWrapperProps {
  children: React.ReactNode;
  isChanging: boolean;
  animationType?: AnimationType;
  duration?: number;
  onAnimationComplete?: () => void;
}