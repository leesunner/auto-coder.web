

import React from "react";
import { RobotOutlined, BulbOutlined, ThunderboltOutlined } from "@ant-design/icons";
import CustomModelSelector from "./index";

/**
 * 自定义模型选择器使用示例
 * 
 * 这个组件展示了如何使用 CustomModelSelector 组件创建不同类型的模型选择器
 */
const CustomModelSelectorExample: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold text-white mb-4">自定义模型选择器示例</h3>
      
      {/* 代码模型选择器 */}
      <CustomModelSelector
        needApiKey={false}
        configKey="code_model"
        title="代码模型"
        placeholder="选择代码生成模型"
        icon={<RobotOutlined />}
        tooltip="选择用于代码生成的模型"
        eventKey="CODE_MODEL_UPDATED"
      />

      {/* 聊天模型选择器 */}
      <CustomModelSelector
        needApiKey={true}
        configKey="chat_model"
        title="聊天模型"
        placeholder="选择对话模型"
        icon={<BulbOutlined />}
        tooltip="选择用于对话的模型，需要配置API Key"
        eventKey="CHAT_MODEL_UPDATED"
      />

      {/* 推理模型选择器 */}
      <CustomModelSelector
        needApiKey={false}
        configKey="inference_model"
        title="推理模型"
        placeholder="选择推理模型"
        icon={<ThunderboltOutlined />}
        tooltip="选择用于推理任务的模型"
        eventKey="INFERENCE_MODEL_UPDATED"
      />
    </div>
  );
};

export default CustomModelSelectorExample;

