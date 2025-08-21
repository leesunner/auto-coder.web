interface Message {
  en: string;
  zh: string;
}

export const thumbnailListMessages: { [key: string]: Message } = {
  // 缩略图操作
  deleteImage: {
    en: "Delete image",
    zh: "删除图片"
  },
  
  // 预览相关
  closePreview: {
    en: "Close preview",
    zh: "关闭预览"
  },
  previousImage: {
    en: "Previous image",
    zh: "上一张图片"
  },
  nextImage: {
    en: "Next image", 
    zh: "下一张图片"
  },
  imageCounter: {
    en: "{{current}} / {{total}}",
    zh: "{{current}} / {{total}}"
  },
  
  // 键盘提示
  keyboardHints: {
    en: "Use ← → arrow keys to navigate, ESC to close",
    zh: "使用 ← → 方向键导航，ESC 键关闭"
  },
  
  // 空状态
  noImages: {
    en: "No images to display",
    zh: "没有图片可显示"
  },
  
  // 错误信息
  imageLoadError: {
    en: "Failed to load image",
    zh: "图片加载失败"
  },
  
  // 工具提示
  clickToPreview: {
    en: "Click to preview",
    zh: "点击预览"
  },
  dragToReorder: {
    en: "Drag to reorder",
    zh: "拖拽重新排序"
  }
};
