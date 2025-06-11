import React from 'react';
import { Obstacle as ObstacleType } from './types';

interface ObstacleProps {
  obstacle: ObstacleType;
  collided: boolean;
  obstacleImg: string;
  extraStyle?: React.CSSProperties;
}

const Obstacle: React.FC<ObstacleProps> = ({ obstacle, collided, obstacleImg, extraStyle }) => (
  <div
    className={`absolute${obstacle.type === 'high' ? ' spin-obstacle' : ''}`}
    style={{
      left: `${obstacle.x}px`,
      bottom: `${56 + obstacle.y}px`,
      width: `${obstacle.width}px`,
      height: `${obstacle.height}px`,
      zIndex: 8,
      boxShadow: collided ? '0 0 32px 8px #ff0033, 0 0 0 8px #ff003388' : undefined,
      background: collided ? 'rgba(255,0,0,0.15)' : undefined,
      transition: 'box-shadow 0.1s, background 0.1s',
      ...extraStyle,
    }}
  >
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

interface ObstaclesProps {
  obstacles: ObstacleType[];
  collidedObstacleId: number | null;
  obstacleJumpImg: string;
  obstacleDuckImg: string;
}

const Obstacles: React.FC<ObstaclesProps> = ({ obstacles, collidedObstacleId, obstacleJumpImg, obstacleDuckImg }) => (
  <>
    {obstacles.map(obstacle => {
      let obstacleImg = obstacleJumpImg;
      let extraStyle = {};
      if (obstacle.type === 'low') {
        obstacleImg = obstacleDuckImg;
      } else if (obstacle.type === 'high') {
        obstacleImg = obstacleJumpImg;
        extraStyle = {
          animation: 'spinObstacle 1.2s linear infinite',
        };
      }
      return (
        <Obstacle
          key={obstacle.id}
          obstacle={obstacle}
          collided={collidedObstacleId === obstacle.id}
          obstacleImg={obstacleImg}
          extraStyle={extraStyle}
        />
      );
    })}
  </>
);

export default Obstacles;
