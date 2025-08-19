

import { useCallback, KeyboardEvent } from 'react';

interface UseKeyboardNavigationOptions {
  totalItems: number;
  isOpen: boolean;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onSelect: (index: number) => void;
  onClose: () => void;
}

/**
 * 键盘导航Hook
 * @param options 配置选项
 * @returns 键盘事件处理函数
 */
export const useKeyboardNavigation = (options: UseKeyboardNavigationOptions) => {
  const { 
    totalItems, 
    isOpen, 
    currentIndex, 
    onIndexChange, 
    onSelect, 
    onClose 
  } = options;

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (totalItems === 0) return;
        onIndexChange(currentIndex >= totalItems - 1 ? 0 : currentIndex + 1);
        break;

      case "ArrowUp":
        e.preventDefault();
        if (totalItems === 0) return;
        onIndexChange(currentIndex <= 0 ? totalItems - 1 : currentIndex - 1);
        break;

      case "Enter":
        if (currentIndex >= 0) {
          e.preventDefault();
          onSelect(currentIndex);
        }
        break;

      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  }, [isOpen, totalItems, currentIndex, onIndexChange, onSelect, onClose]);

  return handleKeyDown;
};

export default useKeyboardNavigation;


