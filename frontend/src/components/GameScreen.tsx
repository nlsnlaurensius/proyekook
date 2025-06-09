// filepath: d:\Documents\KULIAH\Semester4\Netlab\project\src\components\GameScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Pause, Play, RotateCcw } from 'lucide-react';
import { User } from '../App';
import { submitGameSession } from '../utils/api';
import cityBg from '../assets/city/background.svg';
import obstacleJumpImg from '../assets/obsctacle/jump.png';
import obstacleDuckImg from '../assets/obsctacle/duck.png';
import { Howl, Howler } from 'howler';
import playMusicSrc from '../assets/sounds/play.mp3';
import jumpSfxSrc from '../assets/sounds/jump.mp3';
import duckSfxSrc from '../assets/sounds/duck.mp3';
import deathSfxSrc from '../assets/sounds/death.mp3';

export interface UserWithId extends User {
  id?: number;
  userId?: number;
}

interface GameScreenProps {
  user: User;
  onGameOver: (score: number) => void;
  onBack: () => void;
  soundEnabled: boolean;
  sfxVolume: number;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  type: 'low' | 'high' | 'flying';
  width: number;
  height: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

// Helper to import all frames from a folder
function importAll(r: any) {
  // Vite uses import.meta.glob, Webpack uses require.context
  if ('keys' in r) {
    return r.keys().map(r);
  } else {
    return Object.values(r);
  }
}

// Import all frames for each animation (sorted)
const runFrames = importAll(import.meta.glob('../assets/run/*.png', { eager: true, as: 'url' })).sort();
const jumpFrames = importAll(import.meta.glob('../assets/jump/*.png', { eager: true, as: 'url' })).sort();
const duckFrames = importAll(import.meta.glob('../assets/duck/*.png', { eager: true, as: 'url' })).sort();
const deathFrames = importAll(import.meta.glob('../assets/death/*.png', { eager: true, as: 'url' })).sort();

// Helper to get PNG dimensions
function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = src;
  });
}

// --- Dino-like constants ---
const GROUND_Y = 0;
const JUMP_HEIGHT = 100; // Tinggi maksimum lompatan (bisa diubah sesuai kebutuhan)
const GRAVITY = -4.0; // Tidak terlalu besar supaya tetap tinggi, tapi naiknya cepat
const JUMP_DURATION = 700; // ms
const DUCK_DURATION = 700; // ms
const ROBOT_WIDTH = 90;
const ROBOT_HEIGHT = 120;
const OBSTACLE_MIN_GAP = 220;
const OBSTACLE_MAX_GAP = 420;
const OBSTACLE_SPEED_START = 6;
const OBSTACLE_SPEED_MAX = 13;
const OBSTACLE_TYPES: Obstacle['type'][] = ['low', 'high'];

