


import { Model, PresetConfig, ComponentSize, ThemeConfig } from './types';
import { CodeOutlined, MessageOutlined, ThunderboltOutlined, RobotOutlined } from '@ant-design/icons';
import React from 'react';

/**
 * 验证模型是否有有效的 API Key
 */
export const validateModelApiKey = (models: Model[], selectedModels: string[]): boolean => {
  return selectedModels.every(modelName => {
    const model = models.find(m => m.name === modelName);
    return model && !!model.api_key;
  });
};

/**
 * 过滤模型列表
 */
export const filterModels = (
  models: Model[], 
  searchValue: string, 
  caseSensitive: boolean = false
): Model[] => {
  if (!searchValue.trim()) {
    return models;
  }

  const searchTerm = caseSensitive ? searchValue : searchValue.toLowerCase();
  
  return models.filter(model => {
    const modelName = caseSensitive ? model.name : model.name.toLowerCase();
    const modelType = caseSensitive ? model.model_type : model.model_type.toLowerCase();
    
    return modelName.includes(searchTerm) || modelType.includes(searchTerm);
  });
};

/**
 * 截断长文本
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};

/**
 * 生成唯一的组件 ID
 */
export const generateComponentId = (prefix: string = 'custom-selector'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * 预设配置
 */
export const presetConfigs: Record<string, PresetConfig> = {
  code: {
    configKey: 'code_model',
    title: '代码模型',
    placeholder: '选择代码生成模型',
    tooltip: '选择用于代码生成的模型',
    eventKey: 'CODE_MODEL_UPDATED',
    needApiKey: false,
    icon: React.createElement(CodeOutlined)
  },
  chat: {
    configKey: 'chat_model',
    title: '聊天模型',
    placeholder: '选择对话模型',
    tooltip: '选择用于对话的模型，需要配置API Key',
    eventKey: 'CHAT_MODEL_UPDATED',
    needApiKey: true,
    icon: React.createElement(MessageOutlined)
  },
  inference: {
    configKey: 'inference_model',
    title: '推理模型',
    placeholder: '选择推理模型',
    tooltip: '选择用于推理任务的模型',
    eventKey: 'INFERENCE_MODEL_UPDATED',
    needApiKey: false,
    icon: React.createElement(ThunderboltOutlined)
  },
  custom: {
    configKey: 'custom_model',
    title: '自定义模型',
    placeholder: '请选择模型',
    tooltip: '选择自定义模型',
    eventKey: 'CUSTOM_MODEL_UPDATED',
    needApiKey: false,
    icon: React.createElement(RobotOutlined)
  }
};

/**
 * 获取预设配置
 */
export const getPresetConfig = (type: string): PresetConfig => {
  return presetConfigs[type] || presetConfigs.custom;
};

/**
 * 深色主题配置
 */
export const darkTheme: ThemeConfig = {
  backgroundColor: '#1e293b',
  borderColor: '#374151',
  borderHoverColor: '#4b5563',
  borderFocusColor: '#3b82f6',
  textColor: '#e5e7eb',
  placeholderColor: '#9ca3af',
  selectedBackgroundColor: '#2563eb',
  dropdownBackgroundColor: '#1f2937',
  optionHoverBackgroundColor: '#374151'
};

/**
 * 浅色主题配置
 */
export const lightTheme: ThemeConfig = {
  backgroundColor: '#ffffff',
  borderColor: '#d1d5db',
  borderHoverColor: '#9ca3af',
  borderFocusColor: '#3b82f6',
  textColor: '#1f2937',
  placeholderColor: '#6b7280',
  selectedBackgroundColor: '#3b82f6',
  dropdownBackgroundColor: '#ffffff',
  optionHoverBackgroundColor: '#f3f4f6'
};

/**
 * 组件尺寸配置
 */
export const sizeConfig: Record<ComponentSize, { height: number; fontSize: number; padding: string }> = {
  small: {
    height: 28,
    fontSize: 12,
    padding: '2px 6px'
  },
  medium: {
    height: 32,
    fontSize: 14,
    padding: '4px 8px'
  },
  large: {
    height: 40,
    fontSize: 16,
    padding: '6px 12px'
  }
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * 检查是否为有效的模型名称
 */
export const isValidModelName = (name: string): boolean => {
  return typeof name === 'string' && name.trim().length > 0;
};

/**
 * 格式化模型显示名称
 */
export const formatModelDisplayName = (model: Model): string => {
  if (model.model_name && model.model_name !== model.name) {
    return `${model.name} (${model.model_type})`;
  }
  return model.name;
};

/**
 * 排序模型列表
 */
export const sortModels = (models: Model[], sortBy: 'name' | 'type' | 'apiKey' = 'name'): Model[] => {
  return [...models].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return a.model_type.localeCompare(b.model_type);
      case 'apiKey':
        const aHasKey = !!a.api_key;
        const bHasKey = !!b.api_key;
        if (aHasKey === bHasKey) {
          return a.name.localeCompare(b.name);
        }
        return aHasKey ? -1 : 1;
      default:
        return 0;
    }
  });
};

