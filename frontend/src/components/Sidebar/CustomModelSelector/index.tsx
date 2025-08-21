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
import { Select } from "@/components/Common";

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
    title = getMessage("customModel"),
    placeholder = getMessage("selectModel"),
    icon = <CodeOutlined />,
    tooltip = getMessage("selectCustomModel"),
    eventKey = "CODE_MODEL_UPDATED",
  } = props;

  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

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
    try {
      const data = await getModels(needApiKey);
      setAvailableModels(data);
    } catch (error) {
      console.error("Error fetching models:", error);
      message.error(getMessage("errorFetchingModels"));
    }
  }, [needApiKey]);

  // 获取当前配置
  const fetchCurrentConfig = async () => {
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
    }
  };

  // 更新或删除配置
  const updateOrDeleteConfig = async (key: string, value: string[]) => {
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
  const handleModelSelect = (modelNames: string | string[]) => {
    let newSelectedModels: string[] = [];

    if (Array.isArray(modelNames)) {
      newSelectedModels = modelNames;
    } else {
      newSelectedModels = [modelNames];
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

  return (
    <div className="w-full max-w-25" ref={dropdownRef}>
      <Select
        value={selectedModels}
        multiple
        onChange={handleModelSelect}
        options={filteredModels.map((item) => ({
          value: item.name,
          label: item.name,
        }))}
      />
    </div>
  );
};

export default CustomModelSelector;
