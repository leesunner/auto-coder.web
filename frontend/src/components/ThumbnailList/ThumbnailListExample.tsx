

import React, { useState, useRef } from 'react';
import ThumbnailList, { ThumbnailItem } from './index';

const ThumbnailListExample: React.FC = () => {
  const [thumbnailItems, setThumbnailItems] = useState<ThumbnailItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newItems: ThumbnailItem[] = [];
    
    Array.from(files).forEach((file) => {
      // 只处理图片文件
      if (file.type.startsWith('image/')) {
        newItems.push({
          file: file,
          path: file.name
        });
      }
    });

    setThumbnailItems(prev => [...prev, ...newItems]);
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理删除
  const handleDelete = (index: number) => {
    setThumbnailItems(prev => prev.filter((_, i) => i !== index));
  };

  // 清空所有图片
  const handleClearAll = () => {
    setThumbnailItems([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>缩略图列表示例</h2>
      
      {/* 控制面板 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          选择图片
        </button>
        
        {thumbnailItems.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            清空所有
          </button>
        )}
        
        <span style={{ color: '#cccccc', fontSize: '14px' }}>
          已选择 {thumbnailItems.length} 张图片
        </span>
      </div>

      {/* 缩略图列表 */}
      <ThumbnailList 
        items={thumbnailItems} 
        onDelete={handleDelete} 
      />

      {/* 使用说明 */}
      <div style={{ marginTop: '30px', color: '#cccccc', fontSize: '14px' }}>
        <h3>使用说明：</h3>
        <ul>
          <li>点击"选择图片"按钮选择一个或多个图片文件</li>
          <li>缩略图大小为 45x45 像素</li>
          <li>鼠标悬停在缩略图上会显示删除按钮（×）</li>
          <li>点击缩略图可以放大预览</li>
          <li>在预览模式下：</li>
          <ul>
            <li>使用左右箭头键或点击导航按钮切换图片</li>
            <li>按 ESC 键或点击背景关闭预览</li>
            <li>点击右上角的 × 按钮关闭预览</li>
          </ul>
        </ul>
      </div>
    </div>
  );
};

export default ThumbnailListExample;

