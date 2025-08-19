import React, { useState, useEffect, useCallback, useRef } from "react";
import { message, Tag, Tooltip, notification } from "antd";
import {
  CodeOutlined,
  DownOutlined,
  UpOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { getMessage } from "../../../lang";
import "./styles.css";
import eventBus, { EVENTS } from "../../../services/eventBus";
import { validModelHasApiKey } from "@/utils/validModelHasApiKey";

interface Model {
  name: string;
  model_name: string;
  model_type: string;
}

export const getModels = async (needHasApiKey = false) => {
  const response = await fetch("/api/models");
  if (!response.ok) {
    throw new Error(getMessage("failedToFetchModels"));
  }
  const data: any[] = await response.json();
  let _list = data.sort((a, b) => (a.api_key ? -1 : 1));
  if (needHasApiKey) {
    _list = _list.filter((model) => !!model.api_key);
  }
  return _list;
};

interface CustomModelSelectorProps {
  needApiKey?: boolean;
  configKey?: string;
  title?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  eventKey?: string;
}

const CustomModelSelector: React.FC<CustomModelSelectorProps> = (props) => {
  const {
    needApiKey = false,
    configKey = "code_model",
    title = "自定义模型",
    placeholder = "请选择模型",
    icon = <CodeOutlined />,
    tooltip = "选择自定义模型",
    eventKey = "CODE_MODEL_UPDATED",
  } = props;

  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [dropdownDirection, setDropdownDirection] = useState<"up" | "down">(
    "down"
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  // 检测下拉框应该向上还是向下展开
  const detectDropdownDirection = useCallback(() => {
    if (!selectorRef.current) return "down";

    const selectorRect = selectorRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 240; // 预估下拉框高度

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
  }, []);

  // 过滤模型列表
  useEffect(() => {
    const filtered = availableModels.filter((model) =>
      model.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredModels(filtered);
  }, [availableModels, searchValue]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
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

  // 获取可用模型
  const fetchModels = useCallback(async () => {
    setLoadingModels(true);
    try {
      const data = await getModels(needApiKey);
      setAvailableModels(data);
    } catch (error) {
      console.error("Error fetching models:", error);
      message.error(getMessage("errorFetchingModels"));
    } finally {
      setLoadingModels(false);
    }
  }, [needApiKey]);

  // 获取当前配置
  const fetchCurrentConfig = async () => {
    setLoadingConfig(true);
    try {
      const response = await fetch("/api/conf");
      if (!response.ok) {
        console.warn(
          "Failed to fetch initial configuration, proceeding with defaults."
        );
        setSelectedModels([]);
        return;
      }
      const data = await response.json();
      const currentConfig = data.conf;

      if (currentConfig && currentConfig[configKey]) {
        const models =
          typeof currentConfig[configKey] === "string"
            ? currentConfig[configKey]
                .split(",")
                .map((m: string) => m.trim())
                .filter((m: string) => m)
            : Array.isArray(currentConfig[configKey])
            ? currentConfig[configKey]
            : [];
        setSelectedModels(models);
      } else {
        setSelectedModels([]);
      }
    } catch (error) {
      console.error("Error fetching current configuration:", error);
      setSelectedModels([]);
    } finally {
      setLoadingConfig(false);
    }
  };

  // 更新或删除配置
  const updateOrDeleteConfig = async (key: string, value: string[]) => {
    setIsUpdating(true);
    const isEmpty = value.length === 0;

    try {
      let response;

      if (isEmpty) {
        response = await fetch(`/api/conf/${key}`, {
          method: "DELETE",
        });
      } else {
        response = await fetch("/api/conf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [key]: value.join(",") }),
        });
      }

      if (!response.ok) {
        let errorDetail = isEmpty
          ? getMessage("failedToDeleteConfiguration")
          : getMessage("failedToUpdateConfiguration");
        try {
          const errorData = await response.json();
          if (errorData && errorData.detail) {
            errorDetail = errorData.detail;
          }
        } catch (parseError) {
          // Ignore if response is not JSON or empty
        }
        throw new Error(errorDetail);
      }

      // 发布事件
      if (EVENTS.CONFIG[eventKey]) {
        eventBus.publish(EVENTS.CONFIG[eventKey], value);
      }
    } catch (error: any) {
      console.error(
        `Error ${isEmpty ? "deleting" : "updating"} configuration key ${key}:`,
        error
      );
      message.error(error.message || getMessage("failedToUpdateConfiguration"));
      fetchCurrentConfig();
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchModels();
    fetchCurrentConfig();
  }, [fetchModels]);

  // 订阅事件更新
  useEffect(() => {
    if (!EVENTS.CONFIG[eventKey]) return;

    const handleUpdate = (updatedModels: string[]) => {
      const modelsArray = Array.isArray(updatedModels) ? updatedModels : [];
      setSelectedModels((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(modelsArray)) {
          console.log(`${configKey} received update:`, modelsArray);
          return modelsArray;
        }
        return prev;
      });
    };

    const unsubscribe = eventBus.subscribe(
      EVENTS.CONFIG[eventKey],
      handleUpdate
    );
    return () => unsubscribe();
  }, [eventKey, configKey]);

  // 订阅模型列表更新
  useEffect(() => {
    const handleModelListUpdate = () => {
      console.log(
        `${configKey} received model list update, fetching models...`
      );
      fetchModels();
    };

    const unsubscribe = eventBus.subscribe(
      EVENTS.CONFIG.MODEL_LIST_UPDATED,
      handleModelListUpdate
    );

    return () => unsubscribe();
  }, [fetchModels, configKey]);

  // 处理模型选择
  const handleModelSelect = (modelName: string) => {
    let newSelectedModels: string[];

    if (selectedModels.includes(modelName)) {
      newSelectedModels = selectedModels.filter((name) => name !== modelName);
    } else {
      newSelectedModels = [...selectedModels, modelName];
    }

    if (!validModelHasApiKey(availableModels, newSelectedModels)) {
      notification.info({
        message: getMessage("modelApiKeyNotConfigured"),
        duration: 1.5,
      });
    }

    setSelectedModels(newSelectedModels);
    updateOrDeleteConfig(configKey, newSelectedModels);
  };

  // 移除选中的模型
  const handleRemoveModel = (modelName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelectedModels = selectedModels.filter(
      (name) => name !== modelName
    );
    setSelectedModels(newSelectedModels);
    updateOrDeleteConfig(configKey, newSelectedModels);
  };

  // 清空所有选择
  const handleClearAll = () => {
    setSelectedModels([]);
    updateOrDeleteConfig(configKey, []);
  };

  // 打开下拉框时聚焦搜索框
  const handleToggleDropdown = () => {
    if (!isOpen) {
      // 检测方向并设置
      const direction = detectDropdownDirection();
      setDropdownDirection(direction);
    }

    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchValue("");
    }
  };

  const isLoading = loadingModels || loadingConfig;

  return (
    <div className="w-full max-w-20 mb-0" ref={dropdownRef}>
      <div className="custom-model-selector">
        {/* 选择器主体 */}
        <div
          ref={selectorRef}
          className={`custom-selector ${isOpen ? "open" : ""} ${
            isLoading || isUpdating ? "loading" : ""
          }`}
          onClick={handleToggleDropdown}
        >
          <div className="selector-content">
            {selectedModels.length > 0 ? (
              <div className="selected-tags">
                {selectedModels.slice(0, 1).map((modelName) => (
                  <Tag
                    key={modelName}
                    color="blue"
                    closable
                    onClose={(e) => handleRemoveModel(modelName, e)}
                    className="selected-tag"
                    title={modelName}
                  >
                    {modelName.length > 20
                      ? `${modelName.substring(0, 20)}...`
                      : modelName}
                  </Tag>
                ))}
                {selectedModels.length > 1 && (
                  <span className="more-count">
                    +{selectedModels.length - 1} more
                  </span>
                )}
              </div>
            ) : (
              <div className="placeholder truncate">{placeholder}</div>
            )}
          </div>

          <div className="selector-actions">
            {selectedModels.length > 0 &&
              // <CloseOutlined
              //   className="clear-icon"
              //   onClick={(e) => {
              //     e.stopPropagation();
              //     handleClearAll();
              //   }}
              // />
              null}
            {isOpen ? (
              <UpOutlined className="arrow-icon" />
            ) : (
              <DownOutlined className="arrow-icon" />
            )}
          </div>
        </div>

        {/* 下拉选项 */}
        {isOpen && (
          <div className={`dropdown-panel dropdown-${dropdownDirection}`}>
            <div className="options-container">
              {filteredModels.length > 0 ? (
                filteredModels.map((model) => (
                  <div
                    key={model.name}
                    className={`option-item ${
                      selectedModels.includes(model.name) ? "selected" : ""
                    }`}
                    onClick={() => handleModelSelect(model.name)}
                  >
                    <span className="option-label">{model.name}</span>
                    {selectedModels.includes(model.name) && (
                      <span className="check-icon">✓</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-options">暂无匹配的模型</div>
              )}
            </div>
            <div className="search-container">
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="搜索模型..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomModelSelector;
