import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Pause, Play } from 'lucide-react';
import { submitGameSession, getPowerUps, getUserOwnedPowerUps, usePowerUp } from '../utils/api';
import { Howl } from 'howler';
import cityBg from '../assets/city/background.png';
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
import { importAll } from './GameScreen/utils';
import { playClick } from '../utils/clickSound';
const runFrames = importAll(import.meta.glob('../assets/run/*.png', { eager: true, as: 'url' })).sort();
const jumpFrames = importAll(import.meta.glob('../assets/jump/*.png', { eager: true, as: 'url' })).sort();
const duckFrames = importAll(import.meta.glob('../assets/duck/*.png', { eager: true, as: 'url' })).sort();
const deathFrames = importAll(import.meta.glob('../assets/death/*.png', { eager: true, as: 'url' })).sort();
import { Particle, GameScreenProps } from './GameScreen/types';
const GROUND_Y = 0;
const JUMP_HEIGHT = 100;
const JUMP_DURATION = 500;
const DUCK_DURATION = 500;
const ROBOT_WIDTH = 90;
const ROBOT_HEIGHT = 120;
let OBSTACLE_MIN_GAP = 220;
let OBSTACLE_MAX_GAP = 420;
const OBSTACLE_SPEED_START = 6;
const OBSTACLE_SPEED_MAX = 13;
import { Obstacle as ObstacleType } from './GameScreen/types';
const OBSTACLE_TYPES: ObstacleType['type'][] = ['low', 'high'];
const COLLIDER_WIDTH = ROBOT_WIDTH * 0.8;
const COLLIDER_X_OFFSET = (ROBOT_WIDTH - COLLIDER_WIDTH) / 2;
const PLAYER_COLLIDER_WIDTH = ROBOT_WIDTH * 0.05;
const PLAYER_COLLIDER_X_OFFSET = (ROBOT_WIDTH - PLAYER_COLLIDER_WIDTH) / 2;

