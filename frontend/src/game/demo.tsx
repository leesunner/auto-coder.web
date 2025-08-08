




















import React, { useState } from 'react';
import TankGame from './index';
import './styles/game.css';

const GameDemo: React.FC = () => {
  const [showGame, setShowGame] = useState(false);

  return (
    <div style={{ 
      padding: '20px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      {!showGame ? (
        <div style={{ 
          textAlign: 'center', 
          color: 'white',
          maxWidth: '800px',
          margin: '0 auto',
          paddingTop: '100px'
        }}>
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            🎮 坦克大战游戏
          </h1>
          
          <div style={{ 
            background: 'rgba(255,255,255,0.1)',
            padding: '30px',
            borderRadius: '20px',
            marginBottom: '30px',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ marginBottom: '20px' }}>游戏特性</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              textAlign: 'left'
            }}>
              <div>
                <h3>🎯 智能AI</h3>
                <p>敌人坦克具有巡逻、追击、攻击三种智能行为模式</p>
              </div>
              <div>
                <h3>💥 实时碰撞</h3>
                <p>精确的碰撞检测系统，流畅的物理交互</p>
              </div>
              <div>
                <h3>🏗️ 关卡系统</h3>
                <p>多关卡设计，逐步增加难度和挑战</p>
              </div>
              <div>
                <h3>🎨 精美画面</h3>
                <p>流畅动画效果，视觉冲击力强</p>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.1)',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '30px',
            backdropFilter: 'blur(10px)'
          }}>
            <h3>🎮 游戏控制</h3>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '20px',
              flexWrap: 'wrap',
              marginTop: '15px'
            }}>
              <span style={{ 
                background: 'rgba(255,255,255,0.2)',
                padding: '8px 15px',
                borderRadius: '20px',
                fontSize: '14px'
              }}>
                W/A/S/D - 移动控制
              </span>
              <span style={{ 
                background: 'rgba(255,255,255,0.2)',
                padding: '8px 15px',
                borderRadius: '20px',
                fontSize: '14px'
              }}>
                空格键 - 发射子弹
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowGame(true)}
            style={{
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              color: 'white',
              border: 'none',
              padding: '15px 40px',
              fontSize: '18px',
              borderRadius: '30px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
          >
            🚀 开始游戏
          </button>

          <div style={{ 
            marginTop: '40px',
            fontSize: '14px',
            opacity: '0.8'
          }}>
            <p>这是一个使用TypeScript和HTML5 Canvas开发的面向对象坦克大战游戏</p>
            <p>展示了现代Web游戏开发的最佳实践</p>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px' 
          }}>
            <button
              onClick={() => setShowGame(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '10px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              ← 返回首页
            </button>
          </div>
          <TankGame />
        </div>
      )}
    </div>
  );
};

export default GameDemo;





















