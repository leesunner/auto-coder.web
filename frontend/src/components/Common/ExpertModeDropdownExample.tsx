

import React, { useState } from 'react';
import Dropdown from './Dropdown';
import type { DropdownMenuItem } from './Dropdown';

// 模拟 ExpertModePage 中的使用方式
const ExpertModeDropdownExample: React.FC = () => {
  const [activePanel, setActivePanel] = useState<string>('');

  // 参考原有"更多下拉菜单"的菜单项配置
  const moreMenuItems: DropdownMenuItem[] = [
    {
      key: 'preview_static',
      label: '预览功能',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
      disabled: true, // 预览功能已屏蔽
      onClick: () => {
        console.log('预览功能已被屏蔽');
      }
    },
    {
      key: 'clipboard',
      label: '剪贴板',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      onClick: () => {
        setActivePanel('clipboard');
      }
    },
    {
      key: 'todo',
      label: '待办事项',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      onClick: () => {
        setActivePanel('todo');
      }
    }
  ];

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-white text-2xl mb-8">ExpertMode 中使用 Dropdown 组件示例</h1>
      
      <div className="mb-4 text-gray-300">
        当前激活面板: <span className="text-blue-400">{activePanel || '无'}</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* 模拟其他按钮 */}
        <button
          className="px-2 py-1 rounded text-xs font-medium transition-all duration-300 bg-gray-800/60 text-gray-400 hover:bg-gray-700/80 hover:text-white hover:shadow-sm flex items-center space-x-2"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>历史</span>
        </button>

        <button
          className="px-2 py-1 rounded text-xs font-medium transition-all duration-300 bg-gray-800/60 text-gray-400 hover:bg-gray-700/80 hover:text-white hover:shadow-sm flex items-center space-x-2"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span>代码</span>
        </button>

        <button
          className="px-2 py-1 rounded text-xs font-medium transition-all duration-300 bg-gray-800/60 text-gray-400 hover:bg-gray-700/80 hover:text-white hover:shadow-sm flex items-center space-x-2"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span>文件组</span>
        </button>

        <button
          className="px-2 py-1 rounded text-xs font-medium transition-all duration-300 bg-gray-800/60 text-gray-400 hover:bg-gray-700/80 hover:text-white hover:shadow-sm flex items-center space-x-2"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>设置</span>
        </button>

        {/* 新的更多下拉菜单 - 使用 Dropdown 组件 */}
        <Dropdown
          trigger={['click']}
          placement="bottomLeft"
          menu={{ items: moreMenuItems }}
        >
          <button
            className={`px-2 py-1 rounded text-xs font-medium transition-all duration-300 
              ${
                activePanel === "clipboard" || activePanel === "todo"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700 transform hover:-translate-y-0.5"
                  : "bg-gray-800/60 text-gray-400 hover:bg-gray-700/80 hover:text-white hover:shadow-sm"
              } flex items-center space-x-2`}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <span>更多</span>
          </button>
        </Dropdown>
      </div>

      {/* 显示当前激活的面板内容 */}
      <div className="mt-8 p-6 bg-gray-800 rounded-lg">
        <h3 className="text-white text-lg mb-4">面板内容区域</h3>
        {activePanel === 'clipboard' && (
          <div className="text-gray-300">
            <p>剪贴板面板内容...</p>
            <textarea 
              className="w-full h-32 mt-2 p-2 bg-gray-700 text-white rounded"
              placeholder="这里是剪贴板编辑器"
            />
          </div>
        )}
        {activePanel === 'todo' && (
          <div className="text-gray-300">
            <p>待办事项面板内容...</p>
            <ul className="mt-2 space-y-2">
              <li className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>示例待办事项 1</span>
              </li>
              <li className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>示例待办事项 2</span>
              </li>
            </ul>
          </div>
        )}
        {!activePanel && (
          <p className="text-gray-400">请从上方菜单选择一个面板</p>
        )}
      </div>

      {/* 使用说明 */}
      <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <h4 className="text-blue-300 font-semibold mb-2">使用说明</h4>
        <div className="text-blue-200 text-sm space-y-1">
          <p>• 点击"更多"按钮查看下拉菜单</p>
          <p>• 预览功能已被禁用（灰色显示）</p>
          <p>• 点击菜单项会切换到对应面板</p>
          <p>• 点击外部区域会自动关闭菜单</p>
        </div>
      </div>

      {/* 代码示例 */}
      <div className="mt-8">
        <h4 className="text-white font-semibold mb-4">在 ExpertModePage 中的使用代码：</h4>
        <pre className="bg-gray-800 p-4 rounded-lg text-gray-300 text-sm overflow-x-auto">
{`// 替换原有的"更多下拉菜单"实现
import Dropdown from '../Common/Dropdown';
import type { DropdownMenuItem } from '../Common/Dropdown';

const moreMenuItems: DropdownMenuItem[] = [
  {
    key: 'preview_static',
    label: '预览功能',
    icon: <PreviewIcon />,
    disabled: true,
    onClick: () => console.log('预览功能已屏蔽')
  },
  {
    key: 'clipboard',
    label: '剪贴板',
    icon: <ClipboardIcon />,
    onClick: () => {
      setActivePanel('clipboard');
    }
  },
  {
    key: 'todo',
    label: '待办事项',
    icon: <TodoIcon />,
    onClick: () => {
      setActivePanel('todo');
    }
  }
];

// JSX 中使用
<Dropdown
  trigger={['click']}
  placement="bottomLeft"
  menu={{ items: moreMenuItems }}
>
  <button className="...">
    <DownIcon />
    <span>更多</span>
  </button>
</Dropdown>`}
        </pre>
      </div>
    </div>
  );
};

export default ExpertModeDropdownExample;

