import React from 'react';

export type GameState = 'playing' | 'gameOver' | 'paused';

interface PlayerProps {
  gameState: GameState;
  isJumping: boolean;
  isDucking: boolean;
  runFrame: number;
  jumpFrame: number;
  duckFrame: number;
  deathFrame: number;
  robotY: number;
  ROBOT_WIDTH: number;
  ROBOT_HEIGHT: number;
  collidedObstacleId: number | null;
  runFrames: string[];
  jumpFrames: string[];
  duckFrames: string[];
  deathFrames: string[];
  redShine?: boolean;
  goldShine?: boolean;
  shieldBlink?: boolean;
  left?: number | string;
  leftFraction?: number;
}

const Player: React.FC<PlayerProps> = ({
  gameState,
  isJumping,
  isDucking,
  runFrame,
  jumpFrame,
  duckFrame,
  deathFrame,
  robotY,
  ROBOT_WIDTH,
  ROBOT_HEIGHT,
  collidedObstacleId,
  runFrames,
  jumpFrames,
  duckFrames,
  deathFrames,
  redShine = false,
  goldShine = false,
  shieldBlink = false,
  left = undefined,
  leftFraction = 0.25,
}) => {
  let leftStyle: string | undefined = undefined;
  if (left !== undefined) {
    leftStyle = typeof left === 'number' ? `${left}px` : left;
  } else if (leftFraction !== undefined) {
    leftStyle = `${leftFraction * 100}%`;
  }

  return (
    <div
      className="absolute transition-all duration-100"
      style={{
        left: leftStyle,
        transform: `translateX(-50%) scaleX(-1)`,
        bottom: `${56 + robotY}px`,
        width: `${ROBOT_WIDTH}px`,
        height: `${isDucking ? ROBOT_HEIGHT * 0.7 : ROBOT_HEIGHT}px`,
        zIndex: 10,
        boxShadow: collidedObstacleId !== null && gameState !== 'gameOver' ? '0 0 32px 8px #ff0033, 0 0 0 8px #ff003388' : undefined,
        background: collidedObstacleId !== null && gameState !== 'gameOver' ? 'rgba(255,0,0,0.15)' : undefined,
        transition: 'box-shadow 0.1s, background 0.1s',
        opacity: shieldBlink ? 0.7 : 1,
        filter: shieldBlink ? 'drop-shadow(0 0 16px #38bdf8) drop-shadow(0 0 8px #0ff)' : undefined,
      }}
    >
      {goldShine && (
        <div
          style={{
            position: 'absolute',
            left: '-16px',
            top: '-16px',
            width: `calc(100% + 32px)`,
            height: `calc(100% + 32px)`,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fffbe6 0%, #ffe066 40%, #ffd70088 70%, transparent 100%)',
            zIndex: 150,
            pointerEvents: 'none',
            opacity: 0.85,
            animation: 'gold-shine-flash 0.18s linear',
          }}
        />
      )}
      {redShine && (
        <div
          style={{
            position: 'absolute',
            left: '-16px',
            top: '-16px',
            width: `calc(100% + 32px)`,
            height: `calc(100% + 32px)`,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #ff003388 0%, #ff003344 60%, transparent 100%)',
            zIndex: 200,
            pointerEvents: 'none',
            opacity: 0.85,
            animation: 'red-shine-flash 0.18s linear',
          }}
        />
      )}
      {gameState === 'gameOver' ? (
        <img src={deathFrames[deathFrame]} alt="Robot Death" style={{ width: '100%', height: '100%', transform: 'scale(1.5)', transition: 'transform 0.1s' }} draggable={false} />
      ) : isJumping ? (
        <img src={jumpFrames[jumpFrame]} alt="Robot Jump" style={{ width: '100%', height: '100%' }} draggable={false} />
      ) : isDucking ? (
        <img src={duckFrames[duckFrame]} alt="Robot Duck" style={{ width: '100%', height: '100%' }} draggable={false} />
      ) : (
        <img src={runFrames[runFrame]} alt="Robot Run" style={{ width: '100%', height: '100%' }} draggable={false} />
      )}
    </div>
  );
};

export default Player;
