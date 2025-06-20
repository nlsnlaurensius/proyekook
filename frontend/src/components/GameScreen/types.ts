export interface UserWithId {
  id?: number;
  userId?: number;
  username: string;
  coin?: number; 
}

export interface GameScreenProps {
  user: UserWithId;
  onGameOver: (score: number, coinsCollected: number) => void;
  onBack: () => void;
  soundEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  onSoundSettingsChange: (soundEnabled: boolean, musicVolume: number, sfxVolume: number) => void;
  orientationState?: { isMobile: boolean; isPortrait: boolean } | null;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  type: 'low' | 'high' | 'flying';
  width: number;
  height: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}
