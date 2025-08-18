

import React, { useState, useEffect } from 'react';
import FileListSelector from './FileListSelector';
import { FileGroup } from './Sidebar/types';

const FileListSelectorExample: React.FC = () => {
  const [fileGroups, setFileGroups] = useState<FileGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // 模拟数据
  useEffect(() => {
    const mockFileGroups: FileGroup[] = [
      {
        id: '1',
        name: '前端组件',
        files: ['src/components/Header.tsx', 'src/components/Footer.tsx', 'src/components/Sidebar.tsx'],
        file_count: 3
      },
      {
        id: '2',
        name: '后端API',
        files: ['src/api/users.ts', 'src/api/auth.ts', 'src/api/files.ts'],
        file_count: 3
      },
      {
        id: '3',
        name: '工具函数',
        files: ['src/utils/helpers.ts', 'src/utils/validation.ts'],
        file_count: 2
      }
    ];
    setFileGroups(mockFileGroups);
  }, []);

  const fetchFileGroups = () => {
    // 模拟获取文件组数据
    console.log('获取文件组数据...');
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <h1 className="text-white text-xl mb-4">文件列表选择器示例</h1>
      
      <div className="max-w-md">
        <FileListSelector
          fileGroups={fileGroups}
          selectedGroups={selectedGroups}
          setSelectedGroups={setSelectedGroups}
          fetchFileGroups={fetchFileGroups}
          panelId="example"
        />
      </div>

      <div className="mt-4 text-white">
        <h2 className="text-lg mb-2">已选择的文件组：</h2>
        <pre className="bg-gray-800 p-2 rounded text-sm">
          {JSON.stringify(selectedGroups, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default FileListSelectorExample;

