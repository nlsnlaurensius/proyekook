// filepath: d:\Documents\KULIAH\Semester4\Netlab\project\src\components\GameScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Pause, Play } from 'lucide-react';
import { submitGameSession, getPowerUps, getUserOwnedPowerUps, usePowerUp } from '../utils/api';
import { Howl } from 'howler';
import cityBg from '../assets/city/background.svg';
import obstacleJumpImg from '../assets/obsctacle/jump.png';
import obstacleDuckImg from '../assets/obsctacle/duck.png';
import playMusicSrc from '../assets/sounds/play.mp3';
import jumpSfxSrc from '../assets/sounds/jump.mp3';
import duckSfxSrc from '../assets/sounds/duck.mp3';
import deathSfxSrc from '../assets/sounds/death.mp3';
import coinSfxSrc from '../assets/sounds/coin.mp3';
import powerupSfxSrc from '../assets/sounds/powerup.mp3';
import coinImg from '../assets/coin.png';
import doublecoinIcon from '../assets/powerup/doublecoin.svg';
import doublexpIcon from '../assets/powerup/doublexp.svg';
import shieldIcon from '../assets/powerup/shield.svg';
import Player, { GameState } from './GameScreen/Player';
import Obstacles from './GameScreen/Obstacles';
import Particles from './GameScreen/Particles';
import PauseScreen from './GameScreen/PauseScreen';
import GameOverScreen from './GameScreen/GameOverScreen';
import Background from './GameScreen/Background';
import { importAll } from './GameScreen/utils';
import { playClick } from '../utils/clickSound';
// Animation frames (must be top-level for use in both logic and props)
const runFrames = importAll(import.meta.glob('../assets/run/*.png', { eager: true, as: 'url' })).sort();
const jumpFrames = importAll(import.meta.glob('../assets/jump/*.png', { eager: true, as: 'url' })).sort();
const duckFrames = importAll(import.meta.glob('../assets/duck/*.png', { eager: true, as: 'url' })).sort();
const deathFrames = importAll(import.meta.glob('../assets/death/*.png', { eager: true, as: 'url' })).sort();
import { Obstacle, Particle, GameScreenProps } from './GameScreen/types';

// --- Dino-like constants ---
const GROUND_Y = 0;
const JUMP_HEIGHT = 100; // Tinggi maksimum lompatan (bisa diubah sesuai kebutuhan)
const JUMP_DURATION = 700; // ms
const DUCK_DURATION = 700; // ms
const ROBOT_WIDTH = 90;
const ROBOT_HEIGHT = 120;
const OBSTACLE_MIN_GAP = 220;
const OBSTACLE_MAX_GAP = 420;
const OBSTACLE_SPEED_START = 6;
const OBSTACLE_SPEED_MAX = 13;
const OBSTACLE_TYPES: Obstacle['type'][] = ['low', 'high'];

// Tambahkan konstanta untuk collider
const COLLIDER_WIDTH = ROBOT_WIDTH * 0.8; // 80% dari lebar asli
const COLLIDER_X_OFFSET = (ROBOT_WIDTH - COLLIDER_WIDTH) / 2;

