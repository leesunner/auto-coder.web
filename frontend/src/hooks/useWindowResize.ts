import { useEffect, useCallback } from 'react';

interface UseWindowResizeOptions {
  debounceMs?: number;
  onResize?: () => void;
}

/**
 * 窗口大小变化监听Hook
 * @param options 配置选项
 * @returns 无返回值
 */
export const useWindowResize = (options: UseWindowResizeOptions = {}) => {
  const { debounceMs = 100, onResize } = options;

  const handleResize = useCallback(() => {
    if (onResize) {
      onResize();
    }
  }, [onResize]);

  useEffect(() => {
    if (!onResize) return;

    let timeoutId: NodeJS.Timeout;

    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, debounceMs);
    };

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('scroll', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('scroll', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize, debounceMs]);
};

export default useWindowResize;
