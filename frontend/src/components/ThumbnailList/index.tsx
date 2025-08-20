
import React, { useState, useCallback } from 'react';
import './ThumbnailList.css';

export interface ThumbnailItem {
  file: File;
  path: string;
}

export interface ThumbnailListProps {
  items: ThumbnailItem[];
  onDelete: (index: number) => void;
}

const ThumbnailList: React.FC<ThumbnailListProps> = ({ items, onDelete }) => {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // 创建图片URL用于预览
  const createImageUrl = useCallback((file: File) => {
    return URL.createObjectURL(file);
  }, []);

  // 打开预览
  const openPreview = (index: number) => {
    setPreviewIndex(index);
  };

  // 关闭预览
  const closePreview = () => {
    setPreviewIndex(null);
  };

  // 切换到上一张图片
  const goToPrevious = () => {
    if (previewIndex !== null && previewIndex > 0) {
      setPreviewIndex(previewIndex - 1);
    }
  };

  // 切换到下一张图片
  const goToNext = () => {
    if (previewIndex !== null && previewIndex < items.length - 1) {
      setPreviewIndex(previewIndex + 1);
    }
  };

  // 处理键盘事件
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (previewIndex === null) return;
    
    switch (e.key) {
      case 'Escape':
        closePreview();
        break;
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
    }
  }, [previewIndex]);

  // 监听键盘事件
  React.useEffect(() => {
    if (previewIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [previewIndex, handleKeyDown]);

  // 处理删除
  const handleDelete = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    onDelete(index);
  };

  if (items.length === 0) {
    return (
      <div className="thumbnail-list-empty">
        <p>暂无图片</p>
      </div>
    );
  }

  return (
    <>
      {/* 缩略图列表 */}
      <div className="thumbnail-list">
        {items.map((item, index) => (
          <div
            key={`${item.path}-${index}`}
            className="thumbnail-item"
            onClick={() => openPreview(index)}
          >
            <div className="thumbnail-wrapper">
              <img
                src={createImageUrl(item.file)}
                alt={item.path}
                className="thumbnail-image"
                loading="lazy"
              />
              <button
                className="thumbnail-delete-btn"
                onClick={(e) => handleDelete(e, index)}
                title="删除图片"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 预览模态框 */}
      {previewIndex !== null && (
        <div className="thumbnail-preview-modal" onClick={closePreview}>
          <div className="thumbnail-preview-content" onClick={(e) => e.stopPropagation()}>
            {/* 关闭按钮 */}
            <button className="thumbnail-preview-close" onClick={closePreview}>
              ×
            </button>

            {/* 导航按钮 */}
            {previewIndex > 0 && (
              <button className="thumbnail-preview-nav thumbnail-preview-prev" onClick={goToPrevious}>
                ‹
              </button>
            )}
            {previewIndex < items.length - 1 && (
              <button className="thumbnail-preview-nav thumbnail-preview-next" onClick={goToNext}>
                ›
              </button>
            )}

            {/* 预览图片 */}
            <img
              src={createImageUrl(items[previewIndex].file)}
              alt={items[previewIndex].path}
              className="thumbnail-preview-image"
            />

            {/* 图片信息 */}
            <div className="thumbnail-preview-info">
              <p className="thumbnail-preview-filename">{items[previewIndex].path}</p>
              <p className="thumbnail-preview-counter">
                {previewIndex + 1} / {items.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThumbnailList;
