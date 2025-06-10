import React from 'react';
import { Particle } from './types';

interface ParticlesProps {
  particles: Particle[];
}

const Particles: React.FC<ParticlesProps> = ({ particles }) => (
  <>
    {particles.map(particle => (
      <div
        key={particle.id}
        className="absolute w-1 h-1 bg-cyan-400 rounded-full"
        style={{
          left: `${particle.x}px`,
          bottom: `${600 - particle.y}px`,
          opacity: particle.life / particle.maxLife,
        }}
      ></div>
    ))}
  </>
);

export default Particles;
