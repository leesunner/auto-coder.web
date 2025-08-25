import React, {
  useState,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./ThumbnailList.css";
import eventBus, { EVENTS } from "@/services/eventBus";
import type { ThumbnailItem, ThumbnailListProps } from "./types";
import { getMessage } from "../../lang";

const ThumbnailList: React.FC<ThumbnailListProps> = forwardRef(
  ({ onDelete, onChange, ref }) => {
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [items, setItems] = useState<ThumbnailItem[]>([]);

    useEffect(() => {
      onChange?.(items);
    }, [items]);

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
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (previewIndex === null) return;

        switch (e.key) {
          case "Escape":
            closePreview();
            break;
          case "ArrowLeft":
            goToPrevious();
            break;
          case "ArrowRight":
            goToNext();
            break;
        }
      },
      [previewIndex]
    );

    // 监听键盘事件
    React.useEffect(() => {
      if (previewIndex !== null) {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
      }
    }, [previewIndex, handleKeyDown]);

    // 处理删除
    const handleDelete = (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      setItems((pre) => {
        return pre.filter((_, i) => i !== index);
      });
      onDelete?.(index);
    };

    useEffect(() => {
      const unsubscribe = eventBus.subscribe(EVENTS.FILE.PAST, (data) => {
        setItems((pre) => {
          return [...pre, data];
        });
      });

      return () => {
        unsubscribe();
      };
    }, []);

    useImperativeHandle(ref, () => ({
      clearFiles() {
        setItems([]);
      },
    }));

    if (items.length === 0) {
      return null;
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
                  title={getMessage("deleteImage")}
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
            <div
              className="thumbnail-preview-content"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                className="thumbnail-preview-close"
                onClick={closePreview}
                title={getMessage("closePreview")}
              >
                ×
              </button>

              {/* 导航按钮 */}
              {previewIndex > 0 && (
                <button
                  className="thumbnail-preview-nav thumbnail-preview-prev"
                  onClick={goToPrevious}
                  title={getMessage("previousImage")}
                >
                  ‹
                </button>
              )}
              {previewIndex < items.length - 1 && (
                <button
                  className="thumbnail-preview-nav thumbnail-preview-next"
                  onClick={goToNext}
                  title={getMessage("nextImage")}
                >
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
                <p className="thumbnail-preview-filename">
                  {items[previewIndex].path}
                </p>
                <p className="thumbnail-preview-counter">
                  {getMessage("imageCounter", {
                    current: previewIndex + 1,
                    total: items.length,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

export default ThumbnailList;
