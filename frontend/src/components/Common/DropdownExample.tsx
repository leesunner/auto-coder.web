
import React from 'react';
import Dropdown from './Dropdown';
import type { DropdownMenuItem } from './Dropdown';

// 示例：如何使用Dropdown组件
const DropdownExample: React.FC = () => {
  // 定义菜单项
  const menuItems: DropdownMenuItem[] = [
    {
      key: 'preview',
      label: '预览功能',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      disabled: true, // 禁用状态示例
      onClick: () => {
        console.log('预览功能被点击');
      }
    },
    {
      key: 'clipboard',
      label: '剪贴板',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      onClick: () => {
        console.log('剪贴板被点击');
      }
    },
    {
      key: 'todo',
      label: '待办事项',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      onClick: () => {
        console.log('待办事项被点击');
      }
    }
  ];

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-white text-2xl mb-8">Dropdown 组件使用示例</h1>
      
      <div className="space-y-8">
        {/* 点击触发示例 */}
        <div>
          <h2 className="text-white text-lg mb-4">点击触发</h2>
          <Dropdown
            trigger={['click']}
            placement="bottomLeft"
            menu={{ items: menuItems }}
          >
            <button className="px-4 py-2 rounded text-sm font-medium transition-all duration-300 bg-gray-800/60 text-gray-400 hover:bg-gray-700/80 hover:text-white hover:shadow-sm flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>更多选项 (点击)</span>
            </button>
          </Dropdown>
        </div>

        {/* 悬停触发示例 */}
        <div>
          <h2 className="text-white text-lg mb-4">悬停触发</h2>
          <Dropdown
            trigger={['hover']}
            placement="bottomRight"
            menu={{ items: menuItems }}
          >
            <button className="px-4 py-2 rounded text-sm font-medium transition-all duration-300 bg-blue-600 text-white shadow-md hover:bg-blue-700 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>悬停显示</span>
            </button>
          </Dropdown>
        </div>

        {/* 不同位置示例 */}
        <div>
          <h2 className="text-white text-lg mb-4">不同位置</h2>
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {['topLeft', 'top', 'topRight', 'bottomLeft', 'bottom', 'bottomRight'].map((placement) => (
              <Dropdown
                key={placement}
                trigger={['click']}
                placement={placement as any}
                menu={{ items: menuItems }}
              >
                <button className="w-full px-3 py-2 rounded text-xs bg-gray-700 text-gray-300 hover:bg-gray-600">
                  {placement}
                </button>
              </Dropdown>
            ))}
          </div>
        </div>

        {/* 混合触发示例 */}
        <div>
          <h2 className="text-white text-lg mb-4">混合触发 (点击 + 悬停)</h2>
          <Dropdown
            trigger={['click', 'hover']}
            placement="bottom"
            menu={{ items: menuItems }}
          >
            <button className="px-4 py-2 rounded text-sm font-medium transition-all duration-300 bg-green-600 text-white shadow-md hover:bg-green-700 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>点击或悬停</span>
            </button>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default DropdownExample;
