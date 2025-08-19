

import React from "react";

/**
 * 模型接口定义
 */
export interface Model {
  name: string;
  model_name: string;
  model_type: string;
  api_key?: string;
}

/**
 * 自定义模型选择器的属性接口
 */
export interface CustomModelSelectorProps {
  /** 是否只显示配置了 API Key 的模型 */
  needApiKey?: boolean;
  
  /** 配置键名，用于保存和读取选择的模型 */
  configKey?: string;
  
  /** 组件标题 */
  title?: string;
  
  /** 占位符文本 */
  placeholder?: string;
  
  /** 标题前的图标 */
  icon?: React.ReactNode;
  
  /** 鼠标悬停提示文本 */
  tooltip?: string;
  
  /** 事件总线事件键名 */
  eventKey?: string;
  
  /** 是否禁用组件 */
  disabled?: boolean;
  
  /** 自定义样式类名 */
  className?: string;
  
  /** 最大选择数量，0 表示无限制 */
  maxCount?: number;
  
  /** 是否允许清空选择 */
  allowClear?: boolean;
  
  /** 下拉框最大高度 */
  dropdownMaxHeight?: number;
  
  /** 自定义过滤函数 */
  filterOption?: (input: string, model: Model) => boolean;
  
  /** 选择改变时的回调函数 */
  onChange?: (selectedModels: string[]) => void;
  
  /** 模型选择时的回调函数 */
  onSelect?: (modelName: string) => void;
  
  /** 模型取消选择时的回调函数 */
  onDeselect?: (modelName: string) => void;
  
  /** 下拉框打开/关闭时的回调函数 */
  onDropdownVisibleChange?: (open: boolean) => void;
  
  /** 搜索时的回调函数 */
  onSearch?: (value: string) => void;
}

/**
 * 组件内部状态接口
 */
export interface CustomModelSelectorState {
  /** 可用的模型列表 */
  availableModels: Model[];
  
  /** 当前选中的模型名称列表 */
  selectedModels: string[];
  
  /** 是否正在加载模型列表 */
  loadingModels: boolean;
  
  /** 是否正在加载配置 */
  loadingConfig: boolean;
  
  /** 是否正在更新配置 */
  isUpdating: boolean;
  
  /** 下拉框是否打开 */
  isOpen: boolean;
  
  /** 搜索输入值 */
  searchValue: string;
  
  /** 过滤后的模型列表 */
  filteredModels: Model[];
}

/**
 * 获取模型列表的参数接口
 */
export interface GetModelsParams {
  /** 是否只返回配置了 API Key 的模型 */
  needHasApiKey?: boolean;
}

/**
 * API 响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 配置更新参数接口
 */
export interface ConfigUpdateParams {
  [key: string]: string | string[] | number | boolean;
}

/**
 * 事件总线事件类型
 */
export interface EventBusEvents {
  CONFIG: {
    CODE_MODEL_UPDATED: string;
    CHAT_MODEL_UPDATED: string;
    INFERENCE_MODEL_UPDATED: string;
    MODEL_LIST_UPDATED: string;
    [key: string]: string;
  };
}

/**
 * 模型验证结果接口
 */
export interface ModelValidationResult {
  isValid: boolean;
  hasApiKey: boolean;
  message?: string;
}

/**
 * 组件主题配置接口
 */
export interface ThemeConfig {
  /** 主背景色 */
  backgroundColor: string;
  
  /** 边框颜色 */
  borderColor: string;
  
  /** 悬停时边框颜色 */
  borderHoverColor: string;
  
  /** 聚焦时边框颜色 */
  borderFocusColor: string;
  
  /** 文本颜色 */
  textColor: string;
  
  /** 占位符颜色 */
  placeholderColor: string;
  
  /** 选中项背景色 */
  selectedBackgroundColor: string;
  
  /** 下拉面板背景色 */
  dropdownBackgroundColor: string;
  
  /** 选项悬停背景色 */
  optionHoverBackgroundColor: string;
}

/**
 * 预设配置类型
 */
export type PresetConfigType = 'code' | 'chat' | 'inference' | 'custom';

/**
 * 预设配置接口
 */
export interface PresetConfig {
  configKey: string;
  title: string;
  placeholder: string;
  tooltip: string;
  eventKey: string;
  needApiKey: boolean;
  icon: React.ReactNode;
}

/**
 * 组件大小类型
 */
export type ComponentSize = 'small' | 'medium' | 'large';

/**
 * 标签渲染属性接口
 */
export interface TagRenderProps {
  label: string;
  value: string;
  closable: boolean;
  onClose: (event: React.MouseEvent) => void;
}

/**
 * 选项渲染属性接口
 */
export interface OptionRenderProps {
  model: Model;
  selected: boolean;
  onSelect: () => void;
}

/**
 * 搜索配置接口
 */
export interface SearchConfig {
  /** 是否启用搜索 */
  enabled: boolean;
  
  /** 搜索占位符文本 */
  placeholder: string;
  
  /** 是否区分大小写 */
  caseSensitive: boolean;
  
  /** 自定义搜索函数 */
  customFilter?: (input: string, model: Model) => boolean;
}

/**
 * 动画配置接口
 */
export interface AnimationConfig {
  /** 下拉框动画持续时间 */
  dropdownDuration: number;
  
  /** 标签动画持续时间 */
  tagDuration: number;
  
  /** 是否启用动画 */
  enabled: boolean;
}

