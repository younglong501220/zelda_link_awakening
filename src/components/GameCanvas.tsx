import React, { useEffect, useRef } from 'react';
import {
  Bush,
  Cucco,
  DropItem,
  Enemy,
  Obstacle,
  Particle,
  Player,
  Position,
  SirenInstrument,
  WeatherMode,
} from '../types/game';
import {
  EGG_ALTAR,
  MARIN_INITIAL,
  TARIN_INITIAL,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../game/worldData';
import { sound } from '../audio/soundEngine';

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
}

interface RainRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface GameCanvasProps {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  instruments: SirenInstrument[];
  bushes: Bush[];
  setBushes: React.Dispatch<React.SetStateAction<Bush[]>>;
  enemies: Enemy[];
  setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>;
  obstacles: Obstacle[];
  isDialogueActive: boolean;
  virtualDir: Position;
  weatherMode?: WeatherMode;
  onActionTriggered: () => void;
  onGainRupee: (amount: number) => void;
  onHealHeart: () => void;
  onBushCut: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  player,
  setPlayer,
  instruments,
  bushes,
  setBushes,
  enemies,
  setEnemies,
  obstacles,
  isDialogueActive,
  virtualDir,
  weatherMode = 'rain_and_fog',
  onActionTriggered,
  onGainRupee,
  onHealHeart,
  onBushCut,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable refs for continuous 60fps game loop without stale closures
  const playerRef = useRef(player);
  playerRef.current = player;

  const bushesRef = useRef(bushes);
  bushesRef.current = bushes;

  const enemiesRef = useRef(enemies);
  enemiesRef.current = enemies;

  const instrumentsRef = useRef(instruments);
  instrumentsRef.current = instruments;

  const isDialogueActiveRef = useRef(isDialogueActive);
  isDialogueActiveRef.current = isDialogueActive;

  const virtualDirRef = useRef(virtualDir);
  virtualDirRef.current = virtualDir;

  const weatherModeRef = useRef(weatherMode);
  weatherModeRef.current = weatherMode;

  // Active keyboard state
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Dynamic entities
  const dropItemsRef = useRef<DropItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const raindropsRef = useRef<RainDrop[]>([]);
  const ripplesRef = useRef<RainRipple[]>([]);
  const cuccoRef = useRef<Cucco>({
    x: 710,
    y: 930,
    vx: 0,
    vy: 0,
    walkTimer: 30,
    facing: 'left',
    isPanic: 0,
  });

  // Animation frame ticks
  const tickRef = useRef(0);

  // Setup keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;

