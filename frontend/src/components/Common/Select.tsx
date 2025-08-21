import React, { useState, useEffect, useCallback, useRef } from "react";
import { Tag } from "antd";
import {
  DownOutlined,
  UpOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import "./Select.css";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  maxTagCount?: number;
  loading?: boolean;
  onChange?: (value: string | string[]) => void;
  onSearch?: (searchValue: string) => void;
  className?: string;
  style?: React.CSSProperties;
  dropdownClassName?: string;
  dropdownStyle?: React.CSSProperties;
  size?: "small" | "middle" | "large";
  allowClear?: boolean;
  showSearch?: boolean;
  filterOption?: (input: string, option: SelectOption) => boolean;
  notFoundContent?: React.ReactNode;
  maxHeight?: number;
}

const Select: React.FC<SelectProps> = ({
  options = [],
  value: controlledValue,
  defaultValue,
  placeholder = "请选择",
  multiple = false,
  searchable = true,
  disabled = false,
  clearable = true,
  maxTagCount = 3,
  loading = false,
  onChange,
  onSearch,
  className = "",
  style,
  dropdownClassName = "",
  dropdownStyle,
  size = "middle",
  allowClear = true,
  showSearch = true,
  filterOption,
  notFoundContent = "无匹配结果",
  maxHeight = 200,
}) => {
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue || (multiple ? [] : "")
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>(options);
  const [dropdownDirection, setDropdownDirection] = useState<"up" | "down">("down");

  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  // 使用受控值或内部值
  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  // 检测下拉框应该向上还是向下展开
  const detectDropdownDirection = useCallback(() => {
    if (!selectorRef.current) return "down";

    const selectorRect = selectorRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.min(maxHeight + 100, 300); // 预估下拉框高度

    const spaceBelow = viewportHeight - selectorRect.bottom;
    const spaceAbove = selectorRect.top;

    // 如果下方空间足够，优先向下展开
    if (spaceBelow >= dropdownHeight) {
      return "down";
    }

    // 如果上方空间更大，向上展开
    if (spaceAbove > spaceBelow) {
      return "up";
    }

    // 默认向下展开
    return "down";
  }, [maxHeight]);

  // 过滤选项
  useEffect(() => {
    let filtered = options;

    if (searchValue && showSearch) {
      if (filterOption) {
        filtered = options.filter((option) => filterOption(searchValue, option));
      } else {
        filtered = options.filter((option) =>
          option.label.toLowerCase().includes(searchValue.toLowerCase())
        );
      }
    }

    setFilteredOptions(filtered);
  }, [options, searchValue, showSearch, filterOption]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchValue("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 处理值变化
  const handleValueChange = (newValue: string | string[]) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  // 处理选项选择
  const handleOptionSelect = (optionValue: string) => {
    if (multiple) {
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      let newValue: string[];

      if (currentArray.includes(optionValue)) {
        newValue = currentArray.filter((v) => v !== optionValue);
      } else {
        newValue = [...currentArray, optionValue];
      }

      handleValueChange(newValue);
    } else {
      handleValueChange(optionValue);
      setIsOpen(false);
      setSearchValue("");
    }
  };

  // 移除标签
  const handleTagRemove = (tagValue: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (multiple && Array.isArray(currentValue)) {
      const newValue = currentValue.filter((v) => v !== tagValue);
      handleValueChange(newValue);
    }
  };

  // 清空所有选择
  const handleClearAll = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleValueChange(multiple ? [] : "");
  };

  // 切换下拉框
  const handleToggleDropdown = () => {
    if (disabled || loading) return;

    if (!isOpen) {
      const direction = detectDropdownDirection();
      setDropdownDirection(direction);
    }

    setIsOpen(!isOpen);
    if (!isOpen && showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchValue("");
    }
  };

  // 处理搜索
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  // 获取显示的选中项
  const getSelectedDisplay = () => {
    if (multiple && Array.isArray(currentValue)) {
      if (currentValue.length === 0) {
        return <div className="select-placeholder">{placeholder}</div>;
      }

      const selectedOptions = currentValue
        .map((val) => options.find((opt) => opt.value === val))
        .filter(Boolean) as SelectOption[];

      const visibleTags = selectedOptions.slice(0, maxTagCount);
      const remainingCount = selectedOptions.length - maxTagCount;

      return (
        <div className="select-tags">
          {visibleTags.map((option) => (
            <Tag
              key={option.value}
              color="blue"
              closable={!disabled}
              onClose={(e) => handleTagRemove(option.value, e)}
              className="select-tag"
              title={option.label}
            >
              {option.label.length > 20
                ? `${option.label.substring(0, 20)}...`
                : option.label}
            </Tag>
          ))}
          {remainingCount > 0 && (
            <span className="select-more-count">+{remainingCount}</span>
          )}
        </div>
      );
    } else {
      const selectedOption = options.find((opt) => opt.value === currentValue);
      return selectedOption ? (
        <div className="select-single-value" title={selectedOption.label}>
          {selectedOption.label}
        </div>
      ) : (
        <div className="select-placeholder">{placeholder}</div>
      );
    }
  };

  // 获取尺寸类名
  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "select-small";
      case "large":
        return "select-large";
      default:
        return "select-middle";
    }
  };

  // 检查是否有选中值
  const hasValue = multiple
    ? Array.isArray(currentValue) && currentValue.length > 0
    : Boolean(currentValue);

  return (
    <div className={`common-select ${className}`} style={style} ref={selectRef}>
      <div
        ref={selectorRef}
        className={`select-selector ${getSizeClass()} ${
          isOpen ? "select-open" : ""
        } ${disabled ? "select-disabled" : ""} ${loading ? "select-loading" : ""}`}
        onClick={handleToggleDropdown}
      >
        <div className="select-selection">
          <div className="select-selection-search">
            {getSelectedDisplay()}
          </div>
        </div>

        <div className="select-arrow">
          {hasValue && allowClear && clearable && !disabled && !loading && (
            <CloseOutlined
              className="select-clear-icon"
              onClick={handleClearAll}
            />
          )}
          {isOpen ? (
            <UpOutlined className="select-arrow-icon" />
          ) : (
            <DownOutlined className="select-arrow-icon" />
          )}
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`select-dropdown select-dropdown-${dropdownDirection} ${dropdownClassName}`}
          style={{
            maxHeight: maxHeight,
            ...dropdownStyle,
          }}
        >
          {showSearch && searchable && (
            <div className="select-dropdown-search">
              <input
                ref={searchInputRef}
                type="text"
                className="select-search-input"
                placeholder="搜索选项"
                value={searchValue}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="select-dropdown-menu">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = multiple
                  ? Array.isArray(currentValue) && currentValue.includes(option.value)
                  : currentValue === option.value;

                return (
                  <div
                    key={option.value}
                    className={`select-dropdown-menu-item ${
                      isSelected ? "select-dropdown-menu-item-selected" : ""
                    } ${
                      option.disabled ? "select-dropdown-menu-item-disabled" : ""
                    }`}
                    onClick={() => !option.disabled && handleOptionSelect(option.value)}
                  >
                    <span className="select-dropdown-menu-item-content">
                      {option.label}
                    </span>
                    {isSelected && (
                      <CheckOutlined className="select-dropdown-menu-item-check" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="select-dropdown-empty">{notFoundContent}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