const GameScreen: React.FC<GameScreenProps> = ({ user, onGameOver, onBack, soundEnabled, sfxVolume }) => {
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver'>('playing');
  const [score, setScore] = useState(0);
  const [robotY, setRobotY] = useState(GROUND_Y); // Mulai di ground
  const [robotVelocity, setRobotVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isDucking, setIsDucking] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [gameSpeed, setGameSpeed] = useState(6);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [runFrame, setRunFrame] = useState(0);
  const [jumpFrame, setJumpFrame] = useState(0);
  const [duckFrame, setDuckFrame] = useState(0);
  const [deathFrame, setDeathFrame] = useState(0);
  const [collidedObstacleId, setCollidedObstacleId] = useState<number | null>(null);

  // Local sound settings for pause menu
  const [localSoundEnabled, setLocalSoundEnabled] = useState(soundEnabled);
  const [localSfxVolume, setLocalSfxVolume] = useState(sfxVolume);
  // Tambahkan state untuk music
  const [localMusicEnabled, setLocalMusicEnabled] = useState(true);
  const [localMusicVolume, setLocalMusicVolume] = useState(1);

  // Sinkronkan ke parent jika berubah (opsional, jika ingin update ke parent tambahkan callback di props)
  useEffect(() => {
    // Bisa tambahkan callback ke parent jika ingin
  }, [localSoundEnabled]);
  useEffect(() => {
    // Bisa tambahkan callback ke parent jika ingin
  }, [localSfxVolume]);

  const gameLoopRef = useRef<number>();
  const obstacleIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const lastObstacleRef = useRef(0);
  const lastObstacleXRef = useRef(800);
  const keysRef = useRef<Set<string>>(new Set());
  const jumpLockRef = useRef(false);
  const duckLockRef = useRef(false);

  // Helper untuk memudahkan penggunaan requestAnimationFrame dengan React
  const requestAnimationFrameRef = useRef<(callback: FrameRequestCallback) => number>();
  const cancelAnimationFrameRef = useRef<(id: number) => void>();

  // --- Dino-like obstacle spawn logic ---
  const createObstacle = useCallback(() => {
    const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    let width = 40, height = 40, y = 0;
    if (type === 'low') {
      width = 40; // default fallback
      height = 40;
      try {
        const img = new window.Image();
        img.onload = () => {
          setObstacles(prev => {
            const newObs = [...prev];
            const idx = newObs.findIndex(o => o.id === obstacleIdRef.current);
            if (idx !== -1) {
              newObs[idx] = { ...newObs[idx], width: img.width, height: img.height };
            }
            return newObs;
          });
        };
        img.src = obstacleDuckImg;
      } catch {}
      y = ROBOT_HEIGHT - height + 16;
    } else if (type === 'high') {
      width = 40;
      height = 40;
      try {
        const img = new window.Image();
        img.onload = () => {
          setObstacles(prev => {
            const newObs = [...prev];
            const idx = newObs.findIndex(o => o.id === obstacleIdRef.current);
            if (idx !== -1) {
              newObs[idx] = { ...newObs[idx], width: img.width, height: img.height };
            }
            return newObs;
          });
        };
        img.src = obstacleJumpImg;
      } catch {}
      y = 0;
    }
    const x = lastObstacleXRef.current + OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP);
    lastObstacleXRef.current = x;
    const obstacle = {
      id: obstacleIdRef.current++,
      x,
      y,
      type,
      width,
      height,
    };
    setObstacles(prev => [...prev, obstacle]);
    lastObstacleRef.current = Date.now();
  }, []);

  const checkCollision = useCallback((robot: {x: number, y: number, width: number, height: number}, obstacle: any) => {
    // Collider obstacle pakai ukuran tetap (bukan PNG)
    const robotHeight = isDucking ? ROBOT_HEIGHT * 0.6 : ROBOT_HEIGHT;
    const robotYPos = isDucking ? GROUND_Y : robot.y;
    const robotRect = {
      x: 80,
      y: robotYPos,
      width: ROBOT_WIDTH,
      height: robotHeight,
    };
    const obstacleRect = {
      x: obstacle.x,
      y: obstacle.y,
      width: obstacle.width,
      height: obstacle.height,
    };
    // AABB collision
    const overlap =
      robotRect.x < obstacleRect.x + obstacleRect.width &&
      robotRect.x + robotRect.width > obstacleRect.x &&
      robotRect.y < obstacleRect.y + obstacleRect.height &&
      robotRect.y + robotRect.height > obstacleRect.y;

    if (obstacle.type === 'low') {
      if (!isDucking && overlap) return true;
      return false;
    } else if (obstacle.type === 'high') {
      if (!isJumping && overlap) return true;
      return false;
    }
    return false;
  }, [isDucking, isJumping]);

  // Music and SFX Howl instances
  const musicRef = useRef<Howl | null>(null);
  const jumpSfxRef = useRef<Howl | null>(null);
  const duckSfxRef = useRef<Howl | null>(null);
  const deathSfxRef = useRef<Howl | null>(null);

  // Setup music and SFX on mount
  useEffect(() => {
    // Music
    if (musicRef.current) {
      musicRef.current.unload();
    }
    musicRef.current = new Howl({
      src: [playMusicSrc],
      loop: true,
      volume: localMusicEnabled ? localMusicVolume : 0,
      html5: true,
    });
    if (localMusicEnabled && gameState === 'playing') {
      musicRef.current.play();
    }
    // SFX
    jumpSfxRef.current = new Howl({ src: [jumpSfxSrc], volume: localSoundEnabled ? localSfxVolume : 0.0 });
    duckSfxRef.current = new Howl({ src: [duckSfxSrc], volume: localSoundEnabled ? localSfxVolume : 0.0 });
    deathSfxRef.current = new Howl({ src: [deathSfxSrc], volume: localSoundEnabled ? localSfxVolume : 0.0 });
    return () => {
      musicRef.current?.stop();
      musicRef.current?.unload();
    };
  }, []);

  // React to music toggle/volume or gameState
  useEffect(() => {
    if (!musicRef.current) return;
    musicRef.current.volume(localMusicEnabled ? localMusicVolume : 0);
    if (localMusicEnabled && gameState === 'playing') {
      if (!musicRef.current.playing()) musicRef.current.play();
    } else {
      musicRef.current.pause();
    }
  }, [localMusicEnabled, localMusicVolume, gameState]);

  // React to SFX toggle/volume
  useEffect(() => {
    if (jumpSfxRef.current) jumpSfxRef.current.volume(localSoundEnabled ? localSfxVolume : 0.0);
    if (duckSfxRef.current) duckSfxRef.current.volume(localSoundEnabled ? localSfxVolume : 0.0);
    if (deathSfxRef.current) deathSfxRef.current.volume(localSoundEnabled ? localSfxVolume : 0.0);
  }, [localSoundEnabled, localSfxVolume]);

  // Helper: Add particles (must be above gameLoop)
  const addParticles = useCallback((x: number, y: number, count: number = 5) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: x + Math.random() * 20 - 10,
        y: y + Math.random() * 20 - 10,
        vx: Math.random() * 6 - 3,
        vy: Math.random() * 6 - 3,
        life: 30,
        maxLife: 30
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Helper: Play SFX (must be above gameLoop)
  const playSound = useCallback((type: 'jump' | 'duck' | 'crash') => {
    if (!localSoundEnabled) return;
    switch (type) {
      case 'jump':
        jumpSfxRef.current?.play();
        break;
      case 'duck':
        duckSfxRef.current?.play();
        break;
      case 'crash':
        deathSfxRef.current?.play();
        break;
    }
  }, [localSoundEnabled]);

  // Helper: Handle game over (must be above gameLoop)
  const handleGameOver = useCallback(async (finalScore: number) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = localStorage.getItem('neonRunnerToken');
      const userWithId = user as any;
      const userId = userWithId.id ?? userWithId.userId;
      if (token && userId) {
        await submitGameSession(userId, { score: finalScore }, token);
      }
    } catch (err: any) {
      setSubmitError('Gagal submit skor ke server');
    }
    setSubmitting(false);
    onGameOver(finalScore);
  }, [user, onGameOver]);

  // --- Dino-like game loop ---
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;
    setObstacles(prev => {
      const updated = prev.map(obstacle => ({
        ...obstacle,
        x: obstacle.x - gameSpeed
      })).filter(obstacle => obstacle.x > -obstacle.width);
      if (updated.length === 0 || (800 - updated[updated.length - 1].x) > OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP)) {
        createObstacle();
      }
      // Collider presisi: posisi X player = 500px (left), collider X = 500, obstacle.x = left obstacle
      const robotRect = {
        x: 500,
        y: 56 + robotY,
        width: ROBOT_WIDTH,
        height: isDucking ? ROBOT_HEIGHT * 0.7 : ROBOT_HEIGHT,
      };
      for (const obstacle of updated) {
        const obstacleRect = {
          x: obstacle.x,
          y: 56 + obstacle.y,
          width: obstacle.width,
          height: obstacle.height,
        };
        // AABB collision
        const overlap =
          robotRect.x < obstacleRect.x + obstacleRect.width &&
          robotRect.x + robotRect.width > obstacleRect.x &&
          robotRect.y < obstacleRect.y + obstacleRect.height &&
          robotRect.y + robotRect.height > obstacleRect.y;
        let isCollide = false;
        if (obstacle.type === 'low') {
          if (!isDucking && overlap) isCollide = true;
        } else if (obstacle.type === 'high') {
          if (!isJumping && overlap) isCollide = true;
        }
        if (isCollide) {
          setCollidedObstacleId(obstacle.id);
          setTimeout(() => setCollidedObstacleId(null), 200);
          setGameState('gameOver');
          playSound('crash');
          addParticles(robotRect.x + ROBOT_WIDTH / 2, robotRect.y + robotRect.height / 2, 12);
          handleGameOver(score);
          return updated;
        }
      }
      return updated;
    });
    setParticles(prev => prev.map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      life: particle.life - 1
    })).filter(particle => particle.life > 0));
    setScore(prev => prev + 1);
    setGameSpeed(prev => Math.min(prev + 0.002, OBSTACLE_SPEED_MAX));
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, gameSpeed, score, createObstacle, playSound, addParticles, handleGameOver, robotY, isDucking, isJumping]);

  const jump = useCallback(() => {
    if (robotY === GROUND_Y && !isJumping && !jumpLockRef.current && !isDucking) { // Tidak bisa lompat saat duck
      setIsJumping(true);
      setRobotY(JUMP_HEIGHT); // Langsung ke puncak lompatan
      jumpLockRef.current = true;
      playSound('jump');
      addParticles(100, JUMP_HEIGHT + ROBOT_HEIGHT, 3);
      setTimeout(() => {
        setRobotY(GROUND_Y); // Turun kembali ke ground
        setIsJumping(false);
        jumpLockRef.current = false;
      }, JUMP_DURATION);
    }
  }, [robotY, isJumping, isDucking, playSound, addParticles]);

  const duck = useCallback(() => {
    if (!isDucking && robotY === GROUND_Y && !duckLockRef.current && !isJumping) { // Tidak bisa duck saat lompat
      setIsDucking(true);
      duckLockRef.current = true;
      playSound('duck');
      setTimeout(() => {
        setIsDucking(false);
        duckLockRef.current = false;
      }, DUCK_DURATION);
    }
  }, [isDucking, isJumping, robotY, playSound]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tidak bisa hold
      if (e.repeat) return;
      // Jika game over, abaikan semua input
      if (gameState === 'gameOver') return;
      if ((e.code === 'Space' || e.code === 'ArrowUp')) {
        e.preventDefault();
        jump();
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        duck();
      }
      if (e.code === 'KeyP') {
        e.preventDefault();
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [jump, duck, gameState]);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Animasi berlari
  useEffect(() => {
    if (gameState === 'playing' && !isJumping && !isDucking) {
      const interval = setInterval(() => {
        setRunFrame(f => (f + 1) % runFrames.length);
      }, 80);
      return () => clearInterval(interval);
    }
  }, [gameState, isJumping, isDucking]);

  // Animasi lompat
  useEffect(() => {
    if (isJumping) {
      setJumpFrame(0);
      const interval = setInterval(() => {
        setJumpFrame(f => {
          if (f + 1 >= jumpFrames.length) return jumpFrames.length - 1;
          return f + 1;
        });
      }, 60);
      return () => clearInterval(interval);
    } else {
      setJumpFrame(0);
    }
  }, [isJumping]);

  // Animasi duck
  useEffect(() => {
    if (isDucking) {
      setDuckFrame(0);
      const interval = setInterval(() => {
        setDuckFrame(f => (f + 1) % duckFrames.length);
      }, 80);
      return () => clearInterval(interval);
    } else {
      setDuckFrame(0);
    }
  }, [isDucking]);

  // Animasi mati
  useEffect(() => {
    if (gameState === 'gameOver') {
      setDeathFrame(0);
      const interval = setInterval(() => {
        setDeathFrame(f => {
          if (f + 1 >= deathFrames.length) return deathFrames.length - 1;
          return f + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setDeathFrame(0);
    }
  }, [gameState]);

  const resetGame = () => {
    setScore(0);
    setRobotY(GROUND_Y);
    setRobotVelocity(0);
    setIsJumping(false);
    setIsDucking(false);
    setObstacles([]);
    setParticles([]);
    setGameSpeed(OBSTACLE_SPEED_START);
    setGameState('playing');
    lastObstacleRef.current = 0;
    lastObstacleXRef.current = 800;
    // Restart music from beginning when Play Again is pressed
    if (musicRef.current) {
      musicRef.current.seek(0);
      if (localMusicEnabled) musicRef.current.play();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black relative overflow-hidden">
      {/* Game UI */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        {/* Hapus tombol Back di GameScreen */}
        {/* <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-black/50 text-white rounded-lg border border-gray-600 hover:border-cyan-400 transition-colors backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button> */}

        <div className="flex items-center gap-6 ml-auto">
          <div className="text-white font-bold text-xl bg-black/50 px-4 py-2 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
            Score: <span className="text-cyan-400">{score}</span>
          </div>
          
          <button
            onClick={() => setGameState(gameState === 'playing' ? 'paused' : 'playing')}
            className="pause-btn flex items-center gap-2 px-4 py-2 bg-black/50 text-white rounded-lg border border-gray-600 hover:border-purple-400 transition-colors backdrop-blur-sm"
          >
            {gameState === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative w-full h-screen">
        {/* Ground hitam di bawah */}
        <div className="absolute left-0 w-full" style={{height: '56px', background: 'linear-gradient(90deg, #a259ff 0%, #6a00ff 100%)', bottom: 0, zIndex: 20, boxShadow: '0 0 32px 8px #a259ff99'}} />
        {/* Garis batas atas ground (ungu muda) */}
        <div className="absolute left-0 w-full" style={{height: '0px', borderTop: '3px solid #e0aaff', bottom: '56px', zIndex: 25, pointerEvents: 'none'}} />
        {/* Background elements */}
        <div className="absolute inset-0 opacity-30">
          {/* City skyline */}
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-gray-900 to-transparent"></div>
          
          {/* Grid floor */}
          <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
          
          {/* Moving background lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-pulse"
              style={{
                top: `${20 + i * 15}%`,
                width: '100%',
                animationDelay: `${i * 0.5}s`
              }}
            ></div>
          ))}
        </div>

        {/* Ground/alas baru */}
        <div
          className="absolute left-0 w-full"
          style={{
            bottom: 0,
            height: '56px', // ground lebih tebal
            background: 'black',
            zIndex: 5,
          }}
        />
        {/* END GROUND */}
        {/* Game entities */}
        <div className="absolute inset-0">
          {/* Robot player */}
          <div
            className="absolute transition-all duration-100"
            style={{
              left: '500px', // start lebih ke kanan
              bottom: `${56 + robotY}px`,
              width: `${ROBOT_WIDTH}px`,
              height: `${isDucking ? ROBOT_HEIGHT * 0.7 : ROBOT_HEIGHT}px`,
              transform: 'scaleX(-1)',
              zIndex: 10,
              boxShadow: collidedObstacleId !== null ? '0 0 32px 8px #ff0033, 0 0 0 8px #ff003388' : undefined,
              background: collidedObstacleId !== null ? 'rgba(255,0,0,0.15)' : undefined,
              transition: 'box-shadow 0.1s, background 0.1s',
            }}
          >
            {/* Garis collider player (merah) */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              border: '2px dashed red',
              boxSizing: 'border-box',
              pointerEvents: 'none',
              zIndex: 100,
            }} />
            {gameState === 'gameOver' ? (
              <img src={deathFrames[deathFrame]} alt="Robot Death" style={{ width: '100%', height: '100%' }} draggable={false} />
            ) : isJumping ? (
              <img src={jumpFrames[jumpFrame]} alt="Robot Jump" style={{ width: '100%', height: '100%' }} draggable={false} />
            ) : isDucking ? (
              <img src={duckFrames[duckFrame]} alt="Robot Duck" style={{ width: '100%', height: '100%' }} draggable={false} />
            ) : (
              <img src={runFrames[runFrame]} alt="Robot Run" style={{ width: '100%', height: '100%' }} draggable={false} />
            )}
          </div>

          {/* Obstacles */}
          {obstacles.map(obstacle => {
            let obstacleImg = obstacleJumpImg;
            let extraStyle = {};
            if (obstacle.type === 'low') {
              obstacleImg = obstacleDuckImg;
            } else if (obstacle.type === 'high') {
              obstacleImg = obstacleJumpImg;
              // Tambahkan animasi berputar untuk obstacle jump.png
              extraStyle = {
                animation: 'spinObstacle 1.2s linear infinite',
              };
            }
            return (
              <div
                key={obstacle.id}
                className={`absolute${obstacle.type === 'high' ? ' spin-obstacle' : ''}`}
                style={{
                  left: `${obstacle.x}px`,
                  bottom: `${56 + obstacle.y}px`,
                  width: `${obstacle.width}px`,
                  height: `${obstacle.height}px`,
                  zIndex: 8,
                  boxShadow: collidedObstacleId === obstacle.id ? '0 0 32px 8px #ff0033, 0 0 0 8px #ff003388' : undefined,
                  background: collidedObstacleId === obstacle.id ? 'rgba(255,0,0,0.15)' : undefined,
                  transition: 'box-shadow 0.1s, background 0.1s',
                }}
              >
                {/* Garis collider obstacle (biru) */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  border: '2px dashed blue',
                  boxSizing: 'border-box',
                  pointerEvents: 'none',
                  zIndex: 100,
                }} />
                <img
                  src={obstacleImg}
                  alt={obstacle.type}
                  className="select-none pointer-events-none"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 16px #ff0033) drop-shadow(0 0 8px #ff0033) drop-shadow(0 0 2px #fff8)',
                  }}
                  draggable={false}
                />
              </div>
            );
          })}

          {/* Particles */}
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${particle.x}px`,
                bottom: `${600 - particle.y}px`,
                opacity: particle.life / particle.maxLife
              }}
            ></div>
          ))}
        </div>

        {/* Cyberpunk city background (parallax) */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Layer 1: Siluet gedung jauh */}
          <svg width="100%" height="180" style={{ position: 'absolute', bottom: 32, left: 0 }}>
            <rect x="0" y="80" width="60" height="100" fill="#222a" />
            <rect x="70" y="60" width="50" height="120" fill="#223a" />
            <rect x="130" y="100" width="80" height="80" fill="#223a" />
            <rect x="220" y="90" width="40" height="90" fill="#223a" />
            <rect x="270" y="70" width="100" height="110" fill="#223a" />
            <rect x="380" y="110" width="60" height="70" fill="#223a" />
            <rect x="450" y="80" width="90" height="100" fill="#223a" />
            <rect x="550" y="60" width="60" height="120" fill="#223a" />
            <rect x="620" y="100" width="80" height="80" fill="#223a" />
            <rect x="710" y="90" width="40" height="90" fill="#223a" />
            <rect x="760" y="70" width="100" height="110" fill="#223a" />
          </svg>
          {/* Layer 2: Gedung lebih dekat, lampu neon */}
          <svg width="100%" height="120" style={{ position: 'absolute', bottom: 32, left: 0 }}>
            <rect x="30" y="60" width="40" height="60" fill="#0ff8" />
            <rect x="120" y="40" width="30" height="80" fill="#f0f8" />
            <rect x="200" y="70" width="60" height="50" fill="#0ff8" />
            <rect x="300" y="50" width="40" height="70" fill="#f0f8" />
            <rect x="400" y="60" width="50" height="60" fill="#0ff8" />
            <rect x="500" y="40" width="30" height="80" fill="#f0f8" />
            <rect x="600" y="70" width="60" height="50" fill="#0ff8" />
            <rect x="700" y="50" width="40" height="70" fill="#f0f8" />
          </svg>
          {/* Lampu neon di gedung */}
          <div className="absolute left-40 bottom-44 w-2 h-8 bg-cyan-400 rounded-full blur-sm animate-pulse" />
          <div className="absolute left-80 bottom-52 w-2 h-8 bg-pink-400 rounded-full blur-sm animate-pulse" />
          <div className="absolute left-[60%] bottom-40 w-2 h-8 bg-yellow-400 rounded-full blur-sm animate-pulse" />
        </div>

        {/* Background cyberpunk city image */}
        <img
          src={cityBg}
          alt="Cyberpunk City Background"
          className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none"
          style={{
            minHeight: '100vh',
            minWidth: '100vw',
            objectFit: 'cover',
            filter: 'brightness(0.7) saturate(1.2) blur(0.5px)',
          }}
          draggable={false}
        />
      </div>

      {/* Pause screen */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-30">
          <div className="mx-auto w-full max-w-xs bg-gradient-to-br from-[#1a1a2e] via-[#23234d] to-[#0f3460] rounded-2xl shadow-2xl border-2 border-cyan-400/40 p-8 flex flex-col items-center gap-6 animate-fade-in">
            <h2 className="text-4xl font-extrabold text-cyan-300 drop-shadow-lg tracking-wider mb-2 neon-glow">PAUSED</h2>
            <button
              onClick={() => setGameState('playing')}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg shadow-md hover:shadow-cyan-400/40 hover:scale-105 transition-all duration-200 mb-2"
            >
              Resume
            </button>
            {/* Sound Settings */}
            <div className="w-full bg-black/40 rounded-lg p-4 border border-cyan-400/20 flex flex-col gap-4 mb-2">
              {/* SFX */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-cyan-200 font-semibold">Sound Effects</span>
                  <button
                    onClick={() => setLocalSoundEnabled(!localSoundEnabled)}
                    className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${localSoundEnabled ? 'bg-cyan-400' : 'bg-gray-600'}`}
                    aria-label="Toggle SFX"
                  >
                    <span
                      className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-200 ${localSoundEnabled ? 'translate-x-4' : ''}`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-cyan-200 text-xs">Volume</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={localSfxVolume}
                    onChange={e => setLocalSfxVolume(Number(e.target.value))}
                    className="w-24 accent-cyan-400"
                  />
                  <span className="text-cyan-200 text-xs">{Math.round(localSfxVolume * 100)}</span>
                </div>
              </div>
              {/* Music */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-purple-200 font-semibold">Music</span>
                  <button
                    onClick={() => setLocalMusicEnabled(!localMusicEnabled)}
                    className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${localMusicEnabled ? 'bg-purple-400' : 'bg-gray-600'}`}
                    aria-label="Toggle Music"
                  >
                    <span
                      className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-200 ${localMusicEnabled ? 'translate-x-4' : ''}`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-purple-200 text-xs">Volume</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={localMusicVolume}
                    onChange={e => setLocalMusicVolume(Number(e.target.value))}
                    className="w-24 accent-purple-400"
                  />
                  <span className="text-purple-200 text-xs">{Math.round(localMusicVolume * 100)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onBack}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg shadow-md hover:shadow-cyan-400/40 hover:scale-105 transition-all duration-200"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
      {/* Game Over screen */}
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center z-30">
          <div className="mx-auto w-full max-w-xs bg-gradient-to-br from-[#1a1a2e] via-[#23234d] to-[#0f3460] rounded-2xl shadow-2xl border-2 border-cyan-400/40 p-8 flex flex-col items-center gap-6 animate-fade-in">
            <h2 className="text-4xl font-extrabold text-cyan-300 drop-shadow-lg tracking-wider mb-2 neon-glow">GAME OVER</h2>
            <div className="text-white text-lg font-semibold mb-2">Score: <span className="text-cyan-400">{score}</span></div>
            <button
              onClick={onBack}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg shadow-md hover:shadow-cyan-400/40 hover:scale-105 transition-all duration-200 mb-2"
            >
              Back to Menu
            </button>
            <button
              onClick={resetGame}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg shadow-md hover:shadow-cyan-400/40 hover:scale-105 transition-all duration-200"
            >
              Play Again
            </button>
            {submitting && <div className="text-cyan-300 text-sm mt-2">Submitting score...</div>}
            {submitError && <div className="text-red-400 text-sm mt-2">{submitError}</div>}
          </div>
        </div>
      )}
      {/* Moved @keyframes spinObstacle to global CSS (e.g., src/index.css) */}
    </div>
  );
};

export default GameScreen;
