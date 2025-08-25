
import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import VirtualList, { VirtualListItem } from './VirtualList';

// 生成测试数据
const generateTestData = (count: number): VirtualListItem[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    name: `文件组 ${index + 1}`,
    description: `这是第 ${index + 1} 个文件组的描述信息，包含一些详细说明`,
    count: Math.floor(Math.random() * 50) + 1,
    icon: <UserOutlined />,
    data: { index, type: 'fileGroup' },
  }));
};

const VirtualListDemo: React.FC = () => {
  const [items] = useState<VirtualListItem[]>(generateTestData(1000));
  const [selectedId, setSelectedId] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');

  const handleItemClick = (item: VirtualListItem) => {
    setSelectedId(item.id);
    console.log('选中项:', item);
  };

  const handleItemDelete = (item: VirtualListItem) => {
    console.log('删除项:', item);
    // 这里可以实现删除逻辑
  };

  return (
    <div style={{ padding: '20px', height: '100vh', background: '#111827' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ color: '#fff', marginBottom: '12px' }}>虚拟列表组件演示</h2>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <Input
            placeholder="搜索文件组..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ width: '300px' }}
            className="bg-gray-800 border-gray-700 text-gray-200"
          />
          <Button
            type="primary"
            onClick={() => setSelectedId('')}
            className="bg-blue-600 hover:bg-blue-700 border-none"
          >
            清除选择
          </Button>
        </div>
      </div>
      
      <div style={{ height: 'calc(100vh - 160px)', background: '#1f2937', borderRadius: '8px', padding: '16px' }}>
        <VirtualList
          items={items}
          height={0} // 使用动态高度
          itemHeight={72}
          selectedId={selectedId}
          onItemClick={handleItemClick}
          onItemDelete={handleItemDelete}
          showDeleteButton={true}
          emptyText="没有找到文件组"
          searchValue={searchValue}
          showTooltip={true}
          className="demo-virtual-list"
        />
      </div>
      
      {selectedId && (
        <div style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          background: '#374151', 
          color: '#fff', 
          padding: '12px 16px', 
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          当前选中: {selectedId}
        </div>
      )}
    </div>
  );
};

export default VirtualListDemo;