const GameScreen: React.FC<GameScreenProps> = ({ user, onGameOver, onBack, soundEnabled, sfxVolume, musicVolume, onSoundSettingsChange, orientationState }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (orientationState) {
      if (orientationState.isMobile && orientationState.isPortrait) return 'paused';
      if (orientationState.isMobile && !orientationState.isPortrait) return 'playing';
      return 'playing';
    }
    const isMobileDevice = typeof window !== 'undefined' && window.innerWidth <= 1024;
    const isPortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;
    if (isMobileDevice && isPortrait) return 'paused';
    if (isMobileDevice && !isPortrait) return 'playing';
    return 'playing';
  });
  const [score, setScore] = useState(0);
  const [robotY, setRobotY] = useState(GROUND_Y);
  const [isJumping, setIsJumping] = useState(false);
  const [isDucking, setIsDucking] = useState(false);
  const [obstacles, setObstacles] = useState<ObstacleType[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [gameSpeed, setGameSpeed] = useState(6);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [runFrame, setRunFrame] = useState(0);
  const [jumpFrame, setJumpFrame] = useState(0);
  const [duckFrame, setDuckFrame] = useState(0);
  const [deathFrame, setDeathFrame] = useState(0);
  const [collidedObstacleId, setCollidedObstacleId] = useState<number | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [coins, setCoins] = useState<{ id: number; x: number; y: number; collected: boolean }[]>([]);
  const [coinCount, setCoinCount] = useState(0);
  const gameWorldRef = useRef<HTMLDivElement>(null);
  const [userPowerUps, setUserPowerUps] = useState<Record<number, number>>({});
  const [powerUpList, setPowerUpList] = useState<{ id: number; name: string; duration?: number; effectMultiplier?: number }[]>([]);
  const [doubleCoinActive, setDoubleCoinActive] = useState(false);
  const [doubleCoinTimer, setDoubleCoinTimer] = useState(0);
  const [doubleCoinEffect, setDoubleCoinEffect] = useState(2);
  const [doubleCoinDuration, setDoubleCoinDuration] = useState(10);
  const [doubleXpActive, setDoubleXpActive] = useState(false);
  const [doubleXpTimer, setDoubleXpTimer] = useState(0);
  const [doubleXpEffect, setDoubleXpEffect] = useState(2);
  const [doubleXpDuration, setDoubleXpDuration] = useState(10);
  const [shieldActive, setShieldActive] = useState(false);
  const [shieldTimer, setShieldTimer] = useState(0);
  const [shieldDuration, setShieldDuration] = useState(5);
  const [shieldPowerUpId, setShieldPowerUpId] = useState<number | null>(null);
  const [countdownResume, setCountdownResume] = useState<number | null>(null);

  useEffect(() => {
    // Bisa tambahkan callback ke parent jika ingin
  }, [soundEnabled]);
  useEffect(() => {
    // Bisa tambahkan callback ke parent jika ingin
  }, [sfxVolume]);

  useEffect(() => {
    if (showInstructions && gameState === 'playing') {
        const timer = setTimeout(() => {
            setShowInstructions(false);
        }, 3000);

        return () => clearTimeout(timer);
    }
}, [showInstructions, gameState]);

  const gameLoopRef = useRef<number>();
  const obstacleIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const lastObstacleRef = useRef(0);
  const lastObstacleXRef = useRef(800);
  const jumpLockRef = useRef(false);
  const duckLockRef = useRef(false);
  const coinIdRef = useRef(0);
  const lastCoinRef = useRef(0);
  const gameOverHandledRef = useRef(false);

  const createObstacle = useCallback(() => {
    const effectiveScore = Math.max(score, 1);
    const minGap = Math.max(120, 220 - Math.floor(effectiveScore / 100) * 20);
    const maxGap = Math.max(180, 420 - Math.floor(effectiveScore / 100) * 40);
    const minTypeGap = 320;
    const patternChance = Math.random();
    if (patternChance < 0.25 && score > 100) {
      const groupSize = Math.floor(Math.random() * 2) + 3;
      const gapIdx = Math.floor(Math.random() * groupSize);
      const baseX = lastObstacleXRef.current + minGap + Math.random() * (maxGap - minGap);
      let lastType: 'low' | 'high' | 'flying' | null = null;
      let lastX = baseX;
      let lowPlaced = false;
      for (let i = 0; i < groupSize; i++) {
        if (i === gapIdx) {
          lastType = null;
          lastX += 48;
          continue;
        }
        let type: 'low' | 'high' = Math.random() < 0.5 ? 'low' : 'high';
        if (type === 'low') {
          if (lowPlaced) type = 'high';
          else lowPlaced = true;
        }
        let x = lastX;
        if (lastType && lastType !== type) x += minTypeGap;
        const y = type === 'low' ? ROBOT_HEIGHT - 40 + 16 : 0;
        setObstacles(prev => [...prev, {
          id: obstacleIdRef.current++,
          x,
          y,
          type,
          width: 40,
          height: 40,
        }]);
        lastType = type;
        lastX = x + 48;
      }
      lastObstacleXRef.current = lastX;
      lastObstacleRef.current = Date.now();
      return;
    } else if (patternChance < 0.5 && score > 50) {
      const groupSize = Math.floor(Math.random() * 2) + 2;
      const baseX = lastObstacleXRef.current + minGap + Math.random() * (maxGap - minGap);
      let lastType: 'low' | 'high' | 'flying' | null = null;
      let lastX = baseX;
      let lowPlaced = false;
      for (let i = 0; i < groupSize; i++) {
        let type: 'low' | 'high' = i % 2 === 0 ? 'high' : 'low';
        if (type === 'low') {
          if (lowPlaced) type = 'high';
          else lowPlaced = true;
        }
        let x = lastX;
        if (lastType && lastType !== type) x += minTypeGap;
        const y = type === 'low' ? ROBOT_HEIGHT - 40 + 16 : 0;
        setObstacles(prev => [...prev, {
          id: obstacleIdRef.current++,
          x,
          y,
          type,
          width: 40,
          height: 40,
        }]);
        lastType = type;
        lastX = x + 44;
      }
      lastObstacleXRef.current = lastX;
      lastObstacleRef.current = Date.now();
      return;
    } else if (patternChance < 0.7 && score > 30) {
      const groupSize = Math.floor(Math.random() * 3) + 2;
      const baseX = lastObstacleXRef.current + minGap + Math.random() * (maxGap - minGap);
      let lastType: 'low' | 'high' | 'flying' | null = null;
      let lastX = baseX;
      let lowPlaced = false;
      for (let i = 0; i < groupSize; i++) {
        let type: ObstacleType['type'] = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
        if (type === 'low') {
          if (lowPlaced) type = 'high';
          else lowPlaced = true;
        }
        let x = lastX;
        if (lastType && lastType !== type) x += minTypeGap;
        const y = type === 'low' ? ROBOT_HEIGHT - 40 + 16 : 0;
        setObstacles(prev => [...prev, {
          id: obstacleIdRef.current++,
          x,
          y,
          type,
          width: 40,
          height: 40,
        }]);
        lastType = type;
        lastX = x + 40;
      }
      lastObstacleXRef.current = lastX;
      lastObstacleRef.current = Date.now();
      return;
    }
    const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    let width = 40, height = 40, y = 0;
    if (type === 'low') {
      y = ROBOT_HEIGHT - height + 16;
    }
    const x = lastObstacleXRef.current + minGap + Math.random() * (maxGap - minGap);
    lastObstacleXRef.current = x;
    setObstacles(prev => [...prev, {
      id: obstacleIdRef.current++,
      x,
      y,
      type,
      width,
      height,
    }]);
    lastObstacleRef.current = Date.now();
  }, [score]);

  const createCoin = useCallback(() => {
    const minY = 56 + 10;
    const maxY = 56 + 80;
    const y = Math.floor(Math.random() * (maxY - minY)) + minY;
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

  const musicRef = useRef<any>(null);
  const jumpSfxRef = useRef<any>(null);
  const duckSfxRef = useRef<any>(null);
  const deathSfxRef = useRef<any>(null);
  const coinSfxRef = useRef<any>(null);
  const powerupSfxRef = useRef<any>(null);

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

  useEffect(() => {
    if (!musicRef.current) return;
    musicRef.current.volume(soundEnabled ? musicVolume : 0);
    if (soundEnabled && gameState === 'playing') {
      if (!musicRef.current.playing()) musicRef.current.play();
    } else {
      musicRef.current.pause();
    }
  }, [soundEnabled, musicVolume, gameState]);

  useEffect(() => {
    if (jumpSfxRef.current) jumpSfxRef.current.volume(soundEnabled ? sfxVolume : 0.0);
    if (duckSfxRef.current) duckSfxRef.current.volume(soundEnabled ? sfxVolume : 0.0);
    if (deathSfxRef.current) deathSfxRef.current.volume(soundEnabled ? sfxVolume : 0.0);
    if (coinSfxRef.current) coinSfxRef.current.volume(soundEnabled ? sfxVolume : 0.0);
  }, [soundEnabled, sfxVolume]);

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

  const handleGameOver = useCallback(async (finalScore: number) => {
    if (gameOverHandledRef.current) return;
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
    onGameOver(finalScore, coinCount);
  }, [user, onGameOver, coinCount]);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;
    setObstacles(prev => {
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
      const gameWidth = gameWorldRef.current ? gameWorldRef.current.offsetWidth : 800;
      const robotX = gameWidth * 0.25;
      const playerColliderRect = {
        x: robotX + PLAYER_COLLIDER_X_OFFSET,
        y: 56 + robotY,
        width: PLAYER_COLLIDER_WIDTH,
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
          playerColliderRect.x < obstacleRect.x + obstacleRect.width &&
          playerColliderRect.x + playerColliderRect.width > obstacleRect.x &&
          playerColliderRect.y < obstacleRect.y + obstacleRect.height &&
          playerColliderRect.y + playerColliderRect.height > obstacleRect.y;
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
          addParticles(playerColliderRect.x + playerColliderRect.width / 2, playerColliderRect.y + playerColliderRect.height / 2, 12);
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
    setScore(prev => {
      if (gameOverHandledRef.current) return prev;
      const increment = doubleXpActive ? doubleXpEffect : 1;
      return prev + increment;
    });
    setGameSpeed(prev => Math.min(prev + 0.002, OBSTACLE_SPEED_MAX));
    setCoins(prev => {
      let coinsCollectedThisFrame = 0;
      let playCoinSound = false;
      const updated = prev
        .map(coin => {
          const moved = { ...coin, x: coin.x - gameSpeed };
          if (moved.collected) return moved;
          const gameWidth = gameWorldRef.current ? gameWorldRef.current.offsetWidth : 800;
          const robotX = gameWidth * 0.25;
          const robotRect = { x: robotX + COLLIDER_X_OFFSET, y: 56 + robotY, width: COLLIDER_WIDTH, height: isDucking ? ROBOT_HEIGHT * 0.7 : ROBOT_HEIGHT };
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
        .filter(coin => coin.x > -32);
      if (coinsCollectedThisFrame > 0) {
        let multiplier = 1;
        if (doubleCoinActive) multiplier = doubleCoinEffect;
        setCoinCount(c => c + coinsCollectedThisFrame * multiplier);
        if (playCoinSound && coinSfxRef.current) coinSfxRef.current.play();
      }
      return updated;
    });
    const now = Date.now();
    if (now - lastCoinRef.current > 1200 + Math.random() * 2000) {
      createCoin();
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, gameSpeed, score, createObstacle, playSound, addParticles, handleGameOver, robotY, isDucking, isJumping]);

  const jump = useCallback(() => {
    if (!isJumping && !jumpLockRef.current) {
      setIsDucking(false);
      setIsJumping(true);
      setRobotY(JUMP_HEIGHT);
      jumpLockRef.current = true;
      playSound('jump');
      setTimeout(() => {
        setRobotY(GROUND_Y);
        setIsJumping(false);
        jumpLockRef.current = false;
      }, JUMP_DURATION);
    }
  }, [isJumping, playSound]);

  const duck = useCallback(() => {
    if (!isDucking && !duckLockRef.current) {
      setIsJumping(false);
      setRobotY(GROUND_Y);
      setIsDucking(true);
      duckLockRef.current = true;
      playSound('duck');
      setTimeout(() => {
        setIsDucking(false);
        duckLockRef.current = false;
      }, DUCK_DURATION);
    }
  }, [isDucking, playSound]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump, duck, gameState]);

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

  useEffect(() => {
    if (gameState === 'playing' && !isJumping && !isDucking) {
      const interval = setInterval(() => {
        setRunFrame(f => (f + 1) % runFrames.length);
      }, 80);
      return () => clearInterval(interval);
    }
  }, [gameState, isJumping, isDucking]);

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
    setShowInstructions(true);
    setGameState('playing');
    lastObstacleRef.current = 0;
    lastObstacleXRef.current = 800;
    gameOverHandledRef.current = false;
    if (musicRef.current) {
      musicRef.current.seek(0);
      if (soundEnabled) musicRef.current.play();
    }
  };

  const handleSoundSettingsChange = (enabled: boolean, music: number, sfx: number) => {
    onSoundSettingsChange(enabled, music, sfx);
  };

  useEffect(() => {
    if (gameState === 'gameOver') {
      handleGameOver(score);
    }
  }, [gameState, handleGameOver, score]);

  useEffect(() => {
    const fetchPowerUps = async () => {
      try {
        const token = localStorage.getItem('neonRunnerToken') || undefined;
        const userStr = localStorage.getItem('neonRunnerUser');
        if (!userStr) return;
        const userObj = JSON.parse(userStr);
        if (!userObj.id) return;
        const ownedRes = await getUserOwnedPowerUps(userObj.id, token);
        const map: Record<number, number> = {};
        (ownedRes.data || ownedRes.payload || []).forEach((upu: any) => {
          map[upu.powerUpId] = upu.quantity;
        });
        setUserPowerUps(map);
        const allRes = await getPowerUps(token);
        const list = (allRes.data || allRes.payload || []).map((pu: any) => ({
          id: pu.id,
          name: pu.name,
          duration: pu.duration,
          effectMultiplier: pu.effectMultiplier
        }));
        setPowerUpList(list);
        const doubleCoin = list.find((pu: any) => pu.name.toLowerCase().includes('coin'));
        if (doubleCoin) {
          setDoubleCoinEffect(doubleCoin.effectMultiplier || 2);
          setDoubleCoinDuration(doubleCoin.duration || 10);
        }
        const doubleXp = list.find((pu: any) => pu.name.toLowerCase().includes('xp'));
        if (doubleXp) {
          setDoubleXpEffect(doubleXp.effectMultiplier || 2);
          setDoubleXpDuration(doubleXp.duration || 10);
        }
        const shield = list.find((pu: any) => pu.name.toLowerCase().includes('shield'));
        if (shield) {
          setShieldDuration(shield.duration || 5);
          setShieldPowerUpId(shield.id);
        }
      } catch {}
    };
    fetchPowerUps();
  }, []);

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

  const doubleCoinPowerUpId = powerUpList.find(pu => pu.name.toLowerCase().includes('coin'))?.id;
  const doubleXpPowerUpId = powerUpList.find(pu => pu.name.toLowerCase().includes('xp'))?.id;
  const shieldQty = shieldPowerUpId ? userPowerUps[shieldPowerUpId] || 0 : 0;

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
    }, 300);
    return () => clearInterval(interval);
  }, [shieldActive]);

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

  const handleBackWithConfirm = useCallback(() => {
    if (gameState === 'playing') {
      const confirmExit = window.confirm('Your game session will not be saved if you leave now. Are you sure you want to return to the menu?');
      if (!confirmExit) return;
    }
    onBack();
  }, [gameState, onBack]);

  const [isPortrait, setIsPortrait] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    function handleResize() {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      setIsMobile(window.innerWidth <= 1400); 
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  if (isMobile && isPortrait) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <div className="flex flex-col items-center justify-center gap-8 animate-fade-in">
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="mb-4 animate-bounce">
            <rect x="16" y="32" width="64" height="32" rx="8" fill="#0ff" fillOpacity="0.15" stroke="#0ff" strokeWidth="4" />
            <rect x="32" y="40" width="32" height="16" rx="4" fill="#fff" fillOpacity="0.2" />
            <path d="M48 16v8M48 72v8M80 48h-8M24 48h-8" stroke="#0ff" strokeWidth="4" strokeLinecap="round" />
            <path d="M72 72l8 8M24 24l-8-8" stroke="#0ff" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <h2 className="text-2xl md:text-3xl font-extrabold text-cyan-300 neon-glow drop-shadow-lg animate-pulse select-none text-center">Rotate your device<br />to landscape</h2>
          <p className="text-cyan-100 text-center text-lg max-w-xs">Untuk pengalaman bermain terbaik, silakan putar layar ke mode landscape.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-black overflow-hidden font-sans">
        <div
            className="relative bg-black overflow-hidden shadow-2xl border-2 border-cyan-400/20 aspect-video h-full w-auto max-w-full"style={{
                aspectRatio: '16 / 9',
                width: '100%',
                height: '100%',
                maxWidth: 'calc(200vh * (16 / 9))',
                maxHeight: 'calc(100vw * (9 / 16))',
                margin: 'auto',
            }}
        >
            <img
                src={cityBg}
                alt="Cyberpunk City Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
                draggable={false}
                style={{ filter: 'brightness(0.7) saturate(1.2)' }}
            />

            <div className="relative w-full h-full flex flex-col z-10">
                
                <div className="relative z-40 flex-shrink-0 p-2 sm:p-4 flex justify-between items-start">
                    <div className="flex flex-col gap-2 sm:gap-4" style={{ zIndex: 50, pointerEvents: 'auto' }}>
                        <div className="relative flex items-center">
                            <div
                                className="bg-[#181c2f] rounded-lg shadow-xl border-2 border-cyan-400/60 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center relative cursor-pointer"
                                onClick={async () => {
                                    if (isMobile && !isPortrait && doubleCoinPowerUpId && userPowerUps[doubleCoinPowerUpId] > 0 && !doubleCoinActive) {
                                        setUserPowerUps(prev => ({ ...prev, [doubleCoinPowerUpId]: prev[doubleCoinPowerUpId] - 1 }));
                                        setDoubleCoinActive(true);
                                        setDoubleCoinTimer(doubleCoinDuration);
                                        if (powerupSfxRef.current && soundEnabled) powerupSfxRef.current.play();
                                        try {
                                            const userStr = localStorage.getItem('neonRunnerUser');
                                            const token = localStorage.getItem('neonRunnerToken') || undefined;
                                            if (userStr && token) {
                                                const userObj = JSON.parse(userStr);
                                                await usePowerUp(userObj.id, doubleCoinPowerUpId, token);
                                            }
                                        } catch {}
                                    }
                                }}
                                
                            >
                                <img src={doublecoinIcon} alt="Double Coin" className="w-8 h-8 sm:w-10 sm:h-10" />
                                <div className="absolute -bottom-2 -right-2 bg-cyan-400 rounded-full w-6 h-6 flex items-center justify-center border-2 sm:border-4 border-[#181c2f] text-white font-bold text-sm sm:text-base shadow-md">
                                    {doubleCoinPowerUpId ? userPowerUps[doubleCoinPowerUpId] || 0 : 0}
                                </div>
                            </div>
                        </div>
                        <div className="relative flex items-center">
                            <div
                                className="bg-[#181c2f] rounded-lg shadow-xl border-2 border-yellow-400/60 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center relative cursor-pointer"
                                onClick={async () => {
                                    if (isMobile && !isPortrait && doubleXpPowerUpId && userPowerUps[doubleXpPowerUpId] > 0 && !doubleXpActive) {
                                        setUserPowerUps(prev => ({ ...prev, [doubleXpPowerUpId]: prev[doubleXpPowerUpId] - 1 }));
                                        setDoubleXpActive(true);
                                        setDoubleXpTimer(doubleXpDuration);
                                        if (powerupSfxRef.current && soundEnabled) powerupSfxRef.current.play();
                                        try {
                                            const userStr = localStorage.getItem('neonRunnerUser');
                                            const token = localStorage.getItem('neonRunnerToken') || undefined;
                                            if (userStr && token) {
                                                const userObj = JSON.parse(userStr);
                                                await usePowerUp(userObj.id, doubleXpPowerUpId, token);
                                            }
                                        } catch {}
                                    }
                                }}
                            >
                                <img src={doublexpIcon} alt="Double XP" className="w-8 h-8 sm:w-10 sm:h-10" />
                                <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center border-2 sm:border-4 border-[#181c2f] text-white font-bold text-sm sm:text-base shadow-md">
                                    {doubleXpPowerUpId ? userPowerUps[doubleXpPowerUpId] || 0 : 0}
                                </div>
                            </div>
                        </div>
                        <div className="relative flex items-center">
                            <div
                                className="bg-[#181c2f] rounded-lg shadow-xl border-2 border-blue-400/60 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center relative cursor-pointer"
                                onClick={async () => {
                                    if (isMobile && !isPortrait && shieldPowerUpId && userPowerUps[shieldPowerUpId] > 0 && !shieldActive) {
                                        setUserPowerUps(prev => ({ ...prev, [shieldPowerUpId]: prev[shieldPowerUpId] - 1 }));
                                        setShieldActive(true);
                                        setShieldTimer(shieldDuration);
                                        if (powerupSfxRef.current && soundEnabled) powerupSfxRef.current.play();
                                        try {
                                            const userStr = localStorage.getItem('neonRunnerUser');
                                            const token = localStorage.getItem('neonRunnerToken') || undefined;
                                            if (userStr && token) {
                                                const userObj = JSON.parse(userStr);
                                                await usePowerUp(userObj.id, shieldPowerUpId, token);
                                            }
                                        } catch {}
                                    }
                                }}
                            >
                                <img src={shieldIcon} alt="Shield" className="w-8 h-8 sm:w-10 sm:h-10" />
                                <div className="absolute -bottom-2 -right-2 bg-blue-400 rounded-full w-6 h-6 flex items-center justify-center border-2 sm:border-4 border-[#181c2f] text-white font-bold text-sm sm:text-base shadow-md">
                                    {shieldQty}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-white font-bold text-base sm:text-xl bg-black/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
                            Score: <span className="text-cyan-400">{score}</span>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-300 font-bold text-base sm:text-xl bg-black/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-yellow-400/30 backdrop-blur-sm">
                            <img src={coinImg} alt="Coin" className="w-5 h-5 sm:w-6 sm:h-6" />
                            {coinCount}
                        </div>
                        <button
                            onClick={() => {
                                if (soundEnabled) playClick(sfxVolume);
                                setGameState(gameState === 'playing' ? 'paused' : 'playing');
                            }}
                            className="p-2 sm:p-3 bg-black/50 text-white rounded-lg border border-gray-600 hover:border-purple-400 transition-colors backdrop-blur-sm"
                        >
                            {gameState === 'playing' ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                    </div>
                </div>

                <div
    ref={gameWorldRef}
    className="relative flex-1 w-full"
    onTouchStart={e => {
        if (isMobile && !isPortrait && gameState === 'playing') {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const x = touch.clientX - rect.left;

            if (x < rect.width / 2) {
                jump();
            } else {
                duck();
            }
        }
    }}
    style={{ touchAction: isMobile && !isPortrait ? 'manipulation' : undefined }}
>
                    <div className="absolute left-0 bottom-0 w-full z-30" style={{ height: '56px', background: 'linear-gradient(90deg, #a259ff 0%, #6a00ff 100%)', boxShadow: '0 0 32px 8px #a259ff99' }} />
                    <div className="absolute left-0 bottom-[56px] w-full border-t-2 border-purple-300 z-1" />

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
                        leftFraction={0.25}
                    />

                    {(doubleCoinActive || doubleXpActive || shieldActive) && (
                        <div
                            style={{
                                position: 'absolute',
                                left: gameWorldRef.current ? `calc(${gameWorldRef.current.offsetWidth * 0.25}px)` : '25%',
                                transform: 'translateX(-50%)',
                                bottom: `${56 + robotY + 140}px`,
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '8px',
                                zIndex: 30,
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
                    <div style={{ width: 32, height: 4, background: '#334155', borderRadius: 2, marginTop: 2, overflow: 'hidden', border: '1px solid #38bdf8' }}>
                      <div style={{ height: '100%', background: '#38bdf8', width: `${(shieldTimer/shieldDuration)*100}%`, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}
                        </div>
                    )}
                    
                    <Obstacles
                        obstacles={obstacles}
                        collidedObstacleId={collidedObstacleId}
                        obstacleJumpImg={obstacleJumpImg}
                        obstacleDuckImg={obstacleDuckImg}
                    />
                    
                    <Particles particles={particles} />
                    
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
            </div>

            {gameState === 'paused' && countdownResume === null && (
                <PauseScreen
                    onResume={handleResumeWithCountdown}
                    onBack={handleBackWithConfirm}
                    soundEnabled={soundEnabled}
                    sfxVolume={sfxVolume}
                    musicVolume={musicVolume}
                    onSoundSettingsChange={handleSoundSettingsChange}
                    isMobile={isMobile}
                    isPortrait={isPortrait}
                />
            )}

            {countdownResume !== null && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-[2px]">
                    <div className="text-7xl font-extrabold text-cyan-300 drop-shadow-lg animate-pulse">
                        {countdownResume === 0 ? 'GO!' : countdownResume}
                    </div>
                </div>
            )}

            {gameState === 'gameOver' && (
                <GameOverScreen
                    score={score}
                    coinCount={coinCount}
                    onBack={onBack}
                    onRestart={resetGame}
                    submitting={submitting}
                    submitError={submitError}
                    isMobile={isMobile}
                    isPortrait={isPortrait}
                />
            )}

            {isMobile && !isPortrait && showInstructions && (
              <>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-black/70 px-4 py-2 rounded-xl border border-cyan-400 text-cyan-200 text-base font-semibold shadow-lg select-none pointer-events-none animate-fade-in whitespace-nowrap">
                  Touch left side to <span className="text-cyan-300">jump</span>, right side to <span className="text-cyan-300">duck</span>
                </div>
                <div className="absolute left-0 bottom-0 w-full h-[40%] z-30 flex pointer-events-none">
                  <div className="w-1/2 h-full bg-cyan-400/20 border-r-2 border-cyan-300/30 transition-opacity duration-300 pointer-events-none" style={{borderBottomLeftRadius: 16}} />
                  <div className="w-1/2 h-full bg-purple-400/20 border-l-2 border-purple-300/30 transition-opacity duration-300 pointer-events-none" style={{borderBottomRightRadius: 16}} />
                </div>
              </>
            )}

            {!isMobile && showInstructions && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-black/70 px-6 py-3 rounded-xl border border-cyan-400 text-cyan-200 text-base font-semibold shadow-lg select-none pointer-events-none animate-fade-in whitespace-nowrap flex flex-col items-center gap-1">
                <div>
                  Press <span className="text-cyan-300 font-bold">Arrow Up</span> or <span className="text-cyan-300 font-bold">Space</span> to <span className="text-cyan-300">jump</span>, <span className="text-cyan-300 font-bold">Arrow Down</span> to <span className="text-cyan-300">duck</span>
                </div>
                <div>
                  Press <span className="text-yellow-300 font-bold">1</span>, <span className="text-yellow-300 font-bold">2</span>, <span className="text-yellow-300 font-bold">3</span> for <span className="text-yellow-300">power up</span>
                </div>
              </div>
            )}
        </div>
    </div>
);

};

export default GameScreen;