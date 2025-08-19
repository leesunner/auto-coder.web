
import { useEffect, RefObject } from 'react';

/**
 * 点击外部区域检测Hook
 * @param ref 要监听的元素引用
 * @param handler 点击外部时的回调函数
 * @param enabled 是否启用监听，默认为true
 */
export const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent) => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler, enabled]);
};

export default useClickOutside;

