import React, { useEffect, useRef } from 'react';
import { Game } from './core/Game';
import './styles/game.css';

const TankGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      gameRef.current = new Game(canvasRef.current);
      gameRef.current.start();
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="tank-game-container">
      <div className="game-header">
        <h1>坦克大战</h1>
        <div className="game-controls">
          <div className="control-hint">
            <span>WASD: 移动</span>
            <span>空格: 射击</span>
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas"
      />
      <div className="game-info">
        <div>使用WASD键控制坦克移动，空格键发射子弹</div>
      </div>
    </div>
  );
};

export default TankGame;
