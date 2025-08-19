
import { useCallback, RefObject } from 'react';

export type DropdownDirection = 'up' | 'down';

interface UseDropdownDirectionOptions {
  containerRef: RefObject<HTMLElement>;
  dropdownHeight?: number;
  offset?: number;
}

/**
 * 计算下拉框显示方向的Hook
 * @param options 配置选项
 * @returns 计算下拉框方向的函数
 */
export const useDropdownDirection = (options: UseDropdownDirectionOptions) => {
  const { containerRef, dropdownHeight = 320, offset = 10 } = options;

  const calculateDirection = useCallback((): DropdownDirection => {
    if (!containerRef.current) {
      return 'up'; // 默认向上显示
    }

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // 计算容器下方可用空间
    const spaceBelow = viewportHeight - containerRect.bottom - offset;
    
    // 计算容器上方可用空间
    const spaceAbove = containerRect.top - offset;

    // 如果下方空间足够，向下显示
    if (spaceBelow >= dropdownHeight) {
      return 'down';
    }

    // 如果上方空间足够，向上显示
    if (spaceAbove >= dropdownHeight) {
      return 'up';
    }

    // 如果两边空间都不够，选择空间更大的一边
    return spaceBelow > spaceAbove ? 'down' : 'up';
  }, [containerRef, dropdownHeight, offset]);

  return calculateDirection;
};

export default useDropdownDirection;