const GameScreen: React.FC<GameScreenProps> = ({ user, onGameOver, onBack, soundEnabled, sfxVolume, musicVolume, onSoundSettingsChange }) => {
  const [gameState, setGameState] = useState<GameState>('playing');
  const [score, setScore] = useState(0);
  const [robotY, setRobotY] = useState(GROUND_Y); // Mulai di ground
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
  // Tambahkan state untuk coin
  const [coins, setCoins] = useState<{ id: number; x: number; y: number; collected: boolean }[]>([]);
  const [coinCount, setCoinCount] = useState(0);
  // --- Power Up State ---
  const [userPowerUps, setUserPowerUps] = useState<Record<number, number>>({});
  const [powerUpList, setPowerUpList] = useState<{ id: number; name: string; duration?: number; effectMultiplier?: number }[]>([]);
  const [doubleCoinActive, setDoubleCoinActive] = useState(false);
  const [doubleCoinTimer, setDoubleCoinTimer] = useState(0);
  const [doubleCoinEffect, setDoubleCoinEffect] = useState(2); // default multiplier
  const [doubleCoinDuration, setDoubleCoinDuration] = useState(10); // default duration (seconds)
  const [doubleXpActive, setDoubleXpActive] = useState(false);
  const [doubleXpTimer, setDoubleXpTimer] = useState(0);
  const [doubleXpEffect, setDoubleXpEffect] = useState(2); // default multiplier
  const [doubleXpDuration, setDoubleXpDuration] = useState(10); // default duration (seconds)
  const [shieldActive, setShieldActive] = useState(false);
  const [shieldTimer, setShieldTimer] = useState(0);
  const [shieldDuration, setShieldDuration] = useState(5); // default duration (seconds)
  const [shieldPowerUpId, setShieldPowerUpId] = useState<number | null>(null);
  const [countdownResume, setCountdownResume] = useState<number | null>(null);

  // Sinkronkan ke parent jika berubah (opsional, jika ingin update ke parent tambahkan callback di props)
  useEffect(() => {
    // Bisa tambahkan callback ke parent jika ingin
  }, [soundEnabled]);
  useEffect(() => {
    // Bisa tambahkan callback ke parent jika ingin
  }, [sfxVolume]);

  const gameLoopRef = useRef<number>();
  const obstacleIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const lastObstacleRef = useRef(0);
  const lastObstacleXRef = useRef(800);
  const jumpLockRef = useRef(false);
  const duckLockRef = useRef(false);
  // Tambahkan ref untuk coin
  const coinIdRef = useRef(0);
  const lastCoinRef = useRef(0);
  const gameOverHandledRef = useRef(false);

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

  // Fungsi untuk generate coin secara random
  const createCoin = useCallback(() => {
    // Coin muncul di antara ground dan batas atas lompatan robot
    const minY = 56 + 10;
    const maxY = 56 + 80;
    const y = Math.floor(Math.random() * (maxY - minY)) + minY;
    // Spawn X mirip obstacle
    const x = lastObstacleXRef.current + OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP);
    lastObstacleXRef.current = x;
    setCoins(prev => [
      ...prev,
      {
        id: coinIdRef.current++,
        x,
        y,
        collected: false
      }
    ]);
    lastCoinRef.current = Date.now();
  }, []);

  // Music and SFX Howl instances
  const musicRef = useRef<Howl | null>(null);
  const jumpSfxRef = useRef<Howl | null>(null);
  const duckSfxRef = useRef<Howl | null>(null);
  const deathSfxRef = useRef<Howl | null>(null);
  const coinSfxRef = useRef<Howl | null>(null);
  const powerupSfxRef = useRef<Howl | null>(null);

  // Setup music and SFX on mount
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.unload();
    }
    musicRef.current = new Howl({
      src: [playMusicSrc],
      loop: true,
      volume: soundEnabled ? musicVolume : 0,
      html5: true,
    });
    if (soundEnabled && gameState === 'playing' && musicRef.current) {
      musicRef.current.play();
    }
    // SFX setup tetap
    jumpSfxRef.current = new Howl({ src: [jumpSfxSrc], volume: soundEnabled ? sfxVolume : 0.0 });
    duckSfxRef.current = new Howl({ src: [duckSfxSrc], volume: soundEnabled ? sfxVolume : 0.0 });
    deathSfxRef.current = new Howl({ src: [deathSfxSrc], volume: soundEnabled ? sfxVolume : 0.0 });
    coinSfxRef.current = new Howl({ src: [coinSfxSrc], volume: soundEnabled ? sfxVolume : 0.0 });
    powerupSfxRef.current = new Howl({ src: [powerupSfxSrc], volume: soundEnabled ? sfxVolume : 0.8 });
    return () => {
      musicRef.current?.stop();
      musicRef.current?.unload();
    };
  }, [soundEnabled, musicVolume, sfxVolume, gameState]);

  // React to music toggle/volume or gameState
  useEffect(() => {
    if (!musicRef.current) return;
    musicRef.current.volume(soundEnabled ? musicVolume : 0);
    if (soundEnabled && gameState === 'playing') {
      if (!musicRef.current.playing()) musicRef.current.play();
    } else {
      musicRef.current.pause();
    }
  }, [soundEnabled, musicVolume, gameState]);

  // React to SFX toggle/volume
  useEffect(() => {
    if (jumpSfxRef.current) jumpSfxRef.current.volume(soundEnabled ? sfxVolume : 0.0);
    if (duckSfxRef.current) duckSfxRef.current.volume(soundEnabled ? sfxVolume : 0.0);
    if (deathSfxRef.current) deathSfxRef.current.volume(soundEnabled ? sfxVolume : 0.0);
    if (coinSfxRef.current) coinSfxRef.current.volume(soundEnabled ? sfxVolume : 0.0);
  }, [soundEnabled, sfxVolume]);

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
    if (!soundEnabled) return;
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
  }, [soundEnabled]);

  // Helper: Handle game over (must be above gameLoop)
  const handleGameOver = useCallback(async (finalScore: number) => {
    if (gameOverHandledRef.current) return; // Guard agar hanya sekali
    gameOverHandledRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = localStorage.getItem('neonRunnerToken');
      const userWithId = user as any;
      const userId = userWithId.id ?? userWithId.userId;
      if (token && userId) {
        await submitGameSession(userId, { score: finalScore, coinsCollected: coinCount }, token);
      }
    } catch (err: any) {
      setSubmitError('Failed to submit score to server.');
    }
    setSubmitting(false);
    onGameOver(finalScore, coinCount); // Pass both score and coinsCollected
  }, [user, onGameOver, coinCount]);

  // --- Dino-like game loop ---
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;
    setObstacles(prev => {
      // Jika shield aktif, skip semua collision obstacle
      if (shieldActive) {
        return prev.map(obstacle => ({
          ...obstacle,
          x: obstacle.x - gameSpeed
        })).filter(obstacle => obstacle.x > -obstacle.width);
      }
      const updated = prev.map(obstacle => ({
        ...obstacle,
        x: obstacle.x - gameSpeed
      })).filter(obstacle => obstacle.x > -obstacle.width);
      if (updated.length === 0 || (800 - updated[updated.length - 1].x) > OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP)) {
        createObstacle();
      }
      // Collider presisi: posisi X player = 500px (left), collider X = 500 + offset
      const robotRect = {
        x: 500 + COLLIDER_X_OFFSET,
        y: 56 + robotY,
        width: COLLIDER_WIDTH,
        height: isDucking ? ROBOT_HEIGHT * 0.7 : ROBOT_HEIGHT,
      };
      for (const obstacle of updated) {
        const obstacleRect = {
          x: obstacle.x,
          y: 56 + obstacle.y,
          width: obstacle.width,
          height: obstacle.height,
        };
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
          addParticles(robotRect.x + COLLIDER_WIDTH / 2, robotRect.y + robotRect.height / 2, 12);
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
    // Score hanya di-increment jika belum game over
    setScore(prev => {
      if (gameOverHandledRef.current) return prev;
      const increment = doubleXpActive ? doubleXpEffect : 1;
      return prev + increment;
    });
    setGameSpeed(prev => Math.min(prev + 0.002, OBSTACLE_SPEED_MAX));
    // Update coins di gameLoop (gabungkan pergerakan, filter, dan collision dalam satu setCoins)
    setCoins(prev => {
      let coinsCollectedThisFrame = 0;
      let playCoinSound = false;
      const updated = prev
        .map(coin => {
          // Gerakkan coin
          const moved = { ...coin, x: coin.x - gameSpeed };
          // Jika sudah diambil, tetap collected
          if (moved.collected) return moved;
          // Deteksi collision
          const robotRect = { x: 500 + COLLIDER_X_OFFSET, y: 56 + robotY, width: COLLIDER_WIDTH, height: isDucking ? ROBOT_HEIGHT * 0.7 : ROBOT_HEIGHT };
          const coinRect = { x: moved.x, y: moved.y, width: 32, height: 32 };
          const overlap =
            robotRect.x < coinRect.x + coinRect.width &&
            robotRect.x + robotRect.width > coinRect.x &&
            robotRect.y < coinRect.y + coinRect.height &&
            robotRect.y + robotRect.height > coinRect.y;
          if (overlap && !moved.collected) {
            coinsCollectedThisFrame++;
            playCoinSound = true;
            return { ...moved, collected: true };
          }
          return moved;
        })
        // Hapus coin hanya jika sudah keluar layar
        .filter(coin => coin.x > -32);
      if (coinsCollectedThisFrame > 0) {
        let multiplier = 1;
        if (doubleCoinActive) multiplier = doubleCoinEffect;
        setCoinCount(c => c + coinsCollectedThisFrame * multiplier);
        if (playCoinSound && coinSfxRef.current) coinSfxRef.current.play();
      }
      return updated;
    });
    // Generate coin secara random
    const now = Date.now();
    if (now - lastCoinRef.current > 1200 + Math.random() * 2000) {
      createCoin();
    }
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
      if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [jump, duck, gameState]);

  // Handler untuk resume dari pause dengan countdown
  const handleResumeWithCountdown = () => {
    setCountdownResume(3);
  };
  useEffect(() => {
    if (countdownResume === null) return;
    if (countdownResume > 0) {
      const timer = setTimeout(() => setCountdownResume((c) => (c !== null ? c - 1 : null)), 1000);
      return () => clearTimeout(timer);
    } else if (countdownResume === 0) {
      setCountdownResume(null);
      setGameState('playing');
    }
  }, [countdownResume]);

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
    setIsJumping(false);
    setIsDucking(false);
    setObstacles([]);
    setParticles([]);
    setCoins([]);
    setCoinCount(0);
    setGameSpeed(OBSTACLE_SPEED_START);
    setGameState('playing');
    lastObstacleRef.current = 0;
    lastObstacleXRef.current = 800;
    gameOverHandledRef.current = false;
    // Restart music from beginning when Play Again is pressed
    if (musicRef.current) {
      musicRef.current.seek(0);
      if (soundEnabled) musicRef.current.play();
    }
  };

  // Handler untuk update sound setting global dari PauseScreen
  const handleSoundSettingsChange = (enabled: boolean, music: number, sfx: number) => {
    onSoundSettingsChange(enabled, music, sfx);
  };

  // Add this after handleGameOver definition:
  useEffect(() => {
    if (gameState === 'gameOver') {
      handleGameOver(score);
    }
  }, [gameState, handleGameOver, score]);

  // Fetch owned power ups and power up info on mount
  useEffect(() => {
    const fetchPowerUps = async () => {
      try {
        const token = localStorage.getItem('neonRunnerToken') || undefined;
        const userStr = localStorage.getItem('neonRunnerUser');
        if (!userStr) return;
        const userObj = JSON.parse(userStr);
        if (!userObj.id) return;
        // Get owned
        const ownedRes = await getUserOwnedPowerUps(userObj.id, token);
        const map: Record<number, number> = {};
        (ownedRes.data || ownedRes.payload || []).forEach((upu: any) => {
          map[upu.powerUpId] = upu.quantity;
        });
        setUserPowerUps(map);
        // Get all power up info
        const allRes = await getPowerUps(token);
        const list = (allRes.data || allRes.payload || []).map((pu: any) => ({
          id: pu.id,
          name: pu.name,
          duration: pu.duration,
          effectMultiplier: pu.effectMultiplier
        }));
        setPowerUpList(list);
        // Set double coin effect/duration
        const doubleCoin = list.find((pu: any) => pu.name.toLowerCase().includes('coin'));
        if (doubleCoin) {
          setDoubleCoinEffect(doubleCoin.effectMultiplier || 2);
          setDoubleCoinDuration(doubleCoin.duration || 10);
        }
        // Set double xp effect/duration
        const doubleXp = list.find((pu: any) => pu.name.toLowerCase().includes('xp'));
        if (doubleXp) {
          setDoubleXpEffect(doubleXp.effectMultiplier || 2);
          setDoubleXpDuration(doubleXp.duration || 10);
        }
        // Set shield duration
        const shield = list.find((pu: any) => pu.name.toLowerCase().includes('shield'));
        if (shield) {
          setShieldDuration(shield.duration || 5);
          setShieldPowerUpId(shield.id);
        }
      } catch {}
    };
    fetchPowerUps();
  }, []);

  // Keyboard: tombol 1 untuk double coin
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (gameState !== 'playing') return;
      if (e.code === 'Digit1') {
        const doubleCoinPowerUpId = powerUpList.find((pu: any) => pu.name.toLowerCase().includes('coin'))?.id;
        if (doubleCoinPowerUpId && userPowerUps[doubleCoinPowerUpId] > 0 && !doubleCoinActive) {
          setUserPowerUps(prev => ({ ...prev, [doubleCoinPowerUpId]: prev[doubleCoinPowerUpId] - 1 }));
          setDoubleCoinActive(true);
          setDoubleCoinTimer(doubleCoinDuration);
          if (powerupSfxRef.current && soundEnabled) powerupSfxRef.current.play();
          // Update DB
          try {
            const userStr = localStorage.getItem('neonRunnerUser');
            const token = localStorage.getItem('neonRunnerToken') || undefined;
            if (userStr && token) {
              const userObj = JSON.parse(userStr);
              await usePowerUp(userObj.id, doubleCoinPowerUpId, token);
            }
          } catch {}
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [powerUpList, userPowerUps, doubleCoinActive, doubleCoinDuration, gameState, soundEnabled]);

  // Keyboard: tombol 2 untuk double xp
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (gameState !== 'playing') return;
      if (e.code === 'Digit2') {
        const doubleXpPowerUpId = powerUpList.find((pu: any) => pu.name.toLowerCase().includes('xp'))?.id;
        if (doubleXpPowerUpId && userPowerUps[doubleXpPowerUpId] > 0 && !doubleXpActive) {
          setUserPowerUps(prev => ({ ...prev, [doubleXpPowerUpId]: prev[doubleXpPowerUpId] - 1 }));
          setDoubleXpActive(true);
          setDoubleXpTimer(doubleXpDuration);
          if (powerupSfxRef.current && soundEnabled) powerupSfxRef.current.play();
          // Update DB
          try {
            const userStr = localStorage.getItem('neonRunnerUser');
            const token = localStorage.getItem('neonRunnerToken') || undefined;
            if (userStr && token) {
              const userObj = JSON.parse(userStr);
              await usePowerUp(userObj.id, doubleXpPowerUpId, token);
            }
          } catch {}
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [powerUpList, userPowerUps, doubleXpActive, doubleXpDuration, gameState, soundEnabled]);

  // Keyboard: tombol 3 untuk shield
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (gameState !== 'playing') return;
      if (e.code === 'Digit3') {
        if (shieldPowerUpId && userPowerUps[shieldPowerUpId] > 0 && !shieldActive) {
          setUserPowerUps(prev => ({ ...prev, [shieldPowerUpId]: prev[shieldPowerUpId] - 1 }));
          setShieldActive(true);
          setShieldTimer(shieldDuration);
          if (powerupSfxRef.current && soundEnabled) powerupSfxRef.current.play();
          // Update DB
          try {
            const userStr = localStorage.getItem('neonRunnerUser');
            const token = localStorage.getItem('neonRunnerToken') || undefined;
            if (userStr && token) {
              const userObj = JSON.parse(userStr);
              await usePowerUp(userObj.id, shieldPowerUpId, token);
            }
          } catch {}
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shieldPowerUpId, userPowerUps, shieldActive, shieldDuration, gameState, soundEnabled]);

  // Power up langsung habis saat mati
  useEffect(() => {
    if (gameState === 'gameOver' && doubleCoinActive) {
      setDoubleCoinActive(false);
      setDoubleCoinTimer(0);
    }
    if (gameState === 'gameOver' && doubleXpActive) {
      setDoubleXpActive(false);
      setDoubleXpTimer(0);
    }
    if (gameState === 'gameOver' && shieldActive) {
      setShieldActive(false);
      setShieldTimer(0);
    }
  }, [gameState, doubleCoinActive, doubleXpActive, shieldActive]);

  // Power up timer effect: decrease timer every second when active
  useEffect(() => {
    if (!doubleCoinActive) return;
    if (doubleCoinTimer <= 0) {
      setDoubleCoinActive(false);
      setDoubleCoinTimer(0);
      return;
    }
    const interval = setInterval(() => {
      setDoubleCoinTimer((prev) => {
        if (prev <= 1) {
          setDoubleCoinActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [doubleCoinActive, doubleCoinTimer]);

  useEffect(() => {
    if (!doubleXpActive) return;
    if (doubleXpTimer <= 0) {
      setDoubleXpActive(false);
      setDoubleXpTimer(0);
      return;
    }
    const interval = setInterval(() => {
      setDoubleXpTimer((prev) => {
        if (prev <= 1) {
          setDoubleXpActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [doubleXpActive, doubleXpTimer]);

  useEffect(() => {
    if (!shieldActive) return;
    if (shieldTimer <= 0) {
      setShieldActive(false);
      setShieldTimer(0);
      return;
    }
    const interval = setInterval(() => {
      setShieldTimer((prev) => {
        if (prev <= 1) {
          setShieldActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [shieldActive, shieldTimer]);

  // Helper: XP multiplier state
  const [xp, setXp] = useState(0);

  // XP gain logic (example, replace with your XP gain trigger)
  const gainXp = (baseXp: number) => {
    let multiplier = 1;
    if (doubleXpActive) multiplier = doubleXpEffect;
    setXp(x => x + baseXp * multiplier);
  };

  // Power up bar UI:
  const doubleCoinPowerUpId = powerUpList.find(pu => pu.name.toLowerCase().includes('coin'))?.id;
  const doubleCoinQty = doubleCoinPowerUpId ? userPowerUps[doubleCoinPowerUpId] || 0 : 0;
  const doubleXpPowerUpId = powerUpList.find(pu => pu.name.toLowerCase().includes('xp'))?.id;
  const doubleXpQty = doubleXpPowerUpId ? userPowerUps[doubleXpPowerUpId] || 0 : 0;
  const shieldQty = shieldPowerUpId ? userPowerUps[shieldPowerUpId] || 0 : 0;

  // Blinking effect for shield: toggle every 300ms when shieldActive
  const [shieldBlink, setShieldBlink] = useState(false);
  useEffect(() => {
    if (!shieldActive) {
      setShieldBlink(false);
      return;
    }
    let visible = true;
    const interval = setInterval(() => {
      visible = !visible;
      setShieldBlink(visible);
    }, 300); // was 120, now slower
    return () => clearInterval(interval);
  }, [shieldActive]);

  // Warn user before leaving/refreshing if game is still running
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (gameState === 'playing') {
        e.preventDefault();
        e.returnValue = 'Your game session will not be saved if you leave or reload the page.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState]);

  // Handler konfirmasi keluar (back to home/menu) saat game masih berjalan
  const handleBackWithConfirm = useCallback(() => {
    if (gameState === 'playing') {
      const confirmExit = window.confirm('Your game session will not be saved if you leave now. Are you sure you want to return to the menu?');
      if (!confirmExit) return;
    }
    onBack();
  }, [gameState, onBack]);

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
          {/* Tampilkan coin di UI */}
          <div className="flex items-center gap-2 text-yellow-300 font-bold text-xl bg-black/50 px-4 py-2 rounded-lg border border-yellow-400/30 backdrop-blur-sm">
            <img src={coinImg} alt="Coin" className="w-6 h-6 mr-1 inline-block" />
            {coinCount}
          </div>
          
          <button
            onClick={() => {
              if (soundEnabled) playClick(sfxVolume);
              setGameState(gameState === 'playing' ? 'paused' : 'playing');
            }}
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
          <Player
            gameState={gameState}
            isJumping={isJumping}
            isDucking={isDucking}
            runFrame={runFrame}
            jumpFrame={jumpFrame}
            duckFrame={duckFrame}
            deathFrame={deathFrame}
            robotY={robotY}
            ROBOT_WIDTH={90}
            ROBOT_HEIGHT={120}
            collidedObstacleId={collidedObstacleId}
            runFrames={runFrames}
            jumpFrames={jumpFrames}
            duckFrames={duckFrames}
            deathFrames={deathFrames}
            shieldBlink={shieldActive ? shieldBlink : false}
          />
          {/* Power-up icon di kepala karakter jika aktif */}
          {(doubleCoinActive || doubleXpActive || shieldActive) && (
            <div
              style={{
                position: 'absolute',
                left: '500px',
                bottom: `${56 + robotY + 140}px`,
                display: 'flex',
                flexDirection: 'row',
                gap: '8px',
                zIndex: 201,
                pointerEvents: 'none',
                width: '90px',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'bottom 0.1s',
              }}
            >
              {doubleCoinActive && (
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src={doublecoinIcon}
                    alt="Double Coin Active"
                    style={{
                      width: '32px',
                      height: '32px',
                      filter: 'drop-shadow(0 0 8px #0ff) drop-shadow(0 0 2px #fff8)',
                    }}
                  />
                  {/* Bar durasi horizontal di bawah icon */}
                  <div style={{ width: 32, height: 4, background: '#164e63', borderRadius: 2, marginTop: 2, overflow: 'hidden', border: '1px solid #22d3ee' }}>
                    <div style={{ height: '100%', background: '#22d3ee', width: `${(doubleCoinTimer/doubleCoinDuration)*100}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}
              {doubleXpActive && (
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src={doublexpIcon}
                    alt="Double XP Active"
                    style={{
                      width: '32px',
                      height: '32px',
                      filter: 'drop-shadow(0 0 8px #ff0) drop-shadow(0 0 2px #fff8)',
                    }}
                  />
                  {/* Bar durasi horizontal di bawah icon */}
                  <div style={{ width: 32, height: 4, background: '#78350f', borderRadius: 2, marginTop: 2, overflow: 'hidden', border: '1px solid #fde68a' }}>
                    <div style={{ height: '100%', background: '#fde68a', width: `${(doubleXpTimer/doubleXpDuration)*100}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}
              {shieldActive && (
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src={shieldIcon}
                    alt="Shield Active"
                    style={{
                      width: '32px',
                      height: '32px',
                      filter: 'drop-shadow(0 0 8px #0ff) drop-shadow(0 0 2px #fff8)',
                    }}
                  />
                  {/* Bar durasi horizontal di bawah icon */}
                  <div style={{ width: 32, height: 4, background: '#334155', borderRadius: 2, marginTop: 2, overflow: 'hidden', border: '1px solid #38bdf8' }}>
                    <div style={{ height: '100%', background: '#38bdf8', width: `${(shieldTimer/shieldDuration)*100}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Obstacles */}
          <Obstacles
            obstacles={obstacles}
            collidedObstacleId={collidedObstacleId}
            obstacleJumpImg={obstacleJumpImg}
            obstacleDuckImg={obstacleDuckImg}
          />
          {/* Particles */}
          <Particles particles={particles} />
          {/* Render coin di map */}
          {coins.map(coin => !coin.collected && (
            <img
              key={coin.id}
              src={coinImg}
              alt="Coin"
              className="absolute select-none pointer-events-none"
              style={{
                left: `${coin.x}px`,
                bottom: `${coin.y}px`,
                width: '32px',
                height: '32px',
                zIndex: 9,
                filter: 'drop-shadow(0 0 8px #ff0a) drop-shadow(0 0 2px #fff8)'
              }}
              draggable={false}
            />
          ))}
        </div>

        {/* Cyberpunk city background (parallax) */}
        <Background cityBg={cityBg} />
      </div>

      {/* Pause screen */}
      {gameState === 'paused' && countdownResume === null && (
        <PauseScreen
          onResume={handleResumeWithCountdown}
          onBack={handleBackWithConfirm}
          soundEnabled={soundEnabled}
          sfxVolume={sfxVolume}
          musicVolume={musicVolume}
          onSoundSettingsChange={handleSoundSettingsChange}
          showExitWarning={true}
        />
      )}
      {/* Countdown overlay saat resume dari pause */}
      {countdownResume !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-[2px]">
          <div className="text-7xl font-extrabold text-cyan-300 drop-shadow-lg animate-pulse">
            {countdownResume === 0 ? 'GO!' : countdownResume}
          </div>
        </div>
      )}
      {/* Game Over screen */}
      {gameState === 'gameOver' && (
        <GameOverScreen
          score={score}
          coinCount={coinCount}
          onBack={onBack}
          onRestart={resetGame}
          submitting={submitting}
          submitError={submitError}
        />
      )}

      {/* Power Up Bar */}
      <div className="absolute left-4 top-4 z-30 flex flex-col gap-5">
        {/* Double Coin Power Up */}
        <div className="relative flex items-center justify-center">
          <div className="bg-[#181c2f] rounded-2xl shadow-xl border-2 border-cyan-400/60 w-20 h-20 flex items-center justify-center relative">
            <img src={doublecoinIcon} alt="Double Coin" className="w-12 h-12" />
            <div className="absolute -bottom-2 -right-2 bg-cyan-400 rounded-full w-8 h-8 flex items-center justify-center border-4 border-[#181c2f] text-white font-bold text-lg shadow-md">
              {doubleCoinPowerUpId ? userPowerUps[doubleCoinPowerUpId] || 0 : 0}
            </div>
          </div>
          <span className="ml-4 text-cyan-300 text-xs font-semibold">Press 1</span>
        </div>
        {/* Double XP Power Up */}
        <div className="relative flex items-center justify-center">
          <div className="bg-[#181c2f] rounded-2xl shadow-xl border-2 border-yellow-400/60 w-20 h-20 flex items-center justify-center relative">
            <img src={doublexpIcon} alt="Double XP" className="w-12 h-12" />
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center border-4 border-[#181c2f] text-white font-bold text-lg shadow-md">
              {doubleXpPowerUpId ? userPowerUps[doubleXpPowerUpId] || 0 : 0}
            </div>
          </div>
          <span className="ml-4 text-yellow-200 text-xs font-semibold">Press 2</span>
        </div>
        {/* Shield Power Up */}
        <div className="relative flex items-center justify-center">
          <div className="bg-[#181c2f] rounded-2xl shadow-xl border-2 border-blue-400/60 w-20 h-20 flex items-center justify-center relative">
            <img src={shieldIcon} alt="Shield" className="w-12 h-12" />
            <div className="absolute -bottom-2 -right-2 bg-blue-400 rounded-full w-8 h-8 flex items-center justify-center border-4 border-[#181c2f] text-white font-bold text-lg shadow-md">
              {shieldQty}
            </div>
          </div>
          <span className="ml-4 text-blue-200 text-xs font-semibold">Press 3</span>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