      if (e.key === ' ' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'z' || e.key === 'Enter') {
        e.preventDefault();
        onActionTriggered();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onActionTriggered]);

  // Main 60 FPS Render & Physics Loop
  useEffect(() => {
    let animationFrameId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive Canvas Resizing
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const gameLoop = () => {
      tickRef.current++;
      const ticks = tickRef.current;

      const p = playerRef.current;
      const currentBushes = bushesRef.current;
      const currentEnemies = enemiesRef.current;

      // 1. UPDATE PHYSICS & MOVEMENT
      if (!isDialogueActiveRef.current) {
        let dx = 0;
        let dy = 0;

        // Keyboard movement
        const keys = keysRef.current;
        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;

        // Virtual D-pad overrides / blends
        if (virtualDirRef.current.x !== 0 || virtualDirRef.current.y !== 0) {
          dx = virtualDirRef.current.x;
          dy = virtualDirRef.current.y;
        }

        let newFacing = p.facing;
        if (dy < 0) newFacing = 'up';
        else if (dy > 0) newFacing = 'down';
        else if (dx < 0) newFacing = 'left';
        else if (dx > 0) newFacing = 'right';

        // Diagonal normalization
        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        const nextX = p.x + dx * p.speed;
        const nextY = p.y + dy * p.speed;

        // Collision detection with Obstacles
        let collision = false;
        const pRadius = 12;

        for (const obs of obstacles) {
          if (
            nextX + pRadius > obs.x &&
            nextX - pRadius < obs.x + obs.w &&
            nextY + pRadius > obs.y &&
            nextY - pRadius < obs.y + obs.h
          ) {
            collision = true;
            break;
          }
        }

        // Collision detection with uncut bushes
        if (!collision) {
          for (const b of currentBushes) {
            if (!b.cut) {
              if (
                nextX + pRadius > b.x - b.w / 2 &&
                nextX - pRadius < b.x + b.w / 2 &&
                nextY + pRadius > b.y - b.h / 2 &&
                nextY - pRadius < b.y + b.h / 2
              ) {
                collision = true;
                break;
              }
            }
          }
        }

        // Apply movement if no collision
        let updatedX = p.x;
        let updatedY = p.y;
        let updatedStepCycle = p.stepCycle;

        if (!collision) {
          updatedX = Math.max(30, Math.min(WORLD_WIDTH - 30, nextX));
          updatedY = Math.max(30, Math.min(WORLD_HEIGHT - 30, nextY));
          if (dx !== 0 || dy !== 0) {
            updatedStepCycle += 0.2;
          }
        }

        // Update ambient audio volume based on Link's distance to south beach
        sound.updateAmbientPosition(updatedY);

        // Environmental sound system: subtle bird chirping when walking in forested areas
        const inForest = updatedX >= 50 && updatedX <= 680 && updatedY >= 70 && updatedY <= 680;
        sound.updateForestAmbience(inForest);

        // Attack timer decay
        let updatedAttacking = p.isAttacking;
        let updatedAttackTimer = p.attackTimer;
        if (updatedAttackTimer > 0) {
          updatedAttackTimer--;
          if (updatedAttackTimer === 0) {
            updatedAttacking = false;
          }
        }

        // Invincible timer decay (after hit)
        let updatedInvincibleTimer = Math.max(0, p.invincibleTimer - 1);

        // Check sword slash collisions with bushes & enemies
        if (p.isAttacking && p.attackTimer === 11) {
          // Sword hitbox positioned in front of player
          let slashX = p.x;
          let slashY = p.y;
          const reach = 28;
          if (p.facing === 'up') slashY -= reach;
          if (p.facing === 'down') slashY += reach;
          if (p.facing === 'left') slashX -= reach;
          if (p.facing === 'right') slashX += reach;

          // Cut bushes
          let anyBushCut = false;
          const nextBushes = currentBushes.map((b) => {
            if (!b.cut) {
              const dist = Math.hypot(b.x - slashX, b.y - slashY);
              if (dist < 32) {
                anyBushCut = true;
                sound.playBushCut();
                onBushCut();

                // Leaf burst particles
                for (let i = 0; i < 8; i++) {
                  particlesRef.current.push({
                    x: b.x,
                    y: b.y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3 - 1,
                    size: Math.random() * 4 + 2,
                    color: Math.random() > 0.5 ? '#65a30d' : '#84cc16',
                    alpha: 1,
                    life: 25,
                    maxLife: 25,
                  });
                }

                // Drop heart or rupee chance (65%)
                if (Math.random() < 0.65) {
                  const isHeart = Math.random() < 0.35 && p.hearts < p.maxHearts;
                  dropItemsRef.current.push({
                    id: Math.random(),
                    x: b.x,
                    y: b.y,
                    type: isHeart ? 'heart' : 'rupee',
                    value: isHeart ? 1 : Math.random() < 0.2 ? 5 : 1,
                    vy: -3.5,
                    lifetime: 360,
                  });
                }

                return { ...b, cut: true };
              }
            }
            return b;
          });

          if (anyBushCut) {
            setBushes(nextBushes);
          }

          // Hit enemies
          const nextEnemies = currentEnemies
            .map((enemy) => {
              const dist = Math.hypot(enemy.x - slashX, enemy.y - slashY);
              if (dist < 36 && enemy.isHitTimer === 0) {
                sound.playEnemyDefeat();
                // Particle puff
                for (let i = 0; i < 10; i++) {
                  particlesRef.current.push({
                    x: enemy.x,
                    y: enemy.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4 - 1,
                    size: Math.random() * 5 + 3,
                    color: '#ffffff',
                    alpha: 1,
                    life: 20,
                    maxLife: 20,
                  });
                }

                // Drop item
                dropItemsRef.current.push({
                  id: Math.random(),
                  x: enemy.x,
                  y: enemy.y,
                  type: Math.random() < 0.4 ? 'heart' : 'rupee',
                  value: 1,
                  vy: -3.5,
                  lifetime: 360,
                });

                return {
                  ...enemy,
                  hp: enemy.hp - 1,
                  isHitTimer: 15,
                };
              }
              return enemy;
            })
            .filter((e) => e.hp > 0);

          setEnemies(nextEnemies);
        }

        // Update enemies AI movement
        const updatedEnemies = currentEnemies.map((e) => {
          let ex = e.x;
          let ey = e.y;
          let evx = e.vx;
          let evy = e.vy;
          let moveTimer = e.moveTimer - 1;
          let facing = e.facing;

          if (moveTimer <= 0) {
            moveTimer = 40 + Math.floor(Math.random() * 50);
            const angle = Math.random() * Math.PI * 2;
            const spd = e.type === 'octorok' ? 1.4 : 0.9;
            evx = Math.cos(angle) * spd;
            evy = Math.sin(angle) * spd;
            facing = Math.abs(evx) > Math.abs(evy) ? (evx > 0 ? 'right' : 'left') : (evy > 0 ? 'down' : 'up');
          }

          // Return closer to origin if too far
          if (Math.hypot(ex - e.originX, ey - e.originY) > 160) {
            evx = (e.originX - ex) * 0.02;
            evy = (e.originY - ey) * 0.02;
          }

          ex += evx;
          ey += evy;

          // Check hit against player
          if (
            updatedInvincibleTimer === 0 &&
            Math.hypot(ex - updatedX, ey - updatedY) < 22
          ) {
            sound.playDamage();
            updatedInvincibleTimer = 45;
            setPlayer((prev) => ({
              ...prev,
              hearts: Math.max(1, prev.hearts - 1),
            }));
          }

          return {
            ...e,
            x: ex,
            y: ey,
            vx: evx,
            vy: evy,
            moveTimer,
            facing,
            isHitTimer: Math.max(0, e.isHitTimer - 1),
          };
        });

        // Update Cucco (Chicken)
        const cucco = cuccoRef.current;
        cucco.walkTimer--;
        if (cucco.walkTimer <= 0) {
          cucco.walkTimer = 30 + Math.floor(Math.random() * 40);
          if (Math.random() < 0.6) {
            cucco.vx = (Math.random() - 0.5) * 1.5;
            cucco.vy = (Math.random() - 0.5) * 1.5;
            cucco.facing = cucco.vx > 0 ? 'right' : 'left';
          } else {
            cucco.vx = 0;
            cucco.vy = 0;
          }
        }
        // If Link approaches cucco, panic run!
        const distToCucco = Math.hypot(cucco.x - updatedX, cucco.y - updatedY);
        if (distToCucco < 45) {
          cucco.vx = (cucco.x - updatedX) * 0.08;
          cucco.vy = (cucco.y - updatedY) * 0.08;
          cucco.isPanic = 30;
        } else if (cucco.isPanic > 0) {
          cucco.isPanic--;
        }
        cucco.x = Math.max(600, Math.min(840, cucco.x + cucco.vx));
        cucco.y = Math.max(860, Math.min(960, cucco.y + cucco.vy));

        // Update Drop Items
        dropItemsRef.current = dropItemsRef.current
          .map((item) => {
            const vy = item.vy + 0.25; // gravity
            const y = item.vy < 0 ? item.y + vy : item.y;
            const lifetime = item.lifetime - 1;

            // Pick up by player
            if (Math.hypot(item.x - updatedX, item.y - updatedY) < 24) {
              if (item.type === 'heart') {
                sound.playPickupHeart();
                onHealHeart();
              } else {
                sound.playPickupRupee();
                onGainRupee(item.value);
              }
              return null;
            }

            return { ...item, y, vy, lifetime };
          })
          .filter((i): i is DropItem => i !== null && i.lifetime > 0);

        // Update Particles
        particlesRef.current = particlesRef.current
          .map((pt) => {
            return {
              ...pt,
              x: pt.x + pt.vx,
              y: pt.y + pt.vy,
              alpha: pt.life / pt.maxLife,
              life: pt.life - 1,
            };
          })
          .filter((pt) => pt.life > 0);

        // Sync player state back
        setPlayer((prev) => ({
          ...prev,
          x: updatedX,
          y: updatedY,
          facing: newFacing,
          stepCycle: updatedStepCycle,
          isAttacking: updatedAttacking,
          attackTimer: updatedAttackTimer,
          invincibleTimer: updatedInvincibleTimer,
        }));
      }

      // 2. RENDER SCENE
      const renderW = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
      const renderH = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

      ctx.clearRect(0, 0, renderW, renderH);

      // Camera position clamped to world bounds
      const camX = Math.max(0, Math.min(WORLD_WIDTH - renderW, p.x - renderW / 2));
      const camY = Math.max(0, Math.min(WORLD_HEIGHT - renderH, p.y - renderH / 2));

      ctx.save();
      ctx.translate(-camX, -camY);

      // --- WORLD GROUND BACKGROUND ---
      // Lush clay grass base
      ctx.fillStyle = '#7ec53f';
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // Grass texture specks
      ctx.fillStyle = '#6fb832';
      for (let gx = 0; gx < WORLD_WIDTH; gx += 120) {
        for (let gy = 0; gy < 1050; gy += 120) {
          ctx.beginPath();
          ctx.arc(gx + ((gy * 17) % 70), gy + ((gx * 23) % 70), 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Southern Sand Beach (Toronbo Shores)
      ctx.fillStyle = '#fce592';
      ctx.fillRect(0, 1080, WORLD_WIDTH, 520);

      // Wet Sand line
      ctx.fillStyle = '#ecd37f';
      ctx.fillRect(0, 1260, WORLD_WIDTH, 340);

      // Animated Ocean Water & Rolling Foam
      ctx.fillStyle = '#3ca0e7';
      ctx.fillRect(0, 1340, WORLD_WIDTH, 260);

      // Wave 1
      ctx.fillStyle = '#57b4f3';
      ctx.beginPath();
      ctx.moveTo(0, 1340);
      for (let x = 0; x <= WORLD_WIDTH; x += 30) {
        const waveY = 1335 + Math.sin((x + ticks * 2) * 0.02) * 8;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(WORLD_WIDTH, WORLD_HEIGHT);
      ctx.lineTo(0, WORLD_HEIGHT);
      ctx.fill();

      // Gentle white sea foam crest
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x <= WORLD_WIDTH; x += 20) {
        const waveY = 1326 + Math.sin((x + ticks * 2) * 0.02) * 6;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.stroke();

      // Northern Mountain Rock Area (Mt. Tamaranch)
      ctx.fillStyle = '#8c7a68';
      ctx.beginPath();
      ctx.arc(EGG_ALTAR.x, 140, 360, 0, Math.PI * 2);
      ctx.fill();

      // Mountain stone steps leading up
      ctx.fillStyle = '#736150';
      for (let s = 0; s < 5; s++) {
        ctx.fillRect(EGG_ALTAR.x - 70, 270 + s * 18, 140, 12);
      }

      // Northwest Mysterious Forest Floor tint
      ctx.fillStyle = 'rgba(40, 85, 20, 0.12)';
      ctx.fillRect(50, 80, 620, 580);

      // Floating spores in Mysterious Forest
      for (let i = 0; i < 18; i++) {
        const fx = 80 + ((i * 37 + ticks * 0.4) % 560);
        const fy = 100 + ((i * 53 + Math.sin(ticks * 0.03 + i) * 20) % 520);
        ctx.fillStyle = 'rgba(230, 255, 140, 0.45)';
        ctx.beginPath();
        ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- OBSTACLES & STRUCTURES ---
      for (const obs of obstacles) {
        if (obs.type === 'house') {
          // Clay House: Soft shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.beginPath();
          ctx.roundRect(obs.x + 4, obs.y + obs.h - 6, obs.w - 8, 14, 8);
          ctx.fill();

          // Clay Walls (Warm off-white)
          ctx.fillStyle = obs.color || '#ffedd5';
          ctx.beginPath();
          ctx.roundRect(obs.x + 6, obs.y + obs.h * 0.38, obs.w - 12, obs.h * 0.62, 10);
          ctx.fill();

          // Roof (Terracotta rounded clay tiles)
          ctx.fillStyle = obs.roofColor || '#ea580c';
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.w, obs.h * 0.45, 12);
          ctx.fill();

          // Clay Chimney with gentle smoke
          ctx.fillStyle = '#9a3412';
          ctx.fillRect(obs.x + obs.w - 22, obs.y - 12, 14, 16);
          // Smoke puff
          const smokeY = obs.y - 20 - ((ticks * 0.8) % 30);
          const smokeAlpha = 1 - ((ticks * 0.8) % 30) / 30;
          ctx.fillStyle = `rgba(240, 240, 240, ${smokeAlpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(obs.x + obs.w - 15 + Math.sin(ticks * 0.05) * 4, smokeY, 6, 0, Math.PI * 2);
          ctx.fill();

          // Wooden Door
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.roundRect(obs.x + obs.w / 2 - 10, obs.y + obs.h - 24, 20, 24, [6, 6, 0, 0]);
          ctx.fill();

          // Glass Window
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(obs.x + 18, obs.y + obs.h * 0.52, 16, 16);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x + 18, obs.y + obs.h * 0.52, 16, 16);
        } else if (obs.type === 'tree') {
          // Soft Tree shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h - 4, obs.w / 2, 7, 0, 0, Math.PI * 2);
          ctx.fill();

          // Wooden Trunk
          ctx.fillStyle = '#5c4033';
          ctx.fillRect(obs.x + obs.w / 2 - 5, obs.y + obs.h - 18, 10, 18);

          // Fluffy Clay Foliage (Double rounded blobs)
          ctx.fillStyle = '#3f822a';
          ctx.beginPath();
          ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2 - 4, obs.w / 2 + 2, 0, Math.PI * 2);
          ctx.fill();

          // Foliage highlight
          ctx.fillStyle = '#55a630';
          ctx.beginPath();
          ctx.arc(obs.x + obs.w / 2 - 4, obs.y + obs.h / 2 - 10, obs.w / 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'rock') {
          // Boulder
          ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h - 2, obs.w / 2, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#8b8378';
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 12);
          ctx.fill();
        } else if (obs.type === 'pillar') {
          // Ancient Sandstone Pillar
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h - 2, obs.w / 2 + 2, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = obs.color || '#d4b996';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.fillStyle = '#bfa17c';
          ctx.fillRect(obs.x - 3, obs.y, obs.w + 6, 8); // Top cap
          ctx.fillRect(obs.x - 3, obs.y + obs.h - 8, obs.w + 6, 8); // Base
        }
      }

      // --- CUTTABLE BUSHES ---
      for (const b of currentBushes) {
        if (!b.cut) {
          // Bush shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
          ctx.beginPath();
          ctx.ellipse(b.x, b.y + 8, 12, 5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Green clay bush bulb
          ctx.fillStyle = '#4d9a2a';
          ctx.beginPath();
          ctx.arc(b.x, b.y - 2, 13, 0, Math.PI * 2);
          ctx.fill();

          // Top highlight
          ctx.fillStyle = '#6bb343';
          ctx.beginPath();
          ctx.arc(b.x - 3, b.y - 6, 7, 0, Math.PI * 2);
          ctx.fill();

          // Tiny red berry
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(b.x + 4, b.y - 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Cut bush stub
          ctx.fillStyle = '#3a6624';
          ctx.fillRect(b.x - 6, b.y + 2, 12, 4);
        }
      }

      // --- SIREN INSTRUMENT SHRINES ---
      instrumentsRef.current.forEach((shrine) => {
        // Pedestal base
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(shrine.x, shrine.y + 14, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#d5c4a1';
        ctx.beginPath();
        ctx.roundRect(shrine.x - 18, shrine.y - 8, 36, 22, 6);
        ctx.fill();
        ctx.strokeStyle = '#a48f67';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (!shrine.taken) {
          // Mystical aura ring pulsing
          const auraPulse = Math.sin(ticks * 0.08) * 4;
          ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
          ctx.beginPath();
          ctx.arc(shrine.x, shrine.y - 12, 18 + auraPulse, 0, Math.PI * 2);
          ctx.fill();

          // Floating Instrument Icon with bobbing animation
          const bobY = shrine.y - 14 + Math.sin(ticks * 0.06) * 4;
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(shrine.icon, shrine.x, bobY);

          // Little sparkles
          ctx.fillStyle = '#fef08a';
          const sparkAngle = ticks * 0.05;
          ctx.fillRect(shrine.x + Math.cos(sparkAngle) * 22 - 1, bobY + Math.sin(sparkAngle) * 16 - 1, 3, 3);
        } else {
          // Collected marker: gentle glowing rune
          ctx.fillStyle = '#65a30d';
          ctx.beginPath();
          ctx.arc(shrine.x, shrine.y + 3, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // --- MT. TAMARANCH WIND FISH EGG ---
      // Egg Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(EGG_ALTAR.x, EGG_ALTAR.y + 64, 46, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Giant Clay Egg (Wind Fish Egg)
      ctx.save();
      ctx.fillStyle = '#fffdfa';
      ctx.beginPath();
      ctx.ellipse(EGG_ALTAR.x, EGG_ALTAR.y, 48, 66, 0, 0, Math.PI * 2);
      ctx.fill();

      // Golden Rim outline
      ctx.strokeStyle = '#e6ba68';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Iconic Spotted markings (Terracotta red-orange)
      ctx.fillStyle = '#df654a';
      ctx.beginPath();
      ctx.ellipse(EGG_ALTAR.x - 14, EGG_ALTAR.y - 14, 10, 8, -0.2, 0, Math.PI * 2);
      ctx.ellipse(EGG_ALTAR.x + 18, EGG_ALTAR.y + 16, 13, 10, 0.3, 0, Math.PI * 2);
      ctx.ellipse(EGG_ALTAR.x - 8, EGG_ALTAR.y + 32, 9, 7, 0.1, 0, Math.PI * 2);
      ctx.ellipse(EGG_ALTAR.x + 12, EGG_ALTAR.y - 28, 7, 6, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Sacred Aura shimmer above the egg
      const allInstrumentsTaken = instrumentsRef.current.every((i) => i.taken);
      if (allInstrumentsTaken) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
        ctx.beginPath();
        ctx.arc(EGG_ALTAR.x, EGG_ALTAR.y, 75 + Math.sin(ticks * 0.1) * 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // --- TARIN NPC ---
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.beginPath();
      ctx.ellipse(TARIN_INITIAL.x, TARIN_INITIAL.y + 12, 11, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tarin body (Red coat)
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(TARIN_INITIAL.x - 8, TARIN_INITIAL.y - 4, 16, 16);
      // Face
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(TARIN_INITIAL.x, TARIN_INITIAL.y - 8, 8, 0, Math.PI * 2);
      ctx.fill();
      // Mustache
      ctx.fillStyle = '#451a03';
      ctx.fillRect(TARIN_INITIAL.x - 6, TARIN_INITIAL.y - 6, 12, 4);

      // --- MARIN NPC ---
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.beginPath();
      ctx.ellipse(MARIN_INITIAL.x, MARIN_INITIAL.y + 12, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Marin's Sky Blue Dress
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(MARIN_INITIAL.x - 8, MARIN_INITIAL.y - 2, 16, 16, [4, 4, 2, 2]);
      ctx.fill();
      // White sash
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(MARIN_INITIAL.x - 8, MARIN_INITIAL.y + 4, 16, 3);

      // Head & Auburn Hair
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.arc(MARIN_INITIAL.x - 1, MARIN_INITIAL.y - 10, 9, 0, Math.PI * 2);
      ctx.fill();

      // Face
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.arc(MARIN_INITIAL.x, MARIN_INITIAL.y - 7, 7, 0, Math.PI * 2);
      ctx.fill();

      // Hibiscus Flower in Hair
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(MARIN_INITIAL.x + 7, MARIN_INITIAL.y - 12, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(MARIN_INITIAL.x + 7, MARIN_INITIAL.y - 12, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Floating musical notes from Marin singing
      const noteY = MARIN_INITIAL.y - 24 - ((ticks * 0.6) % 36);
      const noteAlpha = 1 - ((ticks * 0.6) % 36) / 36;
      ctx.font = '12px sans-serif';
      ctx.fillStyle = `rgba(180, 83, 9, ${noteAlpha})`;
      ctx.fillText(ticks % 60 < 30 ? '♪' : '♫', MARIN_INITIAL.x + 4 + Math.sin(ticks * 0.08) * 6, noteY);

      // --- CUCCO (CHICKEN) ---
      const cucco = cuccoRef.current;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.ellipse(cucco.x, cucco.y + 7, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Chicken body
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cucco.x, cucco.y, 8, 0, Math.PI * 2);
      ctx.fill();
      // Red comb
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cucco.x - 2, cucco.y - 10, 4, 4);
      // Yellow beak
      ctx.fillStyle = '#eab308';
      const beakDir = cucco.facing === 'left' ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(cucco.x + beakDir * 6, cucco.y - 2);
      ctx.lineTo(cucco.x + beakDir * 10, cucco.y);
      ctx.lineTo(cucco.x + beakDir * 6, cucco.y + 2);
      ctx.fill();

      // --- ROAMING ENEMIES ---
      currentEnemies.forEach((e) => {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.beginPath();
        ctx.ellipse(e.x, e.y + 10, 9, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        if (e.type === 'octorok') {
          // Bouncy Red Octorok
          const bounce = Math.abs(Math.sin(ticks * 0.15)) * 4;
          ctx.fillStyle = e.isHitTimer > 0 ? '#ffffff' : e.color;
          ctx.beginPath();
          ctx.arc(e.x, e.y - bounce, 11, 0, Math.PI * 2);
          ctx.fill();

          // Trumpet snout
          ctx.fillStyle = '#b91c1c';
          let snoutX = e.x;
          let snoutY = e.y - bounce;
          if (e.facing === 'down') snoutY += 8;
          if (e.facing === 'up') snoutY -= 8;
          if (e.facing === 'left') snoutX -= 8;
          if (e.facing === 'right') snoutX += 8;
          ctx.beginPath();
          ctx.arc(snoutX, snoutY, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Squishy Slime
          const squish = Math.sin(ticks * 0.2) * 2;
          ctx.fillStyle = e.isHitTimer > 0 ? '#ffffff' : e.color;
          ctx.beginPath();
          ctx.ellipse(e.x, e.y + 2, 10 + squish, 9 - squish, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // --- DROP ITEMS (HEARTS & RUPEES) ---
      dropItemsRef.current.forEach((item) => {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.beginPath();
        ctx.ellipse(item.x, item.y + 8, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        if (item.type === 'heart') {
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('❤️', item.x, item.y + 3);
        } else {
          // Emerald Rupee
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.moveTo(item.x, item.y - 7);
          ctx.lineTo(item.x + 5, item.y);
          ctx.lineTo(item.x, item.y + 7);
          ctx.lineTo(item.x - 5, item.y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#6ee7b7';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // --- PARTICLES ---
      particlesRef.current.forEach((pt) => {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // --- PLAYER LINK ---
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 12, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flashing if invincible from hit
      if (p.invincibleTimer % 4 < 2) {
        // Link Green Tunic Body
        ctx.fillStyle = '#65a30d';
        ctx.beginPath();
        ctx.roundRect(p.x - 7, p.y - 2, 14, 14, 3);
        ctx.fill();

        // Brown Belt
        ctx.fillStyle = '#78350f';
        ctx.fillRect(p.x - 7, p.y + 4, 14, 3);

        // Gold Hair
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(p.x, p.y - 8, 9, 0, Math.PI * 2);
        ctx.fill();

        // Peach Face
        ctx.fillStyle = '#ffedd5';
        ctx.beginPath();
        ctx.arc(p.x, p.y - 6, 7, 0, Math.PI * 2);
        ctx.fill();

        // Cute Black Eyes
        ctx.fillStyle = '#1c1917';
        if (p.facing === 'down') {
          ctx.fillRect(p.x - 4, p.y - 7, 2, 3);
          ctx.fillRect(p.x + 2, p.y - 7, 2, 3);
        } else if (p.facing === 'left') {
          ctx.fillRect(p.x - 5, p.y - 7, 2, 3);
        } else if (p.facing === 'right') {
          ctx.fillRect(p.x + 3, p.y - 7, 2, 3);
        }

        // Green Floppy Cap with slight physics tilt
        ctx.fillStyle = '#4d7c0f';
        ctx.beginPath();
        ctx.moveTo(p.x - 8, p.y - 10);
        ctx.lineTo(p.x + 8, p.y - 10);
        const capOffset = p.facing === 'left' ? 4 : p.facing === 'right' ? -4 : 0;
        ctx.lineTo(p.x - 12 + capOffset, p.y - 22);
        ctx.closePath();
        ctx.fill();

        // Wooden Shield held on side
        ctx.fillStyle = '#b45309';
        ctx.fillRect(p.x + (p.facing === 'left' ? 7 : -10), p.y, 4, 8);

        // Sword Swing Slash Animation
        if (p.isAttacking) {
          ctx.strokeStyle = '#f8fafc';
          ctx.lineWidth = 4;
          ctx.beginPath();
          let slashAngle = 0;
          if (p.facing === 'right') slashAngle = 0;
          if (p.facing === 'down') slashAngle = Math.PI / 2;
          if (p.facing === 'left') slashAngle = Math.PI;
          if (p.facing === 'up') slashAngle = -Math.PI / 2;

          ctx.arc(p.x, p.y, 26, slashAngle - 0.9, slashAngle + 0.9);
          ctx.stroke();

          // Sword blade
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.cos(slashAngle) * 26, p.y + Math.sin(slashAngle) * 26);
          ctx.stroke();
        }
      }

      ctx.restore();

      // --- WEATHER EFFECT SYSTEM: LIGHT ANIMATED RAIN & FOG OVERLAY ---
      const activeWeather = weatherModeRef.current || 'rain_and_fog';

      if (activeWeather !== 'clear') {
        // 1. Overall Melancholic Dream Atmosphere Wash
        ctx.fillStyle = 'rgba(185, 205, 230, 0.055)';
        ctx.fillRect(0, 0, renderW, renderH);

        // 2. Animated Drifting Fog Bands across the Island
        // Layer 1: High Mist Layer (drifting leftward)
        const fogX1 = ((ticks * 0.3) % (renderW + 300)) - 150;
        ctx.fillStyle = 'rgba(240, 246, 255, 0.05)';
        ctx.beginPath();
        ctx.ellipse(
          fogX1,
          renderH * 0.2 + Math.sin(ticks * 0.015) * 16,
          renderW * 0.5,
          60,
          -0.04,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Layer 2: Mid Atmospheric Layer (drifting rightward)
        const fogX2 = renderW - ((ticks * 0.45) % (renderW + 350)) + 175;
        ctx.fillStyle = 'rgba(235, 245, 255, 0.06)';
        ctx.beginPath();
        ctx.ellipse(
          fogX2,
          renderH * 0.52 + Math.sin(ticks * 0.02 + 1) * 20,
          renderW * 0.55,
          75,
          0.03,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Layer 3: Ground / River Moisture Mist
        const fogX3 = ((ticks * 0.22) % (renderW + 280)) - 140;
        ctx.fillStyle = 'rgba(245, 250, 255, 0.065)';
        ctx.beginPath();
        ctx.ellipse(
          fogX3,
          renderH * 0.82 + Math.sin(ticks * 0.018 + 2) * 15,
          renderW * 0.6,
          65,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // 3. Volumetric Mysterious Forest Mist (Screen-space projection)
        const forestScreenX = 60 - camX;
        const forestScreenY = 80 - camY;
        if (
          forestScreenX + 600 > 0 &&
          forestScreenX < renderW &&
          forestScreenY + 600 > 0 &&
          forestScreenY < renderH
        ) {
          // Soft radial ethereal emerald mist in the woods
          for (let fi = 0; fi < 4; fi++) {
            const fx = forestScreenX + 130 + fi * 115 + Math.sin(ticks * 0.018 + fi) * 35;
            const fy = forestScreenY + 150 + ((fi * 90 + ticks * 0.35) % 380);
            const rad = 105 + Math.sin(ticks * 0.02 + fi) * 20;
            const grad = ctx.createRadialGradient(fx, fy, 15, fx, fy, rad);
            grad.addColorStop(0, 'rgba(215, 248, 230, 0.15)');
            grad.addColorStop(0.7, 'rgba(215, 248, 230, 0.07)');
            grad.addColorStop(1, 'rgba(215, 248, 230, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(fx, fy, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 4. Light Animated Rain Streaks & Ground Ripples
        if (activeWeather === 'rain_and_fog') {
          // Initialize raindrops if needed
          if (raindropsRef.current.length < 65) {
            const needed = 65 - raindropsRef.current.length;
            for (let i = 0; i < needed; i++) {
              raindropsRef.current.push({
                x: Math.random() * (renderW + 100),
                y: Math.random() * renderH,
                length: 8 + Math.random() * 8,
                speed: 6.5 + Math.random() * 3.0,
                alpha: 0.18 + Math.random() * 0.18,
              });
            }
          }

          // Update & draw raindrops
          ctx.strokeStyle = 'rgba(215, 235, 255, 0.32)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();

          raindropsRef.current.forEach((drop) => {
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x - 2.2, drop.y + drop.length);

            // Move
            drop.x -= 1.1; // gentle breeze
            drop.y += drop.speed;

            // Recycle drop when out of screen
            if (drop.y > renderH || drop.x < -20) {
              if (Math.random() < 0.22 && ripplesRef.current.length < 24) {
                ripplesRef.current.push({
                  x: drop.x,
                  y: renderH - 8 - Math.random() * (renderH * 0.45),
                  radius: 1,
                  maxRadius: 4 + Math.random() * 4,
                  alpha: 0.32,
                });
              }
              drop.y = -15 - Math.random() * 20;
              drop.x = Math.random() * (renderW + 100);
            }
          });
          ctx.stroke();

          // Update & draw rain landing ripples
          ripplesRef.current = ripplesRef.current
            .map((rip) => {
              ctx.strokeStyle = `rgba(225, 242, 255, ${rip.alpha})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.ellipse(rip.x, rip.y, rip.radius, rip.radius * 0.45, 0, 0, Math.PI * 2);
              ctx.stroke();

              return {
                ...rip,
                radius: rip.radius + 0.3,
                alpha: rip.alpha - 0.02,
              };
            })
            .filter((rip) => rip.alpha > 0.01 && rip.radius <= rip.maxRadius);
        }
      }

      // --- TILT-SHIFT DIORAMA OVERLAY EFFECT ---
      // Top and bottom blur vignette creating that 2019 Switch miniature look
      const gradTop = ctx.createLinearGradient(0, 0, 0, 75);
      gradTop.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
      gradTop.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradTop;
      ctx.fillRect(0, 0, renderW, 75);

      const gradBottom = ctx.createLinearGradient(0, renderH - 85, 0, renderH);
      gradBottom.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradBottom.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      ctx.fillStyle = gradBottom;
      ctx.fillRect(0, renderH - 85, renderW, 85);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [
    obstacles,
    onActionTriggered,
    onBushCut,
    onGainRupee,
    onHealHeart,
    setBushes,
    setEnemies,
    setPlayer,
  ]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair touch-none"
      />
    </div>
  );
};