/**
 * 获取模型统计信息
 */
export const getModelStats = (models: Model[]): {
  total: number;
  withApiKey: number;
  withoutApiKey: number;
  types: Record<string, number>;
} => {
  const stats = {
    total: models.length,
    withApiKey: 0,
    withoutApiKey: 0,
    types: {} as Record<string, number>
  };

  models.forEach(model => {
    if (model.api_key) {
      stats.withApiKey++;
    } else {
      stats.withoutApiKey++;
    }

    const type = model.model_type || 'unknown';
    stats.types[type] = (stats.types[type] || 0) + 1;
  });

  return stats;
};

/**
 * 本地存储工具
 */
export const storage = {
  /**
   * 保存选择历史
   */
  saveSelectionHistory: (configKey: string, models: string[]): void => {
    try {
      const key = `custom-selector-history-${configKey}`;
      const history = JSON.parse(localStorage.getItem(key) || '[]');
      
      // 添加新的选择到历史记录
      models.forEach(model => {
        if (!history.includes(model)) {
          history.unshift(model);
        }
      });
      
      // 限制历史记录数量
      const limitedHistory = history.slice(0, 10);
      localStorage.setItem(key, JSON.stringify(limitedHistory));
    } catch (error) {
      console.warn('Failed to save selection history:', error);
    }
  },

  /**
   * 获取选择历史
   */
  getSelectionHistory: (configKey: string): string[] => {
    try {
      const key = `custom-selector-history-${configKey}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
      console.warn('Failed to get selection history:', error);
      return [];
    }
  },

  /**
   * 清除选择历史
   */
  clearSelectionHistory: (configKey: string): void => {
    try {
      const key = `custom-selector-history-${configKey}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear selection history:', error);
    }
  }
};

/**
 * CSS 类名工具
 */
export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * 生成 CSS 变量
 */
export const generateCSSVariables = (theme: ThemeConfig, prefix: string = '--custom-selector'): Record<string, string> => {
  return {
    [`${prefix}-bg-color`]: theme.backgroundColor,
    [`${prefix}-border-color`]: theme.borderColor,
    [`${prefix}-border-hover-color`]: theme.borderHoverColor,
    [`${prefix}-border-focus-color`]: theme.borderFocusColor,
    [`${prefix}-text-color`]: theme.textColor,
    [`${prefix}-placeholder-color`]: theme.placeholderColor,
    [`${prefix}-selected-bg-color`]: theme.selectedBackgroundColor,
    [`${prefix}-dropdown-bg-color`]: theme.dropdownBackgroundColor,
    [`${prefix}-option-hover-bg-color`]: theme.optionHoverBackgroundColor
  };
};

/**
 * 键盘事件处理工具
 */
export const keyboardUtils = {
  /**
   * 检查是否为导航键
   */
  isNavigationKey: (key: string): boolean => {
    return ['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Tab'].includes(key);
  },

  /**
   * 检查是否为确认键
   */
  isConfirmKey: (key: string): boolean => {
    return ['Enter', ' '].includes(key);
  },

  /**
   * 检查是否为取消键
   */
  isCancelKey: (key: string): boolean => {
    return ['Escape'].includes(key);
  }
};


