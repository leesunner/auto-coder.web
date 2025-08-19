


import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useDropdownDirection } from '../useDropdownDirection';

// Mock window properties
Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 1000,
});

describe('useDropdownDirection', () => {
  it('应该返回计算下拉框方向的函数', () => {
    const { result } = renderHook(() => {
      const containerRef = useRef<HTMLDivElement>(null);
      return useDropdownDirection({
        containerRef,
        dropdownHeight: 320,
        offset: 10,
      });
    });

    expect(typeof result.current).toBe('function');
  });

  it('当容器引用为空时应该返回默认方向', () => {
    const { result } = renderHook(() => {
      const containerRef = useRef<HTMLDivElement>(null);
      return useDropdownDirection({
        containerRef,
        dropdownHeight: 320,
        offset: 10,
      });
    });

    const calculateDirection = result.current;
    expect(calculateDirection()).toBe('up');
  });
});



