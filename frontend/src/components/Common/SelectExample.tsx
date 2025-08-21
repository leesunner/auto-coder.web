
import React, { useState } from "react";
import { Select, SelectOption } from "./index";

const SelectExample: React.FC = () => {
  const [singleValue, setSingleValue] = useState<string>("");
  const [multipleValue, setMultipleValue] = useState<string[]>([]);
  const [searchableValue, setSearchableValue] = useState<string>("");

  // 示例选项数据
  const options: SelectOption[] = [
    { value: "option1", label: "选项一" },
    { value: "option2", label: "选项二" },
    { value: "option3", label: "选项三" },
    { value: "option4", label: "选项四（禁用）", disabled: true },
    { value: "option5", label: "选项五" },
    { value: "option6", label: "选项六" },
    { value: "option7", label: "选项七" },
    { value: "option8", label: "选项八" },
    { value: "option9", label: "选项九" },
    { value: "option10", label: "选项十" },
  ];

  const modelOptions: SelectOption[] = [
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { value: "claude-3-opus", label: "Claude 3 Opus" },
    { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku" },
    { value: "gemini-pro", label: "Gemini Pro" },
    { value: "llama-2-70b", label: "Llama 2 70B" },
    { value: "mistral-large", label: "Mistral Large" },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Select 组件示例</h1>

      {/* 单选示例 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">单选模式</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 基础单选 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              基础单选
            </label>
            <Select
              options={options}
              value={singleValue}
              onChange={(value) => setSingleValue(value as string)}
              placeholder="请选择一个选项"
            />
          </div>

          {/* 不同尺寸 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              小尺寸
            </label>
            <Select
              options={options.slice(0, 5)}
              size="small"
              placeholder="小尺寸选择器"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              大尺寸
            </label>
            <Select
              options={options.slice(0, 5)}
              size="large"
              placeholder="大尺寸选择器"
            />
          </div>
        </div>
      </div>

      {/* 多选示例 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">多选模式</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 基础多选 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              基础多选
            </label>
            <Select
              options={options}
              value={multipleValue}
              onChange={(value) => setMultipleValue(value as string[])}
              multiple
              placeholder="请选择多个选项"
              maxTagCount={2}
            />
          </div>

          {/* 模型选择器 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              AI 模型选择器
            </label>
            <Select
              options={modelOptions}
              multiple
              placeholder="选择 AI 模型"
              maxTagCount={3}
            />
          </div>
        </div>
      </div>

      {/* 搜索功能示例 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">搜索功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 可搜索单选 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              可搜索单选
            </label>
            <Select
              options={modelOptions}
              value={searchableValue}
              onChange={(value) => setSearchableValue(value as string)}
              showSearch
              placeholder="搜索并选择模型"
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase()) ||
                option.value.toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>

          {/* 禁用搜索 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              禁用搜索
            </label>
            <Select
              options={options.slice(0, 6)}
              showSearch={false}
              placeholder="不可搜索"
            />
          </div>
        </div>
      </div>

      {/* 特殊状态示例 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">特殊状态</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 禁用状态 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              禁用状态
            </label>
            <Select
              options={options.slice(0, 5)}
              disabled
              placeholder="禁用的选择器"
            />
          </div>

          {/* 加载状态 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              加载状态
            </label>
            <Select
              options={options.slice(0, 5)}
              loading
              placeholder="加载中..."
            />
          </div>

          {/* 不允许清空 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              不允许清空
            </label>
            <Select
              options={options.slice(0, 5)}
              allowClear={false}
              defaultValue="option1"
              placeholder="不可清空"
            />
          </div>
        </div>
      </div>

      {/* 边界检测示例 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">边界检测</h2>
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            这些选择器会根据屏幕空间自动调整下拉方向（向上或向下展开）
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              options={options}
              placeholder="顶部边界测试"
              maxHeight={150}
            />
            <Select
              options={modelOptions}
              multiple
              placeholder="多选边界测试"
              maxHeight={180}
            />
            <Select
              options={options}
              showSearch
              placeholder="搜索边界测试"
              maxHeight={200}
            />
            <Select
              options={modelOptions}
              size="large"
              placeholder="大尺寸边界测试"
              maxHeight={160}
            />
          </div>
        </div>
      </div>

      {/* 当前选中值显示 */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">当前选中值</h3>
        <div className="space-y-2 text-sm">
          <div className="text-gray-300">
            <span className="font-medium">单选值：</span>
            <span className="text-blue-400">{singleValue || "未选择"}</span>
          </div>
          <div className="text-gray-300">
            <span className="font-medium">多选值：</span>
            <span className="text-blue-400">
              {multipleValue.length > 0 ? multipleValue.join(", ") : "未选择"}
            </span>
          </div>
          <div className="text-gray-300">
            <span className="font-medium">搜索选择值：</span>
            <span className="text-blue-400">{searchableValue || "未选择"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectExample;

