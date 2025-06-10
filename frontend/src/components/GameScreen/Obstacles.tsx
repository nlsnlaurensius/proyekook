import React from 'react';
import { Obstacle as ObstacleType } from './types';
import Obstacle from './Obstacle';

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
