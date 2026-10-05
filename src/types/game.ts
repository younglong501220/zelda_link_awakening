export type GameScreen = 'TITLE' | 'PLAYING' | 'ENDING';
export type WeatherMode = 'rain_and_fog' | 'fog_only' | 'clear';

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  speed: number;
  facing: 'up' | 'down' | 'left' | 'right';
  isAttacking: boolean;
  attackTimer: number;
  stepCycle: number;
  hearts: number;
  maxHearts: number;
  rupees: number;
  invincibleTimer: number;
}

export interface SirenInstrument {
  id: number;
  name: string;
  jpName: string;
  icon: string;
  x: number;
  y: number;
  taken: boolean;
  region: string;
  description: string;
  poeticNote: string;
}

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'tree' | 'house' | 'rock' | 'water' | 'wall' | 'pillar';
  color?: string;
  roofColor?: string;
}

export interface Bush {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  cut: boolean;
  respawnTime?: number;
}

export interface DropItem {
  id: number;
  x: number;
  y: number;
  type: 'heart' | 'rupee';
  value: number;
  vy: number;
  lifetime: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  originX: number;
  originY: number;
  w: number;
  h: number;
  hp: number;
  type: 'octorok' | 'slime';
  vx: number;
  vy: number;
  color: string;
  facing: 'left' | 'right' | 'up' | 'down';
  shootTimer?: number;
  moveTimer: number;
  isHitTimer: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
}

export interface NPC {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  role: string;
  facing: 'left' | 'right' | 'down' | 'up';
}

export interface Cucco {
  x: number;
  y: number;
  vx: number;
  vy: number;
  walkTimer: number;
  facing: 'left' | 'right';
  isPanic: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface DialogueLine {
  speaker: string;
  speakerRole?: string;
  text: string;
  portrait?: 'marin_smile' | 'marin_sing' | 'marin_sad' | 'instrument' | 'egg';
}
