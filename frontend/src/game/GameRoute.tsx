











import React from 'react';
import TankGame from './index';

const GameRoute: React.FC = () => {
  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
    }}>
      <TankGame />
    </div>
  );
};

export default GameRoute;












