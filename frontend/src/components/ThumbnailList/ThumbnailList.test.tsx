

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThumbnailList, { ThumbnailItem } from './index';

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

describe('ThumbnailList', () => {
  const mockItems: ThumbnailItem[] = [
    {
      file: new File(['test'], 'test1.jpg', { type: 'image/jpeg' }),
      path: 'test1.jpg'
    },
    {
      file: new File(['test'], 'test2.png', { type: 'image/png' }),
      path: 'test2.png'
    }
  ];

  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('渲染空状态', () => {
    render(<ThumbnailList items={[]} onDelete={mockOnDelete} />);
    expect(screen.getByText('暂无图片')).toBeInTheDocument();
  });

  test('渲染缩略图列表', () => {
    render(<ThumbnailList items={mockItems} onDelete={mockOnDelete} />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('alt', 'test1.jpg');
    expect(images[1]).toHaveAttribute('alt', 'test2.png');
  });

  test('点击缩略图打开预览', () => {
    render(<ThumbnailList items={mockItems} onDelete={mockOnDelete} />);
    
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');
    fireEvent.click(thumbnailItems[0]);
    
    // 检查预览模态框是否出现
    expect(document.querySelector('.thumbnail-preview-modal')).toBeInTheDocument();
  });

  test('点击删除按钮调用 onDelete', () => {
    render(<ThumbnailList items={mockItems} onDelete={mockOnDelete} />);
    
    const deleteButtons = document.querySelectorAll('.thumbnail-delete-btn');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDelete).toHaveBeenCalledWith(0);
  });

  test('ESC 键关闭预览', () => {
    render(<ThumbnailList items={mockItems} onDelete={mockOnDelete} />);
    
    // 打开预览
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');
    fireEvent.click(thumbnailItems[0]);
    
    // 按 ESC 键
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // 检查预览模态框是否关闭
    expect(document.querySelector('.thumbnail-preview-modal')).not.toBeInTheDocument();
  });

  test('左右箭头键切换图片', () => {
    render(<ThumbnailList items={mockItems} onDelete={mockOnDelete} />);
    
    // 打开预览
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');
    fireEvent.click(thumbnailItems[0]);
    
    // 按右箭头键
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    
    // 检查是否切换到第二张图片
    const previewImage = document.querySelector('.thumbnail-preview-image') as HTMLImageElement;
    expect(previewImage?.alt).toBe('test2.png');
  });

  test('点击预览背景关闭预览', () => {
    render(<ThumbnailList items={mockItems} onDelete={mockOnDelete} />);
    
    // 打开预览
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');
    fireEvent.click(thumbnailItems[0]);
    
    // 点击背景
    const modal = document.querySelector('.thumbnail-preview-modal');
    if (modal) {
      fireEvent.click(modal);
    }
    
    // 检查预览模态框是否关闭
    expect(document.querySelector('.thumbnail-preview-modal')).not.toBeInTheDocument();
  });
});


