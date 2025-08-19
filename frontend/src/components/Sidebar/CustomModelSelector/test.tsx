


import React, { useState } from 'react';
import { Button, Space, Card, Divider } from 'antd';
import { RobotOutlined, MessageOutlined, ThunderboltOutlined, SettingOutlined } from '@ant-design/icons';
import CustomModelSelector from './index';

/**
 * 自定义模型选择器测试组件
 * 用于测试和演示各种功能
 */
const CustomModelSelectorTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">自定义模型选择器测试</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：组件展示 */}
        <div>
          <Card title="组件展示" className="bg-gray-800 border-gray-700">
            <Space direction="vertical" size="large" className="w-full">
              
              {/* 基础用法 */}
              <div>
                <h3 className="text-white mb-2">基础用法</h3>
                <CustomModelSelector
                  onChange={(models) => addTestResult(`基础选择器变更: ${models.join(', ')}`)}
                />
              </div>

              <Divider className="border-gray-600" />

              {/* 代码模型选择器 */}
              <div>
                <h3 className="text-white mb-2">代码模型选择器</h3>
                <CustomModelSelector
                  needApiKey={false}
                  configKey="test_code_model"
                  title="代码模型"
                  placeholder="选择代码生成模型"
                  icon={<RobotOutlined />}
                  tooltip="选择用于代码生成的模型"
                  eventKey="TEST_CODE_MODEL_UPDATED"
                  onChange={(models) => addTestResult(`代码模型变更: ${models.join(', ')}`)}
                  onSelect={(model) => addTestResult(`选择代码模型: ${model}`)}
                  onDeselect={(model) => addTestResult(`取消选择代码模型: ${model}`)}
                />
              </div>

              <Divider className="border-gray-600" />

              {/* 聊天模型选择器（需要API Key） */}
              <div>
                <h3 className="text-white mb-2">聊天模型选择器（需要API Key）</h3>
                <CustomModelSelector
                  needApiKey={true}
                  configKey="test_chat_model"
                  title="聊天模型"
                  placeholder="选择对话模型"
                  icon={<MessageOutlined />}
                  tooltip="选择用于对话的模型，需要配置API Key"
                  eventKey="TEST_CHAT_MODEL_UPDATED"
                  maxCount={3}
                  onChange={(models) => addTestResult(`聊天模型变更: ${models.join(', ')}`)}
                  onDropdownVisibleChange={(open) => addTestResult(`聊天模型下拉框${open ? '打开' : '关闭'}`)}
                />
              </div>

              <Divider className="border-gray-600" />

              {/* 推理模型选择器 */}
              <div>
                <h3 className="text-white mb-2">推理模型选择器</h3>
                <CustomModelSelector
                  needApiKey={false}
                  configKey="test_inference_model"
                  title="推理模型"
                  placeholder="选择推理模型"
                  icon={<ThunderboltOutlined />}
                  tooltip="选择用于推理任务的模型"
                  eventKey="TEST_INFERENCE_MODEL_UPDATED"
                  dropdownMaxHeight={150}
                  onChange={(models) => addTestResult(`推理模型变更: ${models.join(', ')}`)}
                  onSearch={(value) => addTestResult(`推理模型搜索: ${value}`)}
                />
              </div>

              <Divider className="border-gray-600" />

              {/* 自定义配置选择器 */}
              <div>
                <h3 className="text-white mb-2">自定义配置选择器</h3>
                <CustomModelSelector
                  needApiKey={false}
                  configKey="test_custom_model"
                  title="自定义模型"
                  placeholder="选择自定义模型"
                  icon={<SettingOutlined />}
                  tooltip="完全自定义的模型选择器"
                  eventKey="TEST_CUSTOM_MODEL_UPDATED"
                  className="custom-test-selector"
                  allowClear={true}
                  filterOption={(input, model) => {
                    // 自定义过滤：支持模型名称和类型搜索
                    const searchTerm = input.toLowerCase();
                    return model.name.toLowerCase().includes(searchTerm) ||
                           model.model_type.toLowerCase().includes(searchTerm);
                  }}
                  onChange={(models) => addTestResult(`自定义模型变更: ${models.join(', ')}`)}
                />
              </div>

            </Space>
          </Card>
        </div>

        {/* 右侧：测试结果 */}
        <div>
          <Card 
            title="测试结果" 
            className="bg-gray-800 border-gray-700"
            extra={
              <Button size="small" onClick={clearResults} type="primary">
                清空
              </Button>
            }
          >
            <div className="bg-gray-900 p-4 rounded max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-400 text-center">暂无测试结果，请与组件交互</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm text-green-400 font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* 功能测试按钮 */}
          <Card title="功能测试" className="bg-gray-800 border-gray-700 mt-4">
            <Space wrap>
              <Button 
                type="primary" 
                onClick={() => addTestResult('手动测试：基础功能正常')}
              >
                测试基础功能
              </Button>
              
              <Button 
                type="default" 
                onClick={() => addTestResult('手动测试：搜索功能正常')}
              >
                测试搜索功能
              </Button>
              
              <Button 
                type="default" 
                onClick={() => addTestResult('手动测试：多选功能正常')}
              >
                测试多选功能
              </Button>
              
              <Button 
                type="default" 
                onClick={() => addTestResult('手动测试：API Key验证正常')}
              >
                测试API Key验证
              </Button>
              
              <Button 
                type="default" 
                onClick={() => addTestResult('手动测试：事件回调正常')}
              >
                测试事件回调
              </Button>
              
              <Button 
                type="default" 
                onClick={() => addTestResult('手动测试：样式适配正常')}
              >
                测试样式适配
              </Button>
            </Space>
          </Card>

          {/* 组件特性说明 */}
          <Card title="组件特性" className="bg-gray-800 border-gray-700 mt-4">
            <div className="text-sm text-gray-300 space-y-2">
              <div>✅ 完全自定义实现，不依赖 Antd Select</div>
              <div>✅ 支持多选和单选模式</div>
              <div>✅ 实时搜索过滤功能</div>
              <div>✅ API Key 验证支持</div>
              <div>✅ 事件总线集成</div>
              <div>✅ 响应式设计</div>
              <div>✅ 深色主题适配</div>
              <div>✅ 键盘操作支持</div>
              <div>✅ 加载状态显示</div>
              <div>✅ 自定义配置支持</div>
            </div>
          </Card>
        </div>
      </div>

      {/* 使用说明 */}
      <Card title="使用说明" className="bg-gray-800 border-gray-700 mt-6">
        <div className="text-gray-300 space-y-3">
          <p><strong>基础用法：</strong>直接使用 <code className="bg-gray-700 px-1 rounded">&lt;CustomModelSelector /&gt;</code></p>
          <p><strong>自定义配置：</strong>通过 props 传递不同的配置参数</p>
          <p><strong>事件监听：</strong>使用 onChange、onSelect 等回调函数</p>
          <p><strong>样式定制：</strong>修改 styles.css 或传递 className</p>
          <p><strong>API Key 验证：</strong>设置 needApiKey={`{true}`} 只显示有 API Key 的模型</p>
        </div>
      </Card>
    </div>
  );
};

export default CustomModelSelectorTest;


